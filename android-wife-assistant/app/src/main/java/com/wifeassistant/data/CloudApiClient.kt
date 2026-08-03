package com.wifeassistant.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

// عميل باك-إند وصال (WhatsApp Business Cloud API). بينادي POST /api/send.
// إرسال آلي **مشروع** عبر Meta — مش فتح واتساب اليدوي. اختياري: بيشتغل بس لو المستخدم
// ظبّط endpoint + مفتاح. الأسرار الحقيقية (توكن Meta) بتفضل على السيرفر.
class CloudApiClient(private val endpoint: String, private val apiKey: String) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    private val json = Json { ignoreUnknownKeys = true }

    fun isConfigured(): Boolean = endpoint.isNotBlank() && apiKey.isNotBlank()

    // نص حر (بيشتغل جوّه نافذة 24 ساعة من آخر رسالة بعتها العميل).
    suspend fun sendText(to: String, text: String): Result<String> = post(buildSendJson(to, text))

    // قالب معتمد من Meta (بيشتغل خارج الـ24 ساعة كمان). language مثلاً "ar" أو "en_US".
    suspend fun sendTemplate(to: String, name: String, language: String): Result<String> =
        post(buildTemplateJson(to, name, language))

    // POST مشترك للعقد بتاع الباك-إند: يرجّع معرّف الرسالة أو رسالة خطأ واضحة.
    private suspend fun post(bodyJson: String): Result<String> = withContext(Dispatchers.IO) {
        if (!isConfigured()) return@withContext Result.failure(IllegalStateException("Business API مش متظبّط"))
        val body = bodyJson.toRequestBody("application/json".toMediaType())
        val req = Request.Builder()
            .url(endpoint)
            .addHeader("x-api-key", apiKey)
            .post(body)
            .build()
        try {
            client.newCall(req).execute().use { resp ->
                val raw = resp.body?.string().orEmpty()
                val obj = runCatching { json.parseToJsonElement(raw).jsonObject }.getOrNull()
                if (resp.isSuccessful && obj?.get("ok")?.jsonPrimitive?.contentOrNull == "true") {
                    Result.success(obj["id"]?.jsonPrimitive?.contentOrNull ?: "sent")
                } else {
                    val err = obj?.get("error")?.jsonPrimitive?.contentOrNull ?: "HTTP ${resp.code}"
                    Result.failure(RuntimeException(err))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    companion object {
        // بناء جسم النص — دالة نقية عشان تتختبر (نفس عقد الباك-إند).
        fun buildSendJson(to: String, text: String): String = buildJsonObject {
            put("to", to.filter { it.isDigit() })
            put("type", "text")
            put("text", text)
        }.toString()

        // بناء جسم القالب — دالة نقية.
        fun buildTemplateJson(to: String, name: String, language: String): String = buildJsonObject {
            put("to", to.filter { it.isDigit() })
            put("type", "template")
            putJsonObject("template") {
                put("name", name)
                putJsonObject("language") { put("code", language.ifBlank { "ar" }) }
            }
        }.toString()
    }
}
