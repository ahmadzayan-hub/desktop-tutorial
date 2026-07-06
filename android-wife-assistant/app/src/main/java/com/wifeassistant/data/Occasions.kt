package com.wifeassistant.data

// تحديد مناسبة النهاردة من الإعدادات — نظير occasions.js.
// fixed = MM-DD ثابت، manual = YYYY-MM-DD (أعياد إسلامية بتتغيّر كل سنة).
class Occasions(private val settings: Settings) {

    fun todaysOccasion(): Occasion? =
        match(settings.occasions, DateUtil.todayISO(), DateUtil.todayMMDD())

    companion object {
        // مناسبة الشخص النهاردة (عيد ميلاده/جوازه...) لو فيه.
        fun recipientOccasionToday(r: Recipient, mmdd: String = DateUtil.todayMMDD()): Occasion? {
            for (o in r.occasions) {
                if (o.date.isNotBlank() && o.date == mmdd) return Occasion("person", o.label)
            }
            return null
        }

        // مطابقة نقية (بدون I/O) عشان تتختبر مباشرة.
        internal fun match(configs: List<OccasionConfig>, ymd: String, mmdd: String): Occasion? {
            for (occ in configs) {
                if (!occ.enabled) continue
                when (occ.type) {
                    "fixed" -> {
                        val d = occ.date ?: continue
                        if (d == "MM-DD") continue
                        if (d == mmdd) return Occasion(occ.label, occ.label)
                    }
                    "manual" -> {
                        for (d in occ.dates) {
                            if (d.isBlank() || d == "YYYY-MM-DD") continue
                            if (d == ymd) return Occasion(occ.label, occ.label)
                        }
                    }
                }
            }
            return null
        }
    }
}
