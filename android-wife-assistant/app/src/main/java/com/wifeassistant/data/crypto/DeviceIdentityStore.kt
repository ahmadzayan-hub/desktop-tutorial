package com.wifeassistant.data.crypto

import android.content.Context
import com.wifeassistant.data.SecureStore
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

// تخزين هوية الجهاز: بتتولّد مرة واحدة عند أول طلب وبتتخزن في التخزين المشفّر.
// المفتاح الخاص عمره ما يسيب SecureStore — أي واجهة بتاخد PublicIdentity بس.

@Serializable
private data class StoredIdentity(
    val deviceId: String,
    val publicKeyB64: String,
    val privateKeyB64: String,
)

object DeviceIdentityStore {
    private const val KEY = "deviceIdentity"
    private val json = Json { ignoreUnknownKeys = true }

    fun getOrCreate(context: Context): LocalIdentity {
        SecureStore.getSecret(context, KEY)?.let { raw ->
            runCatching {
                val s = json.decodeFromString(StoredIdentity.serializer(), raw)
                return LocalIdentity(s.deviceId, s.publicKeyB64, s.privateKeyB64)
            }
        }
        val fresh = DeviceIdentityCodec.generate()
        SecureStore.setSecret(
            context, KEY,
            json.encodeToString(
                StoredIdentity.serializer(),
                StoredIdentity(fresh.deviceId, fresh.publicKeyB64, fresh.privateKeyB64),
            ),
        )
        return fresh
    }
}
