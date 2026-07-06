package com.wifeassistant.data

import android.content.Context
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

// نسخة احتياطية من بياناتك (بدون مفتاح Groq - سر مايتشاركش).
@Serializable
data class Backup(
    val recipients: List<Recipient> = emptyList(),
    val selectedRecipientId: String = "",
    val myName: String = "",
    val model: String = AppConstants.DEFAULT_MODEL,
    val humor: Boolean = false,
    val messageLength: String = "short",
    val morningTime: String = "07:00",
    val eveningTime: String = "21:00",
    val occasions: List<OccasionConfig> = emptyList(),
    val data: AppData = AppData(),
)

// تصدير/استيراد كل بياناتك (الأشخاص + التعلّم + الإعدادات) كنص JSON.
object BackupManager {
    private val json = Json { ignoreUnknownKeys = true; prettyPrint = true; encodeDefaults = true }

    fun export(context: Context): String {
        val s = Settings(context)
        val store = Store(context)
        val b = Backup(
            recipients = s.recipients,
            selectedRecipientId = s.selectedRecipientId,
            myName = s.myName,
            model = s.model,
            humor = s.humor,
            messageLength = s.messageLength,
            morningTime = s.morningTime,
            eveningTime = s.eveningTime,
            occasions = s.occasions,
            data = store.read(),
        )
        return json.encodeToString(b)
    }

    // بيرجّع true لو الاستعادة نجحت.
    fun import(context: Context, raw: String): Boolean {
        val b = runCatching { json.decodeFromString<Backup>(raw.trim()) }.getOrNull() ?: return false
        val s = Settings(context)
        s.recipients = b.recipients
        s.selectedRecipientId = b.selectedRecipientId
        s.myName = b.myName
        s.model = b.model
        s.humor = b.humor
        s.messageLength = b.messageLength
        s.morningTime = b.morningTime
        s.eveningTime = b.eveningTime
        s.occasions = b.occasions
        Store(context).write(b.data)
        return true
    }
}
