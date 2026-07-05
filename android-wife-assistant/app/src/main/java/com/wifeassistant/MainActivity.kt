package com.wifeassistant

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.wifeassistant.ui.HistoryScreen
import com.wifeassistant.ui.HomeScreen
import com.wifeassistant.ui.HomeViewModel
import com.wifeassistant.ui.SettingsScreen
import com.wifeassistant.ui.StatsScreen
import com.wifeassistant.ui.theme.WifeAssistantTheme
import com.wifeassistant.util.Notifications
import com.wifeassistant.work.Scheduler

class MainActivity : ComponentActivity() {

    private val notifPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { /* اختياري */ }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Notifications.ensureChannel(this)
        requestNotificationPermissionIfNeeded()
        Scheduler.scheduleDaily(this) // جدولة إشعارات الصباح/المساء

        setContent {
            WifeAssistantTheme {
                // اللغة عربي فالاتجاه من اليمين لليسار.
                CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
                    AppRoot()
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

@Composable
private fun AppRoot() {
    var screen by remember { mutableStateOf("home") }
    val vm: HomeViewModel = viewModel()

    when (screen) {
        "settings" -> SettingsScreen(onBack = { screen = "home" })
        "stats" -> StatsScreen(onBack = { screen = "home" })
        "history" -> HistoryScreen(onBack = { screen = "home" })
        else -> HomeScreen(
            vm = vm,
            onOpenSettings = { screen = "settings" },
            onOpenStats = { screen = "stats" },
            onOpenHistory = { screen = "history" },
        )
    }
}
