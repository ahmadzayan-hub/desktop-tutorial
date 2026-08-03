package com.wifeassistant.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import java.net.URLEncoder

// إرسال لواتساب - بيفتح الشات والرسالة جاهزة مكتوبة، وانت تدوس Send.
// مفيش إرسال تلقائي: الضغطة الأخيرة بإيدك (مشروع وآمن ومتوافق مع الشروط).
object WhatsApp {
    // باكدج واتساب بزنس عشان نفتح شات العميل في واتساب Business لو المستخدم مفعّله.
    private const val PKG_BUSINESS = "com.whatsapp.w4b"

    // إرسال لجهة اتصال محددة (رقم مباشر). cc اختياري — لو موجود بنكمّل كود الدولة.
    // businessApp = true بيفتح واتساب Business بالذات (للردود على العملاء).
    // منطق التطبيع في Phone.normalize (نقي ومختبَر).
    fun send(context: Context, rawNumber: String, text: String, cc: String = "", businessApp: Boolean = false) {
        val digits = if (cc.isNotBlank()) Phone.normalize(rawNumber, cc) else rawNumber.filter { it.isDigit() }
        if (digits.isEmpty()) {
            Toast.makeText(context, "رقم واتساب الشخص مش متسجّل - ظبّطه من الأشخاص", Toast.LENGTH_LONG).show()
            return
        }
        open(context, "https://wa.me/$digits?text=" + URLEncoder.encode(text, "UTF-8"), businessApp)
    }

    // بدون رقم: واتساب بيفتح منتقي المحادثات فتختار أي **مجموعة** أو جهة اتصال
    // والرسالة جاهزة، وتدوس Send. الطريقة المشروعة الوحيدة للمجموعات.
    fun chooser(context: Context, text: String, businessApp: Boolean = false) {
        open(context, "https://wa.me/?text=" + URLEncoder.encode(text, "UTF-8"), businessApp)
    }

    // لو businessApp: نوجّه النية لواتساب Business بالباكدج. لو مش متثبّت، نرجع
    // نفتح من غير باكدج (واتساب العادي) بدل ما نفشل — أأمن للمستخدم.
    private fun open(context: Context, url: String, businessApp: Boolean = false) {
        fun launch(pkg: String?): Boolean {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                if (pkg != null) setPackage(pkg)
            }
            return try { context.startActivity(intent); true } catch (e: Exception) { false }
        }
        val ok = if (businessApp) {
            // نجرّب واتساب Business الأول؛ لو مش متثبّت نرجع للعادي ونوضّح للمستخدم.
            if (launch(PKG_BUSINESS)) true
            else {
                val fell = launch(null)
                if (fell) Toast.makeText(context, "واتساب Business مش متثبّت — فتحنا واتساب العادي", Toast.LENGTH_LONG).show()
                fell
            }
        } else {
            launch(null)
        }
        if (!ok) Toast.makeText(context, "واتساب مش متثبّت على الجهاز", Toast.LENGTH_LONG).show()
    }
}
