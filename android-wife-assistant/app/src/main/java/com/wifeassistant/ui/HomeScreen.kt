package com.wifeassistant.ui

import androidx.compose.foundation.background
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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
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
import androidx.compose.runtime.setValue
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.wifeassistant.data.Relations
import com.wifeassistant.data.Settings
import com.wifeassistant.data.Suggestion
import com.wifeassistant.util.Share
import com.wifeassistant.util.WhatsApp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    vm: HomeViewModel,
    onOpenSettings: () -> Unit,
    onOpenStats: () -> Unit,
    onOpenHistory: () -> Unit,
    onOpenPeople: () -> Unit,
) {
    val state by vm.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current
    var edited by remember { mutableStateOf("") }
    val snackbar = remember { SnackbarHostState() }

    // نعرض رسائل الحالة (نجاح/خطأ) كـ Snackbar لطيف.
    LaunchedEffect(state.info) { state.info?.let { snackbar.showSnackbar(it) } }
    LaunchedEffect(state.error) { state.error?.let { snackbar.showSnackbar("⚠️ $it") } }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbar) },
        topBar = {
            TopAppBar(
                title = { Text("رسايل القلب 💗", fontWeight = FontWeight.Bold) },
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
            HeaderBanner()
            RecipientBar(onOpenPeople = onOpenPeople)

            // أزرار التوليد
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { vm.generate("manual") }, modifier = Modifier.weight(1f)) {
                    Text("✨ اقتراح فوري")
                }
                FilledTonalButton(onClick = { vm.requestOccasion() }, modifier = Modifier.weight(1f)) {
                    Text("💌 مناسبة")
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
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    CircularProgressIndicator(modifier = Modifier.height(28.dp))
                    Spacer(Modifier.height(0.dp))
                    Text("  بكتب لك اقتراحين...", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            state.occasionLabel?.let {
                Text("💝 مناسبة: $it", style = MaterialTheme.typography.titleMedium)
            }

            state.items.forEachIndexed { idx, item ->
                SuggestionCard(
                    index = idx,
                    item = item,
                    onChoose = { vm.choose(idx) },
                    onCopy = { clipboard.setText(AnnotatedString(item.text)) },
                    onShare = { Share.text(context, item.text) },
                    onWhatsApp = {
                        WhatsApp.send(context, Settings(context).currentRecipient()?.number.orEmpty(), item.text)
                    },
                )
            }

            if (state.items.isNotEmpty()) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { vm.regenerate() }, modifier = Modifier.weight(1f)) {
                        Text("🔄 جديد")
                    }
                    OutlinedButton(onClick = { vm.ignore() }, modifier = Modifier.weight(1f)) {
                        Text("🙈 تجاهل")
                    }
                }
                OutlinedTextField(
                    value = edited,
                    onValueChange = { edited = it },
                    label = { Text("عدّل بنفسك واحفظه لأسلوبك") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 2,
                )
                Button(
                    onClick = { vm.edit(edited); edited = "" },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("💾 احفظ نسختي المعدّلة") }
            } else if (!state.loading) {
                EmptyState()
            }

            Spacer(Modifier.height(24.dp))
        }
    }
}

@Composable
private fun RecipientBar(onOpenPeople: () -> Unit) {
    val context = LocalContext.current
    val r = remember { Settings(context).currentRecipient() }
    val who = when {
        r == null -> "محدّش لسه — ضيف شخص"
        r.name.isNotBlank() -> "${Relations.emojiOf(r.relation)} ${r.name} · ${Relations.labelOf(r.relation)}"
        else -> "${Relations.emojiOf(r.relation)} ${Relations.labelOf(r.relation)}"
    }
    Surface(
        color = MaterialTheme.colorScheme.surfaceVariant,
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text("✍️ بتكتب لـ: $who", modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
            TextButton(onClick = onOpenPeople) { Text("تغيير") }
        }
    }
}

@Composable
private fun HeaderBanner() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(
                Brush.horizontalGradient(
                    listOf(
                        MaterialTheme.colorScheme.primary,
                        MaterialTheme.colorScheme.secondary,
                    )
                )
            )
            .padding(20.dp),
    ) {
        Column {
            Text(
                "رسالة من القلب 💗",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onPrimary,
                fontWeight = FontWeight.Bold,
            )
            Text(
                "اختار اقتراح، عدّله، وابعته لمراتك بضغطة",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimary,
            )
        }
    }
}

@Composable
private fun SuggestionCard(
    index: Int,
    item: Suggestion,
    onChoose: () -> Unit,
    onCopy: () -> Unit,
    onShare: () -> Unit,
    onWhatsApp: () -> Unit,
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

            Button(
                onClick = onWhatsApp,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                ),
            ) { Text("📲 ابعت لمراتي على واتساب") }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = onCopy, modifier = Modifier.weight(1f)) {
                    Text("📋 نسخ")
                }
                OutlinedButton(onClick = onShare, modifier = Modifier.weight(1f)) {
                    Text("🔗 مشاركة")
                }
                FilledTonalButton(onClick = onChoose, modifier = Modifier.weight(1f)) {
                    Text("👍 اختار")
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
            "دوس \"اقتراح فوري\" وابدأ",
            style = MaterialTheme.typography.titleMedium,
        )
        Text(
            "كل ما تختار وتعدّل، الاقتراحات بتقرب أكتر من أسلوبك",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
