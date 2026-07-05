package com.wifeassistant

import com.wifeassistant.data.SuggestionEngine
import org.junit.Assert.assertEquals
import org.junit.Test

// اختبار تحليل رد الموديل لاقتراحين (parseTwo) — نظير generate.test.js.
class SuggestionParseTest {
    private val themes = listOf("امتنان", "دعاء")

    @Test
    fun `يرجع اقتراحين مرقّمين`() {
        val r = SuggestionEngine.parseTwo("١- أول اقتراح\n٢- تاني اقتراح", themes)
        assertEquals("أول اقتراح", r[0].text)
        assertEquals("تاني اقتراح", r[1].text)
    }

    @Test
    fun `يتجاهل الكلام التمهيدي`() {
        val raw = "اتفضل يا فندم:\n\n١- الاقتراح الحقيقي الأول\n٢- الاقتراح الحقيقي التاني"
        val r = SuggestionEngine.parseTwo(raw, themes)
        assertEquals("الاقتراح الحقيقي الأول", r[0].text)
        assertEquals("الاقتراح الحقيقي التاني", r[1].text)
    }

    @Test
    fun `ترقيم انجليزي وبأقواس`() {
        val r = SuggestionEngine.parseTwo("1. واحد\n2) اتنين", themes)
        assertEquals("واحد", r[0].text)
        assertEquals("اتنين", r[1].text)
    }

    @Test
    fun `سطر واحد بس - احتياطي`() {
        val r = SuggestionEngine.parseTwo("اقتراح وحيد", themes)
        assertEquals("اقتراح وحيد", r[0].text)
        assertEquals("اقتراح وحيد", r[1].text)
    }

    @Test
    fun `الموضوع بيتربط بالاقتراح`() {
        val r = SuggestionEngine.parseTwo("١- أ\n٢- ب", themes)
        assertEquals("امتنان", r[0].theme)
        assertEquals("دعاء", r[1].theme)
    }
}
