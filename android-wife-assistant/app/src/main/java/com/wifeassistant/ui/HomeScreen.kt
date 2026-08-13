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
import androidx.compose.material3.CardDefaults
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.runtime.LaunchedEffect
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
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
import com.wifeassistant.data.t
import com.wifeassistant.ui.theme.GradientButton
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
    onOpenReply: () -> Unit = {},
    onOpenPolish: () -> Unit = {},
) {
    val state by vm.state.collectAsStateWithLifecycle()
    val people by vm.people.collectAsStateWithLifecycle()
    val ideas by vm.ideas.collectAsStateWithLifecycle()
    val next by vm.nextAction.collectAsStateWithLifecycle()
    val streak by vm.streak.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current
    var edited by remember { mutableStateOf("") }
    var selectedIntent by remember { mutableStateOf<String?>(null) }
    var contextText by remember { mutableStateOf("") }
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // إشعار شفافية الذكاء (مرة واحدة): مسؤولية + خصوصية قبل أول استخدام.
    val settings = remember { com.wifeassistant.data.Settings(context) }
    var showAiNotice by remember { mutableStateOf(!settings.aiNoticeAck) }
    if (showAiNotice) {
        AlertDialog(
            onDismissRequest = { }, // لازم يقر بيها عشان نضمن إنه شافها
            title = { Text(t("شفافية الذكاء الاصطناعي 🤖", "AI transparency 🤖")) },
            text = {
                Text(
                    t(
                        "• الاقتراحات بيكتبها ذكاء اصطناعي — راجعها وعدّلها قبل ما تبعت.\n" +
                            "• لما تطلب توليد، بيتبعت نص الموقف/السياق لمزوّد الذكاء (Groq) عشان يجهّز الرسالة.\n" +
                            "• بياناتك وتعلّم أسلوبك متخزّنين على جهازك بس، ومفتاح Groq مشفّر.\n" +
                            "• مفيش أي رسالة بتتبعت تلقائيًا — الضغطة الأخيرة دايمًا بإيدك.",
                        "• Suggestions are written by AI — review and tweak them before you send.\n" +
                            "• When you ask for a suggestion, the situation/context text goes to the AI provider (Groq) to craft the message.\n" +
                            "• Your data and style learning stay on your device only, and your Groq key is encrypted.\n" +
                            "• Nothing is ever sent automatically — the final tap is always yours.",
                    ),
                    style = MaterialTheme.typography.bodyMedium,
                )
            },
            confirmButton = {
                Button(onClick = { settings.aiNoticeAck = true; showAiNotice = false }) { Text(t("فهمت 👍", "Got it 👍")) }
            },
        )
    }

    // كل ما نرجع للشاشة نحدّث قائمة الأشخاص (ممكن اتغيّرت من شاشة الأشخاص).
    LaunchedEffect(Unit) { vm.refreshRecipients() }
    val current = people.current

    // ---- تقويم الموبايل (Google Calendar وغيره) ----
    var calEvents by remember { mutableStateOf<List<String>>(emptyList()) }
    var showCal by remember { mutableStateOf(false) }
    fun loadCalendar() {
        // قراءة التقويم في الخلفية (IO) — عشان ما نهنّجش الواجهة.
        scope.launch {
            val titles = withContext(Dispatchers.IO) { CalendarReader.events(context).map { it.title } }
            calEvents = titles
            showCal = true
        }
    }
    val calPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) loadCalendar()
        else Toast.makeText(context, t("محتاج إذن التقويم عشان أقرأ أجندتك", "I need calendar permission to read your agenda"), Toast.LENGTH_LONG).show()
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
                title = { Text(t("وصال 💗", "Wesal 💗"), fontWeight = FontWeight.Bold) },
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
            StreakCard(streak)
            next?.let { na -> NextActionCard(na) { vm.writeToNext(na) } }
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
                label = { Text(t("إيه المناسبة أو اللي حصل؟ (اختياري)", "What's the occasion, or what happened? (optional)")) },
                modifier = Modifier.fillMaxWidth(),
                minLines = 1,
            )

            // أزرار التوليد
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                GradientButton(
                    onClick = { vm.generate("manual", intentId = selectedIntent, context = contextText.trim()) },
                    modifier = Modifier.weight(1f),
                ) {
                    Text(if (selectedIntent != null) t("✨ اكتب الرسالة", "✨ Write the message") else t("✨ اقتراح فوري", "✨ Instant suggestion"))
                }
                FilledTonalButton(onClick = { vm.requestOccasion() }, modifier = Modifier.weight(1f)) {
                    Text(t("💌 مناسبة", "💌 Occasion"))
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = { vm.generate("morning", intentId = selectedIntent, context = contextText.trim()) },
                    modifier = Modifier.weight(1f),
                ) {
                    Text(t("🌅 صباحي", "🌅 Morning"))
                }
                OutlinedButton(
                    onClick = { vm.generate("evening", intentId = selectedIntent, context = contextText.trim()) },
                    modifier = Modifier.weight(1f),
                ) {
                    Text(t("🌙 مسائي", "🌙 Evening"))
                }
            }
            OutlinedButton(onClick = { openCalendar() }, modifier = Modifier.fillMaxWidth()) {
                Text(t("📅 مناسبة من أجندتي", "📅 From my calendar"))
            }
            OutlinedButton(onClick = onOpenReply, modifier = Modifier.fillMaxWidth()) {
                Text(t("💬 رد ذكي على رسالة وصلتك", "💬 Smart reply to a message"))
            }
            OutlinedButton(onClick = onOpenPolish, modifier = Modifier.fillMaxWidth()) {
                Text(t("✨ حسّن رسالتي قبل ما أبعتها", "✨ Polish my draft before sending"))
            }
            OutlinedButton(onClick = onOpenBroadcast, modifier = Modifier.fillMaxWidth()) {
                Text(t("📣 رسالة جماعية لجهات الاتصال", "📣 Group message to contacts"))
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
                    title = { Text(t("من أجندتك النهاردة 📅", "From your calendar today 📅")) },
                    text = {
                        if (calEvents.isEmpty()) {
                            Text(t("مفيش أحداث النهاردة في تقويمك.", "No events on your calendar today."))
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
                        TextButton(onClick = { showCal = false }) { Text(t("إغلاق", "Close")) }
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
                    Text(t("  بكتب لك اقتراحين...", "  Writing two suggestions for you..."), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            state.occasionLabel?.let {
                Text(t("💝 مناسبة: ", "💝 Occasion: ") + it, style = MaterialTheme.typography.titleMedium)
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
                        val who = current?.let { it.name.ifBlank { Relations.labelOf(it.relation) } } ?: t("حد بتحبه", "someone you love")
                        SendReminder.schedule(context, who, item.text, "tomorrow_morning")
                        Toast.makeText(context, t("هفكّرك بكرة الصبح ⏰", "I'll remind you tomorrow morning ⏰"), Toast.LENGTH_SHORT).show()
                    },
                )
            }

            if (state.items.isNotEmpty()) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { vm.regenerate() }, modifier = Modifier.weight(1f)) {
                        Text(t("🔄 جديد", "🔄 Fresh"))
                    }
                    OutlinedButton(onClick = { vm.ignore() }, modifier = Modifier.weight(1f)) {
                        Text(t("🙈 تجاهل", "🙈 Skip"))
                    }
                }
                OutlinedTextField(
                    value = edited,
                    onValueChange = { edited = it },
                    label = { Text(t("عدّل بنفسك واحفظه لأسلوبك", "Edit it yourself and save it to your style")) },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                )
                GradientButton(
                    onClick = { vm.edit(edited); edited = "" },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text(t("💾 احفظ نسختي المعدّلة", "💾 Save my edited version")) }
            } else if (!state.loading) {
                EmptyState()
            }

            Spacer(Modifier.height(24.dp))
        }

        // نافذة أفكار المناسبة (هدية/كارت/ورد/لمسة).
        if (ideas.open) {
            AlertDialog(
                onDismissRequest = { vm.closeIdeas() },
                title = { Text(t("🎁 أفكار لـ", "🎁 Ideas for ") + ideas.title) },
                text = {
                    if (ideas.loading) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            CircularProgressIndicator(modifier = Modifier.height(22.dp))
                            Text(t("  بجهّزلك أفكار...", "  Getting ideas ready..."))
                        }
                    } else {
                        Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                            Text(ideas.text)
                            Spacer(Modifier.height(8.dp))
                            Text(
                                t("دي أفكار وفئة سعرية تقريبية - مش أسعار حقيقية لحظية.", "These are ideas with rough price ranges — not live prices."),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                },
                confirmButton = { TextButton(onClick = { vm.closeIdeas() }) { Text(t("تمام", "Done")) } },
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
    val context = LocalContext.current
    val settings = remember { com.wifeassistant.data.Settings(context) }
    var muted by remember { mutableStateOf(settings.mutedOccasions.toSet()) }

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
            Text(t("🎀 مناسبات جايّة", "🎀 Upcoming occasions"), style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
            upcoming.forEach { u ->
                val whenTxt = when (u.days) {
                    0 -> t("النهاردة", "today")
                    1 -> t("بكرة", "tomorrow")
                    else -> t("بعد ${u.days} يوم", "in ${u.days} days")
                }
                val key = u.rid + "|" + u.label
                val isMuted = muted.contains(key)
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        t("${u.label} لـ${u.name} · $whenTxt", "${u.label} for ${u.name} · $whenTxt") + if (isMuted) "  🔕" else "",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        AssistChip(onClick = { onWrite(u.rid, u.label) }, label = { Text(t("✍️ اكتب", "✍️ Write")) })
                        AssistChip(onClick = { onIdeas(u.rid, u.label) }, label = { Text(t("🎁 أفكار", "🎁 Ideas")) })
                        AssistChip(
                            onClick = {
                                muted = if (isMuted) muted - key else muted + key
                                settings.mutedOccasions = muted.toList()
                            },
                            label = { Text(if (isMuted) t("🔔 تفعيل التنبيه", "🔔 Unmute") else t("🔕 كتم", "🔕 Mute")) },
                        )
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
                    t("✍️ بتكتب لـ", "✍️ Writing to"),
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                )
                TextButton(onClick = onManage) { Text(t("إدارة الأشخاص", "Manage people")) }
            }
            if (people.recipients.isEmpty()) {
                Text(
                    t("لسه مفيش حد. ضيف أول شخص عشان تبدأ.", "No one yet. Add your first person to begin."),
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
                    AssistChip(onClick = onManage, label = { Text(t("＋ شخص", "＋ Person")) })
                }
                people.current?.let { r ->
                    Text(
                        t("النبرة: ", "Tone: ") + Relations.byId(r.relation).tone,
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
            t("نيّة الرسالة (اختياري)", "Message intent (optional)"),
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
        in 5..11 -> t("صباح الخير 🌅", "Good morning 🌅")
        in 12..16 -> t("نهارك سعيد ☀️", "Have a lovely day ☀️")
        in 17..21 -> t("مساء الخير 🌙", "Good evening 🌙")
        else -> t("سهرة هنيّة ✨", "Sweet night ✨")
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
                if (who != null) t("مين تحب تطمّن عليه؟ ابعت لـ$who بكلمة حلوة 💗", "Who needs to hear from you? Send $who a kind word 💗")
                else t("مين تحب تفاجئه بكلمة حلوة النهاردة؟ 💗", "Who will you surprise with a kind word today? 💗"),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimary,
            )
        }
    }
}

// 🔥 «سلسلة الدفء»: كام يوم متتالي وانت بتوصّل حب — تحفيز لطيف يحافظ على العادة.
// بتظهر بس لما فيه سلسلة فعلاً (مفيش تأنيب لو مفيش).
@Composable
private fun StreakCard(streak: Int) {
    if (streak < 1) return
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                Brush.horizontalGradient(
                    listOf(
                        MaterialTheme.colorScheme.tertiaryContainer,
                        MaterialTheme.colorScheme.primaryContainer,
                    ),
                ),
                RoundedCornerShape(20.dp),
            )
            .padding(horizontal = 16.dp, vertical = 12.dp),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("🔥", style = MaterialTheme.typography.headlineMedium)
            Column {
                Text(
                    if (streak == 1) t("يوم دفء متواصل", "1 warm day in a row") else t("$streak يوم دفء متواصل", "$streak warm days in a row"),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                )
                Text(
                    com.wifeassistant.data.Streak.message(streak),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            }
        }
    }
}

// 💡 اللفتة الجاية: البرنامج بيرشّح مين تطمّن عليه (مناسبة قريّبة أو بقالك فترة) بضغطة كتابة.
@Composable
private fun NextActionCard(a: NextAction, onWrite: () -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.elevatedCardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer,
        ),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    t("💡 اللفتة الجاية", "💡 Next gesture"),
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSecondaryContainer,
                )
                Text(
                    a.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSecondaryContainer,
                )
                Text(
                    a.reason,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSecondaryContainer,
                )
            }
            FilledTonalButton(onClick = onWrite) { Text(t("✍️ اكتبله", "✍️ Write to them")) }
        }
    }
}

// نص زر الواتساب حسب الشخص المختار: "ابعت لأمي"، "ابعت لسوسو"، أو "ابعت للعيلة".
private fun sendLabelFor(current: Recipient?): String {
    if (current == null) return t("📲 إرسال واتساب", "📲 Send on WhatsApp")
    val rel = Relations.byId(current.relation)
    val who = current.name.ifBlank { rel.label }
    return if (current.relation.startsWith("group")) t("📣 ابعت لـ$who", "📣 Send to $who") else t("📲 ابعت لـ$who", "📲 Send to $who")
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
                AssistChip(onClick = { onRefine("longer") }, label = { Text(t("➕ أطول", "➕ Longer")) })
                AssistChip(onClick = { onRefine("shorter") }, label = { Text(t("➖ أقصر", "➖ Shorter")) })
                AssistChip(onClick = { onRefine("romantic") }, label = { Text(t("💘 أرومانسي", "💘 More romantic")) })
                AssistChip(onClick = { onRefine("simpler") }, label = { Text(t("🌿 أبسط", "🌿 Simpler")) })
                AssistChip(onClick = onRemind, label = { Text(t("⏰ ذكّرني بكرة", "⏰ Remind me tomorrow")) })
            }

            // نبرة سريعة: نفس الرسالة بمزاج مختلف بضغطة واحدة.
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                AssistChip(onClick = { onRefine("playful") }, label = { Text(t("😄 مرح", "😄 Playful")) })
                AssistChip(onClick = { onRefine("serious") }, label = { Text(t("🎯 جاد", "🎯 Serious")) })
                AssistChip(onClick = { onRefine("apology") }, label = { Text(t("🕊️ اعتذار", "🕊️ Apology")) })
                AssistChip(onClick = { onRefine("grateful") }, label = { Text(t("🙏 امتنان", "🙏 Grateful")) })
                AssistChip(onClick = { onRefine("reassure") }, label = { Text(t("🫂 طمأنة", "🫂 Reassure")) })
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                GradientButton(
                    onClick = onWhatsApp,
                    modifier = Modifier.weight(1f),
                ) { Text(sendLabel) }
                FilledTonalButton(onClick = onGroup, modifier = Modifier.weight(1f)) {
                    Text(t("📣 منتقي", "📣 Picker"))
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = onCopy, modifier = Modifier.weight(1f)) {
                    Text(t("📋 نسخ", "📋 Copy"))
                }
                OutlinedButton(onClick = onShare, modifier = Modifier.weight(1f)) {
                    Text(t("🔗 مشاركة", "🔗 Share"))
                }
                FilledTonalButton(onClick = onChoose, modifier = Modifier.weight(1f)) {
                    Text(t("👍 اختار", "👍 Choose"))
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
            t("دوس \"اقتراح فوري\" وابدأ", "Tap \"Instant suggestion\" to begin"),
            style = MaterialTheme.typography.titleMedium,
        )
        Text(
            t("كل ما تختار وتعدّل، الاقتراحات بتقرب أكتر من أسلوبك", "Every pick and edit brings suggestions closer to your style"),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
