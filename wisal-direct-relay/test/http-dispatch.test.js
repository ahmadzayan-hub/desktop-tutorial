// اختبار انحدار مباشر للعطل الحرج اللي اكتشفه تدقيق الكود: قبل كده كل
// endpoint (devices/envelopes/inbox/ack) كان ملف Vercel Function منفصل،
// يعني في نشر حقيقي كل واحد بيشتغل في عملية مستقلة بنسخة store خاصة بيها
// — تسجيل جهاز من /api/devices ما كانش "موجود" أبدًا لطلب لاحق على
// /api/envelopes. الاختبار ده بينادي على handler الموحّد (api/relay.js)
// بطلبات req/res وهمية منفصلة تمامًا لكل عملية (زي ما هيحصل فعليًا بين
// طلبات HTTP حقيقية)، ويتأكد إن الحالة فعلًا بتتشارك.
const assert = require('assert');
const { generateKeyPairSync, createSign } = require('crypto');
const handler = require('../api/relay');

function makeIdentity() {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  return { publicKeyB64: publicKey.export({ type: 'spki', format: 'der' }).toString('base64'), privateKey };
}
function sign(privateKey, data) {
  const s = createSign('SHA256'); s.update(data); s.end();
  return s.sign(privateKey).toString('base64');
}

// req/res وهمية بسيطة — بتلتقط الرد بدون سيرفر حقيقي.
function mockReq({ method, query = {}, body }) {
  return { method, query, body };
}
function mockRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.body = obj; return res; };
  return res;
}

async function call(op, req) {
  const res = mockRes();
  req.query = { ...(req.query || {}), op };
  await handler(req, res);
  return res;
}

(async () => {
  const alice = makeIdentity();
  const bob = makeIdentity();
  const NOW = () => Math.floor(Date.now() / 1000);

  // تسجيل بوب — استدعاء منفصل تمامًا (req/res جديدة) زي ما هيحصل بين طلبين حقيقيين.
  const bobId = 'bob-http-' + Date.now();
  const regRes = await call('devices', mockReq({
    method: 'POST',
    body: { deviceId: bobId, publicKeyB64: bob.publicKeyB64, signatureB64: sign(bob.privateKey, `wisal-direct-register:${bobId}`) },
  }));
  assert.strictEqual(regRes.statusCode, 200);
  assert.strictEqual(regRes.body.ok, true);

  // تسجيل أليس — استدعاء تالت منفصل.
  const aliceId = 'alice-http-' + Date.now();
  await call('devices', mockReq({
    method: 'POST',
    body: { deviceId: aliceId, publicKeyB64: alice.publicKeyB64, signatureB64: sign(alice.privateKey, `wisal-direct-register:${aliceId}`) },
  }));

  // إيداع من أليس لبوب — لازم يلاقي الاتنين مسجَّلين رغم إن كل نداء منفصل.
  const ct = Buffer.from('opaque').toString('base64');
  const expiresAt = NOW() + 3600;
  const backend = 'VODOZEMAC';
  const submitProof = `${aliceId}:${bobId}:${ct}:${backend}:${expiresAt}`;
  const submitRes = await call('envelopes', mockReq({
    method: 'POST',
    body: {
      senderDeviceId: aliceId, recipientDeviceId: bobId, ciphertextB64: ct, backend, expiresAtEpochSec: expiresAt,
      signatureB64: sign(alice.privateKey, submitProof),
    },
  }));
  assert.strictEqual(submitRes.statusCode, 200, `submit failed: ${JSON.stringify(submitRes.body)}`);
  assert.strictEqual(submitRes.body.ok, true);
  const envelopeId = submitRes.body.id;

  // صندوق وارد بوب — استدعاء رابع منفصل، لازم يلاقي المغلف اللي اتبعت في نداء مختلف تمامًا.
  const ts = NOW();
  const inboxRes = await call('inbox', mockReq({
    method: 'GET',
    query: { deviceId: bobId, timestamp: String(ts), signatureB64: sign(bob.privateKey, `fetch:${bobId}:${ts}`) },
  }));
  assert.strictEqual(inboxRes.statusCode, 200);
  assert.strictEqual(inboxRes.body.items.length, 1, 'inbox must see the envelope submitted via a separate call');
  assert.strictEqual(inboxRes.body.items[0].id, envelopeId);

  // تأكيد التسليم — استدعاء خامس منفصل.
  const ackRes = await call('ack', mockReq({
    method: 'POST',
    body: { deviceId: bobId, envelopeId, signatureB64: sign(bob.privateKey, `ack:${envelopeId}`) },
  }));
  assert.strictEqual(ackRes.statusCode, 200);
  assert.strictEqual(ackRes.body.ok, true);

  // عملية غير معروفة: 404 نضيف.
  const unknownRes = await call('nope', mockReq({ method: 'GET' }));
  assert.strictEqual(unknownRes.statusCode, 404);

  console.log('http-dispatch.test.js: all assertions passed ✅ (shared state across separate calls confirmed)');
})();
