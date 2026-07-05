package com.wifeassistant.data

import android.content.Context
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

// الإعدادات (المفتاح + رقم الواتساب + المواعيد + المناسبات) في SharedPreferences.
// المفتاح سر — بيتخزّن على الجهاز بس، مش بيتبعت لأي حد غير Groq.
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
}
