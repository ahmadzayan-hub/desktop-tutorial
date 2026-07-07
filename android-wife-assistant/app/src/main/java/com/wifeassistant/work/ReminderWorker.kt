package com.wifeassistant.work

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.wifeassistant.data.DateUtil
import com.wifeassistant.data.Settings
import com.wifeassistant.data.Store
import com.wifeassistant.util.Notifications

// عامل الخلفية للتذكيرات:
// 1) مناسبات الأشخاص النهاردة (عيد ميلاد/جواز...) - تنبيه بيها دايماً.
// 2) "بقالك فترة ما كلّمت فلان" - لو التذكيرات مفعّلة.
class ReminderWorker(context: Context, params: WorkerParameters) :
    CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val settings = Settings(applicationContext)

        // (1) مناسبات الأشخاص النهاردة - مهمة، بتشتغل بغضّ النظر عن مفتاح التذكيرات.
        val mmdd = DateUtil.todayMMDD()
        settings.recipients.forEach { r ->
            r.occasions.forEach { o ->
                if (o.date == mmdd) {
                    val who = r.name.ifBlank { "حد بتحبه" }
                    Notifications.show(
                        applicationContext,
                        "🎉 ${o.label} لـ$who",
                        "النهاردة مناسبته! تحب أجهّزلك رسالة دافئة تبعتهاله؟",
                        ("occ_" + r.id + o.label).hashCode(),
                    )
                }
            }
        }

        if (!settings.reminders) return Result.success()

        val store = Store(applicationContext)
        val threshold = settings.reminderDays

        // نتجاهل المجموعات - التذكير معناه لأشخاص بعينهم.
        val candidate = settings.recipients
            .filterNot { it.relation.startsWith("group") }
            .mapNotNull { r -> store.daysSinceContact(r.id)?.let { days -> r to days } }
            .filter { it.second >= threshold }
            .maxByOrNull { it.second }
            ?: return Result.success()

        val (recipient, days) = candidate
        val name = recipient.name.ifBlank { "حد بتحبه" }
        val title = "🤍 افتقدت التواصل؟"
        val body = "بقالك $days يوم ما كلّمتش $name. تحب أجهّزلك رسالة دافئة دلوقتي؟"
        Notifications.show(applicationContext, title, body, ("reminder_" + recipient.id).hashCode())
        return Result.success()
    }
}
