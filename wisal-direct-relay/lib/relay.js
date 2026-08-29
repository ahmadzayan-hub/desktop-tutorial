// منطق الـ relay (ADR-002 §5.3): تسجيل جهاز، إيداع مغلف مشفّر، سحب صندوق
// الوارد، وتأكيد التسليم (بيمسح المغلف فورًا — مفيش احتفاظ بعد التسليم).
//
// كل دالة نقية قدر الإمكان: التخزين والوقت بيتحقنوا، فالاختبارات حتمية من
// غير سيرفر أو ساعة حقيقية. كل عملية تعديل بتتحقق بتوقيع صاحب الجهاز —
// السيرفر عمره ما يقبل حاجة من غير إثبات ملكية المفتاح الخاص.

const { verifySignature } = require('./crypto');
const { safeLog } = require('./log');

const MAX_ENVELOPE_TTL_SECONDS = 14 * 24 * 3600; // أقصى احتفاظ (§5.3: انتهاء صريح)
const FETCH_CLOCK_SKEW_SECONDS = 300; // نافذة قبول توقيع "fetch" — يمنع إعادة استخدام قديم

function ok(value) { return { ok: true, ...value }; }
function refused(reason) { return { ok: false, reason }; }

// ---- تسجيل جهاز ----
// إثبات الملكية: توقيع على "wisal-direct-register:{deviceId}" بالمفتاح الخاص.
function registerDevice(store, { deviceId, publicKeyB64, signatureB64 }, nowEpochSec) {
  if (!deviceId || !publicKeyB64 || !signatureB64) return refused('missing fields');
  const proof = `wisal-direct-register:${deviceId}`;
  if (!verifySignature(publicKeyB64, proof, signatureB64)) return refused('bad signature');

  const existing = store.getDevice(deviceId);
  // إعادة تسجيل بنفس المفتاح مسموحة (idempotent)؛ بمفتاح مختلف مرفوضة —
  // يمنع محاولة انتحال جهاز عن طريق تسجيل مفتاح جديد على نفس المعرّف.
  if (existing && existing.publicKeyB64 !== publicKeyB64) return refused('device id already bound to a different key');

  store.putDevice({ deviceId, publicKeyB64, registeredAtEpochSec: nowEpochSec });
  safeLog('device_registered', { deviceId, atEpochSec: nowEpochSec });
  return ok({ deviceId });
}

// ---- إيداع مغلف ----
function submitEnvelope(store, envelope, signatureB64, nowEpochSec) {
  const { senderDeviceId, recipientDeviceId, ciphertextB64, backend, expiresAtEpochSec } = envelope || {};
  if (!senderDeviceId || !recipientDeviceId || !ciphertextB64 || !backend || !expiresAtEpochSec) {
    return refused('missing fields');
  }
  // لازم رقم فعلي — لو جه نص غير رقمي (أو أي قيمة غير محدودة) كل مقارنات
  // الانتهاء بعد كده بتتقيّم NaN وترجع false دايمًا، يعني يتخطّى فحص
  // الانتهاء والـ TTL بصمت. رفض صريح هنا أأمن من مقارنة NaN صامتة.
  if (!Number.isFinite(expiresAtEpochSec)) return refused('invalid expiry');

  const sender = store.getDevice(senderDeviceId);
  if (!sender) return refused('sender not registered');
  // المستلم لازم يكون جهاز مسجَّل — مفيش داعي نخزّن مغلفات لمعرّف وهمي
  // محدش هيقدر يجيبها أو يأكّد تسليمها أبدًا.
  if (!store.getDevice(recipientDeviceId)) return refused('recipient not registered');

  // بصمة الإثبات بتشمل backend عمدًا — لو اتشالت، حد على المسار (أو الـ
  // relay نفسه لو اتلخبط) يقدر يغيّر تصنيف بروتوكول التشفير من غير ما
  // يبوّظ التوقيع، وده يناقض مبدأ المشروع الأساسي: مفيش وصف تشفير كاذب.
  const proof = `${senderDeviceId}:${recipientDeviceId}:${ciphertextB64}:${backend}:${expiresAtEpochSec}`;
  if (!verifySignature(sender.publicKeyB64, proof, signatureB64)) return refused('bad signature');

  if (expiresAtEpochSec <= nowEpochSec) return refused('already expired');
  if (expiresAtEpochSec - nowEpochSec > MAX_ENVELOPE_TTL_SECONDS) return refused('ttl too long');

  // منع إعادة الإرسال (replay): توقيع مُلتقَط ومُعاد بنفس البايتات بالظبط
  // بيترفض. التوقيع نفسه فريد لكل عملية توقيع حقيقية، فمطابقته الحرفية
  // معناها نفس الطلب اتبعت قبل كده.
  if (store.hasSeenSubmissionSignature(signatureB64)) return refused('replayed submission');
  store.recordSubmissionSignature(signatureB64, expiresAtEpochSec);

  const id = `${senderDeviceId}:${nowEpochSec}:${Math.random().toString(36).slice(2, 10)}`;
  store.putEnvelope({
    id, senderDeviceId, recipientDeviceId, ciphertextB64, backend,
    expiresAtEpochSec, createdAtEpochSec: nowEpochSec,
  });
  safeLog('envelope_submitted', { senderDeviceId, recipientDeviceId, envelopeId: id, backend, atEpochSec: nowEpochSec });
  return ok({ id });
}

// ---- سحب صندوق الوارد ----
// إثبات الطلب: توقيع على "fetch:{deviceId}:{timestamp}" بمفتاح المستلم نفسه،
// والـ timestamp لازم يكون قريب من وقت السيرفر (يمنع إعادة استخدام توقيع قديم).
function listInbox(store, { deviceId, timestamp, signatureB64 }, nowEpochSec) {
  if (!deviceId || !timestamp || !signatureB64) return refused('missing fields');
  const ts = Number(timestamp);
  // نفس منطق الحماية من NaN فوق: timestamp غير رقمي يخلّي فحص الانحراف
  // الزمني يرجع false دايمًا (NaN > رقم = false) فيقبل توقيع قديم اتسرّب.
  if (!Number.isFinite(ts)) return refused('invalid timestamp');

  const device = store.getDevice(deviceId);
  if (!device) return refused('device not registered');

  const proof = `fetch:${deviceId}:${timestamp}`;
  if (!verifySignature(device.publicKeyB64, proof, signatureB64)) return refused('bad signature');
  if (Math.abs(nowEpochSec - ts) > FETCH_CLOCK_SKEW_SECONDS) return refused('stale timestamp');

  store.sweepExpired(nowEpochSec);
  const items = store.listEnvelopesFor(deviceId).map(
    ({ id, senderDeviceId, ciphertextB64, backend, createdAtEpochSec }) =>
      ({ id, senderDeviceId, ciphertextB64, backend, createdAtEpochSec }),
  );
  return ok({ items });
}

// ---- تأكيد التسليم (بيمسح المغلف فورًا) ----
function ackDelivery(store, { deviceId, envelopeId, signatureB64 }, nowEpochSec) {
  if (!deviceId || !envelopeId || !signatureB64) return refused('missing fields');
  const device = store.getDevice(deviceId);
  if (!device) return refused('device not registered');

  const proof = `ack:${envelopeId}`;
  if (!verifySignature(device.publicKeyB64, proof, signatureB64)) return refused('bad signature');

  const env = store.getEnvelope(envelopeId);
  if (!env) return refused('not found');
  if (env.recipientDeviceId !== deviceId) return refused('not your envelope');

  store.deleteEnvelope(envelopeId);
  safeLog('envelope_delivered', { deviceId, envelopeId, atEpochSec: nowEpochSec });
  return ok({});
}

module.exports = {
  registerDevice, submitEnvelope, listInbox, ackDelivery,
  MAX_ENVELOPE_TTL_SECONDS, FETCH_CLOCK_SKEW_SECONDS,
};
