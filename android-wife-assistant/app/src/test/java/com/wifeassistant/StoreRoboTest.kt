package com.wifeassistant

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.wifeassistant.data.DateUtil
import com.wifeassistant.data.Feedback
import com.wifeassistant.data.Store
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

// اختبار طبقة البيانات على الـ JVM عبر Robolectric — بيشغّل التخزين الحقيقي (JSON في
// filesDir عبر kotlinx.serialization). ده أهم اختبار آلي: بيحرس دوران البيانات اللي
// ممكن R8/minify يكسره من غير ما يبان في البناء.
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class StoreRoboTest {
    private fun ctx(): Context = ApplicationProvider.getApplicationContext()

    @Test fun feedbackRoundTrips() {
        val store = Store(ctx())
        store.addFeedback(Feedback(DateUtil.todayISO(), "manual", listOf("حب", "اشتياق"), "pick1", "رسالة تجربة", "r1"))
        val fb = store.feedback()
        assertEquals(1, fb.size)
        assertEquals("رسالة تجربة", fb[0].finalText)
        assertEquals("r1", fb[0].recipientId)
        assertEquals(listOf("حب", "اشتياق"), fb[0].themesShown)
    }

    @Test fun favoritesToggle() {
        val store = Store(ctx())
        store.toggleFavorite("نص مفضّل")
        assertTrue(store.favorites().contains("نص مفضّل"))
        store.toggleFavorite("نص مفضّل")
        assertFalse(store.favorites().contains("نص مفضّل"))
    }

    @Test fun styleExamplesAreScopedPerRecipient() {
        val store = Store(ctx())
        store.addStyleExample("مثال لأحمد", "حب", "r1")
        store.addStyleExample("مثال لسارة", "شكر", "r2")
        assertEquals(1, store.styleExamples("r1").size)
        assertEquals("مثال لأحمد", store.styleExamples("r1")[0].text)
        assertEquals(1, store.styleExamples("r2").size)
    }

    @Test fun themeWeightPersistsAndClamps() {
        val store = Store(ctx())
        store.bumpThemeWeight("حب", 0.5)
        assertTrue((store.themeWeights()["حب"] ?: 1.0) > 1.0)
        // السقف الأعلى 5.0 — زيادة كبيرة مالازمش تتعداه.
        repeat(50) { store.bumpThemeWeight("حب", 1.0) }
        assertTrue((store.themeWeights()["حب"] ?: 0.0) <= 5.0)
    }

    @Test fun contactTrackingRoundTrips() {
        val store = Store(ctx())
        assertEquals(null, store.daysSinceContact("rX"))
        store.markContacted("rX")
        assertEquals(0L, store.daysSinceContact("rX"))
    }

    @Test fun deleteHistoryRemovesMatch() {
        val store = Store(ctx())
        val d = DateUtil.todayISO()
        store.addFeedback(Feedback(d, "manual", listOf("حب"), "edited", "احذفني", "r1"))
        assertEquals(1, store.feedback().size)
        store.deleteHistory(d, "احذفني")
        assertTrue(store.feedback().none { it.finalText == "احذفني" })
    }
}
