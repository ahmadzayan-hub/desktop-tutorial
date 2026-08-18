package com.wifeassistant

import com.wifeassistant.data.crypto.CryptoBackend
import com.wifeassistant.data.crypto.LibsignalCryptoProvider
import com.wifeassistant.data.crypto.LibsignalKeys
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

// دورة تشفير حقيقية كاملة بمكتبة libsignal 0.86.5 الفعلية (PQXDH + Double
// Ratchet) — نفس التدفق اتحقق منه أولًا بـ smoke test تنفيذي مباشر (javac +
// java) ضد الـ .jar المنشور على Maven Central قبل كتابة الغلاف ده، عشان
// نتأكد من صحة كل توقيع دالة قبل الاعتماد عليه. راجع ADR-002.
class LibsignalCryptoProviderTest {
    private val json = Json { ignoreUnknownKeys = true }

    private fun bundleBytes(dto: com.wifeassistant.data.crypto.SignalPreKeyBundleDto): ByteArray =
        json.encodeToString(com.wifeassistant.data.crypto.SignalPreKeyBundleDto.serializer(), dto).toByteArray()

    @Test fun signalBackendNeverClaimsE2eeYet() {
        val provider = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())
        assertEquals(CryptoBackend.SIGNAL, provider.backend)
        assertFalse(provider.mayClaimE2ee)
    }

    @Test fun encryptWithoutEstablishedSessionThrows() {
        // مفيش حارس مننا فوق المكتبة — الضمانة جايه من libsignal نفسها
        // (NoSessionException) لما تحاول تشفّر لعنوان مفيش له جلسة أصلًا.
        val provider = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())
        assertFalse(provider.hasSession("bob-device"))
        assertThrows(Exception::class.java) { provider.session("bob-device").encrypt("hi".toByteArray()) }
    }

    @Test fun establishSessionRejectsMismatchedDeviceId() {
        val alice = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())
        val bob = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())
        val bobBundle = bob.publishableBundle(myDeviceId = "bob-device")
        assertThrows(IllegalArgumentException::class.java) {
            // العميل بيطلب حزمة "bob-device" بس الحزمة الراجعة معرّفها مختلف — رفض واضح.
            alice.establishSession("someone-else", bundleBytes(bobBundle))
        }
    }

    // الاختبار المحوري: دورة تبادل ثنائية الاتجاه حقيقية بالكامل، تمامًا زي
    // الـ smoke test التنفيذي اللي أثبت صحة كل توقيع قبل ما الكود ده يتكتب.
    @Test fun fullBidirectionalRoundTripWithRealDoubleRatchet() {
        val aliceId = "alice-device-uuid"
        val bobId = "bob-device-uuid"
        val alice = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())
        val bob = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())

        // بوب بينشر حزمته، أليس بتستهلكها وتأسس جلسة.
        val bobBundle = bob.publishableBundle(myDeviceId = bobId)
        assertFalse(alice.hasSession(bobId))
        alice.establishSession(bobId, bundleBytes(bobBundle))
        assertTrue(alice.hasSession(bobId))

        // الرسالة الأولى من أليس: PreKey message (أول رسالة في أي جلسة جديدة).
        val aliceSession = alice.session(bobId)
        val msg1 = "وحشتني يا قمر ❤️".toByteArray(Charsets.UTF_8)
        val ct1 = aliceSession.encrypt(msg1)

        // بوب يستقبل — جلسته بتتأسس تلقائيًا كأثر جانبي لفك أول رسالة PreKey،
        // من غير ما يحتاج ينادي establishSession بنفسه.
        assertFalse(bob.hasSession(aliceId))
        val bobSession = bob.session(aliceId)
        val dec1 = bobSession.decrypt(ct1)
        assertEquals(String(msg1, Charsets.UTF_8), String(dec1, Charsets.UTF_8))
        assertTrue(bob.hasSession(aliceId))

        // رد بوب: بجلسة متأسسة فعلًا فبيبقى Whisper مباشرة مش PreKey تاني.
        val replyPlain = "رد بوب".toByteArray(Charsets.UTF_8)
        val reply = bobSession.encrypt(replyPlain)
        val decReply = aliceSession.decrypt(reply)
        assertEquals(String(replyPlain, Charsets.UTF_8), String(decReply, Charsets.UTF_8))

        // بعد ما أليس استلمت رد، رسالتها التالية بتبقى Whisper كمان — التبديل
        // (ratchet) اكتمل من الاتجاهين، مش بس من جانب واحد.
        val msg2 = "second message, ratchet advanced".toByteArray(Charsets.UTF_8)
        val ct2 = aliceSession.encrypt(msg2)
        val dec2 = bobSession.decrypt(ct2)
        assertEquals(String(msg2, Charsets.UTF_8), String(dec2, Charsets.UTF_8))
    }

    @Test fun tamperedCiphertextIsRejected() {
        val alice = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())
        val bob = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())
        val bobBundle = bob.publishableBundle(myDeviceId = "bob-device")
        alice.establishSession("bob-device", bundleBytes(bobBundle))

        val ct = alice.session("bob-device").encrypt("سلام".toByteArray(Charsets.UTF_8))
        val tampered = ct.copyOf()
        tampered[tampered.size - 1] = (tampered[tampered.size - 1].toInt() xor 0xFF).toByte()

        val bobSession = bob.session("alice-device")
        assertThrows(Exception::class.java) { bobSession.decrypt(tampered) }
    }

    @Test fun unknownCiphertextTypeByteIsRejected() {
        val alice = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())
        val bob = LibsignalCryptoProvider(LibsignalKeys.generateIdentity())
        val bobBundle = bob.publishableBundle(myDeviceId = "bob-device")
        alice.establishSession("bob-device", bundleBytes(bobBundle))
        val ct = alice.session("bob-device").encrypt("سلام".toByteArray(Charsets.UTF_8))
        ct[0] = 99 // نوع مش معروف
        val bobSession = bob.session("alice-device")
        assertThrows(IllegalArgumentException::class.java) { bobSession.decrypt(ct) }
    }
}
