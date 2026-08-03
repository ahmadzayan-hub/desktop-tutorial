package com.wifeassistant

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import com.wifeassistant.ui.HistoryScreen
import com.wifeassistant.ui.WelcomeScreen
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

// اختبارات Compose UI لشاشات حقيقية على الـ JVM (Robolectric) — بتتأكد إن الشاشات
// بتتركّب من غير كراش وإن النصوص الأساسية موجودة، بدون emulator. بنستخدم assertExists
// (مش assertIsDisplayed) عشان ما نعتمدش على مقاس نافذة الاختبار.
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34])
class ScreenRenderTest {
    @get:Rule val rule = createComposeRule()

    @Test fun welcomeScreenComposes() {
        rule.setContent { WelcomeScreen(onStart = {}) }
        rule.onNodeWithText("وصال 💗").assertExists()
        rule.onNodeWithText("يلا نبدأ 💗").assertExists()
    }

    @Test fun historyScreenComposesWithEmptyState() {
        // مخزن فاضي (أول تشغيل) → العنوان + رسالة "مفيش رسايل" لازم يتركّبوا.
        rule.setContent { HistoryScreen(onBack = {}) }
        rule.onNodeWithText("سجل الرسايل 📜").assertExists()
        rule.onNodeWithText("مفيش رسايل بالفلتر ده. جرّب تشيل البحث أو الفلترة.").assertExists()
    }
}
