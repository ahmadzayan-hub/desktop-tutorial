package com.wifeassistant

import com.wifeassistant.data.crypto.DeviceIdentityCodec
import com.wifeassistant.data.pairing.DirectRelayClient
import com.wifeassistant.data.pairing.DirectRelayProofs
import kotlinx.coroutines.runBlocking
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import java.util.Base64

// DirectRelayClient ضد سيرفر HTTP وهمي محلي (MockWebServer) — بدون شبكة
// فعلية ولا relay منشور. بيتأكد إن الطلبات بتتبني صح وإن التوقيعات المُنتَجة
// فعلاً صالحة (بنتحقق منها بـ DeviceIdentityCodec.verify، نفس اللي السيرفر
// الحقيقي هيعمله بمنطق مكافئ في Node).
class DirectRelayClientTest {
    private lateinit var server: MockWebServer

    @Before fun setUp() { server = MockWebServer(); server.start() }
    @After fun tearDown() { server.shutdown() }

    private fun baseUrl() = server.url("/").toString().removeSuffix("/")

    @Test fun notConfiguredWhenBaseUrlBlank() = runBlocking {
        val client = DirectRelayClient("")
        assertFalse(client.isConfigured())
        val id = DeviceIdentityCodec.generate()
        assertTrue(client.registerDevice(id).isFailure)
    }

    @Test fun registerDeviceSendsValidSignatureAndParsesSuccess() = runBlocking {
        server.enqueue(MockResponse().setBody("""{"ok":true,"deviceId":"devA"}""").setResponseCode(200))
        val client = DirectRelayClient(baseUrl())
        val identity = DeviceIdentityCodec.generate()

        val result = client.registerDevice(identity)
        assertTrue(result.isSuccess)

        val req = server.takeRequest()
        assertEquals("POST", req.method)
        assertTrue(req.path!!.endsWith("/api/devices"))
        val bodyStr = req.body.readUtf8()
        assertTrue(bodyStr.contains(identity.deviceId))
        assertTrue(bodyStr.contains(identity.publicKeyB64))

        // نطلع التوقيع من الجسم ونتحقق منه فعليًا ضد نص الإثبات المتوقّع.
        val sigMatch = Regex("\"signatureB64\":\"([^\"]+)\"").find(bodyStr)!!.groupValues[1]
        val proof = DirectRelayProofs.register(identity.deviceId)
        assertTrue(DeviceIdentityCodec.verify(identity.publicKeyB64, proof.toByteArray(), Base64.getDecoder().decode(sigMatch)))
    }

    @Test fun registerDevicePropagatesServerRefusal() = runBlocking {
        server.enqueue(MockResponse().setBody("""{"ok":false,"reason":"bad signature"}""").setResponseCode(400))
        val client = DirectRelayClient(baseUrl())
        val result = client.registerDevice(DeviceIdentityCodec.generate())
        assertTrue(result.isFailure)
        assertEquals("bad signature", result.exceptionOrNull()?.message)
    }

    @Test fun submitEnvelopeSignsCorrectProofAndReturnsId() = runBlocking {
        server.enqueue(MockResponse().setBody("""{"ok":true,"id":"env-xyz"}""").setResponseCode(200))
        val client = DirectRelayClient(baseUrl())
        val identity = DeviceIdentityCodec.generate()
        val ct = "b3BhcXVl"
        val expiresAt = 1_800_003_600L

        val result = client.submitEnvelope(identity, "devB", ct, "DEMO_ONLY", expiresAt)
        assertTrue(result.isSuccess)
        assertEquals("env-xyz", result.getOrNull())

        val bodyStr = server.takeRequest().body.readUtf8()
        val sigMatch = Regex("\"signatureB64\":\"([^\"]+)\"").find(bodyStr)!!.groupValues[1]
        val proof = DirectRelayProofs.submit(identity.deviceId, "devB", ct, expiresAt)
        assertTrue(DeviceIdentityCodec.verify(identity.publicKeyB64, proof.toByteArray(), Base64.getDecoder().decode(sigMatch)))
    }

    @Test fun fetchInboxSignsFetchProofAndParsesItems() = runBlocking {
        server.enqueue(
            MockResponse().setBody(
                """{"ok":true,"items":[{"id":"e1","senderDeviceId":"devA","ciphertextB64":"eA==","backend":"DEMO_ONLY","createdAtEpochSec":1800000000}]}""",
            ).setResponseCode(200),
        )
        val client = DirectRelayClient(baseUrl())
        val identity = DeviceIdentityCodec.generate()
        val now = 1_800_000_005L

        val result = client.fetchInbox(identity, now)
        assertTrue(result.isSuccess)
        assertEquals(1, result.getOrNull()?.size)
        assertEquals("e1", result.getOrNull()?.first()?.id)

        val req = server.takeRequest()
        assertEquals("GET", req.method)
        assertTrue(req.path!!.contains("deviceId=${identity.deviceId}"))
        assertTrue(req.path!!.contains("timestamp=$now"))
    }

    @Test fun ackDeliverySignsAckProof() = runBlocking {
        server.enqueue(MockResponse().setBody("""{"ok":true}""").setResponseCode(200))
        val client = DirectRelayClient(baseUrl())
        val identity = DeviceIdentityCodec.generate()

        val result = client.ackDelivery(identity, "env-xyz")
        assertTrue(result.isSuccess)

        val bodyStr = server.takeRequest().body.readUtf8()
        val sigMatch = Regex("\"signatureB64\":\"([^\"]+)\"").find(bodyStr)!!.groupValues[1]
        val proof = DirectRelayProofs.ack("env-xyz")
        assertTrue(DeviceIdentityCodec.verify(identity.publicKeyB64, proof.toByteArray(), Base64.getDecoder().decode(sigMatch)))
    }
}
