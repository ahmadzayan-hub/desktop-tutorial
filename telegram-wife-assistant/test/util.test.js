const { test } = require('node:test');
const assert = require('node:assert');

const util = require('../util');

test('todayISO بصيغة YYYY-MM-DD', () => {
  assert.match(util.todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

test('todayParts متوافق مع todayISO', () => {
  const p = util.todayParts();
  assert.strictEqual(p.ymd, util.todayISO());
  assert.strictEqual(p.mmdd, p.ymd.slice(5));
});

test('daysAgoISO بيرجّع تاريخ أقدم', () => {
  const past = util.daysAgoISO(3);
  assert.match(past, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(past < util.todayISO());
});
