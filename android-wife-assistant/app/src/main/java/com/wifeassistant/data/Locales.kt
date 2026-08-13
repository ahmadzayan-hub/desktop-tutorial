package com.wifeassistant.data

// سجل اللغات المتاحة فعليًا في الواجهة (Level C framework):
// إضافة لغة جديدة = تسجيلها هنا + حزمة ترجمة في LocalePacks — من غير لمس أي شاشة.
// nativeName بيتعرض بلسان اللغة نفسها، ومفيش أعلام دول (اللغة مش دولة).
data class AppLocale(
    val code: String,          // BCP 47
    val nativeName: String,
    val rtl: Boolean,
    // لغة اتترجمت آليًا ولسه محتاجة مراجعة ناطق أصلي قبل اعتبارها Level A كاملة.
    val machineDrafted: Boolean = false,
)

object Locales {
    val registered: List<AppLocale> = listOf(
        AppLocale("ar", "العربية", rtl = true),
        AppLocale("en", "English", rtl = false),
        AppLocale("es", "Español", rtl = false, machineDrafted = true),
    )

    fun byCode(code: String): AppLocale? = registered.firstOrNull { it.code == code }

    fun isRegistered(code: String): Boolean = byCode(code) != null

    fun isRtl(code: String): Boolean = byCode(code)?.rtl ?: true
}

// حزم الترجمة للغات غير العربي/الإنجليزي، مفتاحها النص الإنجليزي المصدر.
// النصوص اللي فيها interpolation بتتقيّم قبل النداء فمش هتتطابق — بتقع للإنجليزي
// بأمان (موثّق في docs/supported-locales.md).
object LocalePacks {
    private val packs: Map<String, Map<String, String>> = mapOf(
        "es" to LocalePackEs.strings,
    )

    fun lookup(lang: String, enSource: String): String? = packs[lang]?.get(enSource)
}
