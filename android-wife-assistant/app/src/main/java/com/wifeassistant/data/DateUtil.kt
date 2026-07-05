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
}
