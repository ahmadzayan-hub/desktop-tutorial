package com.wifeassistant.util

import android.content.Context
import android.content.Intent

// مشاركة نص لأي تطبيق (واتساب، رسائل، ملاحظات...) عبر شيت المشاركة.
object Share {
    fun text(context: Context, text: String) {
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
        }
        val chooser = Intent.createChooser(send, "مشاركة الرسالة").apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(chooser)
    }
}
