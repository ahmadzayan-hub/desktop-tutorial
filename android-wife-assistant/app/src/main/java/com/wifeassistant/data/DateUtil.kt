package com.wifeassistant.data

import java.time.LocalDate
import java.time.ZoneId

// مصدر واحد لحساب تاريخ النهاردة بتوقيت الإعدادات (نظير util.js).
object DateUtil {
    private val zone: ZoneId = ZoneId.of(AppConstants.TIMEZONE)

    fun today(): LocalDate = LocalDate.now(zone)

    // YYYY-MM-DD (LocalDate.toString بيدّيها جاهزة وقابلة للمقارنة كنص).
    fun todayISO(): String = today().toString()

    fun todayMMDD(): String = todayISO().substring(5)

    fun daysAgoISO(days: Long): String = today().minusDays(days).toString()

    // كام يوم فاضل لمناسبة سنوية بصيغة MM-DD (0 = النهاردة). null لو التاريخ غلط.
    fun daysUntilMMDD(mmdd: String): Int? {
        val parts = mmdd.split("-")
        val m = parts.getOrNull(0)?.toIntOrNull() ?: return null
        val d = parts.getOrNull(1)?.toIntOrNull() ?: return null
        val t = today()
        return runCatching {
            var next = LocalDate.of(t.year, m, d)
            if (next.isBefore(t)) next = LocalDate.of(t.year + 1, m, d)
            java.time.temporal.ChronoUnit.DAYS.between(t, next).toInt()
        }.getOrNull()
    }
}
