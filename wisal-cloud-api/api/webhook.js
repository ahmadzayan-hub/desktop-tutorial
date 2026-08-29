// Webhook واتساب:
//  - GET: تحقّق الاشتراك (Meta بتبعت hub.challenge أول مرة).
//  - POST: استقبال الرسائل الواردة + حالات التسليم — مع تحقق توقيع Meta
//    (X-Hub-Signature-256) على الـ raw body، إلزامي دايمًا.
//
// ملاحظة أمان: مفيش مسار "قبول مع تحذير" لو APP_SECRET مش متظبّط — كان
// موجود قبل كده وبيسمح لأي حد يحقن أحداث "رسالة عميل" مزيّفة (اللي المفروض
// مستقبلاً بتفتح نافذة رد 24 ساعة أو تخطر الفريق)، وده بالظبط النوع اللي
// المشروع بيرفضه في كل مكان تاني (relay التوقيعات، DEMO_ONLY guard...).
// من غير APP_SECRET، كل POST بيترفض 401 صريح.
//
// بنعطّل الـ body parser عشان الـ HMAC لازم يتحسب على البايتات الخام بالظبط.

const { verifySignature, timingSafeEqualStr } = require('../lib/wa');

// آخر 4 أرقام بس — كافية للتتبّع التشغيلي (مطابقة حدث بمحادثة) من غير ما
// نسجّل رقم تليفون كامل لعميل في سجلات السيرفر.
function maskPhone(n) {
  const s = String(n || '');
  return s.length > 4 ? `…${s.slice(-4)}` : s;
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && process.env.VERIFY_TOKEN && timingSafeEqualStr(token, process.env.VERIFY_TOKEN)) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('forbidden');
    }
    return;
  }

  if (req.method === 'POST') {
    // نقرأ البايتات الخام (الـ parser متعطّل) — مطلوبة لتحقق التوقيع.
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks);

    const secret = process.env.APP_SECRET;
    if (!secret) {
      console.error('webhook: APP_SECRET not set — rejecting POST (configure it before relying on inbound events)');
      res.status(401).json({ error: 'webhook not configured' });
      return;
    }
    if (!verifySignature(raw, req.headers['x-hub-signature-256'], secret)) {
      res.status(401).json({ error: 'invalid signature' });
      return;
    }

    try {
      const body = JSON.parse(raw.toString('utf8') || '{}');
      const entry = body && body.entry ? body.entry : [];
      for (const e of entry) {
        for (const ch of e.changes || []) {
          const v = ch.value || {};
          for (const m of v.messages || []) {
            // رسالة واردة من عميل — هنا تقدر تفتح نافذة الرد 24 ساعة / تخطر الفريق.
            console.log('inbound', maskPhone(m.from), m.type, m.id);
          }
          for (const s of v.statuses || []) {
            console.log('status', maskPhone(s.recipient_id), s.status, s.id);
          }
        }
      }
    } catch (e) {
      console.error('webhook parse error', e && e.message);
    }
    // نرجّع 200 دايمًا بسرعة عشان Meta ما تعيدش الإرسال.
    res.status(200).json({ received: true });
    return;
  }

  res.status(405).send('method not allowed');
};

// تعطيل الـ body parser: التوقيع بيتحسب على البايتات الخام.
module.exports.config = { api: { bodyParser: false } };
