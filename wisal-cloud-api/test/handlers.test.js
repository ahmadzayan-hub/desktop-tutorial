// اختبارات على مستوى الـ handlers نفسها (api/send.js و api/webhook.js) — بتغطي
// ترتيب المصادقة/حد المعدّل والمسارات المرفوضة (fail-closed) اللي مش متغطاة في
// wa.test.js (ده بيختبر بس الدوال النقية في lib/wa.js). بدون شبكة حقيقية —
// global.fetch متعمول له mock. شغّلها بـ: npm test
'use strict';
const assert = require('assert');
const crypto = require('crypto');

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(o) { this.body = o; return this; },
    send(t) { this.body = t; return this; },
  };
}

function makeReq({ method, headers = {}, query = {}, body, chunks = [] }) {
  return {
    method,
    headers,
    query,
    body,
    // webhook.js بيقرأ raw body عن طريق for-await على الـ req نفسه (bodyParser معطّل).
    [Symbol.asyncIterator]: async function* () {
      for (const c of chunks) yield Buffer.isBuffer(c) ? c : Buffer.from(String(c));
    },
  };
}

async function main() {
  // ---------- send.js: المصادقة لازم تسبق حد المعدّل ----------
  process.env.APP_API_KEY = 'test-key-123';
  process.env.WHATSAPP_TOKEN = 'tok';
  process.env.PHONE_NUMBER_ID = 'phone123';

  const originalFetch = global.fetch;
  let fetchCalls = 0;
  global.fetch = async () => {
    fetchCalls++;
    return { ok: true, status: 200, json: async () => ({ messages: [{ id: 'wamid.123' }] }) };
  };

  const sendHandler = require('../api/send.js');

  // ميثود غير مسموح
  {
    const res = makeRes();
    await sendHandler(makeReq({ method: 'GET' }), res);
    assert.strictEqual(res.statusCode, 405);
  }

  // مفتاح مفقود — 401 من غير ما يوصل لـ sendMessage خالص
  {
    const res = makeRes();
    await sendHandler(makeReq({ method: 'POST', body: { to: '971500000000', text: 'hi' } }), res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(fetchCalls, 0);
  }

  // مفتاح غلط 40 مرة — أكتر من حد المعدّل (30/دقيقة) — لازم يفضل يرجّع 401
  // في كل مرة وميستهلكش من ميزانية حد المعدّل خالص (ده بالظبط الإصلاح: مصادقة
  // قبل حد المعدّل، مش العكس).
  for (let i = 0; i < 40; i++) {
    const res = makeRes();
    await sendHandler(makeReq({ method: 'POST', headers: { 'x-api-key': 'wrong' }, body: { to: '971500000000', text: 'hi' } }), res);
    assert.strictEqual(res.statusCode, 401, `attempt ${i} لازم يبقى 401 مش rate-limited`);
  }
  assert.strictEqual(fetchCalls, 0, 'طلبات من غير مصادقة صحيحة ما توصلش لـ sendMessage خالص');

  // بعد الـ 40 محاولة الغلط، المفتاح الصح لازم يفضل شغّال — يثبت إن حد المعدّل
  // اتحدّد على المصادقة الصحيحة بس، مش استهلكه أي حد قبل ما يتحقق.
  {
    const res = makeRes();
    await sendHandler(makeReq({ method: 'POST', headers: { 'x-api-key': 'test-key-123' }, body: { to: '971500000000', text: 'hi' } }), res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(fetchCalls, 1);
  }

  global.fetch = originalFetch;
  delete process.env.APP_API_KEY;
  delete process.env.WHATSAPP_TOKEN;
  delete process.env.PHONE_NUMBER_ID;

  // ---------- webhook.js: fail-closed + ثغرة توكن التحقق الفاضي ----------
  const webhookHandler = require('../api/webhook.js');

  // VERIFY_TOKEN مش متظبّط + توكن فاضي في الطلب — لازم يترفض (مش "فاضي == فاضي")
  {
    delete process.env.VERIFY_TOKEN;
    const res = makeRes();
    await webhookHandler(makeReq({ method: 'GET', query: { 'hub.mode': 'subscribe', 'hub.verify_token': '', 'hub.challenge': 'abc' } }), res);
    assert.strictEqual(res.statusCode, 403);
  }

  // توكن صح
  {
    process.env.VERIFY_TOKEN = 'vtok';
    const res = makeRes();
    await webhookHandler(makeReq({ method: 'GET', query: { 'hub.mode': 'subscribe', 'hub.verify_token': 'vtok', 'hub.challenge': 'chal-1' } }), res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body, 'chal-1');
  }

  // توكن غلط
  {
    const res = makeRes();
    await webhookHandler(makeReq({ method: 'GET', query: { 'hub.mode': 'subscribe', 'hub.verify_token': 'nope', 'hub.challenge': 'chal-1' } }), res);
    assert.strictEqual(res.statusCode, 403);
  }

  // POST من غير APP_SECRET متظبّط — لازم يترفض 401 (مش قبول مع تحذير)
  {
    delete process.env.APP_SECRET;
    const res = makeRes();
    await webhookHandler(makeReq({ method: 'POST', chunks: [JSON.stringify({ entry: [] })] }), res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, 'webhook not configured');
  }

  // POST بتوقيع غلط
  {
    process.env.APP_SECRET = 'whsecret';
    const raw = JSON.stringify({ entry: [] });
    const res = makeRes();
    await webhookHandler(makeReq({ method: 'POST', headers: { 'x-hub-signature-256': 'sha256=' + '0'.repeat(64) }, chunks: [raw] }), res);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, 'invalid signature');
  }

  // POST بتوقيع صح — 200 + رقم التليفون في اللوج متقنّع (آخر 4 أرقام بس)
  {
    const secret = process.env.APP_SECRET;
    const payload = {
      entry: [{ changes: [{ value: { messages: [{ from: '971501234567', type: 'text', id: 'wamid.abc' }] } }] }],
    };
    const raw = JSON.stringify(payload);
    const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(Buffer.from(raw)).digest('hex');

    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));
    const res = makeRes();
    try {
      await webhookHandler(makeReq({ method: 'POST', headers: { 'x-hub-signature-256': sig }, chunks: [raw] }), res);
    } finally {
      console.log = originalLog;
    }

    assert.strictEqual(res.statusCode, 200);
    assert.deepStrictEqual(res.body, { received: true });
    const inboundLog = logs.find((l) => l.includes('inbound'));
    assert.ok(inboundLog, 'المفروض يسجّل الرسالة الواردة');
    assert.ok(!inboundLog.includes('971501234567'), 'الرقم الكامل ما ينلوجّش خالص');
    assert.ok(inboundLog.includes('4567'), 'اللوج المقنّع لازم يحتفظ بآخر 4 أرقام');
  }

  console.log('handlers.test.js: all assertions passed ✅');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
