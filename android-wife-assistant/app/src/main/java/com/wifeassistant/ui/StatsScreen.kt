package com.wifeassistant.ui

import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import androidx.compose.ui.unit.dp
import com.wifeassistant.data.ReviewReport
import com.wifeassistant.data.Review
import com.wifeassistant.data.Store

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val store = remember { Store(context) }
    var report by remember { mutableStateOf(Review(store).build()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("الإحصائيات 📊") },
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
            StatCard("✅ نسبة القبول", "${report.acceptRate}%  (اخترت ${report.accepted} من ${report.total})")

            if (report.topThemes.isNotEmpty()) {
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("🏆 أكتر 3 مواضيع نجاحاً", style = MaterialTheme.typography.titleMedium)
                        report.topThemes.forEachIndexed { i, (theme, n) ->
                            Text("${i + 1}. $theme  ($n)")
                        }
                    }
                }
            }

            StatCard("📚 أمثلة الأسلوب المتجمّعة", "${report.styleExamplesCount}")

            report.worstSlot?.let { w ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(16.dp)) {
                        Text(
                            "⚠️ الخانة ${slotName(w.slot)} بتتجاهل كتير (${w.ignoredRate}%). " +
                                "تحب توقفها أو تغيّر ميعادها؟",
                            color = MaterialTheme.colorScheme.error,
                        )
                    }
                }
            }

            if (report.total == 0) {
                Text(
                    "لسه مفيش تفاعلات كفاية - استخدم الاقتراحات شوية والإحصائيات هتظهر.",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }

            OutlinedButton(
                onClick = {
                    store.resetLearning()
                    report = Review(store).build()
                    Toast.makeText(context, "اتصفّر التعلّم 🔄", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("🔄 تصفير التعلّم (Reset)") }
        }
    }
}

@Composable
private fun StatCard(title: String, value: String) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(value, style = MaterialTheme.typography.headlineSmall)
        }
    }
}

private fun slotName(slot: String): String = when (slot) {
    "morning" -> "الصباحية"
    "evening" -> "المسائية"
    "occasion" -> "المناسبات"
    "manual" -> "الفورية"
    else -> slot
}
