package com.wifeassistant.ui

import android.widget.Toast
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.rememberCoroutineScope
import com.wifeassistant.data.DateUtil
import com.wifeassistant.data.Feedback
import com.wifeassistant.data.GroqClient
import com.wifeassistant.data.Relations
import com.wifeassistant.data.Settings
import com.wifeassistant.data.SmartReply
import com.wifeassistant.data.Store
import com.wifeassistant.data.Suggestion
import com.wifeassistant.data.t
import com.wifeassistant.util.SocialShare
import com.wifeassistant.util.WhatsApp
import kotlinx.coroutines.launch

// 💬 رد ذكي: تلصق رسالة وصلتلك، والوكيل يقترح ردّين بأسلوبك ونبرة علاقتك بالشخص.
// بيتعلّم من اختيارك (زي التوليد الأساسي). الإرسال بضغطة منك — مفيش إرسال تلقائي.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SmartReplyScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }
    val store = remember { Store(context) }
    val engine = remember { SmartReply(store, GroqClient(settings), settings) }
    val clipboard = LocalClipboardManager.current
    val scope = rememberCoroutineScope()

    val recipients = remember { settings.recipients }
    var recipientId by remember {
        mutableStateOf(settings.selectedRecipientId.ifBlank { recipients.firstOrNull()?.id ?: "" })
    }
    val recipient = recipients.firstOrNull { it.id == recipientId } ?: settings.currentRecipient()

    var received by remember { mutableStateOf("") }
    var contextText by remember { mutableStateOf("") }
    var results by remember { mutableStateOf<List<Suggestion>>(emptyList()) }
    var busy by remember { mutableStateOf(false) }
    var editBox by remember { mutableStateOf("") }

    fun toast(m: String) = Toast.makeText(context, m, Toast.LENGTH_LONG).show()
    fun sendReply(text: String) {
        val num = recipient?.number.orEmpty()
        if (num.isBlank()) WhatsApp.chooser(context, text)
        else WhatsApp.send(context, num, text, settings.defaultCountryCode)
    }
    fun learn(text: String, choice: String) {
        val rid = recipient?.id ?: ""
        store.addStyleExample(text, "رد", rid)
        store.addFeedback(Feedback(DateUtil.todayISO(), "reply", listOf("رد"), choice, text, rid))
        store.markContacted(rid)
    }
    fun generate() {
        if (received.isBlank()) { toast(t("الصق الرسالة اللي وصلتك الأول", "Paste the message you received first")); return }
        if (busy) return
        scope.launch {
            busy = true
            results = engine.suggest(received, recipient, contextText)
            busy = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(t("رد ذكي 💬", "Smart reply 💬")) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = t("رجوع", "Back"))
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                t("الصق رسالة وصلتلك، والوكيل يقترح ردّين بأسلوبك ونبرة علاقتك بالشخص — تعدّل وتبعت بضغطة.", "Paste a message you received and get two reply drafts in your style and this relationship tone — edit and send with one tap."),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            if (recipients.isNotEmpty()) {
                Text(t("الرسالة من مين؟", "Who is the message from?"), style = MaterialTheme.typography.labelLarge)
                Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    recipients.forEach { r ->
                        val label = r.name.ifBlank { Relations.labelOf(r.relation) }
                        FilterChip(
                            selected = recipientId == r.id,
                            onClick = { recipientId = r.id },
                            label = { Text("${Relations.emojiOf(r.relation)} $label") },
                        )
                    }
                }
            }

            OutlinedTextField(
                value = received,
                onValueChange = { received = it },
                label = { Text(t("الرسالة اللي وصلتك", "The message you received")) },
                minLines = 3,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = contextText,
                onValueChange = { contextText = it },
                label = { Text(t("سياق مهم؟ (اختياري)", "Important context? (optional)")) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            Button(onClick = { generate() }, enabled = !busy, modifier = Modifier.fillMaxWidth()) {
                Text(if (busy) t("بجهّز ردّين...", "Preparing two replies...") else t("✨ اقترح ردّ", "✨ Suggest a reply"))
            }

            results.forEachIndexed { idx, s ->
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(t("${idx + 1}️⃣ رد مقترح", "${idx + 1}️⃣ Suggested reply"), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                        Text(s.text, style = MaterialTheme.typography.bodyLarge)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { learn(s.text, "pick"); sendReply(s.text) }) { Text(t("📲 ابعت", "📲 Send")) }
                            OutlinedButton(onClick = { clipboard.setText(AnnotatedString(s.text)); toast(t("اتنسخت ✅", "Copied ✅")) }) { Text(t("📋 نسخ", "📋 Copy")) }
                            OutlinedButton(onClick = { learn(s.text, "pick"); toast(t("حفظت أسلوبك 👌", "Saved to your style 👌")) }) { Text(t("👍 اختار", "👍 Choose")) }
                        }
                        // شارك عبر منصّة تانية: بننسخ الرد ونفتح التطبيق (المنصّات مابتقبلش نص جاهز في اللينك).
                        Row(
                            modifier = Modifier.horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            SocialShare.CHANNELS.forEach { (ch, label) ->
                                OutlinedButton(onClick = {
                                    learn(s.text, "pick")
                                    SocialShare.openWithText(context, ch, recipient?.social.orEmpty(), s.text)
                                }) { Text(label) }
                            }
                        }
                    }
                }
            }

            if (results.isNotEmpty()) {
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(t("عدّل بنفسك واحفظه لأسلوبك", "Edit it yourself and save it to your style"), fontWeight = FontWeight.Bold)
                        OutlinedTextField(
                            value = editBox,
                            onValueChange = { editBox = it },
                            minLines = 2,
                            modifier = Modifier.fillMaxWidth(),
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = {
                                val txt = editBox.trim()
                                if (txt.isBlank()) toast(t("اكتب ردّك", "Write your reply first"))
                                else { learn(txt, "edited"); sendReply(txt); editBox = "" }
                            }) { Text(t("📲 ابعت نسختي", "📲 Send my version")) }
                            OutlinedButton(onClick = {
                                val txt = editBox.trim()
                                if (txt.isNotBlank()) { learn(txt, "edited"); editBox = ""; toast(t("سجّلت نسختك 🌟", "Saved your version 🌟")) }
                            }) { Text(t("💾 احفظ", "💾 Save")) }
                        }
                    }
                }
            }
        }
    }
}
