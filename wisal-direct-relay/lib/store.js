// تخزين قابل للاستبدال (interface) — النسخة الافتراضية في الذاكرة **للتطوير
// والاختبار فقط**. حد إنتاج موثّق: Vercel serverless بيعيد تشغيل الـ instance،
// فالتخزين في الذاكرة بيضيع بين الطلبات في الإنتاج الحقيقي. قبل أي إطلاق عام
// لازم storage حقيقي (Postgres مثلاً) يطبّق نفس الواجهة دي — موثّق كـ blocker
// في docs/decisions/ADR-002-e2ee-protocol.md وdocs/implementation-roadmap.md.
//
// كل الحقول المخزّنة في envelope: توجيه + ciphertext معتم بس — مفيش حقل
// plaintext في السكيمة أصلًا (نفس تصميم EncryptedEnvelope في العميل).

function createInMemoryStore() {
  const devices = new Map();   // deviceId -> { deviceId, publicKeyB64, registeredAtEpochSec }
  const envelopes = new Map(); // id -> envelope
  const seenSubmissionSignatures = new Map(); // signatureB64 -> expiresAtEpochSec (لمنع الإعادة)

  return {
    // ---- الأجهزة ----
    getDevice(deviceId) {
      return devices.get(deviceId) || null;
    },
    putDevice(device) {
      devices.set(device.deviceId, device);
    },

    // ---- المغلفات ----
    putEnvelope(envelope) {
      envelopes.set(envelope.id, envelope);
    },
    getEnvelope(id) {
      return envelopes.get(id) || null;
    },
    deleteEnvelope(id) {
      envelopes.delete(id);
    },
    listEnvelopesFor(recipientDeviceId) {
      return Array.from(envelopes.values()).filter((e) => e.recipientDeviceId === recipientDeviceId);
    },
    // فحص شفافية: كل المغلفات المخزّنة — يستخدمه اختبار تسرّب plaintext.
    allEnvelopes() {
      return Array.from(envelopes.values());
    },
    sweepExpired(nowEpochSec) {
      let removed = 0;
      for (const [id, e] of envelopes) {
        if (e.expiresAtEpochSec <= nowEpochSec) {
          envelopes.delete(id);
          removed++;
        }
      }
      for (const [sig, expiresAt] of seenSubmissionSignatures) {
        if (expiresAt <= nowEpochSec) seenSubmissionSignatures.delete(sig);
      }
      return removed;
    },

    // ---- منع إعادة إرسال مغلف (replay) ----
    // بصمة كل توقيع إيداع اتقبل قبل كده — بايتات مطابقة حرفيًا معناها نفس
    // الطلب اتلقَط وأُعيد بعثه. بتتنضف تلقائيًا مع sweepExpired.
    hasSeenSubmissionSignature(signatureB64) {
      return seenSubmissionSignatures.has(signatureB64);
    },
    recordSubmissionSignature(signatureB64, expiresAtEpochSec) {
      seenSubmissionSignatures.set(signatureB64, expiresAtEpochSec);
    },
  };
}

module.exports = { createInMemoryStore };
