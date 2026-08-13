package com.wifeassistant

import com.wifeassistant.data.StyleExample
import com.wifeassistant.data.StyleInsights
import com.wifeassistant.data.StyleRuleOverride
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

// محرك شفافية التعلّم: اشتقاق محلي حتمي + تجاوزات المستخدم (تعطيل/تعديل/حذف).
class StyleInsightsTest {
    private fun ex(text: String, rid: String = "r1") = StyleExample(text = text, date = "2026-08-13", recipientId = rid)

    @Test fun noRulesBelowMinimumExamples() {
        val rules = StyleInsights.deriveRaw("r1", listOf(ex("صباح الخير"), ex("وحشتني")))
        assertTrue(rules.isEmpty())
    }

    @Test fun derivesShortAndOneEmojiHabits() {
        val examples = listOf(
            ex("صباح الخير يا قمر ❤️"),
            ex("وحشتني أوي ❤️"),
            ex("ربنا يخليكي ليا ❤️"),
        )
        val rules = StyleInsights.deriveRaw("r1", examples)
        val texts = rules.map { it.text }
        assertTrue(texts.any { it.contains("القصيرة") })
        assertTrue(texts.any { it.contains("إيموجي واحد") })
        // كل قاعدة بتقول اتبنت من كام رسالة — شفافية المصدر من غير نسب غامضة.
        assertTrue(rules.all { it.contributing >= 3 })
    }

    @Test fun derivesFrequentPhraseAcrossThreeMessages() {
        val examples = listOf(
            ex("ربنا يخليكي يا أمي"),
            ex("ربنا يخليكي وحشتيني"),
            ex("ربنا يخليكي صباح الخير"),
        )
        val rules = StyleInsights.deriveRaw("r1", examples)
        // الثنائية الكاملة «ربنا يخليكي» أولى من الكلمة المفردة.
        assertTrue(rules.any { it.id == "phrase:r1" && it.text.contains("ربنا يخليكي") })
    }

    @Test fun overridesDisableEditAndDelete() {
        val examples = listOf(ex("أهلًا"), ex("إزيك"), ex("نورت"))
        val raw = StyleInsights.deriveRaw("r1", examples)
        val lenId = "len:r1"

        val disabled = StyleInsights.applyOverrides(raw, mapOf(lenId to StyleRuleOverride(enabled = false)))
        assertFalse(disabled.first { it.id == lenId }.enabled)

        val edited = StyleInsights.applyOverrides(raw, mapOf(lenId to StyleRuleOverride(editedText = "قاعدة معدّلة")))
        assertEquals("قاعدة معدّلة", edited.first { it.id == lenId }.text)

        val deleted = StyleInsights.applyOverrides(raw, mapOf(lenId to StyleRuleOverride(deleted = true)))
        assertNull(deleted.firstOrNull { it.id == lenId })
    }

    @Test fun activeRulesExcludesDisabledOnes() {
        val examples = listOf(ex("أهلًا"), ex("إزيك"), ex("نورت"))
        val active = StyleInsights.activeRules(
            "r1", examples,
            mapOf("emoji:r1" to StyleRuleOverride(enabled = false)),
        )
        assertTrue(active.none { it.id == "emoji:r1" })
        assertTrue(active.any { it.id == "len:r1" })
    }

    @Test fun rulesAreScopedPerRecipient() {
        // أمثلة شخص ما بتأثرش على قواعد شخص تاني (التعلّم لكل شخص على حدة).
        val rules = StyleInsights.deriveRaw("r2", listOf(ex("أهلًا", "r1"), ex("إزيك", "r1"), ex("نورت", "r1")))
        assertTrue(rules.all { it.recipientId == "r2" })
    }
}
