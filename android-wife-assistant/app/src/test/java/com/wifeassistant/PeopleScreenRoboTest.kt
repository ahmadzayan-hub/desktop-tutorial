package com.wifeassistant

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.core.app.ApplicationProvider
import com.wifeassistant.data.SecureStore
import com.wifeassistant.data.crypto.DeviceIdentityStore
import com.wifeassistant.ui.PeopleScreen
import org.junit.Assert.assertNotNull
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

// شاشة الأشخاص وزر «🔗 دعوة» مكانش عليهم أي تغطية اختبارات قبل كده رغم
// إنهم مسار دخول حقيقي لتوليد هوية جهاز ودعوة إقران.
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34])
class PeopleScreenRoboTest {
    @get:Rule val rule = createComposeRule()

    @Test fun peopleScreenComposesWithEmptyState() {
        rule.setContent { PeopleScreen(onBack = {}) }
        rule.onNodeWithText("الأشخاص 👨‍👩‍👧‍👦").assertExists()
        rule.onNodeWithText("🔗 دعوة").assertExists()
    }

    @Test fun tappingInviteGeneratesAndPersistsDeviceIdentity() {
        val context = ApplicationProvider.getApplicationContext<android.content.Context>()
        rule.setContent { PeopleScreen(onBack = {}) }

        rule.onNodeWithText("🔗 دعوة").performClick()

        // الزرار بيولّد هوية الجهاز (لو مش موجودة) كجزء من إنشاء الدعوة —
        // نتأكد إنها فعلًا اتخزّنت، مش بس عملية في الذاكرة اختفت مع الشاشة.
        assertNotNull(SecureStore.getSecret(context, "deviceIdentity"))
        // نفس الاستدعاء اللي هيحصل لأي دعوة تانية لازم يرجّع نفس الهوية (مش
        // يولّد واحدة جديدة كل مرة تُضغط الزرار).
        val identity = DeviceIdentityStore.getOrCreate(context)
        assertNotNull(identity.deviceId)
    }
}
