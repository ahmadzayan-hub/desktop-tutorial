const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const { useTempStore } = require('./helpers');

// نعزل المخزن في ملف مؤقت قبل تحميل الموديول.
const tmp = useTempStore();
const store = require('../store');
const config = require('../config');
const util = require('../util');

beforeEach(() => tmp.cleanup()); // كل اختبار يبدأ بمخزن نضيف
after(() => tmp.cleanup());

test('ملف الأسلوب محدود بـ styleExamplesMax (الأقدم يخرج)', () => {
  const max = config.styleExamplesMax;
  for (let i = 0; i < max + 5; i++) store.addStyleExample(`مثال ${i}`, 'امتنان');
  const ex = store.getStyleExamples();
  assert.strictEqual(ex.length, max);
  // آخر واحد اتضاف لازم يكون موجود، وأول واحد يكون خرج.
  assert.strictEqual(ex[ex.length - 1].text, `مثال ${max + 4}`);
  assert.ok(!ex.some((e) => e.text === 'مثال 0'));
});

test('أوزان المواضيع بتزيد وتقل مع حدود [0.2 , 5]', () => {
  store.bumpThemeWeight('امتنان', +0.3);
  assert.ok(store.getThemeWeights()['امتنان'] > 1);
  // تخطّي الحد الأقصى
  for (let i = 0; i < 50; i++) store.bumpThemeWeight('امتنان', +1);
  assert.strictEqual(store.getThemeWeights()['امتنان'], 5);
  // تخطّي الحد الأدنى
  for (let i = 0; i < 50; i++) store.bumpThemeWeight('امتنان', -1);
  assert.strictEqual(store.getThemeWeights()['امتنان'], 0.2);
});

test('ثبات الحالة: مش نفس الخانة مرتين في نفس اليوم', () => {
  assert.strictEqual(store.wasSlotSentToday('morning'), false);
  store.markSlotSentToday('morning');
  assert.strictEqual(store.wasSlotSentToday('morning'), true);
  assert.strictEqual(store.wasSlotSentToday('evening'), false);
});

test('recentThemes بيرجّع مواضيع آخر N يوم', () => {
  store.addFeedback({ slot: 'morning', themesShown: ['امتنان', 'دعاء'], choice: 'pick1' });
  const recent = store.recentThemes(3);
  assert.ok(recent.includes('امتنان'));
  assert.ok(recent.includes('دعاء'));
});

test('reset بيصفّر التعلّم بس بيحافظ على lastSentPerSlot', () => {
  store.addStyleExample('مثال', 'امتنان');
  store.markSlotSentToday('morning');
  store.resetLearning();
  assert.strictEqual(store.getStyleExamples().length, 0);
  // مهم: عشان ما يبعتش نفس الخانة تاني في نفس اليوم بعد الريسيت.
  assert.strictEqual(store.wasSlotSentToday('morning'), true);
});

test('المخزن التالف بيرجّع نسخة افتراضية بدل ما يقع', () => {
  const fs = require('fs');
  fs.writeFileSync(store.STORE_PATH, '{ مش json صحيح', 'utf8');
  const s = store.read();
  assert.ok(Array.isArray(s.feedback));
  assert.ok(Array.isArray(s.styleExamples));
});
