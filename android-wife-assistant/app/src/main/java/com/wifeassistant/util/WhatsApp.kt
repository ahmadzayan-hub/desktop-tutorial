package com.wifeassistant.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import java.net.URLEncoder

// إرسال لواتساب — بيفتح شات مراتك والرسالة جاهزة مكتوبة، وانت تدوس Send.
// مفيش إرسال تلقائي: الضغطة الأخيرة بإيدك (مشروع وآمن ومتوافق مع الشروط).
object WhatsApp {
    fun send(context: Context, rawNumber: String, text: String) {
        val digits = rawNumber.filter { it.isDigit() }
        if (digits.isEmpty()) {
            Toast.makeText(context, "رقم واتساب مراتك مش متسجّل — روح الإعدادات", Toast.LENGTH_LONG).show()
            return
        }
        val url = "https://wa.me/$digits?text=" + URLEncoder.encode(text, "UTF-8")
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
