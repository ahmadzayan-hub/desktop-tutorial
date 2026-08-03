// اختبارات نقية لبناء جسم الرسالة (بدون شبكة). شغّلها بـ: npm test
const assert = require('assert');
const { buildMessage } = require('../lib/wa');

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

console.log('wa.test.js: all assertions passed ✅');
