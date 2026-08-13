package com.wifeassistant.ui

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.unit.dp
import com.wifeassistant.data.Relations
import com.wifeassistant.data.t
import com.wifeassistant.data.Settings
import com.wifeassistant.data.Store
import com.wifeassistant.util.Share
import com.wifeassistant.util.WhatsApp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val clipboard = LocalClipboardManager.current
    val store = remember { Store(context) }
    val settings = remember { Settings(context) }
    val recipients = remember { settings.recipients }

    var query by remember { mutableStateOf("") }
    var personFilter by remember { mutableStateOf("") } // "" = الكل، غير كده recipientId
    var favOnly by remember { mutableStateOf(false) }
    var refresh by remember { mutableIntStateOf(0) }

    // الأحدث الأول، بس اللي ليها نص نهائي.
    val all = remember(refresh) {
        store.feedback().filter { !it.finalText.isNullOrBlank() }.reversed()
    }
    val favs = remember(refresh) { store.favorites().toSet() }

    val shown = all.filter { fb ->
        val text = fb.finalText.orEmpty()
        (query.isBlank() || text.contains(query.trim(), ignoreCase = true)) &&
            (personFilter.isBlank() || fb.recipientId == personFilter) &&
            (!favOnly || favs.contains(text))
    }

    fun nameOf(recipientId: String): String =
        recipients.firstOrNull { it.id == recipientId }?.name?.ifBlank { null } ?: ""

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(t("سجل الرسايل 📜", "Message history 📜")) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = t("رجوع", "Back"))
                    }
                },
            )
        },
    ) { padding ->
        // LazyColumn: السجل بيكبر مع الوقت، فبنرسمه كسول بدل رسم كل الكروت مرة واحدة.
        LazyColumn(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
          item {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                label = { Text(t("دوّر في رسايلك", "Search your messages")) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            // فلترة بالشخص + المفضّلة.
            Row(
                modifier = Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = favOnly,
                    onClick = { favOnly = !favOnly },
                    label = { Text(t("⭐ المفضلة", "⭐ Favorites")) },
                )
                FilterChip(
                    selected = personFilter.isBlank(),
                    onClick = { personFilter = "" },
                    label = { Text(t("الكل", "All")) },
                )
                recipients.forEach { r ->
                    FilterChip(
                        selected = personFilter == r.id,
                        onClick = { personFilter = r.id },
                        label = { Text("${Relations.emojiOf(r.relation)} ${r.name.ifBlank { Relations.labelOf(r.relation) }}") },
                    )
                }
            }

            if (shown.isEmpty()) {
                Text(
                    t("مفيش رسايل بالفلتر ده. جرّب تشيل البحث أو الفلترة.", "No messages match this filter. Try clearing the search or filters."),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            } // Column الهيدر
          } // item الهيدر

          items(shown, key = { it.date + "|" + it.finalText }) { fb ->
                val text = fb.finalText.orEmpty()
                val fav = favs.contains(text)
                val who = nameOf(fb.recipientId)
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Text(
                            "${fb.date}" +
                                (if (who.isNotBlank()) "  ·  $who" else "") +
                                (fb.themesShown.firstOrNull()?.let { "  ·  $it" } ?: ""),
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.primary,
                        )
                        Text(text, style = MaterialTheme.typography.bodyLarge)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { store.toggleFavorite(text); refresh++ },
                                modifier = Modifier.weight(1f),
                            ) { Text(if (fav) "⭐" else "☆") }
                            OutlinedButton(
                                onClick = { clipboard.setText(AnnotatedString(text)) },
                                modifier = Modifier.weight(1f),
                            ) { Text("📋") }
                            OutlinedButton(
                                onClick = { Share.text(context, text) },
                                modifier = Modifier.weight(1f),
                            ) { Text("🔗") }
                            OutlinedButton(
                                onClick = {
                                    WhatsApp.send(context, settings.currentRecipient()?.number.orEmpty(), text)
                                },
                                modifier = Modifier.weight(1f),
                            ) { Text("📲") }
                            OutlinedButton(
                                onClick = { store.deleteHistory(fb.date, text); refresh++ },
                                modifier = Modifier.weight(1f),
                            ) { Text("🗑️") }
                        }
                    }
                }
            }
        }
    }
}
