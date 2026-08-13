package com.wifeassistant.data

// محرك «ما الذي تعلّمه وصال؟» — بيحوّل بيانات التعلّم المحلية (أمثلة الأسلوب)
// لقواعد مقروءة المستخدم يقدر يعطّلها أو يعدّلها أو يمسحها.
//
// مبادئ (من متطلبات المنتج):
// - كل الاشتقاق محلي وحتمي — مفيش نداء شبكة ومفيش نسب ثقة غامضة.
// - كل قاعدة بتقول اتبنت من كام رسالة (شفافية مصدر البيانات).
// - التجاوزات (تعطيل/تعديل/حذف) بتتخزن محليًا في Store زي باقي التعلّم.

data class StyleRule(
    val id: String,           // ثابت: kind:recipientId — التجاوزات بتتربط بيه
    val recipientId: String,
    val text: String,
    val enabled: Boolean,
    val contributing: Int,    // عدد الرسائل اللي القاعدة اتبنت منها
)

object StyleInsights {
    // أقل عدد أمثلة قبل ما نشتق أي قاعدة — أقل من كده يبقى "لسه بتعلّم".
    const val MIN_EXAMPLES = 3

    private val EMOJI = Regex("[\\p{So}\\p{Sk}\\x{1F300}-\\x{1FAFF}\\x{2600}-\\x{27BF}]")
    private val STOPWORDS = setOf(
        "على", "إلى", "من", "في", "عن", "مع", "أنا", "انا", "انت", "إنت", "يا",
        "the", "and", "you", "for", "with", "que", "para", "los", "las",
    )

    // القواعد الخام المشتقّة من أمثلة شخص واحد (قبل تطبيق التجاوزات).
    fun deriveRaw(recipientId: String, examples: List<StyleExample>): List<StyleRule> {
        if (examples.size < MIN_EXAMPLES) return emptyList()
        val rules = mutableListOf<StyleRule>()
        val n = examples.size

        // 1) طول الرسالة المعتاد
        val avgLen = examples.map { it.text.length }.average()
        val lenText = when {
            avgLen < 60 -> t("بتفضل الرسائل القصيرة", "You prefer short messages")
            avgLen < 140 -> t("بتفضل الرسائل المتوسطة", "You prefer medium-length messages")
            else -> t("بتفضل الرسائل الطويلة المفصّلة", "You prefer longer, detailed messages")
        }
        rules.add(StyleRule("len:$recipientId", recipientId, lenText, true, n))

        // 2) عادة الإيموجي
        val avgEmoji = examples.map { EMOJI.findAll(it.text).count() }.average()
        val emojiText = when {
            avgEmoji < 0.5 -> t("غالبًا من غير إيموجي", "Usually no emoji")
            avgEmoji <= 1.5 -> t("إيموجي واحد غالبًا", "Usually one emoji")
            else -> t("بتحب الإيموجي في رسائلك", "You like emoji in your messages")
        }
        rules.add(StyleRule("emoji:$recipientId", recipientId, emojiText, true, n))

        // 3) عبارة متكررة (في 3 رسائل مختلفة على الأقل) — الثنائيات أولى من
        // الكلمة المفردة («ربنا يخليكي» أوصف من «ربنا»)، والترتيب حتمي.
        val wordFreq = mutableMapOf<String, Int>()
        val bigramFreq = mutableMapOf<String, Int>()
        for (e in examples) {
            val words = e.text.split(Regex("[\\s\\p{Punct}،؛؟]+"))
                .map { it.trim() }
                .filter { it.length >= 3 && it.lowercase() !in STOPWORDS && !EMOJI.containsMatchIn(it) }
            for (w in words.toSet()) wordFreq[w] = (wordFreq[w] ?: 0) + 1
            for (b in words.zipWithNext { a, c -> "$a $c" }.toSet()) bigramFreq[b] = (bigramFreq[b] ?: 0) + 1
        }
        fun topOf(freq: Map<String, Int>): Pair<String, Int>? = freq.entries
            .filter { it.value >= 3 }
            .sortedWith(compareByDescending<Map.Entry<String, Int>> { it.value }.thenBy { it.key })
            .firstOrNull()?.let { it.key to it.value }
        val top = topOf(bigramFreq) ?: topOf(wordFreq)
        if (top != null) {
            rules.add(
                StyleRule(
                    "phrase:$recipientId", recipientId,
                    t("بتستخدم كتير: «${top.first}»", "You often use: “${top.first}”"),
                    true, top.second,
                )
            )
        }
        return rules
    }

    // القواعد بعد تطبيق تجاوزات المستخدم: المحذوف بيختفي، المعدَّل بياخد نصه الجديد.
    fun applyOverrides(raw: List<StyleRule>, overrides: Map<String, StyleRuleOverride>): List<StyleRule> =
        raw.mapNotNull { rule ->
            val o = overrides[rule.id] ?: return@mapNotNull rule
            if (o.deleted) return@mapNotNull null
            rule.copy(enabled = o.enabled, text = o.editedText ?: rule.text)
        }

    // القواعد المفعّلة فقط — دي اللي بتدخل توجيه توليد الرسائل.
    fun activeRules(recipientId: String, examples: List<StyleExample>, overrides: Map<String, StyleRuleOverride>): List<StyleRule> =
        applyOverrides(deriveRaw(recipientId, examples), overrides).filter { it.enabled }
}
