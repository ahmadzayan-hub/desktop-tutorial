// GET /api/inbox?deviceId=...&timestamp=...&signatureB64=... — صندوق وارد
// جهاز. إثبات الهوية بتوقيع على "fetch:{deviceId}:{timestamp}"، والـ
// timestamp لازم يكون قريب من وقت السيرفر — يمنع أي حد يعيد استخدام توقيع قديم
// اتسرّب عشان يسرد رسائل شخص تاني.
const store = require('../lib/sharedStore');
const { listInbox } = require('../lib/relay');
const { makeRateLimiter } = require('../lib/limiter');

const allow = makeRateLimiter({ limit: 120, windowMs: 60000 });

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }
  if (!allow()) {
    res.status(429).json({ ok: false, error: 'rate limit exceeded — slow down' });
    return;
  }
  const { deviceId, timestamp, signatureB64 } = req.query || {};
  const result = listInbox(
    store,
    { deviceId, timestamp: timestamp ? Number(timestamp) : undefined, signatureB64 },
    Math.floor(Date.now() / 1000),
  );
  res.status(result.ok ? 200 : 400).json(result);
};
