package com.wifeassistant

import androidx.test.core.app.ApplicationProvider
import com.wifeassistant.data.SecureStore
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

// ملحوظة: زي groqKey، Android Keystore/EncryptedSharedPreferences مش متاحين
// تحت Robolectric — secure() بترجع null دايمًا هنا، يعني كل استدعاء بيتحل
// عبر المسار الاحتياطي (legacy) بس. الاختبارات دي بتغطي السلوك الملحوظ من
// الخارج (round-trip، عزل المفاتيح عن بعض) اللي بيفضل صحيح مهما كان أي
// المسارين اتنفّذ. مسار "امسح النسخة القديمة بعد نجاح التشفير" (SecureStore.kt)
// محتاج جهاز حقيقي أو instrumented test عشان يتغطى فعليًا.
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class SecureStoreTest {
    private fun ctx() = ApplicationProvider.getApplicationContext<android.content.Context>()

    @Test fun missingSecretReturnsNull() {
        assertNull(SecureStore.getSecret(ctx(), "neverSet"))
    }

    @Test fun setThenGetRoundTrips() {
        SecureStore.setSecret(ctx(), "myKey", "سر ١٢٣")
        assertEquals("سر ١٢٣", SecureStore.getSecret(ctx(), "myKey"))
    }

    @Test fun overwriteReplacesPreviousValue() {
        SecureStore.setSecret(ctx(), "k", "old")
        SecureStore.setSecret(ctx(), "k", "new")
        assertEquals("new", SecureStore.getSecret(ctx(), "k"))
    }

    @Test fun differentKeysAreIsolated() {
        SecureStore.setSecret(ctx(), "a", "valueA")
        SecureStore.setSecret(ctx(), "b", "valueB")
        assertEquals("valueA", SecureStore.getSecret(ctx(), "a"))
        assertEquals("valueB", SecureStore.getSecret(ctx(), "b"))
    }
}
