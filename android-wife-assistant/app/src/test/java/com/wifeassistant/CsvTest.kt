package com.wifeassistant

import com.wifeassistant.util.Csv
import org.junit.Assert.assertEquals
import org.junit.Test

// اختبار قارئ CSV: عناوين، فواصل داخل تنصيص، بدون عناوين، صفوف ناقصة، ملف فاضي.
class CsvTest {
    @Test
    fun parsesWithHeaders() {
        val rows = Csv.parse("name,phone,relation\nأحمد,+20100 123 4567,زميل\n\"عبدالله, أبو خالد\",00966501112222,مدير\n")
        assertEquals(2, rows.size)
        assertEquals("أحمد", rows[0].name)
        assertEquals("+201001234567", rows[0].number)
        assertEquals("عبدالله, أبو خالد", rows[1].name)
        assertEquals("00966501112222", rows[1].number)
    }

    @Test
    fun parsesWithoutHeaders() {
        val rows = Csv.parse("منى,01011112222\nسارة,01033334444\nخالد\n")
        assertEquals(3, rows.size)
        assertEquals("منى", rows[0].name)
        assertEquals("01011112222", rows[0].number)
        assertEquals("خالد", rows[2].name) // صف ناقص الرقم — مايكسرش
        assertEquals("", rows[2].number)
    }

    @Test
    fun emptyIsEmpty() {
        assertEquals(0, Csv.parse("").size)
        assertEquals(0, Csv.parse("\n\n").size)
    }
}
