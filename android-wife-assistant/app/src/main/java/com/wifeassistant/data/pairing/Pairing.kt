package com.wifeassistant.data.pairing

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import java.util.UUID

// دعوات إقران Wisal Direct (ADR-002 §5.2): منتهية الصلاحية، تُستخدم مرة واحدة،
// وقابلة للإلغاء. منطق صرف — الوقت بيتحقن (nowEpochSec) فكل الحالات قابلة
// للاختبار الحتمي، والتكامل مع الـ relay بييجي في شريحة لاحقة.

@Serializable
data class PairingInvitation(
    val id: String,
    val token: String,             // سر أحادي الاستخدام — بيتقارن بوقت ثابت
    val inviterDeviceId: String,
    val inviterPublicKeyB64: String,
    val inviterName: String,       // الاسم اللي المدعو هيشوفه قبل القبول
    val createdAtEpochSec: Long,
    val expiresAtEpochSec: Long,
    val state: String = STATE_PENDING,
) {
    companion object {
        const val STATE_PENDING = "pending"
        const val STATE_ACCEPTED = "accepted"
        const val STATE_REJECTED = "rejected"
        const val STATE_REVOKED = "revoked"
    }
}

sealed class PairingResult {
    data class Ok(val invitation: PairingInvitation) : PairingResult()
    data class Refused(val reason: String) : PairingResult()
}

object Pairing {
    const val TTL_SECONDS: Long = 48 * 3600
    private val json = Json { ignoreUnknownKeys = true }

    fun create(
        inviterDeviceId: String,
        inviterPublicKeyB64: String,
        inviterName: String,
        nowEpochSec: Long,
        ttlSeconds: Long = TTL_SECONDS,
    ): PairingInvitation {
        val raw = ByteArray(32).also { SecureRandom().nextBytes(it) }
        return PairingInvitation(
            id = UUID.randomUUID().toString(),
            token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw),
            inviterDeviceId = inviterDeviceId,
            inviterPublicKeyB64 = inviterPublicKeyB64,
            inviterName = inviterName,
            createdAtEpochSec = nowEpochSec,
            expiresAtEpochSec = nowEpochSec + ttlSeconds,
        )
    }

    fun isExpired(inv: PairingInvitation, nowEpochSec: Long): Boolean =
        nowEpochSec >= inv.expiresAtEpochSec

    // القبول: مرة واحدة فقط، قبل الانتهاء، وبتوكن مطابق (مقارنة وقت ثابت).
    // أي إعادة استخدام (replay) بترفض لأن الحالة مش pending.
    fun accept(inv: PairingInvitation, presentedToken: String, nowEpochSec: Long): PairingResult {
        if (inv.state != PairingInvitation.STATE_PENDING)
            return PairingResult.Refused("already ${inv.state}")
        if (isExpired(inv, nowEpochSec))
            return PairingResult.Refused("expired")
        if (!constantTimeEquals(inv.token, presentedToken))
            return PairingResult.Refused("bad token")
        return PairingResult.Ok(inv.copy(state = PairingInvitation.STATE_ACCEPTED))
    }

    fun reject(inv: PairingInvitation): PairingInvitation =
        inv.copy(state = PairingInvitation.STATE_REJECTED)

    // الداعي يقدر يلغي دعوة معلّقة في أي وقت — بعدها القبول مستحيل.
    fun revoke(inv: PairingInvitation): PairingInvitation =
        inv.copy(state = PairingInvitation.STATE_REVOKED)

    // حمولة رابط/QR الدعوة. بتتبعت للمدعو — من غير أي بيانات عن أشخاص تانيين.
    fun payload(inv: PairingInvitation): String {
        val body = json.encodeToString(PairingInvitation.serializer(), inv)
        return "wisal://pair#" + Base64.getUrlEncoder().withoutPadding().encodeToString(body.toByteArray())
    }

    fun parsePayload(payload: String): PairingInvitation? = runCatching {
        val b64 = payload.removePrefix("wisal://pair#")
        json.decodeFromString(PairingInvitation.serializer(), String(Base64.getUrlDecoder().decode(b64)))
    }.getOrNull()

    private fun constantTimeEquals(a: String, b: String): Boolean =
        MessageDigest.isEqual(a.toByteArray(), b.toByteArray())
}
