package com.wifeassistant.ui

import android.widget.Toast
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
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.wifeassistant.data.AppConstants
import com.wifeassistant.data.BackupManager
import com.wifeassistant.data.Settings
import com.wifeassistant.util.Share
import com.wifeassistant.work.Scheduler

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }

    var groqKey by remember { mutableStateOf(settings.groqKey) }
    var myName by remember { mutableStateOf(settings.myName) }
    var humor by remember { mutableStateOf(settings.humor) }
    var emoji by remember { mutableStateOf(settings.emoji) }
    var messageLength by remember { mutableStateOf(settings.messageLength) }
    var model by remember { mutableStateOf(settings.model) }
    var morning by remember { mutableStateOf(settings.morningTime) }
    var evening by remember { mutableStateOf(settings.eveningTime) }
    var showRestore by remember { mutableStateOf(false) }
    var restoreText by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("الإعدادات") },
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
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Section("الأساسيات")
            OutlinedTextField(
                value = groqKey,
                onValueChange = { groqKey = it },
                label = { Text("مفتاح Groq (console.groq.com/keys)") },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            Section("عنك")
            OutlinedTextField(
                value = myName,
                onValueChange = { myName = it },
                label = { Text("اسمك") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            Text(
                "الأشخاص وأرقامهم بتتظبط من شاشة \"الأشخاص\" في الصفحة الرئيسية.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Section("نبرة الرسالة")
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("لمسة دُعابة خفيفة", modifier = Modifier.weight(1f))
                Switch(checked = humor, onCheckedChange = { humor = it })
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("إيموجي معبّر في الرسالة", modifier = Modifier.weight(1f))
                Switch(checked = emoji, onCheckedChange = { emoji = it })
            }
            Text("طول الرسالة", style = MaterialTheme.typography.bodyMedium)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AppConstants.LENGTHS.forEach { (id, label) ->
                    FilterChip(
                        selected = messageLength == id,
                        onClick = { messageLength = id },
                        label = { Text(label) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }

            Section("موديل الذكاء (Groq مجاني)")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AppConstants.MODELS.forEach { (id, label) ->
                    FilterChip(
                        selected = model == id,
                        onClick = { model = id },
                        label = { Text(label) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }

            Section("مواعيد الاقتراحات")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = morning,
                    onValueChange = { morning = it },
                    label = { Text("الصباح HH:mm") },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
                OutlinedTextField(
                    value = evening,
                    onValueChange = { evening = it },
                    label = { Text("المساء HH:mm") },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
            }

            Section("نسخة احتياطية واستعادة")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = { Share.text(context, BackupManager.export(context)) },
                    modifier = Modifier.weight(1f),
                ) { Text("📤 نسخة احتياطية") }
                OutlinedButton(
                    onClick = { restoreText = ""; showRestore = true },
                    modifier = Modifier.weight(1f),
                ) { Text("📥 استعادة") }
            }
            Text(
                "النسخة مفيهاش مفتاح Groq (سر). احفظها في مكان أمين واستعيدها لأي جهاز.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Button(
                onClick = {
                    settings.groqKey = groqKey.trim()
                    settings.myName = myName.trim()
                    settings.humor = humor
                    settings.emoji = emoji
                    settings.messageLength = messageLength
                    settings.model = model
                    settings.morningTime = morning.trim()
                    settings.eveningTime = evening.trim()
                    Scheduler.scheduleDaily(context)
                    Toast.makeText(context, "اتحفظ ✅", Toast.LENGTH_SHORT).show()
                    onBack()
                },
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
            ) { Text("💾 حفظ") }

            if (showRestore) {
                AlertDialog(
                    onDismissRequest = { showRestore = false },
                    title = { Text("استعادة نسخة") },
                    text = {
                        OutlinedTextField(
                            value = restoreText,
                            onValueChange = { restoreText = it },
                            label = { Text("الصق نص النسخة الاحتياطية هنا") },
                            minLines = 4,
                            modifier = Modifier.fillMaxWidth(),
                        )
                    },
                    confirmButton = {
                        TextButton(onClick = {
                            val ok = BackupManager.import(context, restoreText)
                            showRestore = false
                            Toast.makeText(
                                context,
                                if (ok) "اتستعادت ✅ — أعد فتح التطبيق" else "النص مش صحيح",
                                Toast.LENGTH_LONG,
                            ).show()
                            if (ok) onBack()
                        }) { Text("استعادة") }
                    },
                    dismissButton = {
                        TextButton(onClick = { showRestore = false }) { Text("إلغاء") }
                    },
                )
            }
        }
    }
}

@Composable
private fun Section(title: String) {
    HorizontalDivider(modifier = Modifier.padding(top = 8.dp))
    Text(
        title,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
    )
}
