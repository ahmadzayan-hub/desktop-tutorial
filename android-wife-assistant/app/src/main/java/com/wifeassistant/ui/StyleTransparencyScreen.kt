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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
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
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wifeassistant.data.Settings
import com.wifeassistant.data.Store
import com.wifeassistant.data.StyleInsights
import com.wifeassistant.data.StyleRule
import com.wifeassistant.data.StyleRuleOverride
import com.wifeassistant.data.t

// شاشة «ما الذي تعلّمه وصال؟» — شفافية التعلّم:
// قواعد مقروءة لكل شخص، المستخدم يقدر يعطّل/يعدّل/يمسح أي قاعدة،
// ويصفّر تعلّم شخص واحد أو الكل. كل البيانات محلية ومفيش نسب ثقة غامضة.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StyleTransparencyScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }
    val store = remember { Store(context) }

    // refresh بيجبر إعادة قراءة القواعد بعد أي تعديل.
    var refresh by remember { mutableIntStateOf(0) }
    var editing by remember { mutableStateOf<StyleRule?>(null) }
    var editText by remember { mutableStateOf("") }
    var confirmResetAll by remember { mutableStateOf(false) }
    var confirmResetPerson by remember { mutableStateOf<String?>(null) } // recipientId

    val recipients = remember(refresh) { settings.recipients }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(t("ما الذي تعلّمه وصال؟", "What has Wisal learned?")) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = t("رجوع", "Back"))
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
            Card {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        t(
                            "وصال بيتعلم من رسايلك اللي اخترتها أو عدّلتها انت بس — ومحدش غيرك.",
                            "Wisal learns only from messages you picked or edited — no one else's.",
                        ),
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Text(
                        t(
                            "كل ده متخزن على جهازك فقط، وتقدر تعطّل أو تعدّل أو تمسح أي قاعدة.",
                            "All of it stays on your device only, and you can turn off, edit, or delete any rule.",
                        ),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            recipients.forEach { r ->
                val rules = remember(refresh) { store.styleRules(r.id) }
                val exampleCount = remember(refresh) { store.styleExamples(r.id).size }
                Text(
                    r.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.secondary,
                )
                if (rules.isEmpty()) {
                    Text(
                        if (exampleCount < StyleInsights.MIN_EXAMPLES)
                            t(
                                "لسه بيتعلم — اختار أو عدّل شوية رسايل الأول ($exampleCount من ${StyleInsights.MIN_EXAMPLES}).",
                                "Still learning — pick or edit a few messages first ($exampleCount of ${StyleInsights.MIN_EXAMPLES}).",
                            )
                        else
                            t("مسحت كل القواعد للشخص ده.", "You deleted all rules for this person."),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                } else {
                    rules.forEach { rule ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Switch(
                                checked = rule.enabled,
                                onCheckedChange = { on ->
                                    store.setStyleRuleOverride(
                                        rule.id,
                                        StyleRuleOverride(enabled = on, editedText = ruleEditedText(rule, store)),
                                    )
                                    refresh++
                                },
                            )
                            Column(Modifier.weight(1f)) {
                                Text(rule.text, style = MaterialTheme.typography.bodyMedium)
                                Text(
                                    t("اتبنت من ${rule.contributing} رسالة اخترتها", "Built from ${rule.contributing} messages you picked"),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            IconButton(onClick = { editing = rule; editText = rule.text }) {
                                Icon(Icons.Filled.Edit, contentDescription = t("تعديل", "Edit"))
                            }
                            IconButton(onClick = {
                                store.setStyleRuleOverride(rule.id, StyleRuleOverride(deleted = true))
                                refresh++
                            }) {
                                Icon(Icons.Filled.Delete, contentDescription = t("حذف", "Delete"))
                            }
                        }
                    }
                    TextButton(onClick = { confirmResetPerson = r.id }) {
                        Text(t("🔄 تصفير التعلّم للشخص ده", "🔄 Reset learning for this person"))
                    }
                }
                HorizontalDivider()
            }

            OutlinedButton(
                onClick = { confirmResetAll = true },
                modifier = Modifier.fillMaxWidth(),
            ) { Text(t("🔄 تصفير كل التعلّم", "🔄 Reset all learning")) }
        }
    }

    // حوار تعديل نص قاعدة
    editing?.let { rule ->
        AlertDialog(
            onDismissRequest = { editing = null },
            title = { Text(t("تعديل القاعدة", "Edit rule")) },
            text = {
                OutlinedTextField(value = editText, onValueChange = { editText = it }, modifier = Modifier.fillMaxWidth())
            },
            confirmButton = {
                TextButton(onClick = {
                    if (editText.isNotBlank()) {
                        store.setStyleRuleOverride(rule.id, StyleRuleOverride(enabled = rule.enabled, editedText = editText.trim()))
                        refresh++
                    }
                    editing = null
                }) { Text(t("حفظ", "Save")) }
            },
            dismissButton = { TextButton(onClick = { editing = null }) { Text(t("إلغاء", "Cancel")) } },
        )
    }

    // تأكيد تصفير شخص واحد
    confirmResetPerson?.let { rid ->
        AlertDialog(
            onDismissRequest = { confirmResetPerson = null },
            title = { Text(t("تصفير التعلّم للشخص ده؟", "Reset learning for this person?")) },
            text = { Text(t("هيمسح أمثلته وقواعده من جهازك. مفيش رجوع.", "This deletes their examples and rules from your device. No undo.")) },
            confirmButton = {
                TextButton(onClick = {
                    store.resetLearningFor(rid)
                    confirmResetPerson = null
                    refresh++
                    Toast.makeText(context, t("اتصفّر التعلّم 🔄", "Learning reset 🔄"), Toast.LENGTH_SHORT).show()
                }) { Text(t("تصفير", "Reset")) }
            },
            dismissButton = { TextButton(onClick = { confirmResetPerson = null }) { Text(t("إلغاء", "Cancel")) } },
        )
    }

    // تأكيد تصفير الكل
    if (confirmResetAll) {
        AlertDialog(
            onDismissRequest = { confirmResetAll = false },
            title = { Text(t("تصفير كل التعلّم؟", "Reset all learning?")) },
            text = { Text(t("هيمسح كل أمثلة الأسلوب والقواعد لكل الأشخاص من جهازك. مفيش رجوع.", "This deletes all style examples and rules for everyone from your device. No undo.")) },
            confirmButton = {
                TextButton(onClick = {
                    store.resetLearning()
                    confirmResetAll = false
                    refresh++
                    Toast.makeText(context, t("اتصفّر التعلّم 🔄", "Learning reset 🔄"), Toast.LENGTH_SHORT).show()
                }) { Text(t("تصفير", "Reset")) }
            },
            dismissButton = { TextButton(onClick = { confirmResetAll = false }) { Text(t("إلغاء", "Cancel")) } },
        )
    }
}

// نص القاعدة المعدَّل الحالي لو موجود (عشان ما نضيعوش لما نبدّل التفعيل).
private fun ruleEditedText(rule: StyleRule, store: Store): String? {
    // لو النص الحالي مختلف عن المشتق يبقى معدَّل — نحتفظ بيه مع تغيير التفعيل.
    val raw = StyleInsights.deriveRaw(rule.recipientId, store.styleExamples(rule.recipientId))
        .firstOrNull { it.id == rule.id }
    return if (raw != null && raw.text != rule.text) rule.text else null
}
