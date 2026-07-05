package com.wifeassistant.data

// ثوابت المشروع (نظير config.js في بوت التيليجرام).
object AppConstants {
    val THEMES = listOf(
        "امتنان", "اشتياق", "تمني يوم جميل", "تقدير", "دعم", "دعاء", "كلمة من القلب"
    )
    const val STYLE_EXAMPLES_MAX = 30
    const val AVOID_RECENT_THEME_DAYS = 3L
    const val TIMEZONE = "Asia/Dubai"
    const val TONE = "دافئة، صادقة، بسيطة، من غير مبالغة ولا كلام مصنوع"
    const val DEFAULT_MODEL = "llama-3.3-70b-versatile"

    // موديلات Groq المجانية (id -> اسم للعرض). الأولانية الأفضل للعربي.
    val MODELS = listOf(
        "llama-3.3-70b-versatile" to "لاما 3.3 (70B) — الأفضل للعربي",
        "llama-3.1-8b-instant" to "لاما 3.1 (8B) — أسرع",
    )

    // طول الرسالة (id -> اسم).
    val LENGTHS = listOf(
        "short" to "قصيرة",
        "medium" to "متوسطة",
    )

    // مناسبات افتراضية — نفس اللي في بوت التيليجرام. المستخدم يقدر يعدّلها.
    val DEFAULT_OCCASIONS = listOf(
        OccasionConfig("fixed", date = "08-24", label = "عيد ميلاد مراتي"),
        OccasionConfig("fixed", date = "02-14", label = "عيد الحب (الفلانتين)"),
        OccasionConfig("fixed", date = "11-04", label = "عيد الحب المصري"),
        OccasionConfig("manual", dates = listOf("2026-08-25", "2027-08-14"), label = "المولد النبوي"),
        OccasionConfig("manual", dates = listOf("2027-02-08"), label = "أول رمضان"),
        OccasionConfig("manual", dates = listOf("2027-03-10"), label = "عيد الفطر"),
        OccasionConfig("manual", dates = listOf("2027-05-16"), label = "عيد الأضحى"),
        OccasionConfig("manual", dates = listOf("2027-06-06"), label = "رأس السنة الهجرية"),
    )
}
