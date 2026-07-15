package com.wifeassistant.data

// «رد ذكي»: تلصق رسالة وصلتلك، والوكيل يقترح ردّين بأسلوبك ونبرة علاقتك بالشخص.
// بيتعلّم بالسياق (few-shot) لكل شخص زي التوليد الأساسي. مفيش إرسال تلقائي.
class SmartReply(
    private val store: Store,
    private val groq: GroqClient,
    private val settings: Settings,
) {
    suspend fun suggest(received: String, recipient: Recipient?, context: String): List<Suggestion> {
        val rel = Relations.byId(recipient?.relation ?: "partner_wife")
        val tone = recipient?.tone?.takeIf { it.isNotBlank() } ?: rel.tone
        val dialect = AppConstants.dialectPhrase(recipient?.dialect ?: "egyptian")
        val name = recipient?.name?.takeIf { it.isNotBlank() }
        val examples = store.styleExamples(recipient?.id ?: "").takeLast(AppConstants.STYLE_EXAMPLES_MAX)

        val sys = buildString {
            append("انت بتساعد شخص يرد على رسالة وصلته من ${rel.label} بـ$dialect. ")
            append("النبرة المناسبة: $tone. ")
            append("اكتب كإنسان حقيقي بمشاعر صادقة، ردّ قصير طبيعي يخاطب اللي الرسالة قالته بالظبط، من غير ما تعيد كلامها حرفيًا. ")
            append(if (settings.emoji) "ممكن إيموجي معبّر بذوق." else "من غير إيموجي خالص.")
        }
        val user = buildString {
            if (examples.isNotEmpty()) {
                appendLine("أمثلة من أسلوبي (قلّد الروح مش النص):")
                examples.forEachIndexed { i, e -> appendLine("${i + 1}) ${e.text}") }
                appendLine()
            }
            settings.myName.takeIf { it.isNotBlank() }?.let { appendLine("اسمي: $it.") }
            name?.let { appendLine("اللي باعت الرسالة: $it.") }
            recipient?.notes?.takeIf { it.isNotBlank() }?.let { appendLine("حاجات عنه: $it.") }
            appendLine("الرسالة اللي وصلتني منه:")
            appendLine("\"\"\"")
            appendLine(received.trim())
            appendLine("\"\"\"")
            if (context.isNotBlank()) appendLine("سياق مهم: ${context.trim()}.")
            appendLine()
            appendLine("رجّع ردّين مختلفين مناسبين، بالظبط بالصيغة دي ومن غير أي كلام زيادة:")
            appendLine("١- <الرد الأول>")
            appendLine("٢- <الرد التاني>")
        }
        return try {
            parseTwo(groq.complete(listOf(ChatMessage("system", sys), ChatMessage("user", user)), 0.85))
        } catch (e: Exception) {
            listOf(
                Suggestion("وصلتني رسالتك وسعدت بيها جدًا، ربنا يخليك ليا 🤍", "رد"),
                Suggestion("كلامك دايمًا بيفرق معايا، متشكّر من قلبي 💗", "رد"),
            )
        }
    }

    private fun parseTwo(raw: String): List<Suggestion> {
        val re = Regex("^[١٢12]\\s*[-.)]\\s*(.+)$")
        val nums = raw.lines().mapNotNull { l -> re.find(l.trim())?.groupValues?.get(1)?.trim() }
        val a: String
        val b: String
        if (nums.size >= 2) {
            a = nums[0]; b = nums[1]
        } else {
            val clean = raw.lines().map { it.replace(Regex("^[١٢12]\\s*[-.)]\\s*"), "").trim() }.filter { it.isNotBlank() }
            a = clean.getOrNull(0) ?: raw.trim()
            b = clean.getOrNull(1) ?: a
        }
        return listOf(Suggestion(a, "رد"), Suggestion(b, "رد"))
    }
}
