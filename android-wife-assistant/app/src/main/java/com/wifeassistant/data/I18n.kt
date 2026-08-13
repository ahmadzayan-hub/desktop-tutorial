package com.wifeassistant.data

// لغة واجهة التطبيق (منفصلة تمامًا عن لغة الرسائل المولّدة لكل شخص).
// "ar" = عربي (RTL) — الافتراضي. "en" = إنجليزي (LTR).
// بتتظبط مرة عند الإقلاع ومع كل تغيير من الإعدادات، وإعادة التكوين بتتم عبر
// state في MainActivity (key(lang) حوالين الشجرة كلها).
object I18n {
    @Volatile
    var lang: String = "ar"

    val isEnglish: Boolean get() = lang == "en"
}

// النصوص بتتكتب مكانها بالنسختين — أوضح للمراجعة ومفيش جدول مفاتيح منفصل يتنسي.
fun t(ar: String, en: String): String = if (I18n.lang == "en") en else ar
