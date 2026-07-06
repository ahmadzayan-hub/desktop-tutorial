package com.wifeassistant.data

import android.content.Context
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

// الإعدادات (المفتاح + رقم الواتساب + التخصيص + المواعيد + المناسبات).
// كله على الجهاز بس (SharedPreferences) — مفيش سر بيتبعت لأي حد غير Groq.
class Settings(context: Context) {
    private val prefs = context.getSharedPreferences("wife_assistant_settings", Context.MODE_PRIVATE)
    private val json = Json { ignoreUnknownKeys = true }

    var groqKey: String
        get() = prefs.getString("groqKey", "").orEmpty()
        set(v) = prefs.edit().putString("groqKey", v).apply()

    // رقم مراتك بالصيغة الدولية بأرقام بس (زي 201001234567).
    var wifeNumber: String
        get() = prefs.getString("wifeNumber", "").orEmpty()
        set(v) = prefs.edit().putString("wifeNumber", v).apply()

    var model: String
        get() = prefs.getString("model", AppConstants.DEFAULT_MODEL) ?: AppConstants.DEFAULT_MODEL
        set(v) = prefs.edit().putString("model", v).apply()

    // ---- التخصيص والإنسانية ----
    var myName: String // اسم المُرسِل (انت)
        get() = prefs.getString("myName", "").orEmpty()
        set(v) = prefs.edit().putString("myName", v).apply()

    var wifeName: String // اسم/دلع مراتك
        get() = prefs.getString("wifeName", "").orEmpty()
        set(v) = prefs.edit().putString("wifeName", v).apply()

    // تفاصيل شخصية عنها (حاجات بتحبها، دلع، نكت بينكم) عشان الرسالة تبقى ليها هي بالذات.
    var relationshipNotes: String
        get() = prefs.getString("relationshipNotes", "").orEmpty()
        set(v) = prefs.edit().putString("relationshipNotes", v).apply()

    // لمسة دُعابة خفيفة في الاقتراحات؟
    var humor: Boolean
        get() = prefs.getBoolean("humor", false)
        set(v) = prefs.edit().putBoolean("humor", v).apply()

    // طول الرسالة: "short" أو "medium".
    var messageLength: String
        get() = prefs.getString("messageLength", "short") ?: "short"
        set(v) = prefs.edit().putString("messageLength", v).apply()

    // خلّص شاشة الترحيب؟
    var onboarded: Boolean
        get() = prefs.getBoolean("onboarded", false)
        set(v) = prefs.edit().putBoolean("onboarded", v).apply()

    // إيموجي معبّر في الاقتراحات؟
    var emoji: Boolean
        get() = prefs.getBoolean("emoji", true)
        set(v) = prefs.edit().putBoolean("emoji", v).apply()

    // ---- المواعيد ----
    var morningTime: String
        get() = prefs.getString("morningTime", "07:00") ?: "07:00"
        set(v) = prefs.edit().putString("morningTime", v).apply()

    var eveningTime: String
        get() = prefs.getString("eveningTime", "21:00") ?: "21:00"
        set(v) = prefs.edit().putString("eveningTime", v).apply()

    var occasions: List<OccasionConfig>
        get() {
            val raw = prefs.getString("occasions", null) ?: return AppConstants.DEFAULT_OCCASIONS
            return runCatching { json.decodeFromString<List<OccasionConfig>>(raw) }
                .getOrDefault(AppConstants.DEFAULT_OCCASIONS)
        }
        set(v) = prefs.edit().putString("occasions", json.encodeToString(v)).apply()

    // ---- الأشخاص (الترابط الأسري) ----
    var recipients: List<Recipient>
        get() {
            val raw = prefs.getString("recipients", null) ?: return emptyList()
            return runCatching { json.decodeFromString<List<Recipient>>(raw) }.getOrDefault(emptyList())
        }
        set(v) = prefs.edit().putString("recipients", json.encodeToString(v)).apply()

    var selectedRecipientId: String
        get() = prefs.getString("selectedRecipientId", "").orEmpty()
        set(v) = prefs.edit().putString("selectedRecipientId", v).apply()

    fun currentRecipient(): Recipient? {
        val list = recipients
        return list.firstOrNull { it.id == selectedRecipientId } ?: list.firstOrNull()
    }

    // أول تشغيل: لو مفيش أشخاص، اعمل واحد افتراضي (من بيانات الزوجة القديمة لو موجودة).
    fun ensureSeed() {
        if (recipients.isNotEmpty()) return
        val seed = Recipient(
            id = "seed-1",
            name = wifeName,
            relation = "partner_wife",
            number = wifeNumber,
            notes = relationshipNotes,
        )
        recipients = listOf(seed)
        selectedRecipientId = seed.id
    }
}
