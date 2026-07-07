package com.wifeassistant.util

import android.content.Context
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import java.io.File

// صور الأشخاص: المستخدم يختار الصورة من المعرض، بننسخها محلياً ونعرضها كأفاتار.
// مفيش سحب من السوشيال - الصورة من جهاز المستخدم فقط.
object Avatars {
    private fun dir(context: Context): File =
        File(context.filesDir, "avatars").apply { mkdirs() }

    // ننسخ الصورة المختارة لملف داخلي ونرجّع مساره.
    fun saveFromUri(context: Context, recipientId: String, uri: Uri): String? = runCatching {
        val file = File(dir(context), "$recipientId.jpg")
        context.contentResolver.openInputStream(uri)?.use { input ->
            file.outputStream().use { output -> input.copyTo(output) }
        } ?: return null
        file.absolutePath
    }.getOrNull()

    // نحمّل الصورة مصغّرة (توفير للذاكرة) للعرض.
    fun load(path: String): ImageBitmap? {
        if (path.isBlank()) return null
        return runCatching {
            val opts = BitmapFactory.Options().apply { inSampleSize = 2 }
            BitmapFactory.decodeFile(path, opts)?.asImageBitmap()
        }.getOrNull()
    }

    fun delete(path: String) {
        if (path.isNotBlank()) runCatching { File(path).delete() }
    }
}
