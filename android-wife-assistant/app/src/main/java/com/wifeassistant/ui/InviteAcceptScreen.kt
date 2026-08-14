package com.wifeassistant.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.wifeassistant.data.Settings
import com.wifeassistant.data.pairing.PairedPeer
import com.wifeassistant.data.pairing.Pairing
import com.wifeassistant.data.pairing.PairingInvitation
import com.wifeassistant.data.pairing.PairingResult
import com.wifeassistant.data.t
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

// شاشة قبول دعوة الإقران (wisal://pair): المدعو بيشوف مين بيدعوه ويقبل أو يرفض.
// القرار دايمًا بإيد المستخدم — مفيش قبول تلقائي، والدعوة المنتهية/المعادة بترفض.
@Composable
fun InviteAcceptScreen(
    invitation: PairingInvitation,
    onClose: () -> Unit,
    nowEpochSec: Long = System.currentTimeMillis() / 1000,
) {
    val context = LocalContext.current
    val settings = remember { Settings(context) }

    // الحالة الأولية: منتهية، مستخدمة قبل كده على الجهاز ده، أو معلّقة.
    var phase by remember {
        mutableStateOf(
            when {
                invitation.id in settings.acceptedInvitationIds -> "already"
                Pairing.isExpired(invitation, nowEpochSec) -> "expired"
                else -> "pending"
            }
        )
    }

    Scaffold { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text(
                t("دعوة لوصال 🔗", "Invitation to Wisal 🔗"),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
            )

            when (phase) {
                "pending" -> {
                    Card {
                        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                t(
                                    "«${invitation.inviterName}» بيدعوك تتواصلوا في وصال.",
                                    "“${invitation.inviterName}” invites you to connect on Wisal.",
                                ),
                                style = MaterialTheme.typography.titleMedium,
                            )
                            val expiry = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
                                .format(Instant.ofEpochSecond(invitation.expiresAtEpochSec).atZone(ZoneId.systemDefault()))
                            Text(
                                t("الدعوة صالحة حتى $expiry.", "Valid until $expiry."),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            Text(
                                t(
                                    "لو قبلت، بيتسجل على جهازك معرّف جهازه ومفتاحه العام واسمه — بس كده. مفيش رقم تليفون ولا جهات اتصال بتتبادل.",
                                    "If you accept, only their device id, public key, and name are stored on your device. No phone numbers or contacts are exchanged.",
                                ),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        Button(
                            onClick = {
                                when (val r = Pairing.accept(invitation, invitation.token, nowEpochSec)) {
                                    is PairingResult.Ok -> {
                                        settings.pairedPeers = settings.pairedPeers +
                                            PairedPeer(
                                                deviceId = invitation.inviterDeviceId,
                                                publicKeyB64 = invitation.inviterPublicKeyB64,
                                                name = invitation.inviterName,
                                                invitationId = invitation.id,
                                                pairedAtEpochSec = nowEpochSec,
                                            )
                                        settings.acceptedInvitationIds =
                                            settings.acceptedInvitationIds + invitation.id
                                        phase = "accepted"
                                    }
                                    is PairingResult.Refused -> phase = "expired"
                                }
                            },
                            modifier = Modifier.weight(1f),
                        ) { Text(t("قبول الدعوة", "Accept invitation")) }
                        OutlinedButton(onClick = onClose, modifier = Modifier.weight(1f)) {
                            Text(t("رفض", "Decline"))
                        }
                    }
                }

                "accepted" -> {
                    Text(
                        t("تم القبول ✅", "Accepted ✅"),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        // صدق المرحلة: مفيش قناة مشفرة شغالة لسه — ده تسجيل محلي.
                        t(
                            "اتسجل الإقران على جهازك. المحادثة المشفرة بين الجهازين بتتفعّل مع خدمة وصال المباشر — قيد التطوير، ولسه ما بنوصفهاش بالمشفرة قبل ما تتبني وتتراجع.",
                            "Pairing is recorded on your device. Encrypted chat between devices activates with the Wisal Direct service — in development, and we won't call it encrypted before it's built and reviewed.",
                        ),
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Start,
                    )
                    Button(onClick = onClose, modifier = Modifier.fillMaxWidth()) { Text(t("تمام", "Done")) }
                }

                "already" -> {
                    Text(
                        t("الدعوة دي اتقبلت قبل كده على الجهاز ده.", "This invitation was already accepted on this device."),
                        style = MaterialTheme.typography.bodyLarge,
                    )
                    Button(onClick = onClose, modifier = Modifier.fillMaxWidth()) { Text(t("تمام", "Done")) }
                }

                else -> {
                    Text(
                        t("الدعوة انتهت صلاحيتها أو مش صالحة. اطلب دعوة جديدة.", "This invitation is expired or invalid. Ask for a new one."),
                        style = MaterialTheme.typography.bodyLarge,
                    )
                    Button(onClick = onClose, modifier = Modifier.fillMaxWidth()) { Text(t("إغلاق", "Close")) }
                }
            }
        }
    }
}
