package com.wifeassistant.data

// اختيار لغة الرسالة حسب لغة المستقبل الأولى (عربي/إنجليزي) مع كشف تلقائي.
// كل الدوال نقية بدون I/O عشان تتختبر بسهولة (زي Phone/Csv).
object Lang {
    const val AUTO = "auto"
    const val AR = "ar"
    const val EN = "en"

    // كشف اللغة الغالبة من نص: عربي لو فيه حروف عربية أكتر، إنجليزي لو لاتيني أكتر،
    // null لو مفيش حروف نقدر نحكم بيها (أرقام/رموز بس).
    fun detect(text: String?): String? {
        if (text.isNullOrBlank()) return null
        var ar = 0
        var la = 0
        for (c in text) {
            val code = c.code
            when {
                code in 0x0600..0x06FF || code in 0x0750..0x077F || code in 0x08A0..0x08FF -> ar++
                c in 'A'..'Z' || c in 'a'..'z' -> la++
            }
        }
        return when {
            ar == 0 && la == 0 -> null
            ar >= la -> AR
            else -> EN
        }
    }

    // اللغة النهائية: تفضيل الشخص أولاً (ar/en)، وإلا كشف من عيّنات (الاسم/رسالة)،
    // وإلا عربي افتراضي.
    fun resolve(recipientLang: String?, vararg samples: String?): String {
        when (recipientLang?.lowercase()) {
            AR -> return AR
            EN -> return EN
        }
        for (s in samples) detect(s)?.let { return it }
        return AR
    }

    // توجيه اللغة اللي بيتحقن في البرومبت. عربي = السلوك الافتراضي (باللهجة) فبيرجّع فاضي.
    fun promptDirective(lang: String): String = when (lang) {
        EN -> "IMPORTANT: The recipient's first language is English. Write the ENTIRE message in natural, warm, human English. Do NOT use Arabic at all. Ignore any Arabic-dialect instruction."
        else -> ""
    }

    // تسمية للعرض في الواجهة.
    fun label(lang: String): String = when (lang) {
        AR -> "عربي"
        EN -> "إنجليزي"
        else -> "تلقائي"
    }
}
