package com.wifeassistant.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// لوحة ألوان دافئة (وردي/بنفسجي رومانسي) بتشتغل في اللايت والدارك.
private val LightColors = lightColorScheme(
    primary = Color(0xFFE5397B),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFFFD9E5),
    onPrimaryContainer = Color(0xFF3E0021),
    secondary = Color(0xFF7B4EE5),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE7DEFF),
    background = Color(0xFFFFF7FA),
    onBackground = Color(0xFF201A1C),
    surface = Color(0xFFFFFFFF),
    surfaceVariant = Color(0xFFF6E3EA),
    onSurfaceVariant = Color(0xFF524347),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFFFF86B4),
    onPrimary = Color(0xFF57132F),
    primaryContainer = Color(0xFF7A2148),
    onPrimaryContainer = Color(0xFFFFD9E5),
    secondary = Color(0xFFCBB6FF),
    onSecondary = Color(0xFF33116B),
    background = Color(0xFF191113),
    onBackground = Color(0xFFECE0E3),
    surface = Color(0xFF211A1C),
    surfaceVariant = Color(0xFF524347),
    onSurfaceVariant = Color(0xFFD7C1C8),
)

@Composable
fun WifeAssistantTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors,
        content = content,
    )
}
