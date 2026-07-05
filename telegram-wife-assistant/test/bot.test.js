const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const { useTempStore, makeFakeBot, makeCtx } = require('./helpers');

const tmp = useTempStore();
const llm = require('../llm');
const config = require('../config');
const { setupHandlers } = require('../bot');
const store = require('../store');

// إعداد ثابت للاختبارات: موديل مزيّف + مالك محدّد + إرسال حقيقي (تليجرام مزيّف).
llm.complete = async () => '١- الاقتراح الأول\n٢- الاقتراح التاني';
config.chatId = '555';
config.dryRun = false;

const OWNER = '555';
const STRANGER = '999';

let bot, H, sent;
beforeEach(() => {
  tmp.cleanup();
  ({ bot, H, sent } = makeFakeBot());
  setupHandlers(bot);
});
after(() => tmp.cleanup());

test('/suggest بيبعت رسالة بأزرار (اختيار + نسخ)', async () => {
  await H.commands.suggest(makeCtx(OWNER, '/suggest'));
  const msg = sent.find((s) => s.keyboard);
  assert.ok(msg, 'المفروض اتبعت رسالة بكيبورد');
  const labels = msg.keyboard.flat().map((b) => b.text);
  assert.ok(labels.some((l) => l.includes('اختار الأول')));
  assert.ok(labels.some((l) => l.includes('انسخ')), 'لازم فيه زر نسخ');
  // زر النسخ لازم يحمل copy_text
  const copyBtn = msg.keyboard.flat().find((b) => b.copy_text);
  assert.ok(copyBtn && typeof copyBtn.copy_text.text === 'string');
});

test('pick1 بيبعت النص المختار لوحده ويحفظه في ملف الأسلوب', async () => {
  const sink = [];
  await H.commands.suggest(makeCtx(OWNER, '/suggest'));
  await H.actions.pick1(makeCtx(OWNER, '', sink));
  assert.ok(sink.some((s) => s.reply === 'الاقتراح الأول'));
  assert.strictEqual(store.getStyleExamples().slice(-1)[0].text, 'الاقتراح الأول');
});

test('حارس المالك: أي حد غير المالك بيتجاهل', async () => {
  await H.commands.suggest(makeCtx(STRANGER, '/suggest'));
  assert.strictEqual(sent.length, 0);
});

test('رد نصي حر بيتسجّل كتعديل (edited)', async () => {
  const sink = [];
  await H.commands.suggest(makeCtx(OWNER, '/suggest'));
  await H.text(makeCtx(OWNER, 'نسختي المعدلة', sink));
  const edited = store.getFeedback().filter((f) => f.choice === 'edited');
  assert.strictEqual(edited.length, 1);
  assert.strictEqual(edited[0].finalText, 'نسختي المعدلة');
});

test('ignore بيسجّل تجاهل بدون أمثلة أسلوب', async () => {
  await H.commands.suggest(makeCtx(OWNER, '/suggest'));
  const before = store.getStyleExamples().length;
  await H.actions.ignore(makeCtx(OWNER));
  assert.strictEqual(store.getStyleExamples().length, before);
  assert.ok(store.getFeedback().some((f) => f.choice === 'ignore'));
});

test('regen بيسجّل المجموعة الأولى ويولّد تانية', async () => {
  await H.commands.suggest(makeCtx(OWNER, '/suggest'));
  sent.length = 0;
  await H.actions.regen(makeCtx(OWNER));
  assert.ok(store.getFeedback().some((f) => f.choice === 'regen'));
  assert.ok(sent.find((s) => s.keyboard), 'المفروض بعت اقتراحين جداد');
});

test('/occasion بنص مخصّص بيحط المناسبة في الرسالة', async () => {
  await H.commands.occasion(makeCtx(OWNER, '/occasion عيد جوازنا'));
  assert.ok(sent.some((s) => s.text && s.text.includes('عيد جوازنا')));
});

test('/reset بيصفّر التعلّم', async () => {
  const sink = [];
  await H.commands.suggest(makeCtx(OWNER, '/suggest'));
  await H.actions.pick1(makeCtx(OWNER));
  assert.ok(store.getStyleExamples().length > 0);
  await H.commands.reset(makeCtx(OWNER, '/reset', sink));
  assert.strictEqual(store.getStyleExamples().length, 0);
});
