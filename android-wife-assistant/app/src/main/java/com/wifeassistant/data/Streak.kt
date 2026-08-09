package com.wifeassistant.data

import java.time.LocalDate

// «سلسلة الدفء»: كام يوم متتالي وانت موصّل حب لحد؟ بتتحسب من سجل الرسايل اللي
// اتبعتت فعلاً (feedback بنص نهائي). منطق نقي بدون I/O عشان يتختبر مباشرة.
object Streak {
    // بيحسب طول السلسلة المنتهية النهاردة أو امبارح (سماحية يوم واحد عشان
    // السلسلة ما تنكسرش قبل ما اليوم يخلص). التواريخ بصيغة YYYY-MM-DD.
    fun compute(dates: Collection<String>, today: LocalDate): Int {
        if (dates.isEmpty()) return 0
        val days = dates.mapNotNull { runCatching { LocalDate.parse(it) }.getOrNull() }.toSet()
        if (days.isEmpty()) return 0
        // نقطة البداية: النهاردة لو فيه إرسال، وإلا امبارح لو فيه — غير كده السلسلة مقطوعة.
        var cursor = when {
            days.contains(today) -> today
            days.contains(today.minusDays(1)) -> today.minusDays(1)
            else -> return 0
        }
        var count = 0
        while (days.contains(cursor)) {
            count++
            cursor = cursor.minusDays(1)
        }
        return count
    }

    // رسالة تشجيع حسب طول السلسلة — لمسة إنسانية مش أرقام جافة.
    fun message(streak: Int): String = when {
        streak >= 30 -> "شهر كامل من الدفء! انت أسطورة 🏆"
        streak >= 7 -> "أسبوع متواصل من الحب — استمر! 🌟"
        streak >= 3 -> "السلسلة بتكبر، حافظ عليها 💪"
        streak == 2 -> "يومين ورا بعض — بداية جميلة ✨"
        else -> "أول شرارة اتولّعت النهاردة 🤍"
    }
}
