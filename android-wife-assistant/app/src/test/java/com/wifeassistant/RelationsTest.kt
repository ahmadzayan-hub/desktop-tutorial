package com.wifeassistant

import com.wifeassistant.data.Relations
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

// اختبار وحدة العلاقات (Relations) — نقي بالكامل.
class RelationsTest {

    @Test
    fun `byId بيرجّع العلاقة الصح`() {
        assertEquals("ابني", Relations.byId("son").label)
        assertEquals("أمي", Relations.byId("mother").label)
    }

    @Test
    fun `id مجهول بيرجّع الافتراضي مش null`() {
        val r = Relations.byId("nope")
        assertEquals(Relations.ALL.first().id, r.id)
    }

    @Test
    fun `كل علاقة ليها نبرة وإيموجي`() {
        assertTrue(Relations.ALL.isNotEmpty())
        Relations.ALL.forEach {
            assertTrue("النبرة فاضية لـ ${it.id}", it.tone.isNotBlank())
            assertTrue("الإيموجي فاضي لـ ${it.id}", it.emoji.isNotBlank())
            assertTrue("العنوان فاضي لـ ${it.id}", it.toAddr.isNotBlank())
        }
    }

    @Test
    fun `العلاقات فيها الشريك والأبناء والوالدين والإخوة`() {
        val ids = Relations.ALL.map { it.id }.toSet()
        listOf("partner_wife", "partner_husband", "son", "daughter", "mother", "father", "brother", "sister")
            .forEach { assertTrue("ناقص $it", ids.contains(it)) }
    }
}
