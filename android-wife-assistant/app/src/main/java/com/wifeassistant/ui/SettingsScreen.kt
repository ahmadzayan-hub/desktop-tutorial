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
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import android.widget.Toast
import com.wifeassistant.data.Settings
import com.wifeassistant.work.Scheduler

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }

    var groqKey by remember { mutableStateOf(settings.groqKey) }
    var wifeNumber by remember { mutableStateOf(settings.wifeNumber) }
    var morning by remember { mutableStateOf(settings.morningTime) }
    var evening by remember { mutableStateOf(settings.eveningTime) }

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
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            OutlinedTextField(
                value = groqKey,
                onValueChange = { groqKey = it },
                label = { Text("مفتاح Groq (من console.groq.com/keys)") },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = wifeNumber,
                onValueChange = { wifeNumber = it },
                label = { Text("رقم واتساب مراتك (دولي بأرقام، مثال 2010xxxxxxxx)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = morning,
                    onValueChange = { morning = it },
                    label = { Text("ميعاد الصباح HH:mm") },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
                OutlinedTextField(
                    value = evening,
                    onValueChange = { evening = it },
                    label = { Text("ميعاد المساء HH:mm") },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
            }

            Text(
                "المناسبات (عيد الميلاد/الجواز والأعياد) متظبطة مبدئياً وتقدر تعدّلها لاحقاً. " +
                    "الأعياد الإسلامية بتتغيّر كل سنة حسب رؤية الهلال.",
                style = androidx.compose.material3.MaterialTheme.typography.bodySmall,
            )

            Button(
                onClick = {
                    settings.groqKey = groqKey.trim()
                    settings.wifeNumber = wifeNumber.trim()
                    settings.morningTime = morning.trim()
                    settings.eveningTime = evening.trim()
                    Scheduler.scheduleDaily(context) // إعادة جدولة بالمواعيد الجديدة
                    Toast.makeText(context, "اتحفظ ✅", Toast.LENGTH_SHORT).show()
                    onBack()
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("حفظ") }
        }
    }
}
