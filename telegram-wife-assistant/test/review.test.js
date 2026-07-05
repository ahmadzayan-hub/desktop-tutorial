const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const { useTempStore } = require('./helpers');

const tmp = useTempStore();
const store = require('../store');
const review = require('../review');

beforeEach(() => tmp.cleanup());
after(() => tmp.cleanup());

test('نسبة القبول بتتحسب صح وبتتجاهل regen', () => {
  store.addFeedback({ slot: 'morning', themesShown: ['امتنان', 'دعاء'], choice: 'pick1' });
  store.addFeedback({ slot: 'morning', themesShown: ['تقدير', 'دعم'], choice: 'ignore' });
  store.addFeedback({ slot: 'evening', themesShown: ['اشتياق', 'دعاء'], choice: 'regen' });
  const { data } = review.buildReport();
  // regen مش بيتحسب، فالقرارات = 2، المقبول = 1 → 50%
  assert.strictEqual(data.total, 2);
  assert.strictEqual(data.accepted, 1);
  assert.strictEqual(data.acceptRate, 50);
});

test('أعلى المواضيع نجاحاً بتظهر', () => {
  store.addFeedback({ slot: 'morning', themesShown: ['امتنان', 'دعاء'], choice: 'pick1' });
  store.addFeedback({ slot: 'evening', themesShown: ['دعم', 'امتنان'], choice: 'pick2' });
  const { data } = review.buildReport();
  const topLabels = data.topThemes.map((t) => t[0]);
  assert.ok(topLabels.includes('امتنان'));
});

test('اقتراح إيقاف خانة بتتجاهل بنسبة عالية', () => {
  for (let i = 0; i < 4; i++) {
    store.addFeedback({ slot: 'evening', themesShown: ['دعم', 'دعاء'], choice: 'ignore' });
  }
  const { text, data } = review.buildReport();
  assert.strictEqual(data.worstSlot.slot, 'evening');
  assert.match(text, /توقفها أو تغيّر ميعادها/);
});

test('تقرير فاضي مبيقعش (0 من 0)', () => {
  const { data } = review.buildReport();
  assert.strictEqual(data.total, 0);
  assert.strictEqual(data.acceptRate, 0);
});
