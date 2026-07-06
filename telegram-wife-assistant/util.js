// =====================================================================
// util.js — أدوات مشتركة صغيرة عشان نتجنّب تكرار نفس المنطق في أكتر ملف.
// أهمها: مصدر واحد لحساب "تاريخ النهاردة" بتوقيت الإعدادات، بيستخدمه
// store.js و occasions.js بدل ما كل واحد يحسبه لوحده.
// =====================================================================

const config = require('./config');

// تاريخ النهاردة بصيغة YYYY-MM-DD بتوقيت الإعدادات (Asia/Dubai).
// en-CA بيدّي الصيغة دي جاهزة، وهي قابلة للمقارنة كنص بثبات.
function todayISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: config.timezone });
}

// نفس التاريخ لكن مقسّم: { ymd: 'YYYY-MM-DD', mmdd: 'MM-DD' }.
// مفيد للمناسبات الثابتة (MM-DD) والمناسبات اليدوية (YYYY-MM-DD).
function todayParts() {
  const ymd = todayISO();
  const [, m, d] = ymd.split('-');
  return { ymd, mmdd: `${m}-${d}` };
}

// تاريخ من (days) يوم فاتوا، بنفس الصيغة (للتنويع/النوافذ الزمنية).
function daysAgoISO(days) {
  const dt = new Date();
  dt.setDate(dt.getDate() - days);
  return dt.toLocaleDateString('en-CA', { timeZone: config.timezone });
}

module.exports = { todayISO, todayParts, daysAgoISO };
