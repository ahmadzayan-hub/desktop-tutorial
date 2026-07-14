package com.wifeassistant.util

// قارئ CSV بسيط ومتين لاستيراد جهات الاتصال من ملف.
// بيتعامل مع علامات التنصيص والفواصل جوه الحقل، ويكتشف أعمدة الاسم/الرقم من العناوين،
// وإلا يفترض العمود الأول اسم والتاني رقم. نفس منطق نسخة الديسكتوب المختبَرة.
object Csv {
    data class Row(val name: String, val number: String)

    private fun cells(text: String): List<List<String>> {
        val rows = mutableListOf<List<String>>()
        var field = StringBuilder()
        var row = mutableListOf<String>()
        var inQ = false
        var i = 0
        while (i < text.length) {
            val c = text[i]
            if (inQ) {
                if (c == '"') {
                    if (i + 1 < text.length && text[i + 1] == '"') { field.append('"'); i++ } else inQ = false
                } else field.append(c)
            } else when (c) {
                '"' -> inQ = true
                ',' -> { row.add(field.toString()); field = StringBuilder() }
                '\n', '\r' -> {
                    if (field.isNotEmpty() || row.isNotEmpty()) { row.add(field.toString()); rows.add(row); row = mutableListOf(); field = StringBuilder() }
                    if (c == '\r' && i + 1 < text.length && text[i + 1] == '\n') i++
                }
                else -> field.append(c)
            }
            i++
        }
        if (field.isNotEmpty() || row.isNotEmpty()) { row.add(field.toString()); rows.add(row) }
        return rows
    }

    fun parse(text: String): List<Row> {
        val rows = cells(text).filter { r -> r.any { it.trim().isNotEmpty() } }
        if (rows.isEmpty()) return emptyList()
        val header = rows[0].map { it.trim().lowercase() }
        fun findCol(re: Regex) = header.indexOfFirst { re.containsMatchIn(it) }
        var ni = findCol(Regex("name|اسم|الاسم"))
        var pi = findCol(Regex("phone|mobile|number|whats|رقم|موبايل|هاتف|واتس"))
        var start = 1
        if (ni < 0 && pi < 0) { ni = 0; pi = 1; start = 0 } // مفيش عناوين
        val out = mutableListOf<Row>()
        for (idx in start until rows.size) {
            val r = rows[idx]
            val name = (if (ni in r.indices) r[ni] else r.getOrNull(0)).orEmpty().trim()
            val numRaw = (if (pi in r.indices) r[pi] else r.getOrNull(1)).orEmpty().trim()
            val number = numRaw.filter { it.isDigit() || it == '+' }
            if (name.isBlank() && number.isBlank()) continue
            out.add(Row(if (name.isBlank()) number else name, number))
        }
        return out
    }
}
