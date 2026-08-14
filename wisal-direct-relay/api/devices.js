// POST /api/devices — تسجيل جهاز (ADR-002 §5.2): معرّف + مفتاح عام + توقيع
// إثبات الملكية. مفيش رقم تليفون ولا إيميل ولا أي معرّف شخصي هنا خالص.
const store = require('../lib/sharedStore');
const { registerDevice } = require('../lib/relay');
const { makeRateLimiter } = require('../lib/limiter');

const allow = makeRateLimiter({ limit: 30, windowMs: 60000 });

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method not allowed' });
    return;
  }
  if (!allow()) {
    res.status(429).json({ ok: false, error: 'rate limit exceeded — slow down' });
    return;
  }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const result = registerDevice(
    store,
    { deviceId: body.deviceId, publicKeyB64: body.publicKeyB64, signatureB64: body.signatureB64 },
    Math.floor(Date.now() / 1000),
  );
  res.status(result.ok ? 200 : 400).json(result);
};
