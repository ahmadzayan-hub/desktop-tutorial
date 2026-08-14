// محدّد معدّل بسيط في الذاكرة (sliding window) — نفس نمط wisal-cloud-api/lib/wa.js.
// ملاحظة: في serverless ده لكل instance منفصلة — حماية best-effort، مش ضمان صارم.
function makeRateLimiter({ limit = 60, windowMs = 60000 } = {}) {
  const hits = [];
  return function allow(now) {
    const t = typeof now === 'number' ? now : Date.now();
    while (hits.length && t - hits[0] > windowMs) hits.shift();
    if (hits.length >= limit) return false;
    hits.push(t);
    return true;
  };
}

module.exports = { makeRateLimiter };
