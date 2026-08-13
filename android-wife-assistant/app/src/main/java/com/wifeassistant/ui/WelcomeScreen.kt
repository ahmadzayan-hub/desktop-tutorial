package com.wifeassistant.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wifeassistant.data.t
import com.wifeassistant.ui.theme.GradientButton
import com.wifeassistant.ui.theme.WisalColors

// شاشة ترحيب أول تشغيل — بهوية وصال الليلية: كحلي عميق، شعار ذهبي، وقلب الجراديانت.
@Composable
fun WelcomeScreen(onStart: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        // الشعار بجراديانت الهوية (وردي → خوخي) — نظير «وصال» الذهبي في الصور.
        Text(
            "وصال",
            fontSize = 52.sp,
            fontWeight = FontWeight.Black,
            style = MaterialTheme.typography.headlineLarge.copy(
                brush = Brush.horizontalGradient(listOf(WisalColors.HumanCoral, WisalColors.SolarAmber)),
            ),
            modifier = Modifier.padding(top = 24.dp),
        )
        Text(
            t("قَرِّب قلوب أحبابك", "Bring your loved ones closer"),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
        )
        Text(
            t("رسالة صغيرة منك ممكن تفرق كتير ❤️", "A small message from you can mean the world ❤️"),
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )

        WelcomePoint(
            "👨‍👩‍👧‍👦",
            t("لكل قرايبك", "For everyone you love"),
            t(
                "شريك/شريكة، ابن، بنت، أم، أب، أخ، أخت - وكمان مجموعات.",
                "Partner, son, daughter, mom, dad, siblings — and groups too.",
            ),
        )
        WelcomePoint(
            "💬",
            t("كلام من القلب", "Words from the heart"),
            t(
                "اقتراحات دافئة باللهجة المصرية، بنبرة مناسبة لكل علاقة.",
                "Warm suggestions in a tone that fits each relationship.",
            ),
        )
        WelcomePoint(
            "🧠",
            t("بيتعلّم منك", "Learns from you"),
            t(
                "كل ما تختار وتعدّل، الرسايل تقرب من أسلوبك أكتر.",
                "Every pick and edit brings suggestions closer to your style.",
            ),
        )
        WelcomePoint(
            "🔒",
            t("خصوصيتك أولاً", "Privacy first"),
            t(
                "بياناتك (الأشخاص والرسايل) متخزّنة على موبايلك بس. وقت التوليد، نص الرسالة بيتبعت لمزوّد الذكاء (Groq) عشان يقترحلك — ومفيش إرسال تلقائي لأي حد، انت اللي بتبعت بإيدك.",
                "Your data (people and messages) stays on your phone. Only at generation time is the message context sent to the AI provider (Groq) — and nothing is ever sent automatically; you always press send yourself.",
            ),
        )

        Text(
            t("افتكر إن كلمة حلوة في وقتها بتقرّب القلوب 💞", "A kind word at the right moment brings hearts closer 💞"),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )

        Text(
            t(
                "بضغطك على «يلا نبدأ» بتوافق إن نص الرسالة يتبعت لمزوّد الذكاء (Groq) وقت التوليد فقط.",
                "By tapping \"Let's start\" you agree that message context is sent to the AI provider (Groq) at generation time only.",
            ),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )

        GradientButton(
            onClick = onStart,
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp, bottom = 16.dp),
        ) { Text(t("يلا نبدأ 💗", "Let's start 💗"), fontWeight = FontWeight.Bold, fontSize = 17.sp) }
    }
}

@Composable
private fun WelcomePoint(emoji: String, title: String, body: String) {
    Surface(
        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)),
        color = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(20.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                "$emoji  $title",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.secondary, // ذهبي
            )
            Text(body, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
