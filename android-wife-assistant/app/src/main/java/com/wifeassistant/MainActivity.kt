package com.wifeassistant

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.wifeassistant.data.Settings
import com.wifeassistant.ui.HistoryScreen
import com.wifeassistant.ui.HomeScreen
import com.wifeassistant.ui.HomeViewModel
import com.wifeassistant.ui.PeopleScreen
import com.wifeassistant.ui.SettingsScreen
import com.wifeassistant.ui.StatsScreen
import com.wifeassistant.ui.WelcomeScreen
import com.wifeassistant.ui.theme.WifeAssistantTheme
import androidx.compose.ui.platform.LocalContext
import com.wifeassistant.util.Notifications
import com.wifeassistant.work.Scheduler

class MainActivity : ComponentActivity() {

    private val notifPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { /* اختياري */ }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Notifications.ensureChannel(this)
        Settings(this).ensureSeed() // أول تشغيل: يجهّز أول شخص افتراضي
        requestNotificationPermissionIfNeeded()
        Scheduler.scheduleDaily(this) // جدولة إشعارات الصباح/المساء

        setContent {
            // نقرأ تفضيلات المظهر ونخلّيها state عشان تتغيّر فوراً من الإعدادات.
            var themeMode by remember { mutableStateOf(Settings(this).themeMode) }
            var dynamicColor by remember { mutableStateOf(Settings(this).dynamicColor) }
            val dark = when (themeMode) {
                "light" -> false
                "dark" -> true
                else -> isSystemInDarkTheme()
            }
            WifeAssistantTheme(darkTheme = dark, dynamicColor = dynamicColor) {
                // اللغة عربي فالاتجاه من اليمين لليسار.
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    AppRoot(onThemeChanged = {
                        themeMode = Settings(this).themeMode
                        dynamicColor = Settings(this).dynamicColor
                    })
                }
            }
        }
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = ContextCompat.checkSelfPermission(
                this, Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
            if (!granted) notifPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }
}

private data class NavItem(val key: String, val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

@Composable
private fun AppRoot(onThemeChanged: () -> Unit = {}) {
    val context = LocalContext.current
    var onboarded by remember { mutableStateOf(Settings(context).onboarded) }
    if (!onboarded) {
        WelcomeScreen(onStart = {
            Settings(context).onboarded = true
            onboarded = true
        })
        return
    }

    var screen by remember { mutableStateOf("home") }
    val vm: HomeViewModel = viewModel()

    val items = listOf(
        NavItem("home", "الرئيسية", Icons.Filled.Home),
        NavItem("people", "الأشخاص", Icons.Filled.People),
        NavItem("history", "السجل", Icons.Filled.History),
        NavItem("stats", "إحصائيات", Icons.Filled.BarChart),
        NavItem("settings", "إعدادات", Icons.Filled.Settings),
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                items.forEach { item ->
                    NavigationBarItem(
                        selected = screen == item.key,
                        onClick = { screen = item.key },
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                    )
                }
            }
        },
    ) { pad ->
        Box(modifier = Modifier.padding(pad)) {
            when (screen) {
                "settings" -> SettingsScreen(onBack = { screen = "home" }, onThemeChanged = onThemeChanged)
                "stats" -> StatsScreen(onBack = { screen = "home" })
                "history" -> HistoryScreen(onBack = { screen = "home" })
                "people" -> PeopleScreen(onBack = { screen = "home" })
                else -> HomeScreen(
                    vm = vm,
                    onOpenSettings = { screen = "settings" },
                    onOpenStats = { screen = "stats" },
                    onOpenHistory = { screen = "history" },
                    onOpenPeople = { screen = "people" },
                )
            }
        }
    }
}
