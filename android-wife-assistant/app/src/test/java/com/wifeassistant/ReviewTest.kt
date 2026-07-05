package com.wifeassistant

import com.wifeassistant.data.Feedback
import com.wifeassistant.data.Review
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

// اختبار حساب التقرير (Review.compute) — نظير review.test.js.
class ReviewTest {
    private fun fb(slot: String, choice: String, themes: List<String> = listOf("امتنان", "دعاء")) =
        Feedback("2026-07-05", slot, themes, choice, null)

    @Test
    fun `نسبة القبول بتتحسب وبتتجاهل regen`() {
        val report = Review.compute(
            listOf(
                fb("morning", "pick1"),
                fb("morning", "ignore"),
                fb("evening", "regen"),
            ),
            styleCount = 5,
        )
        assertEquals(2, report.total) // regen مش محسوب
        assertEquals(1, report.accepted)
        assertEquals(50, report.acceptRate)
        assertEquals(5, report.styleExamplesCount)
    }

    @Test
    fun `أعلى المواضيع بتظهر`() {
        val report = Review.compute(
            listOf(
                fb("morning", "pick1", listOf("امتنان", "دعاء")),
                fb("evening", "pick2", listOf("دعم", "امتنان")),
            ),
            styleCount = 0,
        )
        assertTrue(report.topThemes.any { it.first == "امتنان" })
    }

    @Test
    fun `خانة بتتجاهل بنسبة عالية بتترصد`() {
        val report = Review.compute(
            List(4) { fb("evening", "ignore") },
            styleCount = 0,
        )
        assertNotNull(report.worstSlot)
        assertEquals("evening", report.worstSlot!!.slot)
    }

    @Test
    fun `تقرير فاضي مبيقعش`() {
        val report = Review.compute(emptyList(), styleCount = 0)
        assertEquals(0, report.total)
        assertEquals(0, report.acceptRate)
        assertNull(report.worstSlot)
    }
}
