package com.wifeassistant.util

import android.content.ContentUris
import android.content.Context
import android.provider.CalendarContract
import com.wifeassistant.data.AppConstants
import java.time.LocalDate
import java.time.ZoneId

// بيقرأ أحداث تقويم الموبايل (اللي بيزامن Google Calendar وأي حساب تاني)
// عبر CalendarContract — محلي بالكامل، بإذن READ_CALENDAR. بيغذّي الاقتراحات
// بناءً على أجندتك (أعياد، مناسبات، مواعيد).
object CalendarReader {
    data class Event(val title: String, val begin: Long)

    fun events(context: Context, days: Int = 1): List<Event> {
        val zone = ZoneId.of(AppConstants.TIMEZONE)
        val today = LocalDate.now(zone)
        val startMs = today.atStartOfDay(zone).toInstant().toEpochMilli()
        val endMs = today.plusDays(days.toLong()).atStartOfDay(zone).toInstant().toEpochMilli()

        val builder = CalendarContract.Instances.CONTENT_URI.buildUpon()
        ContentUris.appendId(builder, startMs)
        ContentUris.appendId(builder, endMs)
        val projection = arrayOf(CalendarContract.Instances.TITLE, CalendarContract.Instances.BEGIN)

        val out = mutableListOf<Event>()
        try {
            context.contentResolver.query(
                builder.build(),
                projection,
                null,
                null,
                CalendarContract.Instances.BEGIN + " ASC",
            )?.use { c ->
                val ti = c.getColumnIndex(CalendarContract.Instances.TITLE)
                val bi = c.getColumnIndex(CalendarContract.Instances.BEGIN)
                while (c.moveToNext()) {
                    val title = if (ti >= 0) c.getString(ti) else null
                    if (title.isNullOrBlank()) continue
                    val begin = if (bi >= 0) c.getLong(bi) else 0L
                    out.add(Event(title.trim(), begin))
                }
            }
        } catch (e: SecurityException) {
            // مفيش إذن التقويم — نرجّع فاضي بهدوء
        } catch (e: Exception) {
            // أي مشكلة تانية في القراءة
        }
        return out.distinctBy { it.title }
    }
}
