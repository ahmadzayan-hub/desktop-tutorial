package com.wifeassistant.ui

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
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
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.wifeassistant.data.BroadcastGroup
import com.wifeassistant.data.GroupComposer
import com.wifeassistant.data.GroupMember
import com.wifeassistant.data.Settings
import com.wifeassistant.data.t
import com.wifeassistant.ui.theme.GradientButton
import com.wifeassistant.util.ContactsReader
import com.wifeassistant.util.Csv
import com.wifeassistant.util.WhatsApp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext

// عضو في قائمة الإرسال بمعرّف فريد (id) — عشان الاختيار والرسائل الذكية تتربط بالشخص
// نفسه مش برقمه (ممكن يكون فاضي أو مكرّر من CSV).
private data class BcMember(val id: String, val name: String, val number: String)

// رسالة جماعية مخصّصة: استورد ناسك (جهات الاتصال أو ملف CSV) أو اختار مجموعة محفوظة،
// والتطبيق يجهّز الرسالة باسم كل واحد — وانت تبعت بضغطة لكل شخص (بيفتح شاته والرسالة
// جاهزة). كود الدولة الافتراضي بيتكمّل للأرقام الناقصة. مفيش إرسال تلقائي — آمن ومشروع.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BroadcastScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }

    var cc by remember { mutableStateOf(settings.defaultCountryCode) }
    var template by remember { mutableStateOf("كل سنة وانت طيّب يا {الاسم} 🌙🤍") }
    var query by remember { mutableStateOf("") }
    var activeList by remember { mutableStateOf<List<BcMember>>(emptyList()) }
    var loaded by remember { mutableStateOf(false) }
    var groups by remember { mutableStateOf(settings.broadcastGroups) }
    val selected = remember { mutableStateListOf<String>() }
    var groupName by remember { mutableStateOf("") }
    var groupKind by remember { mutableStateOf("work") }
    var unknownNum by remember { mutableStateOf("") }
    // وضع الأعمال: الردود بتفتح في واتساب Business والنبرة مهنية دافئة — للعملاء
    // اللي عندهم محادثة شغّالة معاك (رد شخصي بضغطة، من غير إرسال جماعي تلقائي).
    var businessMode by remember { mutableStateOf(false) }
    // حسابات المُرسِل (أرقامك: إمارات/مصر/أعمال) + الحساب المختار + فورمة إضافة حساب.
    var senders by remember { mutableStateOf(settings.senderAccounts) }
    var selectedSenderId by remember { mutableStateOf(settings.selectedSenderId) }
    var newSenderLabel by remember { mutableStateOf("") }
    var newSenderChannel by remember { mutableStateOf("whatsapp") }
    var newSenderCc by remember { mutableStateOf("") }
    var newSenderSig by remember { mutableStateOf("") }
    // (متقدّم) باك-إند WhatsApp Business Cloud API — إرسال آلي مشروع لو اتظبّط.
    var apiEndpoint by remember { mutableStateOf(settings.businessApiEndpoint) }
    var apiKey by remember { mutableStateOf(settings.businessApiKey) }
    // قالب معتمد (اختياري) — بيشتغل خارج نافذة 24 ساعة كمان.
    var templateName by remember { mutableStateOf("") }
    var templateLang by remember { mutableStateOf("ar") }
    // تخصيص بالذكاء: رسالة LLM لكل عضو (بالرقم كمفتاح) + سياق مشترك + حالة الشغل.
    val scope = rememberCoroutineScope()
    val composer = remember { GroupComposer(settings) }
    val aiMsgs = remember { mutableStateMapOf<String, String>() }
    var sharedCtx by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var progress by remember { mutableStateOf(0) }
    // نسخ/تصدير + معاينة + قوالب مفضّلة
    val clipboard = LocalClipboardManager.current
    var templates by remember { mutableStateOf(settings.broadcastTemplates) }
    var previewText by remember { mutableStateOf("") }
    var pendingExport by remember { mutableStateOf("") }

    fun toast(m: String) = Toast.makeText(context, m, Toast.LENGTH_LONG).show()
    fun personalize(name: String): String =
        template.replace("{الاسم}", name).replace("{name}", name).trim()
    fun msgFor(c: BcMember): String = aiMsgs[c.id] ?: personalize(c.name)
    fun currentTargets(): List<BcMember> {
        val base = activeList.filter { query.isBlank() || it.name.contains(query.trim(), ignoreCase = true) }
        return if (selected.isEmpty()) base else base.filter { selected.contains(it.id) }
    }
    fun allText(): String = currentTargets().joinToString("\n\n") { c ->
        "— ${c.name}${if (c.number.isNotBlank()) " (${c.number})" else ""}\n${msgFor(c)}"
    }
    val exportLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("text/plain")) { uri ->
        if (uri != null) {
            runCatching { context.contentResolver.openOutputStream(uri)?.use { it.write(pendingExport.toByteArray()) } }
            toast(t("اتصدّر ✅", "Exported ✅"))
        }
    }

    // عند أي تحميل جديد: نمسح الاختيار والرسائل الذكية والمعاينة القديمة.
    fun resetForNewList() { selected.clear(); aiMsgs.clear(); previewText = "" }
    fun loadContacts() {
        // قراءة جهات الاتصال في الخلفية (IO) عشان ما نهنّجش الواجهة مع دفتر أرقام كبير.
        scope.launch {
            val raw = withContext(Dispatchers.IO) {
                runCatching { ContactsReader.allWithNumbers(context) }.getOrDefault(emptyList())
            }
            activeList = raw.mapIndexed { i, c -> BcMember("c$i", c.name, c.number) }
            loaded = true
            resetForNewList()
            if (activeList.isEmpty()) toast(t("مفيش جهات اتصال بأرقام", "No contacts with numbers"))
        }
    }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) loadContacts() else toast(t("محتاج إذن جهات الاتصال", "Contacts permission needed"))
    }
    fun openContacts() {
        val ok = ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CONTACTS) == PackageManager.PERMISSION_GRANTED
        if (ok) loadContacts() else permission.launch(Manifest.permission.READ_CONTACTS)
    }
    val csvLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) scope.launch {
            // قراءة الملف وتحليله في الخلفية (ممكن يكون كبير).
            val rows = withContext(Dispatchers.IO) {
                val text = runCatching {
                    context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() }
                }.getOrNull().orEmpty()
                Csv.parse(text)
            }
            activeList = rows.mapIndexed { i, r -> BcMember("v$i", r.name, r.number) }
            loaded = true
            resetForNewList()
            toast(if (rows.isEmpty()) t("الملف فاضي أو غير مقروء", "File is empty or unreadable") else t("اتحمّل ${rows.size} جهة ✅", "Loaded ${rows.size} contacts ✅"))
        }
    }

    fun kindEmoji(k: String) = when (k) {
        "work" -> "💼"; "project" -> "🚀"; "family" -> "👨‍👩‍👧‍👦"; "friends" -> "🧑‍🤝‍🧑"; "clients" -> "🤝"; else -> "📇"
    }
    fun saveGroup() {
        val nm = groupName.trim()
        if (nm.isBlank()) { toast(t("اكتب اسم المجموعة", "Type a group name")); return }
        val chosen = if (selected.isNotEmpty()) activeList.filter { selected.contains(it.id) } else activeList
        if (chosen.isEmpty()) { toast(t("مفيش أعضاء للحفظ", "No members to save")); return }
        val g = BroadcastGroup(
            id = "g" + System.currentTimeMillis(), name = nm, kind = groupKind,
            members = chosen.map { GroupMember(it.name, it.number) },
        )
        groups = groups + g
        settings.broadcastGroups = groups
        groupName = ""
        toast(t("اتحفظت المجموعة (${chosen.size}) ✅", "Group saved (${chosen.size}) ✅"))
    }
    fun loadGroup(g: BroadcastGroup) {
        activeList = g.members.mapIndexed { i, m -> BcMember("g$i", m.name, m.number) }
        loaded = true
        resetForNewList()
    }
    fun deleteGroup(g: BroadcastGroup) {
        groups = groups.filterNot { it.id == g.id }
        settings.broadcastGroups = groups
    }
    // يولّد رسالة مخصّصة بالـ LLM لكل عضو (المحدّدين أو الكل، بحد أقصى 60).
    fun aiGenerate() {
        if (settings.groqKey.isBlank()) { toast(t("ضيف مفتاح Groq من الإعدادات الأول", "Add your Groq key in Settings first")); return }
        if (busy) return
        val all = currentTargets()
        val targets = all.take(60)
        if (targets.isEmpty()) { toast(t("مفيش أعضاء", "No members")); return }
        if (all.size > 60) toast(t("هنجهّز أول 60 (الأقصى للدفعة) — كرّر للباقي", "Preparing the first 60 (batch max) — repeat for the rest"))
        scope.launch {
            busy = true; progress = 0
            // توليد متوازي محدود (٤ في نفس الوقت) — أسرع بكتير من واحد ورا واحد لـ60 عميل،
            // من غير ما نغرق Groq بطلبات. العدّاد ذرّي عشان التحديث ما يتلغبطش.
            val done = java.util.concurrent.atomic.AtomicInteger(0)
            val sem = Semaphore(4)
            coroutineScope {
                targets.map { c ->
                    async {
                        val msg = sem.withPermit {
                            withContext(Dispatchers.IO) {
                                runCatching { composer.oneFor(c.name, "", sharedCtx, business = businessMode) }
                                    .getOrElse { personalize(c.name) }
                            }
                        }
                        aiMsgs[c.id] = msg
                        progress = done.incrementAndGet()
                    }
                }.awaitAll()
            }
            busy = false
            toast(t("جهّزت $progress رسالة مخصّصة ✍️", "Prepared $progress personalized messages ✍️"))
        }
    }
    // معاينة: يولّد رسالة أول عضو بس عشان تشوف النبرة قبل ما تجهّز للكل.
    fun preview() {
        if (settings.groqKey.isBlank()) { toast(t("ضيف مفتاح Groq الأول", "Add your Groq key first")); return }
        if (busy) return
        val first = currentTargets().firstOrNull() ?: run { toast(t("مفيش أعضاء", "No members")); return }
        scope.launch {
            busy = true
            previewText = runCatching { composer.oneFor(first.name, "", sharedCtx, business = businessMode) }.getOrElse { personalize(first.name) }
            busy = false
        }
    }
    fun saveTemplate() {
        val txt = template.trim()
        if (txt.isBlank()) { toast(t("القالب فاضي", "Template is empty")); return }
        templates = (listOf(txt) + templates).distinct().take(10)
        settings.broadcastTemplates = templates
        toast(t("اتحفظ القالب ⭐", "Template saved ⭐"))
    }

    val filtered = activeList.filter { query.isBlank() || it.name.contains(query.trim(), ignoreCase = true) }

    // الحساب المختار للإرسال (لو فيه). بيحدّد: التطبيق الهدف (عادي/Business) + التوقيع.
    val selectedSender = senders.firstOrNull { it.id == selectedSenderId }
    val useBusinessApp = businessMode || selectedSender?.channel == "whatsapp_business"
    val sig = selectedSender?.signature.orEmpty()
    fun withSig(msg: String): String = if (sig.isBlank()) msg else "$msg\n$sig"
    fun selectSender(a: com.wifeassistant.data.SenderAccount) {
        selectedSenderId = a.id
        settings.selectedSenderId = a.id
        if (a.countryCode.isNotBlank()) { cc = a.countryCode.filter { it.isDigit() }; settings.defaultCountryCode = cc }
    }
    fun addSender() {
        val lbl = newSenderLabel.trim()
        if (lbl.isBlank()) { toast(t("اكتب اسم الحساب", "Type an account name")); return }
        val a = com.wifeassistant.data.SenderAccount(
            id = "s" + System.currentTimeMillis(), label = lbl, channel = newSenderChannel,
            countryCode = newSenderCc.filter { it.isDigit() }, signature = newSenderSig.trim(),
        )
        senders = senders + a
        settings.senderAccounts = senders
        newSenderLabel = ""; newSenderCc = ""; newSenderSig = ""; newSenderChannel = "whatsapp"
        selectSender(a)
        toast(t("اتضاف حساب ${a.label} ✅", "Added account ${a.label} ✅"))
    }
    fun deleteSender(a: com.wifeassistant.data.SenderAccount) {
        senders = senders.filterNot { it.id == a.id }
        settings.senderAccounts = senders
        if (selectedSenderId == a.id) { selectedSenderId = ""; settings.selectedSenderId = "" }
    }
    // إرسال آلي عبر باك-إند وصال (Cloud API) — بديل مشروع لفتح واتساب اليدوي.
    val cloudConfigured = apiEndpoint.isNotBlank() && apiKey.isNotBlank()
    fun sendViaApi(to: String, text: String) {
        if (to.filter { it.isDigit() }.isEmpty()) { toast(t("رقم العميل ناقص", "Customer number is missing")); return }
        scope.launch {
            val res = com.wifeassistant.data.CloudApiClient(apiEndpoint, apiKey).sendText(to, text)
            res.onSuccess { toast(t("اتبعت عبر Business API ✅", "Sent via Business API ✅")) }
                .onFailure { toast(t("فشل الإرسال: ${it.message}", "Send failed: ${it.message}")) }
        }
    }
    // إرسال قالب معتمد (خارج نافذة 24 ساعة). القالب لازم يكون معتمد من Meta بنفس الاسم.
    fun sendTemplateViaApi(to: String) {
        if (to.filter { it.isDigit() }.isEmpty()) { toast(t("رقم العميل ناقص", "Customer number is missing")); return }
        scope.launch {
            val res = com.wifeassistant.data.CloudApiClient(apiEndpoint, apiKey)
                .sendTemplate(to, templateName.trim(), templateLang.trim())
            res.onSuccess { toast(t("اتبعت قالب ✅", "Template sent ✅")) }
                .onFailure { toast(t("فشل الإرسال: ${it.message}", "Send failed: ${it.message}")) }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(t("مجموعات وإرسال 📣", "Groups & sending 📣")) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = t("رجوع", "Back"))
                    }
                },
            )
        },
    ) { padding ->
        // LazyColumn: القائمة بترسم كسول (lazy) فما بنرسمش كل الكروت مرة واحدة —
        // تحسين أداء وذاكرة كبير مع عدد جهات اتصال كبير. الهيدر في item واحد.
        LazyColumn(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
          item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            // كود الدولة + نص الرسالة
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = cc,
                    onValueChange = { cc = it.filter { ch -> ch.isDigit() }; settings.defaultCountryCode = cc },
                    label = { Text(t("كود الدولة", "Country code")) },
                    singleLine = true,
                    modifier = Modifier.width(120.dp),
                )
                Text(
                    t("الأرقام المستوردة من غير مقدمة بنكمّلها بالكود ده تلقائياً.", "Imported numbers without a prefix get this code automatically."),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
            OutlinedTextField(
                value = template,
                onValueChange = { template = it },
                label = { Text(t("نص الرسالة (استخدم {الاسم} مكان اسم الشخص)", "Message text (use {الاسم} where the name goes)")) },
                minLines = 2,
                modifier = Modifier.fillMaxWidth(),
            )
            Text(
                t("بيتبعت واحد واحد بضغطة منك — بيفتح شات كل شخص والرسالة جاهزة باسمه وانت تدوس Send. مفيش إرسال تلقائي.", "Sent one by one with your tap — each chat opens with the message ready, and you press Send. Nothing is automatic."),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            // وضع الأعمال (واتساب Business): للردّ على العملاء اللي عندهم محادثة معاك.
            Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                FilterChip(
                    selected = businessMode,
                    onClick = { businessMode = !businessMode },
                    label = { Text(if (businessMode) t("💼 وضع الأعمال: مفعّل", "💼 Business mode: on") else t("💼 وضع الأعمال", "💼 Business mode")) },
                )
            }
            if (businessMode) {
                Text(
                    t("للردّ على عملاء واتساب Business اللي عندهم محادثة شغّالة معاك: الرسالة بتتفتح في واتساب Business بنبرة مهنية دافئة، وانت تدوس Send لكل واحد. متبعتش رسائل مجهّلة لناس ما كلّموكش — ده بيعرّض رقمك للحظر.", "For replying to WhatsApp Business customers who already have a chat with you: the message opens in WhatsApp Business with a warm professional tone, and you press Send for each one. Never message people who did not contact you — it risks getting your number banned."),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                )
                // (متقدّم) باك-إند Cloud API: إرسال آلي مشروع عبر Meta لو ظبّطت endpoint + مفتاح.
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(t("🚀 Business API (متقدّم — اختياري)", "🚀 Business API (advanced — optional)"), fontWeight = FontWeight.Bold)
                        Text(
                            t("لإرسال آلي مشروع عبر WhatsApp Business Cloud API. سيب الخانتين فاضيين لو مش محتاجه — هيفضل الإرسال بفتح واتساب اليدوي. راجع wisal-cloud-api/README.", "For compliant automated sending via WhatsApp Business Cloud API. Leave both fields empty if unused — sending stays manual via WhatsApp. See wisal-cloud-api/README."),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        OutlinedTextField(
                            value = apiEndpoint,
                            onValueChange = { apiEndpoint = it },
                            label = { Text("Endpoint (…/api/send)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                        )
                        OutlinedTextField(
                            value = apiKey,
                            onValueChange = { apiKey = it },
                            label = { Text("APP_API_KEY") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                        )
                        Button(onClick = {
                            settings.businessApiEndpoint = apiEndpoint
                            settings.businessApiKey = apiKey
                            toast(if (cloudConfigured) t("اتحفظ إعداد Business API ✅", "Business API settings saved ✅") else t("اتمسح الإعداد", "Settings cleared"))
                        }) { Text(t("💾 احفظ الإعداد", "💾 Save settings")) }

                        // قالب معتمد (اختياري) — للإرسال خارج نافذة 24 ساعة.
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = templateName,
                                onValueChange = { templateName = it },
                                label = { Text(t("اسم قالب معتمد (اختياري)", "Approved template name (optional)")) },
                                singleLine = true,
                                modifier = Modifier.weight(1f),
                            )
                            OutlinedTextField(
                                value = templateLang,
                                onValueChange = { templateLang = it },
                                label = { Text(t("لغة", "Language")) },
                                singleLine = true,
                                modifier = Modifier.width(90.dp),
                            )
                        }
                        Text(
                            t("لو حطيت اسم قالب معتمد من Meta، هيظهر زر «ابعت قالب» لكل عميل — بيشتغل حتى خارج الـ24 ساعة.", "If you set a Meta-approved template name, a send-template button appears per customer — it works even outside the 24-hour window."),
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            // أبعت من: حساباتك (إمارات/مصر/أعمال). الاختيار بيظبط الكود + التوقيع + التطبيق الهدف.
            ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(t("📱 أبعت من (حساباتك)", "📱 Send from (your accounts)"), fontWeight = FontWeight.Bold)
                    if (senders.isNotEmpty()) {
                        Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            senders.forEach { a ->
                                FilterChip(
                                    selected = selectedSenderId == a.id,
                                    onClick = { selectSender(a) },
                                    label = { Text("${if (a.channel == "whatsapp_business") "💼" else "📱"} ${a.label}") },
                                    trailingIcon = {
                                        Text("✕", modifier = Modifier
                                            .padding(start = 2.dp)
                                            .semantics { contentDescription = t("حذف الحساب", "Delete account") }
                                            .clickable { deleteSender(a) })
                                    },
                                )
                            }
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = newSenderLabel,
                            onValueChange = { newSenderLabel = it },
                            label = { Text(t("اسم الحساب (مثلاً: الأعمال)", "Account name (e.g. Business)")) },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                        )
                        OutlinedTextField(
                            value = newSenderCc,
                            onValueChange = { newSenderCc = it.filter { ch -> ch.isDigit() } },
                            label = { Text(t("كود", "Code")) },
                            singleLine = true,
                            modifier = Modifier.width(90.dp),
                        )
                    }
                    Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("whatsapp" to t("📱 واتساب", "📱 WhatsApp"), "whatsapp_business" to "💼 Business").forEach { (id, label) ->
                            FilterChip(selected = newSenderChannel == id, onClick = { newSenderChannel = id }, label = { Text(label) })
                        }
                    }
                    OutlinedTextField(
                        value = newSenderSig,
                        onValueChange = { newSenderSig = it },
                        label = { Text(t("توقيع آخر الرسالة (اختياري)", "Signature at the end (optional)")) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Button(onClick = { addSender() }) { Text(t("＋ أضف حساب", "＋ Add account")) }
                    Text(
                        t("ملاحظة: رقمين واتساب شخصيين بيبقوا في نفس التطبيق — الاختيار هنا بيظبط الكود والتوقيع والتطبيق الهدف (عادي/Business). البرنامج مايقدرش يبدّل بين رقمين جوّه نفس واتساب — ده قيد واتساب نفسه.", "Note: two personal WhatsApp numbers live in the same app — this choice sets the code, signature, and target app (regular/Business). Wisal cannot switch between numbers inside WhatsApp itself — that is a WhatsApp limitation."),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            // قوالب مفضّلة
            Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                OutlinedButton(onClick = { saveTemplate() }) { Text(t("⭐ احفظ القالب", "⭐ Save template")) }
                templates.forEach { t ->
                    FilterChip(
                        selected = template == t,
                        onClick = { template = t },
                        label = { Text(if (t.length > 22) t.take(22) + "…" else t) },
                        trailingIcon = {
                            Text("✕", modifier = Modifier
                                .padding(start = 2.dp)
                                .semantics { contentDescription = t("حذف القالب", "Delete template") }
                                .clickable {
                                    templates = templates.filterNot { it == t }
                                    settings.broadcastTemplates = templates
                                })
                        },
                    )
                }
            }

            // إرسال لرقم مش متسجّل
            ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(t("✉️ رقم مش متسجّل", "✉️ Unsaved number"), fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = unknownNum,
                            onValueChange = { unknownNum = it },
                            label = { Text(t("رقم الموبايل", "Phone number")) },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                        )
                        Button(onClick = {
                            if (unknownNum.filter { it.isDigit() }.isEmpty()) toast(t("اكتب الرقم", "Type the number"))
                            else WhatsApp.send(context, unknownNum, withSig(personalize("")), cc, businessApp = useBusinessApp)
                        }) { Text(t("📲 ابعت", "📲 Send")) }
                    }
                }
            }

            // مجموعات محفوظة
            if (groups.isNotEmpty()) {
                Text(t("مجموعاتك", "Your groups"), style = MaterialTheme.typography.labelLarge)
                groups.forEach { g ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        OutlinedButton(onClick = { loadGroup(g) }, modifier = Modifier.weight(1f)) {
                            Text("${kindEmoji(g.kind)} ${g.name} · ${g.members.size}")
                        }
                        TextButton(onClick = { deleteGroup(g) }) { Text("🗑️") }
                    }
                }
            }

            // مصادر الأعضاء
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                Button(onClick = { openContacts() }, modifier = Modifier.weight(1f)) { Text(t("📇 جهات الاتصال", "📇 Contacts")) }
                OutlinedButton(onClick = { csvLauncher.launch("*/*") }, modifier = Modifier.weight(1f)) { Text(t("📁 استيراد CSV", "📁 Import CSV")) }
            }

            if (loaded) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    label = { Text(t("دوّر على اسم", "Search by name")) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                val selCount = if (selected.isEmpty()) filtered.size else selected.size
                Text(
                    t("${filtered.size} جهة · المستهدَف: $selCount", "${filtered.size} contacts · targeted: $selCount"),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                )

                // تخصيص بالذكاء الاصطناعي لكل عضو
                OutlinedTextField(
                    value = sharedCtx,
                    onValueChange = { sharedCtx = it },
                    label = { Text(t("سياق مشترك للرسائل (اختياري)", "Shared context for messages (optional)")) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = { aiGenerate() }, enabled = !busy) {
                        Text(if (busy) t("بيجهّز... $progress", "Preparing... $progress") else t("✨ خصّص بالذكاء", "✨ Personalize with AI"))
                    }
                    if (aiMsgs.isNotEmpty()) {
                        OutlinedButton(onClick = { aiMsgs.clear() }) { Text(t("ارجع للقالب", "Back to template")) }
                    }
                }
                Text(
                    t("بالذكاء: كل واحد بياخد رسالة تخصّه بالاسم والسياق. من غير ذكاء: بيستخدم القالب فوق مع {الاسم}.", "With AI: everyone gets their own message with their name and context. Without AI: the template above is used with {الاسم}."),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )

                // معاينة أول رسالة + نسخ الكل + تصدير
                Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    OutlinedButton(onClick = { preview() }, enabled = !busy) { Text(t("👁️ معاينة", "👁️ Preview")) }
                    OutlinedButton(onClick = {
                        clipboard.setText(AnnotatedString(allText())); toast(t("اتنسخ الكل ✅", "All copied ✅"))
                    }) { Text(t("📋 نسخ الكل", "📋 Copy all")) }
                    OutlinedButton(onClick = {
                        pendingExport = allText()
                        exportLauncher.launch("wisal-broadcast.txt")
                    }) { Text(t("📤 تصدير", "📤 Export")) }
                }
                if (previewText.isNotBlank()) {
                    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(t("👁️ معاينة أول رسالة", "👁️ Preview of the first message"), fontWeight = FontWeight.Bold)
                            Text(previewText, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }

                // حفظ كمجموعة
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(t("💾 احفظ كمجموعة", "💾 Save as a group"), fontWeight = FontWeight.Bold)
                        Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf("work" to t("شغل", "Work"), "project" to t("مشروع", "Project"), "family" to t("أسرة", "Family"), "friends" to t("أصحاب", "Friends"), "clients" to t("عملاء", "Clients")).forEach { (id, label) ->
                                FilterChip(selected = groupKind == id, onClick = { groupKind = id }, label = { Text("${kindEmoji(id)} $label") })
                            }
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = groupName,
                                onValueChange = { groupName = it },
                                label = { Text(t("اسم المجموعة", "Group name")) },
                                singleLine = true,
                                modifier = Modifier.weight(1f),
                            )
                            Button(onClick = { saveGroup() }) { Text(t("حفظ", "Save")) }
                        }
                    }
                }
            } // نهاية if (loaded) لأدوات الهيدر
            } // نهاية Column الهيدر
          } // نهاية item الهيدر

          // قائمة جهات الاتصال — عناصر كسولة بمفتاح ثابت لكل صف.
          if (loaded) {
            items(filtered.take(300), key = { it.id }) { c ->
                    val isSel = selected.contains(c.id)
                    val msg = aiMsgs[c.id] ?: personalize(c.name)
                    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                                Checkbox(
                                    checked = isSel,
                                    onCheckedChange = { if (isSel) selected.remove(c.id) else selected.add(c.id) },
                                    modifier = Modifier.semantics { contentDescription = t("اختيار ${c.name}", "Select ${c.name}") },
                                )
                                Text(c.name, fontWeight = FontWeight.Bold)
                                if (aiMsgs.containsKey(c.id)) Text("  ✨", style = MaterialTheme.typography.bodySmall)
                            }
                            Text(
                                msg,
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            GradientButton(
                                onClick = { WhatsApp.send(context, c.number, withSig(msg), cc, businessApp = useBusinessApp) },
                                modifier = Modifier.fillMaxWidth(),
                            ) { Text(if (useBusinessApp) t("💼 رد على ${c.name}", "💼 Reply to ${c.name}") else t("📲 ابعت لـ${c.name}", "📲 Send to ${c.name}")) }
                            // إرسال آلي عبر Cloud API — بيظهر بس لو المستخدم ظبّط الباك-إند.
                            if (businessMode && cloudConfigured) {
                                Button(
                                    onClick = { sendViaApi(c.number, withSig(msg)) },
                                    modifier = Modifier.fillMaxWidth(),
                                ) { Text(t("🚀 ابعت عبر Business API", "🚀 Send via Business API")) }
                                if (templateName.isNotBlank()) {
                                    OutlinedButton(
                                        onClick = { sendTemplateViaApi(c.number) },
                                        modifier = Modifier.fillMaxWidth(),
                                    ) { Text(t("📋 ابعت قالب: ${templateName.trim()}", "📋 Send template: ${templateName.trim()}")) }
                                }
                            }
                        }
                    }
            }
          }
        }
    }
}
