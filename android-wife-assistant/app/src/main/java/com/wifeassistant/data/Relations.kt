package com.wifeassistant.data

// أنواع العلاقات — هدف التطبيق: الترابط الأسري والتواصل العاطفي الإنساني.
// لكل علاقة نبرة مناسبة عشان الرسالة تطلع صادقة وطبيعية حسب مين المستقبِل.
object Relations {
    data class Relation(
        val id: String,
        val label: String,   // للعرض (زوجتي، ابني...)
        val toAddr: String,  // "لـ..." تستخدم في البرومبت
        val tone: String,    // النبرة المطلوبة
    )

    val ALL = listOf(
        Relation("partner_wife", "زوجتي", "لمراتي", "حب رومانسي دافئ وصادق، حنية وشوق من غير مبالغة"),
        Relation("partner_husband", "زوجي", "لجوزي", "حب رومانسي دافئ وصادق، حنية وشوق من غير مبالغة"),
        Relation("son", "ابني", "لابني", "حنان وفخر وتشجيع وأمان، كلام بيقرّب"),
        Relation("daughter", "بنتي", "لبنتي", "حنان وفخر ولطف وحماية دافئة"),
        Relation("mother", "أمي", "لأمي", "احترام وحب عميق وامتنان وحنية"),
        Relation("father", "أبويا", "لأبويا", "احترام وحب وتقدير وامتنان"),
        Relation("brother", "أخويا", "لأخويا", "ود وسند وأخوّة وروح مرحة خفيفة"),
        Relation("sister", "أختي", "لأختي", "ود وسند وحنية وأخوّة"),
    )

    fun byId(id: String): Relation = ALL.firstOrNull { it.id == id } ?: ALL[0]
    fun labelOf(id: String): String = byId(id).label
}
