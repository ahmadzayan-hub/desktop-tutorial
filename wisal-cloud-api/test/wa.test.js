// اختبارات نقية لبناء جسم الرسالة (بدون شبكة). شغّلها بـ: npm test
const assert = require('assert');
const { buildMessage, timingSafeEqualStr, verifySignature, makeRateLimiter } = require('../lib/wa');
const crypto = require('crypto');

// نص حر
{
  const m = buildMessage({ to: '+971 50 123 4567', type: 'text', text: 'أهلاً' });
  assert.strictEqual(m.messaging_product, 'whatsapp');
  assert.strictEqual(m.to, '971501234567'); // اتشال منها غير الأرقام
  assert.strictEqual(m.type, 'text');
  assert.strictEqual(m.text.body, 'أهلاً');
}

// قالب معتمد
{
  const m = buildMessage({ to: '201001234567', type: 'template', template: { name: 'hello', language: 'ar' } });
  assert.strictEqual(m.type, 'template');
  assert.strictEqual(m.template.name, 'hello');
  assert.strictEqual(m.template.language.code, 'ar');
}

// أخطاء
assert.throws(() => buildMessage({ to: '', type: 'text', text: 'x' }), /missing "to"/);
assert.throws(() => buildMessage({ to: '971', type: 'text' }), /requires "text"/);
assert.throws(() => buildMessage({ to: '971', type: 'template', template: {} }), /template requires/);

// مقارنة آمنة توقيتيًا
assert.strictEqual(timingSafeEqualStr('secret', 'secret'), true);
assert.strictEqual(timingSafeEqualStr('secret', 'Secret'), false);
assert.strictEqual(timingSafeEqualStr('secret', 'secre'), false);
assert.strictEqual(timingSafeEqualStr('', ''), true);

// تحقق توقيع Meta (HMAC-SHA256 على الـ raw body)
{
  const secret = 'app-secret-123';
  const body = Buffer.from(JSON.stringify({ entry: [] }), 'utf8');
  const good = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
  assert.strictEqual(verifySignature(body, good, secret), true);
  assert.strictEqual(verifySignature(body, 'sha256=' + '0'.repeat(64), secret), false);
  assert.strictEqual(verifySignature(body, good, 'wrong-secret'), false);
  assert.strictEqual(verifySignature(body, '', secret), false);
  assert.strictEqual(verifySignature(body, good, ''), false); // مفيش سر = مفيش قبول
}

// محدّد المعدّل (بزمن صناعي — حتمي)
{
  const allow = makeRateLimiter({ limit: 3, windowMs: 1000 });
  assert.strictEqual(allow(0), true);
  assert.strictEqual(allow(10), true);
  assert.strictEqual(allow(20), true);
  assert.strictEqual(allow(30), false);          // الرابع جوه النافذة يترفض
  assert.strictEqual(allow(1100), true);          // بعد النافذة يرجع يسمح
}

console.log('wa.test.js: all assertions passed ✅');
