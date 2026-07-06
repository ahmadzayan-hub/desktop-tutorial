package com.wifeassistant

import com.wifeassistant.data.OccasionConfig
import com.wifeassistant.data.Occasions
import com.wifeassistant.data.PersonOccasion
import com.wifeassistant.data.Recipient
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

// اختبار مطابقة المناسبات (Occasions.match) — نظير occasions.test.js.
class OccasionsTest {

    @Test
    fun `مناسبة ثابتة MM-DD بتتطابق`() {
        val res = Occasions.match(
            listOf(OccasionConfig("fixed", date = "08-24", label = "عيد ميلاد مراتي")),
            ymd = "2026-08-24", mmdd = "08-24",
        )
        assertEquals("عيد ميلاد مراتي", res?.label)
    }

    @Test
    fun `مناسبة يدوية dates بتتطابق`() {
        val res = Occasions.match(
            listOf(OccasionConfig("manual", dates = listOf("2000-01-01", "2026-08-25"), label = "المولد")),
            ymd = "2026-08-25", mmdd = "08-25",
        )
        assertEquals("المولد", res?.label)
    }

    @Test
    fun `الـ placeholders بتتجاهل`() {
        val res = Occasions.match(
            listOf(
                OccasionConfig("fixed", date = "MM-DD", label = "x"),
                OccasionConfig("manual", dates = listOf("YYYY-MM-DD"), label = "y"),
            ),
            ymd = "2026-08-25", mmdd = "08-25",
        )
        assertNull(res)
    }

    @Test
    fun `المناسبة المعطّلة بتتجاهل`() {
        val res = Occasions.match(
            listOf(OccasionConfig("fixed", date = "08-24", label = "x", enabled = false)),
            ymd = "2026-08-24", mmdd = "08-24",
        )
        assertNull(res)
    }

    @Test
    fun `يوم من غير مناسبة بيرجع null`() {
        val res = Occasions.match(
            listOf(OccasionConfig("fixed", date = "01-01", label = "x")),
            ymd = "2026-07-05", mmdd = "07-05",
        )
        assertNull(res)
    }

    @Test
    fun `مناسبة الشخص الخاصة بتتطابق باليوم`() {
        val r = Recipient(
            id = "1", name = "سارة", relation = "daughter",
            occasions = listOf(PersonOccasion("عيد ميلاد", "08-24")),
        )
        assertEquals("عيد ميلاد", Occasions.recipientOccasionToday(r, "08-24")?.label)
        assertNull(Occasions.recipientOccasionToday(r, "01-01"))
    }
}
