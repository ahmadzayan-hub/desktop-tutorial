// أدوات مساعدة للاختبارات: مخزن مؤقت معزول + بوت تيليجرام مزيّف + LLM مزيّف.
const os = require('os');
const path = require('path');
const fs = require('fs');

// نوجّه المخزن لملف مؤقت فريد قبل تحميل أي موديول بيستخدمه.
function useTempStore() {
  const file = path.join(
    os.tmpdir(),
    `wife-assistant-test-${process.pid}-${Math.floor(process.hrtime()[1])}.json`
  );
  process.env.WIFE_ASSISTANT_STORE_FILE = file;
  return {
    file,
    cleanup() {
      try {
        fs.unlinkSync(file);
      } catch (_) {
        /* الملف ممكن يكون اتمسح خلاص */
      }
    },
  };
}

// بوت تيليجرام مزيّف: بيسجّل الـ handlers وبيجمّع كل اللي "اتبعت".
function makeFakeBot() {
  const H = { commands: {}, actions: {}, text: null, start: null };
  const sent = [];
  const bot = {
    start: (fn) => (H.start = fn),
    command: (n, fn) => (H.commands[n] = fn),
    action: (n, fn) => (H.actions[n] = fn),
    on: (type, fn) => {
      if (type === 'text') H.text = fn;
    },
    telegram: {
      sendMessage: async (id, text, extra) => {
        sent.push({ id, text, keyboard: extra?.reply_markup?.inline_keyboard || null });
        return {};
      },
      setMyCommands: async () => {},
    },
  };
  return { bot, H, sent };
}

// سياق (ctx) مزيّف لأمر أو زر أو رسالة.
function makeCtx(chatId, text = '', sink = []) {
  return {
    chat: { id: chatId },
    message: { text },
    reply: async (t) => sink.push({ reply: t }),
    answerCbQuery: async () => {},
    editMessageReplyMarkup: async () => {},
  };
}

module.exports = { useTempStore, makeFakeBot, makeCtx };
