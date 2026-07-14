package com.wifeassistant.util

// منطق تطبيع رقم الموبايل — نقي (بدون أي Android) عشان يكون قابل للاختبار.
object Phone {
    // يرجّع أرقام صالحة لـ wa.me. cc = كود الدولة الافتراضي (أرقام بس، زي "20").
    // القواعد:
    //  - لو الرقم دولي بالفعل (يبدأ بـ + أو بادئة 00) نسيبه زي ما هو (بس نشيل 00).
    //  - غير كده (رقم محلي) نشيل الصفر المحلي ونحطّ كود الدولة لو مش موجود.
    fun normalize(raw: String, cc: String): String {
        val trimmed = raw.trim()
        val digits = raw.filter { it.isDigit() }
        if (digits.isEmpty()) return digits
        if (trimmed.startsWith("+")) return digits          // دولي بعلامة +
        if (digits.startsWith("00")) return digits.drop(2)  // دولي ببادئة 00
        val code = cc.filter { it.isDigit() }
        if (code.isEmpty()) return digits
        var d = digits.trimStart('0')                       // شيل الصفر المحلي
        if (!d.startsWith(code)) d = code + d
        return d
    }
}
