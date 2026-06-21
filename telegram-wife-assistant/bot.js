// =====================================================================
// bot.js — منطق تيليجرام.
// المسؤول عن: إرسال الاقتراحين بأزرار، التقاط ضغط الأزرار والرد النصي،
// وأوامر /start و /stats و /reset.
//
// قاعدة صارمة: الـ agent بيكلّم chatId بتاعي أنا فقط. مفيش أي إرسال لأي
// حد تاني. كل دالة إرسال بتروح لـ config.chatId بس.
// =====================================================================

const { Telegraf, Markup } = require('telegraf');
const config = require('./config');
const store = require('./store');
const review = require('./review');
const { generateSuggestions } = require('./generateSuggestion');

// آخر اقتراحات اتبعتت (في الذاكرة) عشان نربط الزرار/الرد النصي بسياقه.
// مستخدم واحد بس، فماب بسيط كفاية.
let pending = null; // { slot, themesShown, items, occasion }

// تنسيق رسالة الاقتراحين.
function formatMessage(items, slot, occasion) {
  const head = occasion
    ? `💌 مناسبة: ${occasion.label}`
    : slot === 'morning'
    ? '🌅 اقتراح الصباح'
    : slot === 'evening'
    ? '🌙 اقتراح المساء'
    : '💌 اقتراح';

  return [
    head,
    '',
    `1️⃣ ${items[0].text}`,
    '',
    `2️⃣ ${items[1].text}`,
    '',
    '— اختار، أو ابعتلي نسختك المعدّلة كنص حر.',
  ].join('\n');
}

// أزرار التفاعل تحت الرسالة.
function buildKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('1️⃣ اختار الأول', 'pick1'),
      Markup.button.callback('2️⃣ اختار الثاني', 'pick2'),
    ],
    [
      Markup.button.callback('🔄 جديد', 'regen'),
      Markup.button.callback('🙈 تجاهل', 'ignore'),
    ],
  ]);
}

/**
 * sendSuggestions — يولّد ويبعت اقتراحين للخانة دي.
 * بيحترم dryRun (يطبع بدل ما يبعت) وثبات الحالة (مش نفس الخانة مرتين/يوم).
 * @param {Telegraf} bot
 * @param {object} opts { slot, occasion, force }
 */
async function sendSuggestions(bot, { slot, occasion, force = false } = {}) {
  // ثبات الحالة: ما نبعتش نفس الخانة مرتين في نفس اليوم (إلا بالـ force).
  if (!force && store.wasSlotSentToday(slot)) {
    console.log(`⏭️  الخانة (${slot}) اتبعتت النهاردة قبل كده — تخطّي.`);
    return;
  }

  const result = await generateSuggestions({ slot, occasion });
  pending = { slot, themesShown: result.themesShown, items: result.items, occasion };

  const text = formatMessage(result.items, slot, occasion);

  if (config.dryRun) {
    console.log('\n===== [dryRun] مش هيتبعت، ده اللي كان هيوصلك =====');
    console.log(text);
    console.log('================================================\n');
    store.markSlotSentToday(slot);
    return;
  }

  if (!config.chatId) {
    console.error('⚠️ chatId فاضي في config.js — مش عارف أبعت لمين. ابعت /start للبوت.');
    return;
  }

  await bot.telegram.sendMessage(config.chatId, text, buildKeyboard());
  store.markSlotSentToday(slot);
}

// ---- التعلّم: لما تختار اقتراح ----
function learnFromPick(idx) {
  if (!pending) return;
  const chosen = pending.items[idx];
  const theme = pending.themesShown[idx] || pending.themesShown[0];

  // النص المختار يدخل ملف الأسلوب.
  store.addStyleExample(chosen.text, theme);
  // الموضoع المختار يزيد وزنه، والتاني يقل شوية (ترجيح).
  store.bumpThemeWeight(theme, +0.3);
  const otherTheme = pending.themesShown[idx === 0 ? 1 : 0];
  if (otherTheme && otherTheme !== theme) store.bumpThemeWeight(otherTheme, -0.1);

  store.addFeedback({
    slot: pending.slot,
    themesShown: pending.themesShown,
    choice: idx === 0 ? 'pick1' : 'pick2',
    finalText: chosen.text,
  });
}

// ---- التعلّم: لما تبعت نسخة معدّلة كنص حر ----
function learnFromEdit(editedText) {
  if (!pending) return;
  const theme = pending.themesShown[0];
  // نسختك المعدّلة هي الاختيار النهائي — تدخل ملف الأسلوب.
  store.addStyleExample(editedText, theme);
  store.bumpThemeWeight(theme, +0.3);
  store.addFeedback({
    slot: pending.slot,
    themesShown: pending.themesShown,
    choice: 'edited',
    finalText: editedText,
  });
}

// ---- التعلّم: تجاهل ----
function learnFromIgnore() {
  if (!pending) return;
  // المواضيع المعروضة يقل وزنها (من غير أمثلة أسلوب).
  for (const t of pending.themesShown) store.bumpThemeWeight(t, -0.2);
  store.addFeedback({
    slot: pending.slot,
    themesShown: pending.themesShown,
    choice: 'ignore',
    finalText: null,
  });
}

/**
 * setupHandlers — يربط كل أحداث تيليجرام بالبوت.
 * @param {Telegraf} bot
 */
function setupHandlers(bot) {
  // /start — يرحّب ويطبع chat_id عشان تحطه في config.
  bot.start((ctx) => {
    const id = ctx.chat.id;
    console.log(`\n🆔 الـ chat_id بتاعك هو: ${id}\n   حطه في config.js (أو متغيّر MY_CHAT_ID).\n`);
    ctx.reply(
      `أهلاً 👋 أنا مساعدك الشخصي لاقتراح رسايل لزوجتك.\n` +
        `الـ chat_id بتاعك: ${id}\n` +
        `حطه في config.js وأعد التشغيل.\n\n` +
        `أوامر: /stats للملخّص · /reset لتصفير التعلّم`
    );
  });

  // /stats — يطبع الملخّص وقت ما تطلبه.
  bot.command('stats', (ctx) => {
    const { text } = review.buildReport();
    ctx.reply(text, { parse_mode: 'Markdown' });
  });

  // /reset — يصفّر التعلّم لو حسّيت إن الأسلوب انحرف.
  bot.command('reset', (ctx) => {
    store.resetLearning();
    pending = null;
    ctx.reply('🔄 اتصفّر التعلّم بالكامل: أمثلة الأسلوب والأوزان رجعت من جديد.');
  });

  // ضغط الأزرار (callback_query).
  bot.action('pick1', async (ctx) => {
    learnFromPick(0);
    await ctx.answerCbQuery('اتسجّل ✅ — انسخه وابعته بإيدك');
    await ctx.editMessageReplyMarkup(); // نشيل الأزرار بعد الاختيار
    await ctx.reply('تمام، حفظت أسلوبك من الاختيار ده 👌');
  });

  bot.action('pick2', async (ctx) => {
    learnFromPick(1);
    await ctx.answerCbQuery('اتسجّل ✅ — انسخه وابعته بإيدك');
    await ctx.editMessageReplyMarkup();
    await ctx.reply('تمام، حفظت أسلوبك من الاختيار ده 👌');
  });

  bot.action('regen', async (ctx) => {
    if (!pending) return ctx.answerCbQuery('مفيش اقتراح حالي');
    // نسجّل إن المجموعة الأولى ما عجبتنيش.
    store.addFeedback({
      slot: pending.slot,
      themesShown: pending.themesShown,
      choice: 'regen',
      finalText: null,
    });
    await ctx.answerCbQuery('بولّد اقتراحين جداد...');
    await ctx.editMessageReplyMarkup();
    // نفس الخانة، نعيد التوليد بالـ force.
    await sendSuggestions(bot, { slot: pending.slot, occasion: pending.occasion, force: true });
  });

  bot.action('ignore', async (ctx) => {
    learnFromIgnore();
    await ctx.answerCbQuery('اتسجّل التجاهل');
    await ctx.editMessageReplyMarkup();
    await ctx.reply('تمام، تجاهلنا دي 🙈');
  });

  // أي رد نصي حر = نسختك المعدّلة (الاختيار النهائي).
  bot.on('text', (ctx) => {
    const txt = ctx.message.text.trim();
    if (txt.startsWith('/')) return; // أوامر اتعاملنا معاها فوق
    if (!pending) {
      return ctx.reply('مفيش اقتراح حالي أعدّله. استنى اقتراح الصبح/المسا أو اطلب /stats.');
    }
    learnFromEdit(txt);
    ctx.reply('حلو 🌟 سجّلت نسختك المعدّلة وضفتها لأسلوبي. انسخها وابعتها بإيدك.');
  });
}

module.exports = { setupHandlers, sendSuggestions, Telegraf };
