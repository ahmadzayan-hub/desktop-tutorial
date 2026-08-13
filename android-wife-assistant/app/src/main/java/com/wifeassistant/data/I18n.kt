package com.wifeassistant.data

// لغة واجهة التطبيق (منفصلة تمامًا عن لغة الرسائل المولّدة لكل شخص).
// "ar" = عربي (RTL) — الافتراضي. "en" = إنجليزي (LTR).
// بتتظبط مرة عند الإقلاع ومع كل تغيير من الإعدادات، وإعادة التكوين بتتم عبر
// state في MainActivity (key(lang) حوالين الشجرة كلها).
object I18n {
    @Volatile
    var lang: String = "ar"

    val isEnglish: Boolean get() = lang == "en"

    val isRtl: Boolean get() = Locales.isRtl(lang)
}

// النصوص بتتكتب مكانها بالنسختين (ar/en) — أوضح للمراجعة.
// أي لغة تالتة بتتحل من حزمة LocalePacks بمفتاح النص الإنجليزي،
// ولو المفتاح مش موجود بنقع للإنجليزي بأمان (مفيش نص مقصوص أبدًا).
fun t(ar: String, en: String): String = when (I18n.lang) {
    "ar" -> ar
    "en" -> en
    else -> LocalePacks.lookup(I18n.lang, en) ?: en
}
