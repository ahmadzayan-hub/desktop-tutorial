package com.wifeassistant.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import java.net.URLEncoder

// إرسال لواتساب — بيفتح الشات والرسالة جاهزة مكتوبة، وانت تدوس Send.
// مفيش إرسال تلقائي: الضغطة الأخيرة بإيدك (مشروع وآمن ومتوافق مع الشروط).
object WhatsApp {
    // إرسال لجهة اتصال محددة (رقم مباشر).
    fun send(context: Context, rawNumber: String, text: String) {
        val digits = rawNumber.filter { it.isDigit() }
        if (digits.isEmpty()) {
            Toast.makeText(context, "رقم واتساب الشخص مش متسجّل — ظبّطه من الأشخاص", Toast.LENGTH_LONG).show()
            return
        }
        open(context, "https://wa.me/$digits?text=" + URLEncoder.encode(text, "UTF-8"))
    }

    // بدون رقم: واتساب بيفتح منتقي المحادثات فتختار أي **مجموعة** أو جهة اتصال
    // والرسالة جاهزة، وتدوس Send. الطريقة المشروعة الوحيدة للمجموعات.
    fun chooser(context: Context, text: String) {
        open(context, "https://wa.me/?text=" + URLEncoder.encode(text, "UTF-8"))
    }

    private fun open(context: Context, url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "واتساب مش متثبّت على الجهاز", Toast.LENGTH_LONG).show()
        }
    }
}
