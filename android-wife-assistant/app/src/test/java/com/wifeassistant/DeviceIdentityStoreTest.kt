package com.wifeassistant

import androidx.test.core.app.ApplicationProvider
import com.wifeassistant.data.SecureStore
import com.wifeassistant.data.crypto.DeviceIdentityStore
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

// SecureStore بيقع تلقائيًا للمسار الاحتياطي تحت Robolectric (نفس ملحوظة
// SecureStoreTest) — كافي هنا لاختبار سلوك getOrCreate الفعلي: التوليد
// أول مرة، الثبات بعد كده، والتعافي من بيانات تالفة.
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class DeviceIdentityStoreTest {
    private fun ctx() = ApplicationProvider.getApplicationContext<android.content.Context>()

    @Test fun firstCallGeneratesAndPersistsIdentity() {
        val identity = DeviceIdentityStore.getOrCreate(ctx())
        assertEquals(identity.deviceId, identity.public.deviceId)
        // اتخزّنت فعلًا — مش مجرد قيمة في الذاكرة.
        assert(SecureStore.getSecret(ctx(), "deviceIdentity") != null)
    }

    @Test fun secondCallReturnsSameIdentityNotFresh() {
        val first = DeviceIdentityStore.getOrCreate(ctx())
        val second = DeviceIdentityStore.getOrCreate(ctx())
        assertEquals(first.deviceId, second.deviceId)
        assertEquals(first.publicKeyB64, second.publicKeyB64)
        assertEquals(first.privateKeyB64, second.privateKeyB64)
    }

    @Test fun corruptStoredJsonFallsBackToFreshIdentity() {
        // نموذج لعطل حقيقي: بيانات متخزّنة اتلخبطت أو من نسخة قديمة غير متوافقة.
        SecureStore.setSecret(ctx(), "deviceIdentity", "{ليس JSON صالح")
        val identity = DeviceIdentityStore.getOrCreate(ctx())
        // ما بيكرشش، وبيولّد هوية جديدة قابلة للاستخدام.
        assert(identity.deviceId.isNotBlank())
        assert(identity.publicKeyB64.isNotBlank())
    }

    @Test fun differentAppsGetDifferentIdentitiesWhenStoreIsCleared() {
        val first = DeviceIdentityStore.getOrCreate(ctx())
        // امسح التخزين يدويًا (زي إعادة تثبيت) — لازم يولّد هوية مختلفة تمامًا.
        SecureStore.setSecret(ctx(), "deviceIdentity", "")
        val second = DeviceIdentityStore.getOrCreate(ctx())
        assertNotEquals(first.deviceId, second.deviceId)
    }
}
