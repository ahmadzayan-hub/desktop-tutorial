package com.wifeassistant.ui

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.PointerEventPass
import androidx.compose.ui.input.pointer.pointerInput
import kotlinx.coroutines.launch

// 💧 تأثير مائي خفيف: عند أول ضغطة في أي مكان تظهر دايرة شفافة بتتمدّد وتختفي.
// بنراقب الحدث في مرحلة Initial من غير ما نستهلكه (consume)، فما بيعطّلش أزرار الأبناء.
fun Modifier.waterRipple(color: Color): Modifier = composed {
    val scope = rememberCoroutineScope()
    val radius = remember { Animatable(0f) }
    val alpha = remember { Animatable(0f) }
    val center = remember { mutableStateOf(Offset.Unspecified) }

    this
        .pointerInput(Unit) {
            awaitPointerEventScope {
                while (true) {
                    val e = awaitPointerEvent(PointerEventPass.Initial)
                    val ch = e.changes.firstOrNull { it.pressed && !it.previousPressed }
                    if (ch != null) {
                        center.value = ch.position
                        val maxR = maxOf(size.width, size.height).toFloat() * 1.1f
                        scope.launch {
                            radius.snapTo(0f)
                            alpha.snapTo(0.32f)
                            launch { radius.animateTo(maxR, tween(620)) }
                            alpha.animateTo(0f, tween(620))
                        }
                    }
                }
            }
        }
        .drawWithContent {
            drawContent()
            if (center.value != Offset.Unspecified && alpha.value > 0f) {
                drawCircle(color = color, radius = radius.value, center = center.value, alpha = alpha.value)
            }
        }
}
