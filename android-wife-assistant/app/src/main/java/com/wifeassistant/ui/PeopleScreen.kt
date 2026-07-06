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
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wifeassistant.data.PersonOccasion
import com.wifeassistant.data.Recipient
import com.wifeassistant.data.Relations
import com.wifeassistant.data.Settings
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PeopleScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }

    var people by remember { mutableStateOf(settings.recipients) }
    var name by remember { mutableStateOf("") }
    var relation by remember { mutableStateOf(Relations.ALL.first().id) }
    var number by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var occText by remember { mutableStateOf("") }
    var editingId by remember { mutableStateOf<String?>(null) }

    fun clearForm() {
        name = ""; number = ""; notes = ""; occText = ""; relation = Relations.ALL.first().id; editingId = null
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
            list.add(Recipient(UUID.randomUUID().toString(), name.trim(), relation, number.trim(), notes.trim(), occs))
        } else {
            val i = list.indexOfFirst { it.id == id }
            if (i >= 0) list[i] = list[i].copy(
                name = name.trim(), relation = relation, number = number.trim(),
                notes = notes.trim(), occasions = occs,
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
                        label = { Text(rel.label) },
                    )
                }
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
