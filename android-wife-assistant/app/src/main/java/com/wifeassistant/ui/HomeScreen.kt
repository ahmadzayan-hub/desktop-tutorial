package com.wifeassistant.ui

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.wifeassistant.data.Intents
import com.wifeassistant.data.Occasion
import com.wifeassistant.data.Recipient
import com.wifeassistant.data.Relations
import com.wifeassistant.data.Suggestion
import com.wifeassistant.util.CalendarReader
import com.wifeassistant.util.Share
import com.wifeassistant.util.WhatsApp
import com.wifeassistant.work.SendReminder

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    vm: HomeViewModel,
    onOpenSettings: () -> Unit,
    onOpenStats: () -> Unit,
    onOpenHistory: () -> Unit,
    onOpenPeople: () -> Unit,
    onOpenBroadcast: () -> Unit = {},
) {
    val state by vm.state.collectAsStateWithLifecycle()
    val people by vm.people.collectAsStateWithLifecycle()
    val ideas by vm.ideas.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current
    var edited by remember { mutableStateOf("") }
    var selectedIntent by remember { mutableStateOf<String?>(null) }
    var contextText by remember { mutableStateOf("") }
    val snackbar = remember { SnackbarHostState() }

    // كل ما نرجع للشاشة نحدّث قائمة الأشخاص (ممكن اتغيّرت من شاشة الأشخاص).
    LaunchedEffect(Unit) { vm.refreshRecipients() }
    val current = people.current

    // ---- تقويم الموبايل (Google Calendar وغيره) ----
    var calEvents by remember { mutableStateOf<List<String>>(emptyList()) }
    var showCal by remember { mutableStateOf(false) }
    fun loadCalendar() {
        calEvents = CalendarReader.events(context).map { it.title }
        showCal = true
    }
    val calPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) loadCalendar()
        else Toast.makeText(context, "محتاج إذن التقويم عشان أقرأ أجندتك", Toast.LENGTH_LONG).show()
    }
    fun openCalendar() {
        val granted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.READ_CALENDAR
        ) == PackageManager.PERMISSION_GRANTED
        if (granted) loadCalendar() else calPermission.launch(Manifest.permission.READ_CALENDAR)
    }

    // نعرض رسائل الحالة (نجاح/خطأ) كـ Snackbar لطيف.
    LaunchedEffect(state.info) { state.info?.let { snackbar.showSnackbar(it) } }
    LaunchedEffect(state.error) { state.error?.let { snackbar.showSnackbar("⚠️ $it") } }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            TopAppBar(
                title = { Text("وصال 💗", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                ),
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            HeaderBanner(current)
            RecipientSwitcher(
                people = people,
                onSelect = { vm.selectRecipient(it) },
                onManage = onOpenPeople,
            )
            // مناسبات الشخص المختار - لو ليه مناسبة قريّبة نعرضها كزر سريع.
            PersonOccasionChips(current) { label ->
                vm.generate("occasion", Occasion("person", label), context = contextText.trim())
            }

            // نيّة الرسالة: السبب الحقيقي (اعتذار/تهنئة/مواساة...). اختياري.
            IntentPicker(selected = selectedIntent) { id ->
                selectedIntent = if (selectedIntent == id) null else id
            }
            // سياق سريع للرسالة دي بس (اللي حصل/المناسبة).
            OutlinedTextField(
                value = contextText,
                onValueChange = { contextText = it },
                label = { Text("إيه المناسبة أو اللي حصل؟ (اختياري)") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 1,
            )

            // أزرار التوليد
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { vm.generate("manual", intentId = selectedIntent, context = contextText.trim()) },
                    modifier = Modifier.weight(1f),
                ) {
                    Text(if (selectedIntent != null) "✨ اكتب الرسالة" else "✨ اقتراح فوري")
                }
                FilledTonalButton(onClick = { vm.requestOccasion() }, modifier = Modifier.weight(1f)) {
                    Text("💌 مناسبة")
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = { vm.generate("morning", intentId = selectedIntent, context = contextText.trim()) },
                    modifier = Modifier.weight(1f),
                ) {
                    Text("🌅 صباحي")
                }
                OutlinedButton(
                    onClick = { vm.generate("evening", intentId = selectedIntent, context = contextText.trim()) },
                    modifier = Modifier.weight(1f),
                ) {
                    Text("🌙 مسائي")
                }
            }
            OutlinedButton(onClick = { openCalendar() }, modifier = Modifier.fillMaxWidth()) {
                Text("📅 مناسبة من أجندتي")
            }
            OutlinedButton(onClick = onOpenBroadcast, modifier = Modifier.fillMaxWidth()) {
                Text("📣 رسالة جماعية لجهات الاتصال")
            }

            // المناسبات الجاية عبر كل الأشخاص - تخطيط وتنبيه مبكّر + أفكار عملية.
            UpcomingOccasions(
                people = people,
                onWrite = { rid, label ->
                    vm.selectRecipient(rid)
                    vm.generate("occasion", Occasion("person", label))
                },
                onIdeas = { rid, label ->
                    vm.selectRecipient(rid)
                    vm.loadGiftIdeas(label)
                },
            )

            if (showCal) {
                AlertDialog(
                    onDismissRequest = { showCal = false },
                    title = { Text("من أجندتك النهاردة 📅") },
                    text = {
                        if (calEvents.isEmpty()) {
                            Text("مفيش أحداث النهاردة في تقويمك.")
                        } else {
                            Column {
                                calEvents.take(10).forEach { title ->
                                    TextButton(onClick = {
                                        showCal = false
                                        vm.generate("occasion", Occasion("cal", title))
                                    }) { Text("• $title") }
                                }
                            }
                        }
                    },
                    confirmButton = {
                        TextButton(onClick = { showCal = false }) { Text("إغلاق") }
                    },
                )
            }

            if (state.loading) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    CircularProgressIndicator(modifier = Modifier.height(28.dp))
                    Spacer(Modifier.height(0.dp))
                    Text("  بكتب لك اقتراحين...", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            state.occasionLabel?.let {
                Text("💝 مناسبة: $it", style = MaterialTheme.typography.titleMedium)
            }

            val isGroup = current?.relation?.startsWith("group") == true
            state.items.forEachIndexed { idx, item ->
                SuggestionCard(
                    index = idx,
                    item = item,
                    sendLabel = sendLabelFor(current),
                    onChoose = { vm.choose(idx) },
                    onCopy = { clipboard.setText(AnnotatedString(item.text)) },
                    onShare = { Share.text(context, item.text) },
                    onWhatsApp = {
                        // مجموعة أو من غير رقم: نفتح منتقي واتساب. شخص بيه رقم: نفتح شاته مباشرة.
                        if (isGroup) WhatsApp.chooser(context, item.text)
                        else WhatsApp.send(context, current?.number.orEmpty(), item.text)
                    },
                    onGroup = { WhatsApp.chooser(context, item.text) },
                    onRefine = { style -> vm.refine(idx, style) },
                    onRemind = {
                        val who = current?.let { it.name.ifBlank { Relations.labelOf(it.relation) } } ?: "حد بتحبه"
                        SendReminder.schedule(context, who, item.text, "tomorrow_morning")
                        Toast.makeText(context, "هفكّرك بكرة الصبح ⏰", Toast.LENGTH_SHORT).show()
                    },
                )
            }

            if (state.items.isNotEmpty()) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { vm.regenerate() }, modifier = Modifier.weight(1f)) {
                        Text("🔄 جديد")
                    }
                    OutlinedButton(onClick = { vm.ignore() }, modifier = Modifier.weight(1f)) {
                        Text("🙈 تجاهل")
                    }
                }
                OutlinedTextField(
                    value = edited,
                    onValueChange = { edited = it },
                    label = { Text("عدّل بنفسك واحفظه لأسلوبك") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                )
                Button(
                    onClick = { vm.edit(edited); edited = "" },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("💾 احفظ نسختي المعدّلة") }
            } else if (!state.loading) {
                EmptyState()
            }

            Spacer(Modifier.height(24.dp))
        }

        // نافذة أفكار المناسبة (هدية/كارت/ورد/لمسة).
        if (ideas.open) {
            AlertDialog(
                onDismissRequest = { vm.closeIdeas() },
                title = { Text("🎁 أفكار لـ${ideas.title}") },
                text = {
                    if (ideas.loading) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CircularProgressIndicator(modifier = Modifier.height(22.dp))
                            Text("  بجهّزلك أفكار...")
                        }
                    } else {
                        Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                            Text(ideas.text)
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "دي أفكار وفئة سعرية تقريبية - مش أسعار حقيقية لحظية.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                },
                confirmButton = { TextButton(onClick = { vm.closeIdeas() }) { Text("تمام") } },
            )
        }
    }
}

// المناسبات الجاية عبر كل الأشخاص (خلال ~45 يوم)، الأقرب الأول.
@Composable
private fun UpcomingOccasions(
    people: PeopleState,
    onWrite: (String, String) -> Unit,
    onIdeas: (String, String) -> Unit,
) {
    data class Up(val rid: String, val name: String, val label: String, val days: Int)
    val upcoming = people.recipients.flatMap { r ->
        r.occasions.mapNotNull { o ->
            com.wifeassistant.data.DateUtil.daysUntilMMDD(o.date)?.let { d ->
                if (d <= 45) Up(r.id, r.name.ifBlank { Relations.labelOf(r.relation) }, o.label, d) else null
            }
        }
    }.sortedBy { it.days }.take(4)

    if (upcoming.isEmpty()) return

    Surface(
        color = MaterialTheme.colorScheme.surfaceVariant,
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("🎀 مناسبات جايّة", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            upcoming.forEach { u ->
                val whenTxt = when (u.days) {
                    0 -> "النهاردة"
                    1 -> "بكرة"
                    else -> "بعد ${u.days} يوم"
                }
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("${u.label} لـ${u.name} · $whenTxt", style = MaterialTheme.typography.bodyMedium)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        AssistChip(onClick = { onWrite(u.rid, u.label) }, label = { Text("✍️ اكتب") })
                        AssistChip(onClick = { onIdeas(u.rid, u.label) }, label = { Text("🎁 أفكار") })
                    }
                }
            }
        }
    }
}

// منتقي الأشخاص على الشاشة الرئيسية: صف من الأزرار (chips) لكل شخص. اختيار أي واحد
// بيظبط كل الخيارات عليه فوراً (النبرة، الرقم، زر الواتساب، المناسبات).
@Composable
private fun RecipientSwitcher(
    people: PeopleState,
    onSelect: (String) -> Unit,
    onManage: () -> Unit,
) {
    Surface(
        color = MaterialTheme.colorScheme.surfaceVariant,
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    "✍️ بتكتب لـ",
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                )
                TextButton(onClick = onManage) { Text("إدارة الأشخاص") }
            }
            if (people.recipients.isEmpty()) {
                Text(
                    "لسه مفيش حد. ضيف أول شخص عشان تبدأ.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            } else {
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    people.recipients.forEach { r ->
                        FilterChip(
                            selected = r.id == people.selectedId,
                            onClick = { onSelect(r.id) },
                            label = {
                                Text(
                                    "${Relations.emojiOf(r.relation)} " +
                                        r.name.ifBlank { Relations.labelOf(r.relation) },
                                )
                            },
                        )
                    }
                    AssistChip(onClick = onManage, label = { Text("＋ شخص") })
                }
                people.current?.let { r ->
                    Text(
                        "النبرة: ${Relations.byId(r.relation).tone}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 6.dp),
                    )
                }
            }
        }
    }
}

// منتقي نيّة الرسالة: يوجّه التوليد للموقف (اعتذار/تهنئة/مواساة...). اختياري.
@Composable
private fun IntentPicker(selected: String?, onToggle: (String) -> Unit) {
    Column {
        Text(
            "نيّة الرسالة (اختياري)",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 4.dp),
        )
        Row(
            modifier = Modifier.horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Intents.ALL.forEach { intent ->
                FilterChip(
                    selected = selected == intent.id,
                    onClick = { onToggle(intent.id) },
                    label = { Text("${intent.emoji} ${intent.label}") },
                )
            }
        }
    }
}

// مناسبات الشخص المختار كأزرار سريعة (لو ليه مناسبات مسجّلة).
@Composable
private fun PersonOccasionChips(current: Recipient?, onPick: (String) -> Unit) {
    val occ = current?.occasions ?: emptyList()
    if (occ.isEmpty()) return
    Row(
        modifier = Modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        occ.forEach { o ->
            AssistChip(onClick = { onPick(o.label) }, label = { Text("🎉 ${o.label}") })
        }
    }
}

@Composable
private fun HeaderBanner(current: Recipient?) {
    val who = current?.let { it.name.ifBlank { Relations.labelOf(it.relation) } }
    val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
    val greeting = when (hour) {
        in 5..11 -> "صباح الخير 🌅"
        in 12..16 -> "نهارك سعيد ☀️"
        in 17..21 -> "مساء الخير 🌙"
        else -> "سهرة هنيّة ✨"
    }
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(12.dp, RoundedCornerShape(28.dp))
            .clip(RoundedCornerShape(28.dp))
            .background(
                Brush.linearGradient(
                    listOf(
                        MaterialTheme.colorScheme.primary,
                        MaterialTheme.colorScheme.secondary,
                        MaterialTheme.colorScheme.tertiary,
                    )
                )
            )
            .padding(22.dp),
    ) {
        Column {
            Text(
                greeting,
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onPrimary,
                fontWeight = FontWeight.Bold,
            )
            Text(
                if (who != null) "مين تحب تطمّن عليه؟ ابعت لـ$who بكلمة حلوة 💗"
                else "مين تحب تفاجئه بكلمة حلوة النهاردة؟ 💗",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimary,
            )
        }
    }
}

// نص زر الواتساب حسب الشخص المختار: "ابعت لأمي"، "ابعت لسوسو"، أو "ابعت للعيلة".
private fun sendLabelFor(current: Recipient?): String {
    if (current == null) return "📲 إرسال واتساب"
    val rel = Relations.byId(current.relation)
    val who = current.name.ifBlank { rel.label }
    return if (current.relation.startsWith("group")) "📣 ابعت لـ$who" else "📲 ابعت لـ$who"
}

@Composable
private fun SuggestionCard(
    index: Int,
    item: Suggestion,
    sendLabel: String,
    onChoose: () -> Unit,
    onCopy: () -> Unit,
    onShare: () -> Unit,
    onWhatsApp: () -> Unit,
    onGroup: () -> Unit,
    onRefine: (String) -> Unit,
    onRemind: () -> Unit,
) {
    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // شارة الموضوع
            Surface(
                color = MaterialTheme.colorScheme.primaryContainer,
                shape = RoundedCornerShape(50),
            ) {
                Text(
                    "${index + 1}️⃣  ${item.theme}",
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    style = MaterialTheme.typography.labelMedium,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp),
                )
            }
            Text(item.text, style = MaterialTheme.typography.bodyLarge)

            // تحرير تكراري: نعدّل الاقتراح ده لحد ما يعجبك.
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                AssistChip(onClick = { onRefine("longer") }, label = { Text("➕ أطول") })
                AssistChip(onClick = { onRefine("shorter") }, label = { Text("➖ أقصر") })
                AssistChip(onClick = { onRefine("romantic") }, label = { Text("💘 أرومانسي") })
                AssistChip(onClick = { onRefine("simpler") }, label = { Text("🌿 أبسط") })
                AssistChip(onClick = onRemind, label = { Text("⏰ ذكّرني بكرة") })
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onWhatsApp,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                ) { Text(sendLabel) }
                FilledTonalButton(onClick = onGroup, modifier = Modifier.weight(1f)) {
                    Text("📣 منتقي")
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = onCopy, modifier = Modifier.weight(1f)) {
                    Text("📋 نسخ")
                }
                OutlinedButton(onClick = onShare, modifier = Modifier.weight(1f)) {
                    Text("🔗 مشاركة")
                }
                FilledTonalButton(onClick = onChoose, modifier = Modifier.weight(1f)) {
                    Text("👍 اختار")
                }
            }
        }
    }
}

@Composable
private fun EmptyState() {
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text("💌", style = MaterialTheme.typography.displayMedium)
        Text(
            "دوس \"اقتراح فوري\" وابدأ",
            style = MaterialTheme.typography.titleMedium,
        )
        Text(
            "كل ما تختار وتعدّل، الاقتراحات بتقرب أكتر من أسلوبك",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
