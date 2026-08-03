package com.wifeassistant

import com.wifeassistant.data.CloudApiClient
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

// اختبار بناء جسم طلب الإرسال (دالة نقية) — نفس عقد الباك-إند.
class CloudApiClientTest {
    @Test fun buildsSendJsonWithDigitsOnly() {
        val j = CloudApiClient.buildSendJson("+971 50 123 4567", "أهلا يا فندم")
        assertTrue(j.contains("\"to\":\"971501234567\""))
        assertTrue(j.contains("\"type\":\"text\""))
        assertTrue(j.contains("أهلا يا فندم"))
    }

    @Test fun notConfiguredWhenBlank() {
        assertFalse(CloudApiClient("", "").isConfigured())
        assertFalse(CloudApiClient("https://x/api/send", "").isConfigured())
        assertTrue(CloudApiClient("https://x/api/send", "key").isConfigured())
    }
}
