package com.wifeassistant.data

import kotlin.random.Random

// قلب التوليد — نظير generateSuggestion.js.
// تعلّم بالسياق (few-shot) + ترجيح المواضيع + تنويع + مرساة صوت ثابتة.
class SuggestionEngine(
    private val store: Store,
    private val groq: GroqClient,
) {
    suspend fun generate(slot: String, occasion: Occasion? = null): GenerationResult {
        val themes = if (occasion != null) listOf(occasion.label, occasion.label) else pickThemes(2)
        val raw = groq.complete(
            listOf(
                ChatMessage("system", buildSystemPrompt()),
                ChatMessage("user", buildUserPrompt(slot, occasion, themes)),
            )
        )
        return GenerationResult(parseTwo(raw, themes), themes, slot)
    }

    // اختيار موضوعين: تجنّب المستخدم مؤخراً + ترجيح بالوزن.
    private fun pickThemes(count: Int): List<String> {
        val weights = store.themeWeights()
        val recent = store.recentThemes(AppConstants.AVOID_RECENT_THEME_DAYS)
        var pool = AppConstants.THEMES.filter { it !in recent }
        if (pool.size < count) pool = AppConstants.THEMES.toList()

        val available = pool.toMutableList()
        val chosen = mutableListOf<String>()
        repeat(count) {
            if (available.isEmpty()) return@repeat
            val picked = weightedRandom(available, weights)
            chosen.add(picked)
            available.remove(picked)
        }
        return chosen
    }

    private fun weightedRandom(items: List<String>, weights: Map<String, Double>): String {
        val total = items.sumOf { weights[it] ?: 1.0 }
        var r = Random.nextDouble() * total
        for (it in items) {
            r -= weights[it] ?: 1.0
            if (r <= 0) return it
        }
        return items.last()
    }

    // مرساة الصوت الثابتة — بتحافظ على النبرة الأساسية عشان الأسلوب ما ينحرفش.
    private fun buildSystemPrompt(): String = listOf(
        "انت مساعد بيكتب لي رسايل قصيرة لزوجتي باللهجة المصرية العامية.",
        "النبرة: ${AppConstants.TONE}.",
        "قواعد ثابتة لا تتغيّر:",
        "- الرسالة من سطر لـ 3 أسطر بحد أقصى.",
        "- لهجة مصرية طبيعية، كأني أنا اللي بكتبها، مش فصحى ولا كلام رسمي.",
        "- صدق وبساطة، من غير مبالغة ولا كلام مصنوع ولا شِعر متكلّف.",
        "- من غير إيموجي كتير (إيموجي واحد على الأكثر، أو من غير خالص).",
        "هدفك: اقتراح أكتبه أنا وأبعته بنفسي. انت بتساعدني بس.",
    ).joinToString("\n")

    // حقن أمثلة الأسلوب (few-shot) من اختياراتي السابقة.
    private fun buildStyleBlock(): String {
        val examples = store.styleExamples()
        if (examples.isEmpty()) return "لسه مفيش أمثلة من أسلوبي. اكتب بنبرة دافئة بسيطة طبيعية."
        val lines = examples.takeLast(AppConstants.STYLE_EXAMPLES_MAX)
            .mapIndexed { i, e -> "${i + 1}) ${e.text}" }
            .joinToString("\n")
        return listOf(
            "دي أمثلة من رسايل اخترتها أو عدّلتها قبل كده — ده أسلوبي وصوتي.",
            "قلّد روح الأمثلة دي (اختيار الكلمات والإيقاع) من غير ما تنسخها حرفياً:",
            lines,
        ).joinToString("\n")
    }

    private fun buildUserPrompt(slot: String, occasion: Occasion?, themes: List<String>): String {
        val slotLabel = when (slot) {
            "morning" -> "الصبح"
            "evening" -> "بالليل"
            else -> "دلوقتي"
        }
        val situation = if (occasion != null)
            "النهاردة مناسبة: ${occasion.label}. اكتب رسالة مخصصة للمناسبة دي."
        else
            "الوقت: $slotLabel. الموضوع المطلوب لكل اقتراح موجود تحت."
        val themeLine = if (occasion != null)
            "الاتنين عن: ${occasion.label}."
        else
            "الاقتراح الأول موضوعه: ${themes[0]}. الاقتراح التاني موضوعه: ${themes[1]}."

        return listOf(
            buildStyleBlock(), "",
            situation, "",
            "اكتب لي اقتراحين مختلفين تماماً عن بعض.", themeLine, "",
            "رجّع الرد بالظبط بالصيغة دي ومن غير أي كلام زيادة:",
            "١- <نص الاقتراح الأول>",
            "٢- <نص الاقتراح التاني>",
        ).joinToString("\n")
    }

    companion object {
        // تحليل رد الموديل لاقتراحين — يفضّل الأسطر المرقّمة فعلاً ويتجاهل التمهيد.
        // دالة نقية (بدون I/O) عشان تتختبر بسهولة.
        internal fun parseTwo(raw: String, themes: List<String>): List<Suggestion> {
            val lines = raw.split("\n").map { it.trim() }.filter { it.isNotEmpty() }
            val numberedRe = Regex("^\\s*[١٢12]\\s*[-.)]\\s*(.+)$")
            val numbered = lines.mapNotNull { numberedRe.find(it)?.groupValues?.get(1)?.trim() }

            val first: String
            val second: String
            if (numbered.size >= 2) {
                first = numbered[0]; second = numbered[1]
            } else {
                val stripRe = Regex("^\\s*[١٢12]\\s*[-.)]\\s*")
                val cleaned = lines.map { it.replace(stripRe, "").trim() }.filter { it.isNotEmpty() }
                first = cleaned.getOrNull(0) ?: raw.trim()
                second = cleaned.getOrNull(1) ?: cleaned.getOrNull(0) ?: raw.trim()
            }
            val t0 = themes.getOrElse(0) { "" }
            val t1 = themes.getOrElse(1) { t0 }
            return listOf(Suggestion(first, t0), Suggestion(second, t1))
        }
    }
}
