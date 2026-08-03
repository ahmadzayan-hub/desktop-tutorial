package com.wifeassistant.data

// ✨ «حسّن رسالتي»: تكتب رسالتك بنفسك (ولو مستعجلة/جافة)، والوكيل يرجّعها في
// نسختين أدفأ وأطبع باللهجة ونبرة علاقتك بالشخص — من غير ما يغيّر قصدك.
// نظير SmartReply بس للرسالة الطالعة منك (مش الرد على رسالة جاية).
// بيتعلّم بالسياق (few-shot) لكل شخص. الإرسال بضغطة منك — مفيش إرسال تلقائي.
class DraftPolish(
    private val store: Store,
    private val groq: GroqClient,
    private val settings: Settings,
) {
    suspend fun polish(draft: String, recipient: Recipient?, goal: String): List<Suggestion> {
        val clean = cleanDraft(draft)
        val rel = Relations.byId(recipient?.relation ?: "partner_wife")
        val tone = recipient?.tone?.takeIf { it.isNotBlank() } ?: rel.tone
        val dialect = AppConstants.dialectPhrase(recipient?.dialect ?: "egyptian")
        val name = recipient?.name?.takeIf { it.isNotBlank() }
        val examples = store.styleExamples(recipient?.id ?: "").takeLast(AppConstants.STYLE_EXAMPLES_MAX)
        // لغة النسخة المحسّنة حسب لغة الشخص: تفضيله، وإلا نكشف من مسوّدتك أو اسمه.
        val lang = Lang.resolve(recipient?.language, clean, name)

        val sys = buildString {
            if (lang == Lang.EN) { append(Lang.promptDirective(Lang.EN)); append(" ") }
            append("انت بتساعد شخص يحسّن رسالة هو كاتبها بنفسه عشان يبعتها لـ${rel.label} بـ$dialect. ")
            append("النبرة المناسبة: $tone. ")
            append("حافظ على نفس قصده ومعناه ومعلوماته بالظبط — بس خلّي الصياغة أدفأ وأطبع وأصدق، ")
            append("زي كلام إنسان حقيقي مش رسالة رسمية. ماتزوّدش معلومات من عندك ولا تغيّر الحقائق. ")
            append(if (settings.emoji) "ممكن إيموجي معبّر بذوق." else "من غير إيموجي خالص.")
        }
        val user = buildString {
            if (examples.isNotEmpty()) {
                appendLine("أمثلة من أسلوبي (قلّد الروح مش النص):")
                examples.forEachIndexed { i, e -> appendLine("${i + 1}) ${e.text}") }
                appendLine()
            }
            settings.myName.takeIf { it.isNotBlank() }?.let { appendLine("اسمي: $it.") }
            name?.let { appendLine("اللي هبعتله: $it.") }
            recipient?.notes?.takeIf { it.isNotBlank() }?.let { appendLine("حاجات عنه: $it.") }
            if (goal.isNotBlank()) appendLine("اللي عايز أوصّله بالظبط: ${goal.trim()}.")
            appendLine("مسوّدة رسالتي (حسّنها من غير ما تغيّر قصدها):")
            appendLine("\"\"\"")
            appendLine(clean)
            appendLine("\"\"\"")
            appendLine()
            appendLine("رجّع نسختين محسّنتين مختلفتين شوية، بالظبط بالصيغة دي ومن غير أي كلام زيادة:")
            appendLine("١- <النسخة الأولى>")
            appendLine("٢- <النسخة التانية>")
        }
        return try {
            // نفس محلّل الاقتراحين المختبَر بدل تكرار المنطق.
            SuggestionEngine.parseTwo(
                groq.complete(listOf(ChatMessage("system", sys), ChatMessage("user", user)), 0.8),
                listOf("تحسين", "تحسين"),
            )
        } catch (e: Exception) {
            // مفيش نت/مفتاح: نرجّع مسوّدة المستخدم نفسها كنسخة وحيدة عشان ما نضيّعش كلامه.
            listOf(Suggestion(clean, "تحسين"))
        }
    }

    companion object {
        // تنظيف بسيط للمسوّدة قبل الإرسال للنموذج: يشيل الفراغات الزيادة والأسطر الفاضية
        // المتكررة. دالة نقية عشان نقدر نختبرها من غير شبكة (زي Phone/Csv).
        fun cleanDraft(raw: String): String =
            raw.trim()
                .replace(Regex("[ \\t]+"), " ")
                .replace(Regex("\\n{3,}"), "\n\n")
                .lines()
                .joinToString("\n") { it.trim() }
                .trim()
    }
}
