// غلاف بسيط حول WhatsApp Business Cloud API (Meta Graph API).
// كل الأسرار من متغيّرات البيئة — مفيش توكن متحطوط في الكود.

const crypto = require('crypto');

const GRAPH_VERSION = process.env.GRAPH_VERSION || 'v21.0';

// مقارنة نصوص آمنة توقيتيًا (بتمنع timing attacks على المفاتيح). دالة نقية.
function timingSafeEqualStr(a, b) {
  const ba = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// تحقق توقيع Meta للـ webhook: X-Hub-Signature-256 = 'sha256=' + HMAC(app secret, raw body).
// دالة نقية (bytes/strings داخلة → boolean) عشان تتختبر بدون سيرفر.
function verifySignature(rawBody, signatureHeader, appSecret) {
  if (!appSecret) return false;
  const header = String(signatureHeader || '');
  if (!header.startsWith('sha256=')) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret)
    .update(rawBody instanceof Buffer ? rawBody : Buffer.from(String(rawBody), 'utf8'))
    .digest('hex');
  return timingSafeEqualStr(header, expected);
}

// محدّد معدّل بسيط في الذاكرة (sliding window). ملاحظة أمانة: في serverless ده لكل
// instance منفصلة — حماية best-effort من الإغراق، مش بديل عن حد معدّل على مستوى البنية.
function makeRateLimiter({ limit = 30, windowMs = 60000 } = {}) {
  const hits = [];
  return function allow(now) {
    const t = typeof now === 'number' ? now : Date.now();
    while (hits.length && t - hits[0] > windowMs) hits.shift();
    if (hits.length >= limit) return false;
    hits.push(t);
    return true;
  };
}

// يبني جسم رسالة نصية أو قالب معتمد. دالة نقية — سهلة الاختبار/المراجعة.
// - text: رسالة حرة (بتشتغل بس جوّه نافذة 24 ساعة من آخر رسالة بعتها العميل).
// - template: رسالة قالب معتمدة من Meta (بتشتغل خارج الـ24 ساعة كمان).
function buildMessage({ to, type, text, template }) {
  if (!to) throw new Error('missing "to"');
  const base = { messaging_product: 'whatsapp', to: String(to).replace(/\D/g, '') };
  if (!base.to) throw new Error('invalid "to" number');

  if (type === 'template') {
    if (!template || !template.name) throw new Error('template requires { name, language }');
    return {
      ...base,
      type: 'template',
      template: {
        name: template.name,
        language: { code: template.language || 'ar' },
        ...(template.components ? { components: template.components } : {}),
      },
    };
  }
  // الافتراضي: نص حر.
  if (!text || !String(text).trim()) throw new Error('text message requires "text"');
  return { ...base, type: 'text', text: { preview_url: false, body: String(text) } };
}

// بيبعت فعليًا عبر Graph API. بيرمي لو مفيش إعدادات أو لو Meta رجّعت خطأ.
async function sendMessage(payload) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error('server not configured: set WHATSAPP_TOKEN and PHONE_NUMBER_ID');

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(buildMessage(payload)),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data && data.error ? data.error.message : `HTTP ${res.status}`;
    const err = new Error(`WhatsApp API error: ${msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

module.exports = { buildMessage, sendMessage, GRAPH_VERSION, timingSafeEqualStr, verifySignature, makeRateLimiter };
