package com.wifeassistant.data

// تحديد مناسبة النهاردة من الإعدادات — نظير occasions.js.
// fixed = MM-DD ثابت، manual = YYYY-MM-DD (أعياد إسلامية بتتغيّر كل سنة).
class Occasions(private val settings: Settings) {

    fun todaysOccasion(): Occasion? {
        val ymd = DateUtil.todayISO()
        val mmdd = DateUtil.todayMMDD()

        for (occ in settings.occasions) {
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
