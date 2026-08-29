// اختبارات نقية لمنطق الـ relay (بدون شبكة). شغّلها بـ: npm test
const assert = require('assert');
const { generateKeyPairSync, createSign } = require('crypto');
const { createInMemoryStore } = require('../lib/store');
const {
  registerDevice, submitEnvelope, listInbox, ackDelivery,
} = require('../lib/relay');

// ---- مساعدين يمثّلون عميل يوقّع بمفتاحه الخاص (زي DeviceIdentityCodec) ----
function makeIdentity() {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const publicKeyB64 = publicKey.export({ type: 'spki', format: 'der' }).toString('base64');
  return { publicKeyB64, privateKey };
}
function sign(privateKey, data) {
  const signer = createSign('SHA256');
  signer.update(data);
  signer.end();
  return signer.sign(privateKey).toString('base64');
}

const NOW = 1_800_000_000;

// ---- تسجيل جهاز: نجاح، توقيع غلط، انتحال معرّف بمفتاح مختلف ----
{
  const store = createInMemoryStore();
  const alice = makeIdentity();
  const sig = sign(alice.privateKey, 'wisal-direct-register:devA');
  const r = registerDevice(store, { deviceId: 'devA', publicKeyB64: alice.publicKeyB64, signatureB64: sig }, NOW);
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(store.getDevice('devA').publicKeyB64, alice.publicKeyB64);

  // إعادة تسجيل بنفس المفتاح: مسموح (idempotent)
  const r2 = registerDevice(store, { deviceId: 'devA', publicKeyB64: alice.publicKeyB64, signatureB64: sig }, NOW + 1);
  assert.strictEqual(r2.ok, true);

  // توقيع غلط: مرفوض
  const bob = makeIdentity();
  const badSig = sign(bob.privateKey, 'wisal-direct-register:devA');
  const r3 = registerDevice(store, { deviceId: 'devA', publicKeyB64: alice.publicKeyB64, signatureB64: badSig }, NOW);
  assert.strictEqual(r3.ok, false);

  // انتحال: نفس المعرّف بمفتاح مختلف صحيح على نفسه — مرفوض
  const takeoverSig = sign(bob.privateKey, 'wisal-direct-register:devA');
  const r4 = registerDevice(store, { deviceId: 'devA', publicKeyB64: bob.publicKeyB64, signatureB64: takeoverSig }, NOW);
  assert.strictEqual(r4.ok, false);
  assert.match(r4.reason, /different key/);
}

// ---- دورة كاملة: تسجيل → إيداع → صندوق وارد → تأكيد تسليم (بيمسح) ----
{
  const store = createInMemoryStore();
  const alice = makeIdentity();
  const bobId = 'devB';
  registerDevice(store, {
    deviceId: 'devA', publicKeyB64: alice.publicKeyB64,
    signatureB64: sign(alice.privateKey, 'wisal-direct-register:devA'),
  }, NOW);
  const bob = makeIdentity();
  registerDevice(store, {
    deviceId: bobId, publicKeyB64: bob.publicKeyB64,
    signatureB64: sign(bob.privateKey, `wisal-direct-register:${bobId}`),
  }, NOW);

  const ciphertextB64 = Buffer.from('opaque-bytes-not-plaintext').toString('base64');
  const expiresAt = NOW + 3600;
  const proof = `devA:${bobId}:${ciphertextB64}:VODOZEMAC:${expiresAt}`;
  const submit = submitEnvelope(
    store,
    { senderDeviceId: 'devA', recipientDeviceId: bobId, ciphertextB64, backend: 'VODOZEMAC', expiresAtEpochSec: expiresAt },
    sign(alice.privateKey, proof),
    NOW,
  );
  assert.strictEqual(submit.ok, true);
  assert.ok(submit.id);

  // Bob يسحب صندوقه — لازم يوقّع بنفسه، مش أليس
  const ts = NOW + 5;
  const fetchProof = `fetch:${bobId}:${ts}`;
  const inbox = listInbox(store, { deviceId: bobId, timestamp: ts, signatureB64: sign(bob.privateKey, fetchProof) }, NOW + 5);
  assert.strictEqual(inbox.ok, true);
  assert.strictEqual(inbox.items.length, 1);
  assert.strictEqual(inbox.items[0].ciphertextB64, ciphertextB64);
  // صندوق وارد أليس فاضي — المغلف موجّه لبوب بس
  const aliceInboxProof = `fetch:devA:${ts}`;
  const aliceInbox = listInbox(store, { deviceId: 'devA', timestamp: ts, signatureB64: sign(alice.privateKey, aliceInboxProof) }, NOW + 5);
  assert.strictEqual(aliceInbox.items.length, 0);

  // تأكيد تسليم ببوب — لازم يمسح المغلف نهائيًا
  const ackProof = `ack:${submit.id}`;
  const ack = ackDelivery(store, { deviceId: bobId, envelopeId: submit.id, signatureB64: sign(bob.privateKey, ackProof) }, NOW + 10);
  assert.strictEqual(ack.ok, true);
  assert.strictEqual(store.getEnvelope(submit.id), null);

  // تأكيد تاني على نفس المغلف: مرفوض (مسحته خلاص)
  const ack2 = ackDelivery(store, { deviceId: bobId, envelopeId: submit.id, signatureB64: sign(bob.privateKey, ackProof) }, NOW + 11);
  assert.strictEqual(ack2.ok, false);
}

// ---- حواف: انتهاء صلاحية، TTL طويل جدًا، توقيع fetch قديم، مغلف لشخص تاني ----
{
  const store = createInMemoryStore();
  const alice = makeIdentity();
  registerDevice(store, {
    deviceId: 'devA', publicKeyB64: alice.publicKeyB64,
    signatureB64: sign(alice.privateKey, 'wisal-direct-register:devA'),
  }, NOW);
  const bob = makeIdentity();
  registerDevice(store, {
    deviceId: 'devB', publicKeyB64: bob.publicKeyB64,
    signatureB64: sign(bob.privateKey, 'wisal-direct-register:devB'),
  }, NOW);

  const ct = Buffer.from('x').toString('base64');

  // مغلف بصلاحية في الماضي: مرفوض
  const expiredProof = `devA:devB:${ct}:VODOZEMAC:${NOW - 1}`;
  const expired = submitEnvelope(store, { senderDeviceId: 'devA', recipientDeviceId: 'devB', ciphertextB64: ct, backend: 'VODOZEMAC', expiresAtEpochSec: NOW - 1 }, sign(alice.privateKey, expiredProof), NOW);
  assert.strictEqual(expired.ok, false);
  assert.strictEqual(expired.reason, 'already expired');

  // TTL أطول من المسموح: مرفوض
  const tooLongExp = NOW + 30 * 24 * 3600;
  const tooLongProof = `devA:devB:${ct}:VODOZEMAC:${tooLongExp}`;
  const tooLong = submitEnvelope(store, { senderDeviceId: 'devA', recipientDeviceId: 'devB', ciphertextB64: ct, backend: 'VODOZEMAC', expiresAtEpochSec: tooLongExp }, sign(alice.privateKey, tooLongProof), NOW);
  assert.strictEqual(tooLong.ok, false);
  assert.strictEqual(tooLong.reason, 'ttl too long');

  // انتهاء غير رقمي (NaN): لازم يترفض صريح، مش يعدّي المقارنات بصمت
  const nanProof = `devA:devB:${ct}:VODOZEMAC:not-a-number`;
  const nanExpiry = submitEnvelope(store, { senderDeviceId: 'devA', recipientDeviceId: 'devB', ciphertextB64: ct, backend: 'VODOZEMAC', expiresAtEpochSec: 'not-a-number' }, sign(alice.privateKey, nanProof), NOW);
  assert.strictEqual(nanExpiry.ok, false);
  assert.strictEqual(nanExpiry.reason, 'invalid expiry');

  // مُرسِل غير مسجّل: مرفوض
  const unregisteredProof = `devZ:devB:${ct}:VODOZEMAC:${NOW + 100}`;
  const unregistered = submitEnvelope(store, { senderDeviceId: 'devZ', recipientDeviceId: 'devB', ciphertextB64: ct, backend: 'VODOZEMAC', expiresAtEpochSec: NOW + 100 }, sign(alice.privateKey, unregisteredProof), NOW);
  assert.strictEqual(unregistered.ok, false);
  assert.strictEqual(unregistered.reason, 'sender not registered');

  // مستلم غير مسجّل: مرفوض
  const unregRecipientProof = `devA:ghost:${ct}:VODOZEMAC:${NOW + 100}`;
  const unregRecipient = submitEnvelope(store, { senderDeviceId: 'devA', recipientDeviceId: 'ghost', ciphertextB64: ct, backend: 'VODOZEMAC', expiresAtEpochSec: NOW + 100 }, sign(alice.privateKey, unregRecipientProof), NOW);
  assert.strictEqual(unregRecipient.ok, false);
  assert.strictEqual(unregRecipient.reason, 'recipient not registered');

  // إعادة إرسال نفس التوقيع بالظبط (replay): يترفض تاني مرة
  const replayProof = `devA:devB:${ct}:VODOZEMAC:${NOW + 100}`;
  const replaySig = sign(alice.privateKey, replayProof);
  const first = submitEnvelope(store, { senderDeviceId: 'devA', recipientDeviceId: 'devB', ciphertextB64: ct, backend: 'VODOZEMAC', expiresAtEpochSec: NOW + 100 }, replaySig, NOW);
  assert.strictEqual(first.ok, true);
  const replay = submitEnvelope(store, { senderDeviceId: 'devA', recipientDeviceId: 'devB', ciphertextB64: ct, backend: 'VODOZEMAC', expiresAtEpochSec: NOW + 100 }, replaySig, NOW + 1);
  assert.strictEqual(replay.ok, false);
  assert.strictEqual(replay.reason, 'replayed submission');

  // بصمة الإثبات لازم تشمل backend — لو غيّرته من غير ما تعيد التوقيع
  // بالقيمة الجديدة، السيرفر يرفض (منع تلاعب بتصنيف بروتوكول التشفير).
  const tamperedBackendProof = `devA:devB:${ct}:VODOZEMAC:${NOW + 200}`; // موقّع كـ VODOZEMAC
  const tamperedBackend = submitEnvelope(
    store,
    { senderDeviceId: 'devA', recipientDeviceId: 'devB', ciphertextB64: ct, backend: 'SIGNAL', expiresAtEpochSec: NOW + 200 }, // اتبعت كـ SIGNAL
    sign(alice.privateKey, tamperedBackendProof),
    NOW,
  );
  assert.strictEqual(tamperedBackend.ok, false);
  assert.strictEqual(tamperedBackend.reason, 'bad signature');

  // توقيع fetch قديم جدًا (خارج نافذة الانحراف الزمني): مرفوض
  const staleTs = NOW - 1000;
  const staleProof = `fetch:devB:${staleTs}`;
  const stale = listInbox(store, { deviceId: 'devB', timestamp: staleTs, signatureB64: sign(bob.privateKey, staleProof) }, NOW);
  assert.strictEqual(stale.ok, false);
  assert.strictEqual(stale.reason, 'stale timestamp');

  // توقيت غير رقمي (NaN) على fetch: لازم يترفض صريح، مش يعدّي فحص الانحراف بصمت
  const nanTsProof = `fetch:devB:not-a-number`;
  const nanTs = listInbox(store, { deviceId: 'devB', timestamp: 'not-a-number', signatureB64: sign(bob.privateKey, nanTsProof) }, NOW);
  assert.strictEqual(nanTs.ok, false);
  assert.strictEqual(nanTs.reason, 'invalid timestamp');

  // تأكيد تسليم مغلف لشخص تاني: مرفوض
  const proof = `devA:devB:${ct}:VODOZEMAC:${NOW + 300}`;
  const submit = submitEnvelope(store, { senderDeviceId: 'devA', recipientDeviceId: 'devB', ciphertextB64: ct, backend: 'VODOZEMAC', expiresAtEpochSec: NOW + 300 }, sign(alice.privateKey, proof), NOW);
  const wrongAckProof = `ack:${submit.id}`;
  const wrongAck = ackDelivery(store, { deviceId: 'devA', envelopeId: submit.id, signatureB64: sign(alice.privateKey, wrongAckProof) }, NOW);
  assert.strictEqual(wrongAck.ok, false);
  assert.strictEqual(wrongAck.reason, 'not your envelope');
}

// ---- الاكتساح: مغلف منتهي بيختفي من صندوق الوارد تلقائيًا ----
{
  const store = createInMemoryStore();
  const alice = makeIdentity();
  registerDevice(store, { deviceId: 'devA', publicKeyB64: alice.publicKeyB64, signatureB64: sign(alice.privateKey, 'wisal-direct-register:devA') }, NOW);
  const bob = makeIdentity();
  registerDevice(store, { deviceId: 'devB', publicKeyB64: bob.publicKeyB64, signatureB64: sign(bob.privateKey, 'wisal-direct-register:devB') }, NOW);

  const ct = Buffer.from('y').toString('base64');
  const shortExp = NOW + 50;
  const proof = `devA:devB:${ct}:VODOZEMAC:${shortExp}`;
  const submit = submitEnvelope(store, { senderDeviceId: 'devA', recipientDeviceId: 'devB', ciphertextB64: ct, backend: 'VODOZEMAC', expiresAtEpochSec: shortExp }, sign(alice.privateKey, proof), NOW);
  assert.strictEqual(submit.ok, true);

  const laterTs = NOW + 200;
  const fetchProof = `fetch:devB:${laterTs}`;
  const inbox = listInbox(store, { deviceId: 'devB', timestamp: laterTs, signatureB64: sign(bob.privateKey, fetchProof) }, laterTs);
  assert.strictEqual(inbox.ok, true);
  assert.strictEqual(inbox.items.length, 0); // اتكسح قبل ما يوصل
}

console.log('relay.test.js: all assertions passed ✅');
