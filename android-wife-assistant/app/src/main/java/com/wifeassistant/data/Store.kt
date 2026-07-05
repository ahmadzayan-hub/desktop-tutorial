package com.wifeassistant.data

import android.content.Context
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File

// المخزن المحلي (JSON) — نظير store.js. بيحفظ التعلّم وثبات الحالة.
class Store(context: Context) {
    private val file = File(context.filesDir, "store.json")
    private val json = Json { prettyPrint = true; ignoreUnknownKeys = true; encodeDefaults = true }

    @Synchronized
    fun read(): AppData {
        if (!file.exists()) return defaultData()
        return runCatching { json.decodeFromString<AppData>(file.readText()) }.getOrElse { defaultData() }
    }

    @Synchronized
    fun write(data: AppData) = file.writeText(json.encodeToString(data))

    private fun defaultData(): AppData {
        val weights = AppConstants.THEMES.associateWith { 1.0 }.toMutableMap()
        return AppData(themeWeights = weights)
    }

    // ---- ملف الأسلوب (آخر 30) ----
    fun styleExamples(): List<StyleExample> = read().styleExamples

    @Synchronized
    fun addStyleExample(text: String, theme: String?) {
        val d = read()
        d.styleExamples.add(StyleExample(text.trim(), theme, DateUtil.todayISO()))
        while (d.styleExamples.size > AppConstants.STYLE_EXAMPLES_MAX) d.styleExamples.removeAt(0)
        write(d)
    }

    // ---- أوزان المواضيع (ترجيح) ----
    fun themeWeights(): Map<String, Double> = read().themeWeights

    @Synchronized
    fun bumpThemeWeight(theme: String?, delta: Double) {
        if (theme == null) return
        val d = read()
        var next = (d.themeWeights[theme] ?: 1.0) + delta
        next = next.coerceIn(0.2, 5.0)
        d.themeWeights[theme] = next
        write(d)
    }

    fun recentThemes(days: Long): Set<String> {
        val cutoff = DateUtil.daysAgoISO(days)
        return read().feedback.filter { it.date >= cutoff }.flatMap { it.themesShown }.toSet()
    }

    // ---- تغذية راجعة ----
    @Synchronized
    fun addFeedback(fb: Feedback) {
        val d = read(); d.feedback.add(fb); write(d)
    }

    fun feedback(): List<Feedback> = read().feedback

    // ---- ثبات الحالة (مش نفس الخانة مرتين/يوم) ----
    fun wasSlotSentToday(slot: String): Boolean = read().lastSentPerSlot[slot] == DateUtil.todayISO()

    @Synchronized
    fun markSlotSentToday(slot: String) {
        val d = read(); d.lastSentPerSlot[slot] = DateUtil.todayISO(); write(d)
    }

    // ---- الجولة المعلّقة (بين الإشعار والواجهة) ----
    fun getPending(): PendingRound? = read().pending

    @Synchronized
    fun setPending(p: PendingRound) {
        val d = read(); d.pending = p; write(d)
    }

    @Synchronized
    fun clearPending() {
        val d = read(); d.pending = null; write(d)
    }

    // ---- تصفير التعلّم (بيحافظ على lastSentPerSlot) ----
    @Synchronized
    fun resetLearning() {
        val old = read()
        val fresh = defaultData()
        fresh.lastSentPerSlot.putAll(old.lastSentPerSlot)
        write(fresh)
    }
}
