// POST /api/send — يبعت رسالة واحدة لعميل عبر WhatsApp Business Cloud API.
// مصمّم للردّ على عملاء بدأوا محادثة (نص حر جوّه 24 ساعة) أو قوالب معتمدة.
// محمي بمفتاح تطبيق (APP_API_KEY) بمقارنة آمنة توقيتيًا + حد معدّل best-effort.
//
// سياسة مهمة: ده مش أداة بلاست لأرقام باردة. الاستخدام المشروع:
//  - رد على عميل راسلك (نص حر، خلال 24 ساعة).
//  - قالب معتمد من Meta لعملاء عملوا opt-in.
// إرسال غير مرغوب بيخالف شروط Meta وبيوقّف رقمك.

const { sendMessage, timingSafeEqualStr, makeRateLimiter } = require('../lib/wa');

// حد معدّل في الذاكرة: 30 طلب/دقيقة لكل instance (ملاحظة: في serverless ده لكل
// instance — حماية من الإغراق مش ضمان صارم؛ الحد الصارم يبقى على مستوى البنية).
const allow = makeRateLimiter({ limit: 30, windowMs: 60000 });

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  // مصادقة بمفتاح مشترك أولًا — مقارنة آمنة توقيتيًا. لازم تسبق حد المعدّل:
  // هو عدّاد مشترك على مستوى الـ instance، فلو اتفحص الأول، طرف من غير
  // مفتاح صحيح يقدر "يستنزفه" ويحجب مستخدمين حقيقيين عندهم المفتاح.
  // فحص المفتاح رخيص (مقارنة نص بس، مفيش شبكة أو تشفير تقيل) فمفيش تكلفة
  // حقيقية في تقديمه.
  const key = req.headers['x-api-key'];
  if (!process.env.APP_API_KEY || !timingSafeEqualStr(key, process.env.APP_API_KEY)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  if (!allow()) {
    res.status(429).json({ ok: false, error: 'rate limit exceeded — slow down' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  try {
    const data = await sendMessage({
      to: body.to,
      type: body.type || 'text',
      text: body.text,
      template: body.template,
    });
    const id = data && data.messages && data.messages[0] ? data.messages[0].id : null;
    res.status(200).json({ ok: true, id, raw: data });
  } catch (e) {
    res.status(e.status && e.status >= 400 && e.status < 500 ? e.status : 502)
      .json({ ok: false, error: e.message, details: e.data || null });
  }
};
