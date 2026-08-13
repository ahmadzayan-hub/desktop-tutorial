package com.wifeassistant

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import com.wifeassistant.ui.BroadcastScreen
import com.wifeassistant.ui.DraftPolishScreen
import com.wifeassistant.ui.HistoryScreen
import com.wifeassistant.ui.SmartReplyScreen
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
        rule.onNodeWithText("وصال").assertExists()
        rule.onNodeWithText("يلا نبدأ 💗").assertExists()
    }

    // تبديل لغة الواجهة: نفس الشاشة لازم تترسم بالإنجليزي لما I18n.lang = "en".
    @Test fun welcomeScreenComposesInEnglish() {
        com.wifeassistant.data.I18n.lang = "en"
        try {
            rule.setContent { WelcomeScreen(onStart = {}) }
            rule.onNodeWithText("Let's start 💗").assertExists()
        } finally {
            com.wifeassistant.data.I18n.lang = "ar"
        }
    }

    @Test fun historyScreenComposesWithEmptyState() {
        // مخزن فاضي (أول تشغيل) → العنوان + رسالة "مفيش رسايل" لازم يتركّبوا.
        rule.setContent { HistoryScreen(onBack = {}) }
        rule.onNodeWithText("سجل الرسايل 📜").assertExists()
        rule.onNodeWithText("مفيش رسايل بالفلتر ده. جرّب تشيل البحث أو الفلترة.").assertExists()
    }

    // شاشات مزايا الجلسة الجديدة — نتأكد إنها بتتركّب من غير كراش (عنوانها موجود).
    @Test fun draftPolishScreenComposes() {
        rule.setContent { DraftPolishScreen(onBack = {}) }
        rule.onNodeWithText("حسّن رسالتي ✨").assertExists()
    }

    @Test fun smartReplyScreenComposes() {
        rule.setContent { SmartReplyScreen(onBack = {}) }
        rule.onNodeWithText("رد ذكي 💬").assertExists()
    }

    @Test fun broadcastScreenComposes() {
        rule.setContent { BroadcastScreen(onBack = {}) }
        rule.onNodeWithText("مجموعات وإرسال 📣").assertExists()
    }
}
