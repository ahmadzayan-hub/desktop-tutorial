// اختبارات عقل الديسكتوب (بدون Electron/شبكة) — بتتشغّل في CI بـ: node test/core.test.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const core = require('../lib/core.js');

// ---- اللغة (نظير Lang في أندرويد) ----
assert.strictEqual(core.detectLang('ازيك يا حبيبي'), 'ar');
assert.strictEqual(core.detectLang('Hello my friend'), 'en');
assert.strictEqual(core.detectLang('12345'), null);
assert.strictEqual(core.resolveLang('en', 'اسم عربي'), 'en');
assert.strictEqual(core.resolveLang('auto', 'John Smith'), 'en');
assert.strictEqual(core.resolveLang('auto', 'أحمد'), 'ar');
assert.strictEqual(core.resolveLang(null, '123'), 'ar');
assert.ok(core.langDirective('en').length > 0);
assert.strictEqual(core.langDirective('ar'), '');

// ---- سلسلة الدفء ----
assert.strictEqual(core.computeStreak([], '2026-08-09'), 0);
assert.strictEqual(core.computeStreak(['2026-08-09'], '2026-08-09'), 1);
assert.strictEqual(core.computeStreak(['2026-08-09', '2026-08-08', '2026-08-07'], '2026-08-09'), 3);
assert.strictEqual(core.computeStreak(['2026-08-08', '2026-08-07'], '2026-08-09'), 2); // سماحية امبارح
assert.strictEqual(core.computeStreak(['2026-08-06'], '2026-08-09'), 0); // اتقطعت
assert.strictEqual(core.computeStreak(['2026-08-09', '2026-08-07'], '2026-08-09'), 1); // فجوة

// ---- النيّات واللهجات ----
assert.ok(core.intentById('reconnect'), 'reconnect intent موجودة');
assert.strictEqual(core.intentById('nope'), null);
assert.ok(core.dialectPhrase('gulf').includes('الخليجية'));

// ---- CSV ----
const rows = core.parseContactsCSV('name,phone\nأحمد,+20100 123 4567\n"عبدالله, أبو خالد",00966501112222\n');
assert.strictEqual(rows.length, 2);
assert.strictEqual(rows[0].name, 'أحمد');
assert.strictEqual(rows[1].name, 'عبدالله, أبو خالد');

// ---- التخزين الذرّي: كتابة/قراءة فعلية في مجلد مؤقت، ومفيش .tmp متبقي ----
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wisal-core-test-'));
core.init(dir);
core.setSettings({ myName: 'اختبار' });
assert.strictEqual(core.getSettings().myName, 'اختبار');
core.addFeedback({ date: '2026-08-09', finalText: 'رسالة', recipientId: 'r1' });
assert.strictEqual(core.getStore().feedback.length, 1);
assert.ok(!fs.existsSync(path.join(dir, 'settings.json.tmp')), 'مفيش tmp متبقي بعد الكتابة');
assert.ok(!fs.existsSync(path.join(dir, 'store.json.tmp')), 'مفيش tmp متبقي بعد الكتابة');
fs.rmSync(dir, { recursive: true, force: true });

console.log('core.test.js: all assertions passed ✅');
