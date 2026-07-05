package com.wifeassistant.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColors = lightColorScheme(
    primary = Color(0xFFE5397B),
    secondary = Color(0xFF7B4EE5),
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFFE5397B),
    secondary = Color(0xFFB39DFF),
)

@Composable
fun WifeAssistantTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (isSystemInDarkTheme()) DarkColors else LightColors,
        content = content,
    )
}
