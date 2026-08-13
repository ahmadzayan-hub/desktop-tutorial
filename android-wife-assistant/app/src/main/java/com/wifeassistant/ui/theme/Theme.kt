package com.wifeassistant.ui.theme

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

// أشكال Material 3 Expressive: زوايا أنعم وأكبر لإحساس حديث ومجسّم.
private val ExpressiveShapes = Shapes(
    extraSmall = RoundedCornerShape(10.dp),
    small = RoundedCornerShape(14.dp),
    medium = RoundedCornerShape(20.dp),
    large = RoundedCornerShape(28.dp),
    extraLarge = RoundedCornerShape(36.dp),
)

// ————— هوية «وصال» —————
// كحلي ليلي عميق + ذهبي دافئ للعناوين + جراديانت وردي→خوخي للأزرار الأساسية.
object WisalColors {
    val NavyBg = Color(0xFF0D1524)        // خلفية التطبيق
    val NavySurface = Color(0xFF141E33)   // البطاقات
    val NavyRaised = Color(0xFF1B2740)    // بطاقة مرفوعة/حقل إدخال
    val Outline = Color(0xFF2A3854)       // حدود خفيفة
    val Gold = Color(0xFFEDBF74)          // العناوين والشعار
    val GoldDeep = Color(0xFFD9A84E)
    val Rose = Color(0xFFEF5D6B)          // بداية الجراديانت
    val Peach = Color(0xFFF2A66B)         // نهاية الجراديانت
    val Teal = Color(0xFF3FD3BC)          // نجاح/متصل
    val InkWarm = Color(0xFFF1ECE4)       // نص أساسي دافئ
    val Muted = Color(0xFF9AA6BD)         // نص ثانوي
}

// جراديانت الهوية للأزرار الأساسية والعناصر النشطة.
val WisalGradient = Brush.horizontalGradient(listOf(WisalColors.Rose, WisalColors.Peach))
val WisalGradientVertical = Brush.verticalGradient(listOf(WisalColors.Rose, WisalColors.Peach))

// زرار الهوية: خلفية جراديانت وردي→خوخي بنص أبيض عريض. بديل مباشر لـ Button العادي.
@Composable
fun GradientButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    contentPadding: PaddingValues = PaddingValues(horizontal = 24.dp, vertical = 14.dp),
    content: @Composable () -> Unit,
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.background(
            brush = if (enabled) WisalGradient else Brush.horizontalGradient(
                listOf(WisalColors.Outline, WisalColors.Outline)
            ),
            shape = RoundedCornerShape(50),
        ),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            disabledContainerColor = Color.Transparent,
            contentColor = Color.White,
            disabledContentColor = WisalColors.Muted,
        ),
        shape = RoundedCornerShape(50),
        contentPadding = contentPadding,
    ) { content() }
}

private val LightColors = lightColorScheme(
    primary = WisalColors.Rose,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFFE0D6),
    onPrimaryContainer = Color(0xFF3E1210),
    secondary = WisalColors.GoldDeep,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF6E7C8),
    onSecondaryContainer = Color(0xFF3C2E10),
    tertiary = Color(0xFF0E9384),
    background = Color(0xFFFDF9F3),
    onBackground = Color(0xFF1D2434),
    surface = Color(0xFFFFFFFF),
    surfaceVariant = Color(0xFFF0EAE0),
    onSurfaceVariant = Color(0xFF4E5668),
    outline = Color(0xFFC9C2B4),
)

private val DarkColors = darkColorScheme(
    primary = WisalColors.Rose,
    onPrimary = Color.White,
    primaryContainer = Color(0xFF3A2030),
    onPrimaryContainer = Color(0xFFFFD9CF),
    secondary = WisalColors.Gold,
    onSecondary = Color(0xFF3A2A10),
    secondaryContainer = Color(0xFF223050),
    onSecondaryContainer = WisalColors.Gold,
    tertiary = WisalColors.Teal,
    onTertiary = Color(0xFF00332B),
    background = WisalColors.NavyBg,
    onBackground = WisalColors.InkWarm,
    surface = WisalColors.NavySurface,
    onSurface = WisalColors.InkWarm,
    surfaceVariant = WisalColors.NavyRaised,
    onSurfaceVariant = WisalColors.Muted,
    outline = WisalColors.Outline,
)

@Composable
fun WifeAssistantTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // هوية وصال هي الافتراضي؛ Material You اختياري من الإعدادات
    content: @Composable () -> Unit,
) {
    val context = LocalContext.current
    val scheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        darkTheme -> DarkColors
        else -> LightColors
    }
    MaterialTheme(colorScheme = scheme, shapes = ExpressiveShapes, content = content)
}
