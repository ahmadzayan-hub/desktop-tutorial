package com.wifeassistant.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
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
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.wifeassistant.data.Settings
import com.wifeassistant.data.Suggestion
import com.wifeassistant.util.WhatsApp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(vm: HomeViewModel, onOpenSettings: () -> Unit, onOpenStats: () -> Unit) {
    val state by vm.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current
    var edited by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("مساعد الرسايل 💌") },
                actions = {
                    IconButton(onClick = onOpenStats) {
                        Icon(Icons.Filled.BarChart, contentDescription = "الإحصائيات")
                    }
                    IconButton(onClick = onOpenSettings) {
                        Icon(Icons.Filled.Settings, contentDescription = "الإعدادات")
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
            // أزرار التوليد الفوري
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.generate("manual") }, modifier = Modifier.weight(1f)) {
                    Text("اقتراح فوري")
                }
                OutlinedButton(onClick = { vm.requestOccasion() }, modifier = Modifier.weight(1f)) {
                    Text("مناسبة")
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = { vm.generate("morning") }, modifier = Modifier.weight(1f)) {
                    Text("🌅 صباحي")
                }
                OutlinedButton(onClick = { vm.generate("evening") }, modifier = Modifier.weight(1f)) {
                    Text("🌙 مسائي")
                }
            }

            if (state.loading) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                ) { CircularProgressIndicator() }
            }

            state.error?.let {
                Text("⚠️ $it", color = MaterialTheme.colorScheme.error)
            }
            state.info?.let {
                Text(it, color = MaterialTheme.colorScheme.primary)
            }

            state.occasionLabel?.let {
                Text("💌 مناسبة: $it", style = MaterialTheme.typography.titleMedium)
            }

            // الاقتراحين
            state.items.forEachIndexed { idx, item ->
                SuggestionCard(
                    index = idx,
                    item = item,
                    onChoose = { vm.choose(idx) },
                    onCopy = { clipboard.setText(AnnotatedString(item.text)) },
                    onWhatsApp = { WhatsApp.send(context, Settings(context).wifeNumber, item.text) },
                )
            }

            // أزرار الجولة (جديد / تجاهل)
            if (state.items.isNotEmpty()) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { vm.regenerate() }, modifier = Modifier.weight(1f)) {
                        Text("🔄 جديد")
                    }
                    OutlinedButton(onClick = { vm.ignore() }, modifier = Modifier.weight(1f)) {
                        Text("🙈 تجاهل")
                    }
                }

                // نسختك المعدّلة
                OutlinedTextField(
                    value = edited,
                    onValueChange = { edited = it },
                    label = { Text("عدّل بنفسك واحفظه لأسلوبك") },
                    modifier = Modifier.fillMaxWidth(),
                )
                Button(
                    onClick = {
                        vm.edit(edited)
                        edited = ""
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("احفظ نسختي المعدّلة") }
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun SuggestionCard(
    index: Int,
    item: Suggestion,
    onChoose: () -> Unit,
    onCopy: () -> Unit,
    onWhatsApp: () -> Unit,
) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text("${index + 1}️⃣ ${item.text}", style = MaterialTheme.typography.bodyLarge)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilledTonalButton(onClick = onWhatsApp, modifier = Modifier.weight(1f)) {
                    Text("📲 ابعت لمراتي")
                }
                OutlinedButton(onClick = onCopy) { Text("📋 نسخ") }
            }
            Button(onClick = onChoose, modifier = Modifier.fillMaxWidth()) {
                Text("اختار ده (احفظه لأسلوبي)")
            }
        }
    }
}
