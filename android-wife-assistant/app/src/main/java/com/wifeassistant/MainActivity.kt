package com.wifeassistant

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.wifeassistant.data.I18n
import com.wifeassistant.data.Settings
import com.wifeassistant.data.t
import androidx.compose.runtime.key
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import com.wifeassistant.ui.BroadcastScreen
import com.wifeassistant.ui.DraftPolishScreen
import com.wifeassistant.ui.HistoryScreen
import com.wifeassistant.ui.HomeScreen
import com.wifeassistant.ui.HomeViewModel
import com.wifeassistant.ui.PeopleScreen
import com.wifeassistant.ui.SettingsScreen
import com.wifeassistant.ui.SmartReplyScreen
import com.wifeassistant.ui.StatsScreen
import com.wifeassistant.ui.StyleTransparencyScreen
import com.wifeassistant.ui.WelcomeScreen
import com.wifeassistant.ui.theme.WifeAssistantTheme
import androidx.compose.ui.platform.LocalContext
import com.wifeassistant.util.Notifications
import com.wifeassistant.work.Scheduler

class MainActivity : ComponentActivity() {

    private val notifPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { /* اختياري */ }

    // نتابع الـ intent الحالي كـ state: لازم للإقران عبر wisal://pair — لو
    // التطبيق شغّال بالفعل و launchMode=singleTask، أندرويد بيوصّل رابط
    // الدعوة التاني عبر onNewIntent مش onCreate جديد، فلازم نحدّث الـ state
    // بدل ما نفضل واقفين على الـ intent الأول.
    private var currentIntent by mutableStateOf<Intent?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Notifications.ensureChannel(this)
        Settings(this).ensureSeed() // أول تشغيل: يجهّز أول شخص افتراضي
        requestNotificationPermissionIfNeeded()
        // جدولة WorkManager بره الـ main thread عشان ما تأخّرش بدء التشغيل/أول فريم.
        lifecycleScope.launch(Dispatchers.Default) { Scheduler.scheduleDaily(this@MainActivity) }

        currentIntent = intent

        setContent {
            // نقرأ تفضيلات المظهر واللغة ونخلّيها state عشان تتغيّر فوراً من الإعدادات.
            var themeMode by remember { mutableStateOf(Settings(this).themeMode) }
            var dynamicColor by remember { mutableStateOf(Settings(this).dynamicColor) }
            var appLanguage by remember { mutableStateOf(Settings(this).appLanguage) }
            I18n.lang = appLanguage
            val dark = when (themeMode) {
                "light" -> false
                "dark" -> true
                else -> isSystemInDarkTheme()
            }
            WifeAssistantTheme(darkTheme = dark, dynamicColor = dynamicColor) {
                // الاتجاه بيتبع لغة الواجهة: عربي RTL، إنجليزي LTR.
                val direction = if (com.wifeassistant.data.Locales.isRtl(appLanguage)) LayoutDirection.Rtl else LayoutDirection.Ltr
                CompositionLocalProvider(LocalLayoutDirection provides direction) {
                    // key(appLanguage): تغيير اللغة يعيد تكوين الشجرة كلها فتتبدّل كل النصوص فورًا.
                    key(appLanguage) {
                        // دعوة إقران وصلت عبر wisal://pair — شاشة القبول ليها الأولوية.
                        // remember(currentIntent) عشان أي دعوة جديدة توصل وقت
                        // ما التطبيق شغّال بالفعل (عبر onNewIntent) تتقرأ من
                        // جديد بدل ما تفضل الشاشة واقفة على أول دعوة اتفتح بيها.
                        var pendingInvite by remember(currentIntent) {
                            mutableStateOf(
                                currentIntent?.dataString?.let { com.wifeassistant.data.pairing.Pairing.parsePayload(it) }
                            )
                        }
                        val invite = pendingInvite
                        if (invite != null) {
                            com.wifeassistant.ui.InviteAcceptScreen(
                                invitation = invite,
                                onClose = { pendingInvite = null },
                            )
                        } else {
                            AppRoot(onThemeChanged = {
                                themeMode = Settings(this).themeMode
                                dynamicColor = Settings(this).dynamicColor
                                appLanguage = Settings(this).appLanguage
                            })
                        }
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        currentIntent = intent
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
        NavItem("home", t("اليوم", "Today"), Icons.Filled.Home),
        NavItem("people", t("الأشخاص", "People"), Icons.Filled.People),
        NavItem("history", t("السجل", "History"), Icons.Filled.History),
        NavItem("stats", t("إحصائيات", "Stats"), Icons.Filled.BarChart),
        NavItem("settings", t("إعدادات", "Settings"), Icons.Filled.Settings),
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
        Box(
            modifier = Modifier
                .padding(pad)
                .fillMaxSize(),
        ) {
            when (screen) {
                "settings" -> SettingsScreen(
                    onBack = { screen = "home" },
                    onThemeChanged = onThemeChanged,
                    onOpenStyleTransparency = { screen = "styleTransparency" },
                )
                "styleTransparency" -> StyleTransparencyScreen(onBack = { screen = "settings" })
                "stats" -> StatsScreen(onBack = { screen = "home" })
                "history" -> HistoryScreen(onBack = { screen = "home" })
                "people" -> PeopleScreen(onBack = { screen = "home" })
                "broadcast" -> BroadcastScreen(onBack = { screen = "home" })
                "reply" -> SmartReplyScreen(onBack = { screen = "home" })
                "polish" -> DraftPolishScreen(onBack = { screen = "home" })
                else -> HomeScreen(
                    vm = vm,
                    onOpenSettings = { screen = "settings" },
                    onOpenStats = { screen = "stats" },
                    onOpenHistory = { screen = "history" },
                    onOpenPeople = { screen = "people" },
                    onOpenBroadcast = { screen = "broadcast" },
                    onOpenReply = { screen = "reply" },
                    onOpenPolish = { screen = "polish" },
                )
            }
        }
    }
}
