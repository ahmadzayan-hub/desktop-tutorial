package com.wifeassistant.data

// يولّد رسالة قصيرة مخصّصة لعضو في مجموعة بالـ LLM (نظير generateOneFor في الديسكتوب).
// اسم الشخص + سياق مشترك اختياري. رسالة واحدة، من غير خيارات.
class GroupComposer(private val settings: Settings) {
    private val groq = GroqClient(settings)

    suspend fun oneFor(name: String, notes: String, context: String): String {
        val sys = buildString {
            append("انت بتكتب رسالة قصيرة دافئة وصادقة باللهجة المصرية لشخص اسمه ")
            append(name.ifBlank { "صاحبي" })
            append(". اكتب كإنسان حقيقي — رسالة واحدة قصيرة (سطر أو اتنين)، ")
            append("من غير مقدمات ولا خيارات ولا شرح، النص بس. ")
            if (settings.emoji) append("ممكن إيموجي معبّر بذوق.") else append("من غير إيموجي.")
        }
        val user = buildString {
            if (settings.myName.isNotBlank()) appendLine("اسم المُرسِل: ${settings.myName}.")
            if (name.isNotBlank()) appendLine("اسم المستقبل: $name — نادِه باسمه.")
            if (notes.isNotBlank()) appendLine("معلومات عنه: $notes.")
            if (context.isNotBlank()) appendLine("سياق مهم للرسالة: $context.")
            append("اكتب الرسالة دلوقتي.")
        }
        val raw = groq.complete(
            listOf(ChatMessage("system", sys), ChatMessage("user", user)),
            temperature = 0.85,
        )
        // أول سطر غير فاضي، بعد شيل أي ترقيم زي "١-".
        return raw.lineSequence()
            .map { it.trim().removePrefix("١-").removePrefix("1-").removePrefix("-").trim() }
            .firstOrNull { it.isNotBlank() } ?: raw.trim()
    }
}
