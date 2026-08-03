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

    @Test fun buildsTemplateJson() {
        val j = CloudApiClient.buildTemplateJson("00201001234567", "hello_world", "en_US")
        assertTrue(j.contains("\"to\":\"00201001234567\""))
        assertTrue(j.contains("\"type\":\"template\""))
        assertTrue(j.contains("\"name\":\"hello_world\""))
        assertTrue(j.contains("\"code\":\"en_US\""))
    }

    @Test fun templateLanguageDefaultsToArabic() {
        val j = CloudApiClient.buildTemplateJson("971500000000", "welcome", "")
        assertTrue(j.contains("\"code\":\"ar\""))
    }

    @Test fun notConfiguredWhenBlank() {
        assertFalse(CloudApiClient("", "").isConfigured())
        assertFalse(CloudApiClient("https://x/api/send", "").isConfigured())
        assertTrue(CloudApiClient("https://x/api/send", "key").isConfigured())
    }
}
