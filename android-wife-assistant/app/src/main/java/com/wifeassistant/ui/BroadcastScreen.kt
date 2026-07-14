package com.wifeassistant.ui

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.wifeassistant.data.BroadcastGroup
import com.wifeassistant.data.GroupMember
import com.wifeassistant.data.Settings
import com.wifeassistant.util.ContactsReader
import com.wifeassistant.util.Csv
import com.wifeassistant.util.WhatsApp

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
    var activeList by remember { mutableStateOf<List<ContactsReader.ContactNumber>>(emptyList()) }
    var loaded by remember { mutableStateOf(false) }
    var groups by remember { mutableStateOf(settings.broadcastGroups) }
    val selected = remember { mutableStateListOf<String>() }
    var groupName by remember { mutableStateOf("") }
    var groupKind by remember { mutableStateOf("work") }
    var unknownNum by remember { mutableStateOf("") }

    fun toast(m: String) = Toast.makeText(context, m, Toast.LENGTH_LONG).show()
    fun personalize(name: String): String =
        template.replace("{الاسم}", name).replace("{name}", name).trim()

    fun loadContacts() {
        activeList = runCatching { ContactsReader.allWithNumbers(context) }.getOrDefault(emptyList())
        loaded = true
        selected.clear()
        if (activeList.isEmpty()) toast("مفيش جهات اتصال بأرقام")
    }
    val permission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) loadContacts() else toast("محتاج إذن جهات الاتصال")
    }
    fun openContacts() {
        val ok = ContextCompat.checkSelfPermission(context, Manifest.permission.READ_CONTACTS) == PackageManager.PERMISSION_GRANTED
        if (ok) loadContacts() else permission.launch(Manifest.permission.READ_CONTACTS)
    }
    val csvLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) {
            val text = runCatching {
                context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() }
            }.getOrNull().orEmpty()
            val rows = Csv.parse(text)
            activeList = rows.map { ContactsReader.ContactNumber(it.name, it.number) }
            loaded = true
            selected.clear()
            toast(if (rows.isEmpty()) "الملف فاضي أو غير مقروء" else "اتحمّل ${rows.size} جهة ✅")
        }
    }

    fun kindEmoji(k: String) = when (k) {
        "work" -> "💼"; "project" -> "🚀"; "family" -> "👨‍👩‍👧‍👦"; "friends" -> "🧑‍🤝‍🧑"; "clients" -> "🤝"; else -> "📇"
    }
    fun saveGroup() {
        val nm = groupName.trim()
        if (nm.isBlank()) { toast("اكتب اسم المجموعة"); return }
        val chosen = if (selected.isNotEmpty()) activeList.filter { selected.contains(it.number) } else activeList
        if (chosen.isEmpty()) { toast("مفيش أعضاء للحفظ"); return }
        val g = BroadcastGroup(
            id = "g" + System.currentTimeMillis(), name = nm, kind = groupKind,
            members = chosen.map { GroupMember(it.name, it.number) },
        )
        groups = groups + g
        settings.broadcastGroups = groups
        groupName = ""
        toast("اتحفظت المجموعة (${chosen.size}) ✅")
    }
    fun loadGroup(g: BroadcastGroup) {
        activeList = g.members.map { ContactsReader.ContactNumber(it.name, it.number) }
        loaded = true
        selected.clear()
    }
    fun deleteGroup(g: BroadcastGroup) {
        groups = groups.filterNot { it.id == g.id }
        settings.broadcastGroups = groups
    }

    val filtered = activeList.filter { query.isBlank() || it.name.contains(query.trim(), ignoreCase = true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("مجموعات وإرسال 📣") },
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
            // كود الدولة + نص الرسالة
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = cc,
                    onValueChange = { cc = it.filter { ch -> ch.isDigit() }; settings.defaultCountryCode = cc },
                    label = { Text("كود الدولة") },
                    singleLine = true,
                    modifier = Modifier.width(120.dp),
                )
                Text(
                    "الأرقام المستوردة من غير مقدمة بنكمّلها بالكود ده تلقائياً.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
            OutlinedTextField(
                value = template,
                onValueChange = { template = it },
                label = { Text("نص الرسالة (استخدم {الاسم} مكان اسم الشخص)") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth(),
            )
            Text(
                "بيتبعت واحد واحد بضغطة منك — بيفتح شات كل شخص والرسالة جاهزة باسمه وانت تدوس Send. مفيش إرسال تلقائي.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            // إرسال لرقم مش متسجّل
            ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("✉️ رقم مش متسجّل", fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = unknownNum,
                            onValueChange = { unknownNum = it },
                            label = { Text("رقم الموبايل") },
                            singleLine = true,
                            modifier = Modifier.weight(1f),
                        )
                        Button(onClick = {
                            if (unknownNum.filter { it.isDigit() }.isEmpty()) toast("اكتب الرقم")
                            else WhatsApp.send(context, unknownNum, personalize(""), cc)
                        }) { Text("📲 ابعت") }
                    }
                }
            }

            // مجموعات محفوظة
            if (groups.isNotEmpty()) {
                Text("مجموعاتك", style = MaterialTheme.typography.labelLarge)
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
                Button(onClick = { openContacts() }, modifier = Modifier.weight(1f)) { Text("📇 جهات الاتصال") }
                OutlinedButton(onClick = { csvLauncher.launch("*/*") }, modifier = Modifier.weight(1f)) { Text("📁 استيراد CSV") }
            }

            if (loaded) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    label = { Text("دوّر على اسم") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                val selCount = if (selected.isEmpty()) filtered.size else selected.size
                Text(
                    "${filtered.size} جهة · هيتحفظ في المجموعة: $selCount",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                )

                // حفظ كمجموعة
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("💾 احفظ كمجموعة", fontWeight = FontWeight.Bold)
                        Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            listOf("work" to "شغل", "project" to "مشروع", "family" to "أسرة", "friends" to "أصحاب", "clients" to "عملاء").forEach { (id, label) ->
                                FilterChip(selected = groupKind == id, onClick = { groupKind = id }, label = { Text("${kindEmoji(id)} $label") })
                            }
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = groupName,
                                onValueChange = { groupName = it },
                                label = { Text("اسم المجموعة") },
                                singleLine = true,
                                modifier = Modifier.weight(1f),
                            )
                            Button(onClick = { saveGroup() }) { Text("حفظ") }
                        }
                    }
                }

                filtered.take(300).forEach { c ->
                    val isSel = selected.contains(c.number)
                    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                                Checkbox(checked = isSel, onCheckedChange = {
                                    if (isSel) selected.remove(c.number) else selected.add(c.number)
                                })
                                Text(c.name, fontWeight = FontWeight.Bold)
                            }
                            Text(
                                personalize(c.name),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            OutlinedButton(
                                onClick = { WhatsApp.send(context, c.number, personalize(c.name), cc) },
                                modifier = Modifier.fillMaxWidth(),
                            ) { Text("📲 ابعت لـ${c.name}") }
                        }
                    }
                }
            }
        }
    }
}
