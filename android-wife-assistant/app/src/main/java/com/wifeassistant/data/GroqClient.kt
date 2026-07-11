package com.wifeassistant.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.add
import kotlinx.serialization.json.addJsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

data class ChatMessage(val role: String, val content: String)

// طبقة تجريد عقل الـ AI (Groq) - نظير llm.js. المزوّد معزول هنا بس.
class GroqClient(private val settings: Settings) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(45, TimeUnit.SECONDS)
        .build()
    private val json = Json { ignoreUnknownKeys = true }

    // خطأ مؤقت (شبكة/زحمة/سيرفر) يستاهل إعادة محاولة، عكس خطأ المفتاح.
    private class RetryableException(message: String) : Exception(message)

    suspend fun complete(messages: List<ChatMessage>, temperature: Double = 0.8): String =
        withContext(Dispatchers.IO) {
            val key = settings.groqKey
            require(key.isNotBlank()) { "مفتاح Groq مش متسجّل. روح الإعدادات وحطه." }

            val payload = buildJsonObject {
                put("model", settings.model)
                put("temperature", temperature)
                put("max_tokens", 400)
                putJsonArray("messages") {
                    messages.forEach { m ->
                        addJsonObject {
                            put("role", m.role)
                            put("content", m.content)
                        }
                    }
                }
            }.toString()

            // إعادة محاولة مع تأخير متزايد للأخطاء المؤقتة (زحمة/سيرفر/انقطاع شبكة).
            var last: Exception? = null
            repeat(3) { attempt ->
                try {
                    return@withContext call(payload, key)
                } catch (e: RetryableException) {
                    last = e
                } catch (e: java.io.IOException) {
                    last = e
                }
                delay(500L * (attempt + 1))
            }
            throw last ?: IllegalStateException("تعذّر الاتصال بـ Groq")
        }

    private fun call(payload: String, key: String): String {
        val req = Request.Builder()
            .url("https://api.groq.com/openai/v1/chat/completions")
            .addHeader("Authorization", "Bearer $key")
            .addHeader("Content-Type", "application/json")
            .post(payload.toRequestBody("application/json".toMediaType()))
            .build()

        client.newCall(req).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) {
                // 429/5xx مؤقتة نعيد المحاولة، الباقي (401/400...) خطأ ثابت.
                if (resp.code == 429 || resp.code >= 500) throw RetryableException("Groq ${resp.code}")
                error("Groq رجّع خطأ ${resp.code}")
            }
            val content = json.parseToJsonElement(text).jsonObject["choices"]
                ?.jsonArray?.firstOrNull()?.jsonObject
                ?.get("message")?.jsonObject
                ?.get("content")?.jsonPrimitive?.contentOrNull
            return content?.trim() ?: error("Groq رجّع رد فاضي.")
        }
    }
}
