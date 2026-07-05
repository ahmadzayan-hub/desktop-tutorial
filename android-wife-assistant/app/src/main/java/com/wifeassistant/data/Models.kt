package com.wifeassistant.data

import kotlinx.serialization.Serializable

// مثال من أسلوبي (رسالة اخترتها أو عدّلتها) — للتعلّم بالسياق.
@Serializable
data class StyleExample(val text: String, val theme: String? = null, val date: String)

// تسجيل تفاعل واحد (تغذية راجعة).
@Serializable
data class Feedback(
    val date: String,
    val slot: String,
    val themesShown: List<String>,
    val choice: String,          // pick1 / pick2 / edited / ignore / regen
    val finalText: String? = null,
)

// اقتراح واحد + موضوعه.
@Serializable
data class Suggestion(val text: String, val theme: String)

// آخر جولة معروضة (عشان الإشعار والواجهة يشوفوا نفس الاقتراحين).
@Serializable
data class PendingRound(
    val slot: String,
    val themesShown: List<String>,
    val items: List<Suggestion>,
    val occasionLabel: String? = null,
)

// كل بيانات التعلّم المحفوظة محلياً (JSON في filesDir).
@Serializable
data class AppData(
    val styleExamples: MutableList<StyleExample> = mutableListOf(),
    val themeWeights: MutableMap<String, Double> = mutableMapOf(),
    val feedback: MutableList<Feedback> = mutableListOf(),
    val lastSentPerSlot: MutableMap<String, String> = mutableMapOf(),
    var pending: PendingRound? = null,
)

// إعداد مناسبة.
@Serializable
data class OccasionConfig(
    val type: String,                        // "fixed" أو "manual"
    val date: String? = null,                // MM-DD للـ fixed
    val dates: List<String> = emptyList(),   // YYYY-MM-DD للـ manual
    val label: String,
    val enabled: Boolean = true,
)

// نتيجة توليد جاهزة للعرض.
data class GenerationResult(
    val items: List<Suggestion>,
    val themesShown: List<String>,
    val slot: String,
)

// مناسبة النهاردة.
data class Occasion(val key: String, val label: String)
