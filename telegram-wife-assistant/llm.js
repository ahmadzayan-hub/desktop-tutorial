// =====================================================================
// llm.js — طبقة تجريد لعقل الـ AI (Groq).
// الهدف إن باقي الكود ما يعرفش حاجة عن المزوّد. لو حبيت تغيّر من Groq
// لأي مزوّد تاني (متوافق مع OpenAI) بتغيّر هنا بس.
//
// Groq بيوفّر API متوافق مع OpenAI، والطبقة المجانية كافية للمشروع ده.
// بنستخدم fetch المدمج في Node 18+ (مفيش مكتبة زيادة).
// =====================================================================

const config = require('./config');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * complete — يبعت رسائل (نظام/مستخدم) للموديل ويرجّع نص الرد.
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @param {object} [opts]  خيارات اختيارية (temperature ...)
 * @returns {Promise<string>} نص الرد من الموديل
 */
async function complete(messages, opts = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY مش موجود في .env. روح console.groq.com/keys وخد مفتاح مجاني.'
    );
  }

  const body = {
    model: config.groqModel,
    messages,
    // حرارة متوسطة: تنويع كافي من غير ما يخرج عن النبرة.
    temperature: opts.temperature ?? 0.8,
    max_tokens: opts.maxTokens ?? 400,
  };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Groq رجّع خطأ ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq رجّع رد فاضي.');
  }
  return content.trim();
}

module.exports = { complete };
