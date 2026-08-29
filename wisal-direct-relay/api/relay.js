// نقطة دخول واحدة لكل عمليات الـ relay (تسجيل/إيداع/سحب/تأكيد).
//
// ليه مُدمَجين في ملف واحد بدل 4 ملفات منفصلة؟ Vercel بيبني كل ملف تحت
// api/ كـ Serverless Function مستقلة تمامًا — بكل ما يعنيه ده من عملية
// (process) ونسخة module cache خاصة بيها. lib/sharedStore.js كان singleton
// على مستوى الملف، لكن في نشر حقيقي كل endpoint (devices/envelopes/
// inbox/ack) كان هيشتغل في عملية منفصلة عن التانية — يعني جهاز يتسجّل من
// /api/devices ما كانش هيبقى "موجود" أبدًا لطلب لاحق على /api/envelopes،
// وregisterDevice/submitEnvelope هيفشلوا بـ "sender not registered" كل
// مرة تقريبًا. دمجهم في function واحدة (مع rewrites في vercel.json) بيخلّي
// الطلبات المتتالية تشترك فعليًا في نفس نسخة الـ store جوّه نفس الـ
// invocation/instance الدافئة — مش ضمان كامل تحت تحميل متزامن عالي (لسه
// محتاج storage حقيقي زي ما هو موثّق)، لكنه بيصلّح العطل الأساسي اللي كان
// بيخلّي التدفّق العادي (تسجيل ثم إيداع) يفشل شبه دايمًا.
const store = require('../lib/sharedStore');
const { registerDevice, submitEnvelope, listInbox, ackDelivery } = require('../lib/relay');
const { makeRateLimiter } = require('../lib/limiter');

// حدود منفصلة لكل عملية — نفس القيم القديمة، بس الحارس بقى بعد التحقق
// من صحة الطلب (شكله + توقيعه) مش قبله. طلب مش موقّع صح أو ناقص حقول
// بيترفض فورًا من غير ما يستهلك حصة الحد المشترك — يمنع طرف مش مصرَّح له
// إنه "يستنزف" الحصة ويحجب مستخدمين حقيقيين عن نفس الـ instance.
const limiters = {
  devices: makeRateLimiter({ limit: 30, windowMs: 60000 }),
  envelopes: makeRateLimiter({ limit: 60, windowMs: 60000 }),
  inbox: makeRateLimiter({ limit: 120, windowMs: 60000 }),
  ack: makeRateLimiter({ limit: 120, windowMs: 60000 }),
};

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  return body || {};
}

function handleDevices(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method not allowed' });
  const body = parseBody(req);
  const result = registerDevice(
    store,
    { deviceId: body.deviceId, publicKeyB64: body.publicKeyB64, signatureB64: body.signatureB64 },
    Math.floor(Date.now() / 1000),
  );
  if (!limiters.devices()) return res.status(429).json({ ok: false, error: 'rate limit exceeded — slow down' });
  res.status(result.ok ? 200 : 400).json(result);
}

function handleEnvelopes(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method not allowed' });
  const body = parseBody(req);
  const result = submitEnvelope(
    store,
    {
      senderDeviceId: body.senderDeviceId,
      recipientDeviceId: body.recipientDeviceId,
      ciphertextB64: body.ciphertextB64,
      backend: body.backend,
      expiresAtEpochSec: body.expiresAtEpochSec,
    },
    body.signatureB64,
    Math.floor(Date.now() / 1000),
  );
  if (!limiters.envelopes()) return res.status(429).json({ ok: false, error: 'rate limit exceeded — slow down' });
  res.status(result.ok ? 200 : 400).json(result);
}

function handleInbox(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method not allowed' });
  const { deviceId, timestamp, signatureB64 } = req.query || {};
  const result = listInbox(
    store,
    { deviceId, timestamp: timestamp ? Number(timestamp) : undefined, signatureB64 },
    Math.floor(Date.now() / 1000),
  );
  if (!limiters.inbox()) return res.status(429).json({ ok: false, error: 'rate limit exceeded — slow down' });
  res.status(result.ok ? 200 : 400).json(result);
}

function handleAck(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method not allowed' });
  const body = parseBody(req);
  const result = ackDelivery(
    store,
    { deviceId: body.deviceId, envelopeId: body.envelopeId, signatureB64: body.signatureB64 },
    Math.floor(Date.now() / 1000),
  );
  if (!limiters.ack()) return res.status(429).json({ ok: false, error: 'rate limit exceeded — slow down' });
  res.status(result.ok ? 200 : 400).json(result);
}

const OPS = { devices: handleDevices, envelopes: handleEnvelopes, inbox: handleInbox, ack: handleAck };

module.exports = async function handler(req, res) {
  const op = req.query && req.query.op;
  const fn = OPS[op];
  if (!fn) {
    res.status(404).json({ ok: false, error: 'unknown operation' });
    return;
  }
  fn(req, res);
};
