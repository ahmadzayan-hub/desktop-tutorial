package com.wifeassistant

import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

// اختبار Compose UI (smoke) على الـ JVM عبر Robolectric — بيتأكد إن التركيب والتفاعل
// (semantics + click + recomposition) شغّالين في CI بدون emulator. أساس لاختبارات
// شاشات أكبر لاحقًا.
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34])
class ComposeSmokeTest {
    @get:Rule val rule = createComposeRule()

    @Test fun buttonClickRecomposesText() {
        rule.setContent {
            var n by remember { mutableStateOf(0) }
            Button(onClick = { n++ }) { Text("عدّ: $n") }
        }
        rule.onNodeWithText("عدّ: 0").assertIsDisplayed()
        rule.onNodeWithText("عدّ: 0").performClick()
        rule.onNodeWithText("عدّ: 1").assertIsDisplayed()
    }
}
