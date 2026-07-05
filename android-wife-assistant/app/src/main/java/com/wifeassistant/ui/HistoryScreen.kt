package com.wifeassistant.ui

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
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.unit.dp
import com.wifeassistant.data.Settings
import com.wifeassistant.data.Store
import com.wifeassistant.util.Share
import com.wifeassistant.util.WhatsApp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current
    // الرسايل اللي اخترتها/عدّلتها (فيها نص نهائي)، الأحدث الأول.
    val items = remember {
        Store(context).feedback()
            .filter { !it.finalText.isNullOrBlank() }
            .reversed()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("سجل الرسايل 📜") },
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
            if (items.isEmpty()) {
                Text(
                    "لسه مفيش رسايل محفوظة. أول ما تختار أو تعدّل اقتراح، هيظهر هنا عشان تعيد استخدامه.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }

            items.forEach { fb ->
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Text(
                            "${fb.date}  ·  ${fb.themesShown.firstOrNull() ?: ""}",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.primary,
                        )
                        Text(fb.finalText.orEmpty(), style = MaterialTheme.typography.bodyLarge)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { clipboard.setText(AnnotatedString(fb.finalText.orEmpty())) },
                                modifier = Modifier.weight(1f),
                            ) { Text("📋") }
                            OutlinedButton(
                                onClick = { Share.text(context, fb.finalText.orEmpty()) },
                                modifier = Modifier.weight(1f),
                            ) { Text("🔗") }
                            OutlinedButton(
                                onClick = { WhatsApp.send(context, Settings(context).wifeNumber, fb.finalText.orEmpty()) },
                                modifier = Modifier.weight(1f),
                            ) { Text("📲") }
                        }
                    }
                }
            }
        }
    }
}
