package com.wifeassistant.data

import kotlin.random.Random

// قلب التوليد - نظير generateSuggestion.js.
// تعلّم بالسياق (few-shot) + ترجيح المواضيع + تنويع + مرساة صوت ثابتة.
class SuggestionEngine(
    private val store: Store,
    private val groq: GroqClient,
    private val settings: Settings,
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

    // مرساة الصوت - النبرة الأساسية حسب نوع العلاقة (شريك/ابن/أم/أخ...).
    private fun buildSystemPrompt(): String {
        val rel = Relations.byId(settings.currentRecipient()?.relation ?: "partner_wife")
        val lines = mutableListOf(
            "انت بتساعد شخص مصري يكتب رسالة قصيرة ${rel.toAddr} (${rel.label}) باللهجة المصرية العامية.",
            "النبرة المناسبة للعلاقة دي: ${rel.tone}.",
            "اكتب كإنسان حقيقي بمشاعر صادقة ودفء إنساني - مش كلام آلة.",
            "قواعد ثابتة لا تتغيّر:",
            if (settings.messageLength == "medium")
                "- الرسالة من سطرين لـ 3 أسطر."
            else
                "- الرسالة قصيرة ومركّزة: سطر أو سطرين بحد أقصى.",
            "- لهجة مصرية طبيعية، كأنه هو اللي كتبها، مش فصحى ولا كلام رسمي.",
            "- صدق وبساطة، من غير مبالغة ولا كلام مصنوع ولا شِعر متكلّف.",
            if (settings.emoji)
                "- استخدم إيموجي أو اتنين معبّرين عن روح الرسالة ومناسبين للعلاقة والشخص، بإبداع وذوق ومن غير مبالغة."
            else
                "- من غير إيموجي خالص.",
        )
        if (settings.humor) {
            lines.add("- حطّ لمسة خفيفة من الدُعابة الحلوة اللطيفة، من غير سخافة ولا مبالغة.")
        }
        lines.add("هدفك: اقتراح هو يبعته بنفسه ${rel.toAddr} عشان يقرّب ويقوّي الترابط.")
        return lines.joinToString("\n")
    }

    // بلوك التخصيص - بيخلّي الرسالة للشخص ده بالذات ومنّه هو (شخصنة إنسانية).
    private fun buildPersonaBlock(): String {
        val r = settings.currentRecipient()
        val parts = mutableListOf<String>()
        if (settings.myName.isNotBlank()) parts.add("اسم اللي بيبعت: ${settings.myName.trim()}.")
        if (r != null && r.name.isNotBlank()) {
            parts.add("اسم اللي بيتبعتله: ${r.name.trim()} - نادِه باسمه أو دلعه بشكل طبيعي.")
        }
        if (r != null && r.notes.isNotBlank()) {
            parts.add("حاجات عنه تخصّص بيها الرسالة: ${r.notes.trim()}.")
        }
        if (parts.isEmpty()) return ""
        return ("تخصيص (خلّي التفاصيل دي محسوسة في الرسالة، بس من غير ما تسردها صريحة):\n" +
            parts.joinToString("\n"))
    }

    // حقن أمثلة الأسلوب (few-shot) من اختياراتي السابقة للشخص ده.
    private fun buildStyleBlock(): String {
        val rid = settings.currentRecipient()?.id ?: ""
        val examples = store.styleExamples(rid)
        if (examples.isEmpty()) return "لسه مفيش أمثلة من أسلوبي. اكتب بنبرة دافئة بسيطة طبيعية."
        val lines = examples.takeLast(AppConstants.STYLE_EXAMPLES_MAX)
            .mapIndexed { i, e -> "${i + 1}) ${e.text}" }
            .joinToString("\n")
        return listOf(
            "دي أمثلة من رسايل اخترتها أو عدّلتها قبل كده - ده أسلوبي وصوتي.",
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

        val persona = buildPersonaBlock()
        val blocks = mutableListOf(buildStyleBlock())
        if (persona.isNotBlank()) { blocks.add(""); blocks.add(persona) }
        blocks.addAll(
            listOf(
                "",
                situation, "",
                "اكتب اقتراحين مختلفين تماماً عن بعض، وكإنهم من قلبه هو.", themeLine, "",
                "رجّع الرد بالظبط بالصيغة دي ومن غير أي كلام زيادة:",
                "١- <نص الاقتراح الأول>",
                "٢- <نص الاقتراح التاني>",
            )
        )
        return blocks.joinToString("\n")
    }

    companion object {
        // تحليل رد الموديل لاقتراحين - يفضّل الأسطر المرقّمة فعلاً ويتجاهل التمهيد.
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
