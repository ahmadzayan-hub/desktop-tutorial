package com.wifeassistant.data

import android.content.Context
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File

// المخزن المحلي (JSON) - نظير store.js. بيحفظ التعلّم وثبات الحالة.
//
// سلامة البيانات (مهم):
// 1) الكتابة ذرّية: بنكتب لملف مؤقت ثم rename — لو التطبيق اتقتل وسط الكتابة،
//    الملف الأصلي بيفضل سليم (مفيش ضياع صامت للتعلّم والسجل).
// 2) القفل LOCK ثابت (companion) مش لكل نسخة — الشاشات والـ workers بيعملوا
//    نسخ Store مختلفة، فلازم قفل مشترك عشان قراءة-تعديل-كتابة متزامنة ما
//    تضيعش تحديثات. القفل reentrant فالدوال المعدِّلة بتمسكه على العملية كلها.
class Store(context: Context) {
    private val file = File(context.filesDir, "store.json")
    private val tmpFile = File(context.filesDir, "store.json.tmp")
    private val json = Json { prettyPrint = true; ignoreUnknownKeys = true; encodeDefaults = true }

    companion object {
        // قفل مشترك على مستوى العملية — بيغطي كل نسخ Store.
        private val LOCK = Any()
    }

    fun read(): AppData = synchronized(LOCK) {
        // الملف الأساسي، ولو تالف/ناقص نحاول نسترجع من المؤقت (كتابة اكتملت
        // لكن الـ rename ما حصلش قبل الإغلاق).
        readFrom(file) ?: readFrom(tmpFile) ?: defaultData()
    }

    private fun readFrom(f: File): AppData? {
        if (!f.exists()) return null
        return runCatching { json.decodeFromString<AppData>(f.readText()) }.getOrNull()
    }

    fun write(data: AppData): Unit = synchronized(LOCK) {
        tmpFile.writeText(json.encodeToString(data))
        // rename في نفس المجلد ذرّي على أندرويد/لينكس.
        if (!tmpFile.renameTo(file)) {
            // احتياطي نادر لو الـ rename فشل: نسخ مباشر (أفضل من الفشل الصامت).
            file.writeText(tmpFile.readText())
            tmpFile.delete()
        }
    }

    private fun defaultData(): AppData {
        val weights = AppConstants.THEMES.associateWith { 1.0 }.toMutableMap()
        return AppData(themeWeights = weights)
    }

    // ---- ملف الأسلوب (آخر 30 لكل شخص على حدة) ----
    fun styleExamples(recipientId: String): List<StyleExample> =
        read().styleExamples.filter { it.recipientId == recipientId }

    fun styleExamplesCount(): Int = read().styleExamples.size

    fun addStyleExample(text: String, theme: String?, recipientId: String): Unit = synchronized(LOCK) {
        val d = read()
        d.styleExamples.add(StyleExample(text.trim(), theme, DateUtil.todayISO(), recipientId))
        // السقف لكل شخص لوحده (الأقدم لنفس الشخص يخرج).
        while (d.styleExamples.count { it.recipientId == recipientId } > AppConstants.STYLE_EXAMPLES_MAX) {
            val idx = d.styleExamples.indexOfFirst { it.recipientId == recipientId }
            if (idx >= 0) d.styleExamples.removeAt(idx) else break
        }
        write(d)
    }

    // ---- أوزان المواضيع (ترجيح) ----
    fun themeWeights(): Map<String, Double> = read().themeWeights

    fun bumpThemeWeight(theme: String?, delta: Double): Unit = synchronized(LOCK) {
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
    fun addFeedback(fb: Feedback): Unit = synchronized(LOCK) {
        val d = read(); d.feedback.add(fb); write(d)
    }

    fun feedback(): List<Feedback> = read().feedback

    // حذف عنصر من السجل (بمطابقة التاريخ والنص).
    fun deleteHistory(date: String, text: String): Unit = synchronized(LOCK) {
        val d = read()
        d.feedback.removeAll { it.date == date && it.finalText == text }
        write(d)
    }

    // ---- المفضّلة ----
    fun favorites(): List<String> = read().favorites
    fun isFavorite(text: String): Boolean = read().favorites.contains(text)

    fun toggleFavorite(text: String): Unit = synchronized(LOCK) {
        val d = read()
        if (!d.favorites.remove(text)) d.favorites.add(text)
        write(d)
    }

    // ---- ثبات الحالة (مش نفس الخانة مرتين/يوم) ----
    fun wasSlotSentToday(slot: String): Boolean = read().lastSentPerSlot[slot] == DateUtil.todayISO()

    fun markSlotSentToday(slot: String): Unit = synchronized(LOCK) {
        val d = read(); d.lastSentPerSlot[slot] = DateUtil.todayISO(); write(d)
    }

    // ---- تذكيرات التواصل ("بقالك فترة ما كلّمت فلان") ----
    fun markContacted(recipientId: String): Unit = synchronized(LOCK) {
        if (recipientId.isBlank()) return
        val d = read(); d.lastContactedPerRecipient[recipientId] = DateUtil.todayISO(); write(d)
    }

    // عدد الأيام من آخر تواصل، أو null لو مفيش تواصل قبل كده.
    fun daysSinceContact(recipientId: String): Long? {
        val last = read().lastContactedPerRecipient[recipientId] ?: return null
        return runCatching {
            java.time.temporal.ChronoUnit.DAYS.between(
                java.time.LocalDate.parse(last),
                DateUtil.today(),
            )
        }.getOrNull()
    }

    // أيام آخر تواصل لكذا شخص بقراءة واحدة للملف — أسرع بكتير من نداء لكل شخص.
    fun daysSinceContact(recipientIds: List<String>): Map<String, Long?> {
        val map = read().lastContactedPerRecipient
        val today = DateUtil.today()
        return recipientIds.associateWith { id ->
            map[id]?.let {
                runCatching { java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.parse(it), today) }.getOrNull()
            }
        }
    }

    // ---- الجولة المعلّقة (بين الإشعار والواجهة) ----
    fun getPending(): PendingRound? = read().pending

    fun setPending(p: PendingRound): Unit = synchronized(LOCK) {
        val d = read(); d.pending = p; write(d)
    }

    fun clearPending(): Unit = synchronized(LOCK) {
        val d = read(); d.pending = null; write(d)
    }

    // ---- تصفير التعلّم (بيحافظ على lastSentPerSlot) ----
    fun resetLearning(): Unit = synchronized(LOCK) {
        val old = read()
        val fresh = defaultData()
        fresh.lastSentPerSlot.putAll(old.lastSentPerSlot)
        write(fresh)
    }

    // ---- شاشة «ما الذي تعلّمه وصال؟» ----

    // قواعد الأسلوب لشخص واحد بعد تطبيق تجاوزات المستخدم.
    fun styleRules(recipientId: String): List<StyleRule> {
        val d = read()
        return StyleInsights.applyOverrides(
            StyleInsights.deriveRaw(recipientId, d.styleExamples.filter { it.recipientId == recipientId }),
            d.styleRuleOverrides,
        )
    }

    // القواعد المفعّلة فقط — للاستخدام في توجيه التوليد.
    fun activeStyleRules(recipientId: String): List<StyleRule> = styleRules(recipientId).filter { it.enabled }

    fun setStyleRuleOverride(ruleId: String, override: StyleRuleOverride): Unit = synchronized(LOCK) {
        val d = read(); d.styleRuleOverrides[ruleId] = override; write(d)
    }

    // تصفير تعلّم شخص واحد: أمثلته + تغذيته الراجعة + تجاوزات قواعده فقط.
    fun resetLearningFor(recipientId: String): Unit = synchronized(LOCK) {
        val d = read()
        d.styleExamples.removeAll { it.recipientId == recipientId }
        d.feedback.removeAll { it.recipientId == recipientId }
        val toDrop = d.styleRuleOverrides.keys.filter { it.endsWith(":$recipientId") }
        toDrop.forEach { d.styleRuleOverrides.remove(it) }
        write(d)
    }
}
