package com.wifeassistant

import com.wifeassistant.data.crypto.CryptoBackend
import com.wifeassistant.data.crypto.CryptoProviderFactory
import com.wifeassistant.data.crypto.EncryptedEnvelope
import kotlinx.serialization.json.Json
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

// حراس ADR-002: DEMO_ONLY ممنوع في release، ومفيش باك-إند يدّعي E2EE قبل بوابات الإطلاق.
class CryptoProviderTest {
    @Test fun demoOnlyIsForbiddenInReleaseBuilds() {
        assertThrows(IllegalStateException::class.java) {
            CryptoProviderFactory.create(CryptoBackend.DEMO_ONLY, isDebugBuild = false)
        }
    }

    @Test fun demoOnlyNeverClaimsE2ee() {
        val p = CryptoProviderFactory.create(CryptoBackend.DEMO_ONLY, isDebugBuild = true)
        assertFalse(p.mayClaimE2ee)
    }

    @Test fun demoOnlyPayloadIsExplicitlyMarkedUnencrypted() {
        // الصدق حتى في التطوير: الحمولة موسومة إنها غير مشفرة — مفيش تمويه.
        val s = CryptoProviderFactory.create(CryptoBackend.DEMO_ONLY, isDebugBuild = true).session("dev2")
        val out = s.encrypt("سلام".toByteArray())
        assertTrue(String(out).startsWith("DEMO_ONLY_NOT_ENCRYPTED:"))
        assertArrayEquals("سلام".toByteArray(), s.decrypt(out))
    }

    @Test fun realBackendsFailLoudlyUntilIntegrated() {
        // الفشل الصريح أصدق من mock صامت يتسرب للإنتاج.
        assertThrows(NotImplementedError::class.java) {
            CryptoProviderFactory.create(CryptoBackend.SIGNAL, isDebugBuild = true)
        }
        assertThrows(NotImplementedError::class.java) {
            CryptoProviderFactory.create(CryptoBackend.VODOZEMAC, isDebugBuild = false)
        }
    }

    @Test fun envelopeCarriesRoutingMetadataOnly() {
        // المغلف اللي السيرفر بيشوفه: توجيه + ciphertext معتم — مفيش حقل plaintext أصلًا.
        val env = EncryptedEnvelope(
            senderDeviceId = "devA",
            recipientDeviceId = "devB",
            ciphertextB64 = "b3BhcXVl",
            backend = "DEMO_ONLY",
            expiresAtEpochSec = 1_800_000_000,
        )
        val json = Json.encodeToString(EncryptedEnvelope.serializer(), env)
        val back = Json.decodeFromString(EncryptedEnvelope.serializer(), json)
        assertEquals(env, back)
        // الحقول المسموحة بس — أي حقل جديد لازم يعدي مراجعة metadata في ADR-002.
        val allowed = setOf("senderDeviceId", "recipientDeviceId", "ciphertextB64", "backend", "expiresAtEpochSec")
        val present = Regex("\"(\\w+)\":").findAll(json).map { it.groupValues[1] }.toSet()
        assertEquals(allowed, present)
    }
}
