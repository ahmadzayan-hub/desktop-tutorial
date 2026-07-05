// =====================================================================
// occasions.js — تحديد مناسبة النهاردة من config.occasions.
//
// نوعين:
//   - fixed:  تاريخ ثابت بصيغة MM-DD (عيد الجواز / عيد ميلاد الزوجة).
//   - manual: تاريخ كامل YYYY-MM-DD انت بتدخّله كل سنة (الأعياد الإسلامية).
//             ما نعتمدش على حساب أعمى — انت بتأكّد التاريخ.
//
// بما إن الاقتراح بيوصل لك انت بس، أي خطأ في التاريخ ما بيوصلش لزوجتك.
// =====================================================================

const config = require('./config');
const { todayParts } = require('./util'); // مصدر موحّد لتاريخ النهاردة

/**
 * getTodaysOccasion — يرجّع مناسبة النهاردة لو فيه، وإلا null.
 * @returns {{ key:string, label:string } | null}
 */
function getTodaysOccasion() {
  const { ymd, mmdd } = todayParts();

  for (const [key, occ] of Object.entries(config.occasions)) {
    // ملاحظة: ما نفلترش على occ.date هنا، لأن المناسبات اليدوية بتستخدم
    // dates[] (مصفوفة) ومش عندها occ.date — كل فرع بيتأكد من بياناته بنفسه.
    if (!occ) continue;

    if (occ.type === 'fixed') {
      // نتجاهل القيم اللي لسه placeholder.
      if (!occ.date || occ.date === 'MM-DD') continue;
      if (occ.date === mmdd) return { key, label: occ.label };
    } else if (occ.type === 'manual') {
      // بنقبل مصفوفة dates[] (سنين متعددة) أو date واحد للتوافق مع القديم.
      const list = Array.isArray(occ.dates) ? occ.dates : occ.date ? [occ.date] : [];
      for (const d of list) {
        if (!d || d === 'YYYY-MM-DD') continue;
        if (d === ymd) return { key, label: occ.label };
      }
    }
  }
  return null;
}

module.exports = { getTodaysOccasion };
