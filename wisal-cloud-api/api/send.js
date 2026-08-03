// POST /api/send — يبعت رسالة واحدة لعميل عبر WhatsApp Business Cloud API.
// مصمّم للردّ على عملاء بدأوا محادثة (نص حر جوّه 24 ساعة) أو قوالب معتمدة.
// محمي بمفتاح تطبيق (APP_API_KEY) عشان محدش تاني يستخدم الـ endpoint.
//
// سياسة مهمة: ده مش أداة بلاست لأرقام باردة. الاستخدام المشروع:
//  - رد على عميل راسلك (نص حر، خلال 24 ساعة).
//  - قالب معتمد من Meta لعملاء عملوا opt-in.
// إرسال غير مرغوب بيخالف شروط Meta وبيوقّف رقمك.

const { sendMessage } = require('../lib/wa');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  // مصادقة بسيطة بمفتاح مشترك.
  const key = req.headers['x-api-key'];
  if (!process.env.APP_API_KEY || key !== process.env.APP_API_KEY) {
    res.status(401).json({ error: 'unauthorized' });
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
