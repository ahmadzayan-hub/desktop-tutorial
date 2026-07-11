const { test, afterEach } = require('node:test');
const assert = require('node:assert');

const config = require('../config');
const util = require('../util');
const { getTodaysOccasion } = require('../occasions');

const { ymd, mmdd } = util.todayParts();

// نرجّع نسخة نضيفة من occasions بعد كل اختبار عشان الاختبارات ما تأثّرش على بعض.
const original = JSON.parse(JSON.stringify(config.occasions));
afterEach(() => {
  config.occasions = JSON.parse(JSON.stringify(original));
});

test('مناسبة ثابتة (fixed MM-DD) بتتطابق النهاردة', () => {
  config.occasions = { anniv: { type: 'fixed', date: mmdd, label: 'عيد جوازنا' } };
  assert.strictEqual(getTodaysOccasion()?.label, 'عيد جوازنا');
});

test('مناسبة يدوية (manual dates[]) بتتطابق النهاردة', () => {
  config.occasions = {
    eid: { type: 'manual', dates: ['2000-01-01', ymd], label: 'عيد' },
  };
  assert.strictEqual(getTodaysOccasion()?.label, 'عيد');
});

test('الـ placeholders (MM-DD / YYYY-MM-DD) بتتجاهل', () => {
  config.occasions = {
    a: { type: 'fixed', date: 'MM-DD', label: 'x' },
    b: { type: 'manual', dates: ['YYYY-MM-DD'], label: 'y' },
  };
  assert.strictEqual(getTodaysOccasion(), null);
});

test('يوم من غير مناسبة بيرجّع null', () => {
  // تاريخ مستحيل يطابق النهاردة
  config.occasions = { a: { type: 'fixed', date: '01-01', label: 'x' } };
  const res = getTodaysOccasion();
  // ممكن يصادف 1 يناير، فنتحقق منطقياً:
  if (mmdd !== '01-01') assert.strictEqual(res, null);
  else assert.strictEqual(res?.label, 'x');
});
