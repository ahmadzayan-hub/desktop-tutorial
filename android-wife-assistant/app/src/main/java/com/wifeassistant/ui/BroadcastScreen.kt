package com.wifeassistant.ui

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.wifeassistant.util.ContactsReader
import com.wifeassistant.util.WhatsApp

// رسالة جماعية مخصّصة: التطبيق يجهّز الرسالة باسم كل جهة اتصال، وانت تبعت بضغطة
// لكل واحد (بيفتح شاته والرسالة جاهزة). مفيش إرسال تلقائي ولا بلاست - آمن ومشروع.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BroadcastScreen(onBack: () -> Unit) {
    val context = LocalContext.current

    var template by remember { mutableStateOf("كل سنة وانت طيّب يا {الاسم} 🌙🤍") }
    var query by remember { mutableStateOf("") }
    var contacts by remember { mutableStateOf<List<ContactsReader.ContactNumber>>(emptyList()) }
    var loaded by remember { mutableStateOf(false) }

    fun load() {
        contacts = runCatching { ContactsReader.allWithNumbers(context) }.getOrDefault(emptyList())
        loaded = true
        if (contacts.isEmpty()) {
            Toast.makeText(context, "مفيش جهات اتصال بأرقام", Toast.LENGTH_LONG).show()
        }
    }
    val permission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) load()
        else Toast.makeText(context, "محتاج إذن جهات الاتصال", Toast.LENGTH_LONG).show()
    }
    fun open() {
        val granted = ContextCompat.checkSelfPermission(
            context, Manifest.permission.READ_CONTACTS
        ) == PackageManager.PERMISSION_GRANTED
        if (granted) load() else permission.launch(Manifest.permission.READ_CONTACTS)
    }

    fun personalize(name: String): String =
        template.replace("{الاسم}", name).replace("{name}", name)

    val filtered = contacts.filter { query.isBlank() || it.name.contains(query.trim(), ignoreCase = true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("رسالة جماعية 📣") },
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
            OutlinedTextField(
                value = template,
                onValueChange = { template = it },
                label = { Text("نص الرسالة (استخدم {الاسم} مكان اسم الشخص)") },
                minLines = 2,
                modifier = Modifier.fillMaxWidth(),
            )
            Text(
                "بيتبعت واحد واحد بضغطة منك - بيفتح شات كل شخص والرسالة جاهزة باسمه، وانت تدوس Send. مفيش إرسال تلقائي.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            if (!loaded) {
                Button(onClick = { open() }, modifier = Modifier.fillMaxWidth()) {
                    Text("📇 حمّل جهات الاتصال")
                }
            } else {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    label = { Text("دوّر على اسم") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                Text(
                    "${filtered.size} جهة اتصال",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary,
                )
                filtered.take(300).forEach { c ->
                    ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(c.name, fontWeight = FontWeight.Bold)
                            Text(
                                personalize(c.name),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            OutlinedButton(
                                onClick = { WhatsApp.send(context, c.number, personalize(c.name)) },
                                modifier = Modifier.fillMaxWidth(),
                            ) { Text("📲 ابعت لـ${c.name}") }
                        }
                    }
                }
            }
        }
    }
}
