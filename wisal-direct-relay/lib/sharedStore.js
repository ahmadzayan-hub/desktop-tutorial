// نسخة تخزين واحدة مشتركة بين كل الـ handlers داخل نفس الـ process (instance
// دافئة). في dev/test ده كافي. في إنتاج Vercel ده بيتصفّر مع كل cold start —
// حد إنتاج موثّق (README + ADR-002): لازم storage حقيقي قبل أي إطلاق عام.
const { createInMemoryStore } = require('./store');

module.exports = createInMemoryStore();
