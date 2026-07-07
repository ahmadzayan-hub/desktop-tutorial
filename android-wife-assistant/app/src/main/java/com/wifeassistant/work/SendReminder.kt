package com.wifeassistant.work

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import androidx.work.workDataOf
import com.wifeassistant.data.AppConstants
import com.wifeassistant.util.Notifications
import java.time.Duration
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.concurrent.TimeUnit

// جدولة تذكير "ابعت بكرة" - تنبيه مجدول بالرسالة الجاهزة، من غير أي إرسال تلقائي.
object SendReminder {
    private val zone: ZoneId = ZoneId.of(AppConstants.TIMEZONE)

    // when: "tomorrow_morning" / "tonight" / "in_hour".
    fun schedule(context: Context, name: String, text: String, whenKey: String) {
        val minutes = delayMinutes(whenKey)
        val req = OneTimeWorkRequestBuilder<SendReminderWorker>()
            .setInitialDelay(minutes, TimeUnit.MINUTES)
            .setInputData(workDataOf("name" to name, "text" to text))
            .build()
        WorkManager.getInstance(context).enqueue(req)
    }

    private fun delayMinutes(whenKey: String): Long {
        val now = LocalDateTime.now(zone)
        val target = when (whenKey) {
            "in_hour" -> now.plusHours(1)
            "tonight" -> now.withHour(21).withMinute(0).withSecond(0).withNano(0)
                .let { if (it.isAfter(now)) it else it.plusDays(1) }
            else -> now.plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0) // بكرة الصبح
        }
        return Duration.between(now, target).toMinutes().coerceAtLeast(1)
    }
}

class SendReminderWorker(context: Context, params: WorkerParameters) :
    CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        val name = inputData.getString("name")?.takeIf { it.isNotBlank() } ?: "حد بتحبه"
        val text = inputData.getString("text").orEmpty()
        Notifications.show(
            applicationContext,
            "⏰ فكّرتك تبعت لـ$name",
            text.ifBlank { "الرسالة اللي جهّزتها مستنياك تبعتها 💌" },
            ("sendrem_" + name + text.take(12)).hashCode(),
        )
        return Result.success()
    }
}
