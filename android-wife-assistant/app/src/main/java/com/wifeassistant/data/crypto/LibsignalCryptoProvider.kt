package com.wifeassistant.data.crypto

import kotlinx.serialization.json.Json
import org.signal.libsignal.protocol.SessionBuilder
import org.signal.libsignal.protocol.SessionCipher
import org.signal.libsignal.protocol.SignalProtocolAddress
import org.signal.libsignal.protocol.message.CiphertextMessage
import org.signal.libsignal.protocol.message.PreKeySignalMessage
import org.signal.libsignal.protocol.message.SignalMessage
import org.signal.libsignal.protocol.state.impl.InMemorySignalProtocolStore

// جهاز واحد = رقم "device" ثابت داخل عنونة Signal (SignalProtocolAddress).
// مفيش دعم أجهزة متعددة لنفس الشخص لسه (موثّق في الخارطة كمرحلة لاحقة) —
// معرّف جهازنا الحقيقي (UUID) هو الـ "name"، والرقم ده بس placeholder ثابت.
const val LIBSIGNAL_DEVICE_INDEX = 1

// باك-إند SIGNAL الحقيقي (ADR-002): libsignal 0.86.5 عبر مكتبة الجهاز نفسها
// (نفس الكود اللي بيشتغل بيه Signal). الـ store في الذاكرة بس لسه — تخزينه
// المشفّر الدائم (زي DeviceIdentityStore) هو الخطوة التالية الموثّقة، مش
// جزء من الشريحة دي.
//
// mayClaimE2ee = false لسه — البروتوكول نفسه حقيقي ومتحقق منه، لكن التكامل
// الكامل (نقطة استعلام حزمة مفاتيح على الـ relay + جهازين حقيقيين +
// مراجعة أمنية خارجية) لسه ما اكتملش. ADR-002 صريح: مفيش ادعاء قبل البوابات دي.
class LibsignalCryptoProvider(
    private val identity: LibsignalIdentity,
    private val store: InMemorySignalProtocolStore = InMemorySignalProtocolStore(identity.keyPair, identity.registrationId),
) : PreKeyEstablishingProvider {
    override val backend = CryptoBackend.SIGNAL
    override val mayClaimE2ee = false

    private val json = Json { ignoreUnknownKeys = true }

    private fun addressOf(recipientDeviceId: String) = SignalProtocolAddress(recipientDeviceId, LIBSIGNAL_DEVICE_INDEX)

    // الحزمة اللي الجهاز ده هينشرها على الـ relay (شريحة لاحقة) عشان أي حد
    // يقدر يأسس جلسة معاه. بتخزّن المفاتيح المولّدة في الـ store المحلي —
    // لازم تتنادى قبل أي establishSession جاي من طرف تاني.
    fun publishableBundle(
        myDeviceId: String,
        signedPreKeyId: Int = 1,
        kyberPreKeyId: Int = 1,
        oneTimePreKeyId: Int = 1,
    ): SignalPreKeyBundleDto = LibsignalKeys.generateAndStorePublishableBundle(
        identity, store, myDeviceId, signedPreKeyId, kyberPreKeyId, oneTimePreKeyId,
    )

    override fun hasSession(recipientDeviceId: String): Boolean = store.containsSession(addressOf(recipientDeviceId))

    override fun establishSession(recipientDeviceId: String, preKeyBundleBytes: ByteArray) {
        val dto = json.decodeFromString(SignalPreKeyBundleDto.serializer(), String(preKeyBundleBytes, Charsets.UTF_8))
        require(dto.deviceId == recipientDeviceId) { "bundle deviceId mismatch: expected $recipientDeviceId, got ${dto.deviceId}" }
        val bundle = LibsignalKeys.toPreKeyBundle(dto)
        SessionBuilder(store, addressOf(recipientDeviceId)).process(bundle)
    }

    // مفيش تحقق مسبق هنا إن الجلسة متأسسة — SessionCipher نفسه بيتبنى بأمان
    // من غير جلسة موجودة، لأن أول رسالة PreKey واردة من الطرف التاني هي
    // اللي بتأسس الجلسة كأثر جانبي لفك تشفيرها. المكتبة نفسها بترفض encrypt()
    // أو decrypt() لرسالة Whisper عادية من غير جلسة (NoSessionException) —
    // مفيش داعي نعيد تنفيذ الحارس ده يدويًا فوق ضمانة المكتبة الأصلية.
    override fun session(recipientDeviceId: String): CryptoSession {
        val cipher = SessionCipher(store, addressOf(recipientDeviceId))
        return object : CryptoSession {
            // نبصم بايت واحد بنوع الرسالة (PreKey أو Whisper العادية) قبل
            // الـ bytes المسلسَلة الحقيقية — ده وصف نقل بسيط (metadata) مش
            // تشفير مخصّص؛ بروتوكول Signal نفسه بيحمل نفس المعلومة دي في نقل
            // Signal الحقيقي كحقل منفصل جنب المحتوى.
            override fun encrypt(plaintext: ByteArray): ByteArray {
                val ct = cipher.encrypt(plaintext)
                return byteArrayOf(ct.type.toByte()) + ct.serialize()
            }

            override fun decrypt(ciphertext: ByteArray): ByteArray {
                require(ciphertext.isNotEmpty()) { "empty ciphertext" }
                val type = ciphertext[0].toInt()
                val body = ciphertext.copyOfRange(1, ciphertext.size)
                return when (type) {
                    CiphertextMessage.PREKEY_TYPE -> cipher.decrypt(PreKeySignalMessage(body))
                    CiphertextMessage.WHISPER_TYPE -> cipher.decrypt(SignalMessage(body))
                    else -> throw IllegalArgumentException("unsupported Signal ciphertext type $type")
                }
            }
        }
    }
}
