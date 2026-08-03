// Webhook واتساب:
//  - GET: تحقّق الاشتراك (Meta بتبعت hub.challenge أول مرة).
//  - POST: استقبال الرسائل الواردة + حالات التسليم (delivered/read).
// هنا بنسجّل بس ونرجّع 200 بسرعة (Meta بتعيد المحاولة لو مارجعناش 200 بسرعة).
// ملاحظة: نافذة الـ24 ساعة بتبدأ من آخر رسالة واردة — لو هتتبعها، خزّن الـ timestamp
// لكل رقم في قاعدة بيانات (مثلاً Supabase). السكافولد ده مابيخزّنش لسه.

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token && token === process.env.VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('forbidden');
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
      const entry = body && body.entry ? body.entry : [];
      for (const e of entry) {
        for (const ch of e.changes || []) {
          const v = ch.value || {};
          for (const m of v.messages || []) {
            // رسالة واردة من عميل — هنا تقدر تفتح نافذة الرد 24 ساعة / تخطر الفريق.
            console.log('inbound', m.from, m.type, m.id);
          }
          for (const s of v.statuses || []) {
            console.log('status', s.recipient_id, s.status, s.id);
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
