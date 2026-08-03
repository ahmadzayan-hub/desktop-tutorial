package com.wifeassistant

import com.wifeassistant.util.SocialShare
import org.junit.Assert.assertEquals
import org.junit.Test

// اختبار بناء روابط المنصّات (دالة نقية) — يوزر، @، رابط كامل، وفاضي.
class SocialShareTest {
    @Test fun instagramFromHandle() {
        assertEquals("https://instagram.com/ahmed", SocialShare.link("instagram", "ahmed"))
        assertEquals("https://instagram.com/ahmed", SocialShare.link("instagram", "@ahmed"))
    }

    @Test fun messengerAndLinkedin() {
        assertEquals("https://m.me/ahmed", SocialShare.link("messenger", "ahmed"))
        assertEquals("https://www.linkedin.com/in/ahmed", SocialShare.link("linkedin", "ahmed"))
    }

    @Test fun fullUrlPassesThrough() {
        val u = "https://instagram.com/some.one"
        assertEquals(u, SocialShare.link("instagram", u))
    }

    @Test fun blankHandleOpensAppHome() {
        assertEquals("https://instagram.com", SocialShare.link("instagram", ""))
        assertEquals("https://m.me", SocialShare.link("messenger", "  "))
    }
}
