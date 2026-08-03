package com.wifeassistant.util

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast

// جسر المنصّات: إنستجرام/ماسنجر/لينكدإن مابتسمحش بنص مبدئي في اللينك ولا إرسال DM من
// تطبيق تاني (سياسة المنصّات نفسها). فالطريقة الأمينة: ننسخ الرسالة الجاهزة ونفتح
// التطبيق/البروفايل، والمستخدم يلصقها ويبعت بإيده. مفيش أتمتة إرسال — زي فلسفة الواتساب.
object SocialShare {
    // القنوات المدعومة (للعرض في الواجهة).
    val CHANNELS = listOf(
        "instagram" to "📸 إنستجرام",
        "messenger" to "💬 ماسنجر",
        "linkedin" to "💼 لينكدإن",
    )

    // ينسخ النص ويفتح القناة. handle = يوزر/رابط الشخص (اختياري؛ فاضي = يفتح التطبيق).
    fun openWithText(context: Context, channel: String, handle: String, text: String) {
        copy(context, text)
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(link(channel, handle))).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        val ok = try { context.startActivity(intent); true } catch (e: Exception) { false }
        Toast.makeText(
            context,
            if (ok) "نسخنا الرسالة — الصقها في المحادثة وابعت ✍️" else "التطبيق ده مش متثبّت",
            Toast.LENGTH_LONG,
        ).show()
    }

    // بناء الرابط — دالة نقية بدون I/O عشان تتختبر. لو الـ handle رابط كامل بيرجّعه زي ما هو.
    fun link(channel: String, handle: String): String {
        val h = handle.trim().removePrefix("@").trim()
        if (h.startsWith("http://") || h.startsWith("https://")) return h
        return when (channel) {
            "instagram" -> if (h.isBlank()) "https://instagram.com" else "https://instagram.com/$h"
            "messenger" -> if (h.isBlank()) "https://m.me" else "https://m.me/$h"
            "linkedin" -> if (h.isBlank()) "https://www.linkedin.com" else "https://www.linkedin.com/in/$h"
            else -> if (h.isBlank()) "https://google.com/search" else h
        }
    }

    private fun copy(context: Context, text: String) {
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        cm?.setPrimaryClip(ClipData.newPlainText("wisal", text))
    }
}
