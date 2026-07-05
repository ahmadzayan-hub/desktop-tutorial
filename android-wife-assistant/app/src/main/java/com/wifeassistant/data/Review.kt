package com.wifeassistant.data

// التقييم الذاتي — نظير review.js. بيحسب ملخّص من التغذية الراجعة.
data class WorstSlot(val slot: String, val ignoredRate: Int, val total: Int)

data class ReviewReport(
    val acceptRate: Int,
    val accepted: Int,
    val total: Int,
    val topThemes: List<Pair<String, Int>>,
    val styleExamplesCount: Int,
    val worstSlot: WorstSlot?,
)

class Review(private val store: Store) {
    fun build(): ReviewReport = compute(store.feedback(), store.styleExamplesCount())

    companion object {
        private fun isAccepted(choice: String) =
            choice == "pick1" || choice == "pick2" || choice == "edited"

        // الحساب النقي (بدون I/O) عشان يتختبر مباشرة.
        internal fun compute(feedback: List<Feedback>, styleCount: Int): ReviewReport {
            // بنحسب "جولات" حقيقية بس ونتجاهل "جديد" (regen).
            val decisions = feedback.filter { it.choice != "regen" }
            val total = decisions.size
            val accepted = decisions.count { isAccepted(it.choice) }
            val acceptRate = if (total > 0) Math.round(accepted * 100.0 / total).toInt() else 0

            // أعلى 3 مواضيع نجاحاً (اللي اخترتها أكتر).
            val wins = mutableMapOf<String, Int>()
            for (f in decisions) {
                if (isAccepted(f.choice) && f.themesShown.isNotEmpty()) {
                    val idx = if (f.choice == "pick2") 1 else 0
                    val theme = f.themesShown.getOrElse(idx) { f.themesShown[0] }
                    wins[theme] = (wins[theme] ?: 0) + 1
                }
            }
            val topThemes = wins.entries.sortedByDescending { it.value }.take(3).map { it.key to it.value }

            // الخانة الأكتر تجاهلاً (≥3 تفاعلات و≥60% تجاهل).
            val slotStats = mutableMapOf<String, IntArray>() // slot -> [total, ignored]
            for (f in decisions) {
                val s = slotStats.getOrPut(f.slot) { intArrayOf(0, 0) }
                s[0]++
                if (f.choice == "ignore") s[1]++
            }
            var worst: WorstSlot? = null
            for ((slot, s) in slotStats) {
                val rate = s[1].toDouble() / s[0]
                if (s[0] >= 3 && rate >= 0.6) {
                    val pct = Math.round(rate * 100).toInt()
                    if (worst == null || pct > worst!!.ignoredRate) worst = WorstSlot(slot, pct, s[0])
                }
            }

            return ReviewReport(acceptRate, accepted, total, topThemes, styleCount, worst)
        }
    }
}
