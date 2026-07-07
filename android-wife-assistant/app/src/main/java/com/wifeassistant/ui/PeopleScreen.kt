package com.wifeassistant.ui

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wifeassistant.data.GroqClient
import com.wifeassistant.data.PersonOccasion
import com.wifeassistant.data.PersonaAnalyzer
import com.wifeassistant.data.Recipient
import com.wifeassistant.data.Relations
import com.wifeassistant.data.Settings
import com.wifeassistant.util.ContactsReader
import kotlinx.coroutines.launch
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PeopleScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }

    val scope = rememberCoroutineScope()
    val analyzer = remember { PersonaAnalyzer(GroqClient(settings)) }

    var people by remember { mutableStateOf(settings.recipients) }
    var name by remember { mutableStateOf("") }
    var relation by remember { mutableStateOf(Relations.ALL.first().id) }
    var number by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var occText by remember { mutableStateOf("") }
    var social by remember { mutableStateOf("") }
    var pasteInfo by remember { mutableStateOf("") }
    var analyzing by remember { mutableStateOf(false) }
    var editingId by remember { mutableStateOf<String?>(null) }

    // ---- استيراد أعياد الميلاد من جهات الاتصال ----
    var contacts by remember { mutableStateOf<List<ContactsReader.ContactBirthday>>(emptyList()) }
    var showContacts by remember { mutableStateOf(false) }
    fun loadContacts() {
        contacts = runCatching { ContactsReader.withBirthdays(context) }.getOrDefault(emptyList())
        showContacts = true
        if (contacts.isEmpty()) {
            Toast.makeText(context, "مفيش جهات اتصال بأعياد ميلاد مسجّلة", Toast.LENGTH_LONG).show()
        }
    }
    val contactsPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) loadContacts()
        else Toast.makeText(context, "محتاج إذن جهات الاتصال عشان أستورد المواعيد", Toast.LENGTH_LONG).show()
    }
    fun openContacts() {
        val granted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.READ_CONTACTS
        ) == PackageManager.PERMISSION_GRANTED
        if (granted) loadContacts() else contactsPermission.launch(Manifest.permission.READ_CONTACTS)
    }

    fun clearForm() {
        name = ""; number = ""; notes = ""; occText = ""; social = ""; pasteInfo = ""
        relation = Relations.ALL.first().id; editingId = null
    }

    // تحليل المعلومات الملصوقة بالـ LLM وملء الحقول (المستخدم يراجع قبل الحفظ).
    fun analyze() {
        if (social.isBlank() && pasteInfo.isBlank()) {
            Toast.makeText(context, "حط رابط أو الصق معلومات عنه الأول", Toast.LENGTH_SHORT).show()
            return
        }
        analyzing = true
        scope.launch {
            try {
                val res = analyzer.analyze(Relations.labelOf(relation), name, social, pasteInfo)
                if (name.isBlank() && res.nickname.isNotBlank()) name = res.nickname
                val extra = listOfNotNull(
                    res.notes.ifBlank { null },
                    res.interests.ifBlank { null }?.let { "بيحب: $it" },
                    res.toneHint.ifBlank { null }?.let { "نبرة مناسبة: $it" },
                ).joinToString("\n")
                notes = listOf(notes.trim(), extra).filter { it.isNotBlank() }.joinToString("\n")
                if (res.occasions.isNotEmpty()) {
                    val lines = res.occasions.joinToString("\n") { "${it.label}=${it.date}" }
                    occText = listOf(occText.trim(), lines).filter { it.isNotBlank() }.joinToString("\n")
                }
                Toast.makeText(context, "تم التحليل ✅ راجع وعدّل قبل الحفظ", Toast.LENGTH_LONG).show()
            } catch (e: Exception) {
                Toast.makeText(context, "التحليل مش متاح دلوقتي (محتاج نت + مفتاح Groq)", Toast.LENGTH_LONG).show()
            }
            analyzing = false
        }
    }

    fun save() {
        if (name.isBlank()) {
            Toast.makeText(context, "اكتب الاسم الأول", Toast.LENGTH_SHORT).show()
            return
        }
        val occs = parseOccasions(occText)
        val list = people.toMutableList()
        val id = editingId
        if (id == null) {
            list.add(
                Recipient(
                    id = UUID.randomUUID().toString(), name = name.trim(), relation = relation,
                    number = number.trim(), notes = notes.trim(), occasions = occs, social = social.trim(),
                )
            )
        } else {
            val i = list.indexOfFirst { it.id == id }
            if (i >= 0) list[i] = list[i].copy(
                name = name.trim(), relation = relation, number = number.trim(),
                notes = notes.trim(), occasions = occs, social = social.trim(),
            )
        }
        settings.recipients = list
        if (settings.selectedRecipientId.isBlank()) settings.selectedRecipientId = list.first().id
        people = list
        clearForm()
        Toast.makeText(context, "اتحفظ ✅", Toast.LENGTH_SHORT).show()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("الأشخاص 👨‍👩‍👧‍👦") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "رجوع")
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
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text(
                if (editingId == null) "إضافة شخص" else "تعديل شخص",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
            )
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("الاسم أو الدلع") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            Text("العلاقة", style = MaterialTheme.typography.bodyMedium)
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Relations.ALL.forEach { rel ->
                    FilterChip(
                        selected = relation == rel.id,
                        onClick = { relation = rel.id },
                        label = { Text("${rel.emoji} ${rel.label}") },
                    )
                }
            }
            // معاينة حيّة: نبرة الرسالة بتتغيّر حسب العلاقة المختارة.
            Relations.byId(relation).let { rel ->
                Text(
                    "نبرة الرسالة لـ${rel.label}: ${rel.tone}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            OutlinedTextField(
                value = number,
                onValueChange = { number = it },
                label = { Text("رقم واتساب (اختياري، دولي بأرقام)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("حاجات عنه (بيحب إيه، ذكريات، نكت بينكم)") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = occText,
                onValueChange = { occText = it },
                label = { Text("مناسباته (سطر لكل واحدة: عيد ميلاد=08-24)") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth(),
            )

            // ---- تحليل الشخصية بالذكاء (من معلومات انت بتجيبها، مش سحب تلقائي) ----
            HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
            Text(
                "تحليل بالذكاء 🧠",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
            )
            OutlinedTextField(
                value = social,
                onValueChange = { social = it },
                label = { Text("روابط تواصله (سطر لكل رابط - مرجع سريع)") },
                minLines = 1,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = pasteInfo,
                onValueChange = { pasteInfo = it },
                label = { Text("الصق معلومات عنه (البايو/بوست/رسايل/اهتماماته)") },
                minLines = 3,
                modifier = Modifier.fillMaxWidth(),
            )
            Text(
                "بنحلّل اللي انت بتلصقه بس. الذكاء يكمّل الملف والمناسبات، وانت تراجع قبل الحفظ.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            FilledTonalButton(
                onClick = { analyze() },
                enabled = !analyzing,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (analyzing) {
                    CircularProgressIndicator(modifier = Modifier.size(18.dp))
                    Text("  بحلّل...")
                } else {
                    Text("🧠 حلّل وكمّل الملف")
                }
            }
            OutlinedButton(onClick = { openContacts() }, modifier = Modifier.fillMaxWidth()) {
                Text("📇 استورد عيد ميلاد من جهات الاتصال")
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { save() }, modifier = Modifier.weight(1f)) {
                    Text(if (editingId == null) "➕ إضافة" else "💾 حفظ التعديل")
                }
                if (editingId != null) {
                    OutlinedButton(onClick = { clearForm() }) { Text("إلغاء") }
                }
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
            Text(
                "أشخاصك",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
            )
            if (people.isEmpty()) {
                Text(
                    "لسه مفيش حد. ضيف أول شخص عشان تبدأ تكتب له.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            people.forEach { p ->
                val selected = p.id == settings.selectedRecipientId
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Text(
                            (if (selected) "✅ " else "") + Relations.emojiOf(p.relation) + " " +
                                (p.name.ifBlank { "(بدون اسم)" }) + " · " + Relations.labelOf(p.relation),
                            style = MaterialTheme.typography.titleSmall,
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(
                                onClick = {
                                    settings.selectedRecipientId = p.id
                                    onBack()
                                },
                                modifier = Modifier.weight(1f),
                            ) { Text("اختار") }
                            OutlinedButton(onClick = {
                                name = p.name; relation = p.relation; number = p.number; notes = p.notes
                                occText = p.occasions.joinToString("\n") { "${it.label}=${it.date}" }
                                social = p.social; pasteInfo = ""
                                editingId = p.id
                            }) { Text("تعديل") }
                            TextButton(onClick = {
                                val list = people.toMutableList()
                                list.removeAll { it.id == p.id }
                                settings.recipients = list
                                if (settings.selectedRecipientId == p.id) {
                                    settings.selectedRecipientId = list.firstOrNull()?.id ?: ""
                                }
                                people = list
                            }) { Text("حذف") }
                        }
                    }
                }
            }

            // نافذة اختيار جهة اتصال بعيد ميلاد لملء الفورمة (المستخدم يراجع ويحفظ).
            if (showContacts && contacts.isNotEmpty()) {
                AlertDialog(
                    onDismissRequest = { showContacts = false },
                    title = { Text("استورد عيد ميلاد 📇") },
                    text = {
                        Column(
                            modifier = Modifier.verticalScroll(rememberScrollState()),
                            verticalArrangement = Arrangement.spacedBy(2.dp),
                        ) {
                            contacts.take(50).forEach { cb ->
                                TextButton(onClick = {
                                    if (name.isBlank()) name = cb.name
                                    if (number.isBlank() && cb.number.isNotBlank()) number = cb.number
                                    val line = "عيد ميلاد=${cb.mmdd}"
                                    occText = listOf(occText.trim(), line)
                                        .filter { it.isNotBlank() }.joinToString("\n")
                                    showContacts = false
                                    Toast.makeText(context, "اتضاف - راجع واحفظ ✅", Toast.LENGTH_SHORT).show()
                                }) { Text("🎂 ${cb.name} · ${cb.mmdd}") }
                            }
                        }
                    },
                    confirmButton = {
                        TextButton(onClick = { showContacts = false }) { Text("إغلاق") }
                    },
                )
            }
        }
    }
}

// تحويل نص "الاسم=MM-DD" (سطر لكل مناسبة) لقائمة مناسبات.
private fun parseOccasions(text: String): List<PersonOccasion> {
    val re = Regex("^\\d{2}-\\d{2}$")
    return text.split("\n").mapNotNull { line ->
        val t = line.trim()
        if (t.isEmpty()) return@mapNotNull null
        val idx = t.lastIndexOf('=')
        if (idx <= 0) return@mapNotNull null
        val label = t.substring(0, idx).trim()
        val date = t.substring(idx + 1).trim()
        if (label.isEmpty() || !re.matches(date)) null else PersonOccasion(label, date)
    }
}
