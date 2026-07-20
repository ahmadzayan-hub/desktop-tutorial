package com.wifeassistant.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

// شاشة ترحيب أول تشغيل - بتوضّح هدف التطبيق (الترابط الأسري والتواصل العاطفي).
@Composable
fun WelcomeScreen(onStart: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(
                    Brush.horizontalGradient(
                        listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.secondary)
                    )
                )
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("وصال 💗", style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.onPrimary, fontWeight = FontWeight.Bold)
            Text(
                "مساعدك للتواصل العاطفي والترابط الأسري",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onPrimary,
            )
        }

        WelcomePoint("👨‍👩‍👧‍👦", "لكل قرايبك", "شريك/شريكة، ابن، بنت، أم، أب، أخ، أخت - وكمان مجموعات.")
        WelcomePoint("💬", "كلام من القلب", "اقتراحات دافئة باللهجة المصرية، بنبرة مناسبة لكل علاقة.")
        WelcomePoint("🧠", "بيتعلّم منك", "كل ما تختار وتعدّل، الرسايل تقرب من أسلوبك أكتر.")
        WelcomePoint(
            "🔒", "خصوصيتك أولاً",
            "بياناتك (الأشخاص والرسايل) متخزّنة على موبايلك بس. وقت التوليد، نص الرسالة بيتبعت لمزوّد الذكاء (Groq) عشان يقترحلك — ومفيش إرسال تلقائي لأي حد، انت اللي بتبعت بإيدك.",
        )

        Text(
            "افتكر إن كلمة حلوة في وقتها بتقرّب القلوب 💞",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Text(
            "بضغطك على «يلا نبدأ» بتوافق إن نص الرسالة يتبعت لمزوّد الذكاء (Groq) وقت التوليد فقط.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Button(onClick = onStart, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
            Text("يلا نبدأ 💗")
        }
    }
}

@Composable
private fun WelcomePoint(emoji: String, title: String, body: String) {
    Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text("$emoji  $title", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
        Text(body, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
