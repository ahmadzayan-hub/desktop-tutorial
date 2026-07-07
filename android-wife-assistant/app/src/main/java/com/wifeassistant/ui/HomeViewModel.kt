package com.wifeassistant.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.wifeassistant.data.DateUtil
import com.wifeassistant.data.Feedback
import com.wifeassistant.data.GroqClient
import com.wifeassistant.data.Occasion
import com.wifeassistant.data.Occasions
import com.wifeassistant.data.PendingRound
import com.wifeassistant.data.Recipient
import com.wifeassistant.data.Relations
import com.wifeassistant.data.Settings
import com.wifeassistant.data.Store
import com.wifeassistant.data.Suggestion
import com.wifeassistant.data.SuggestionEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeState(
    val loading: Boolean = false,
    val error: String? = null,
    val info: String? = null,
    val items: List<Suggestion> = emptyList(),
    val slot: String = "manual",
    val themesShown: List<String> = emptyList(),
    val occasionLabel: String? = null,
)

// حالة الأشخاص - عشان الواجهة تتفاعل فوراً مع اختيار أي شخص وتظبط كل الخيارات عليه.
data class PeopleState(
    val recipients: List<Recipient> = emptyList(),
    val selectedId: String = "",
    val current: Recipient? = null,
)

class HomeViewModel(app: Application) : AndroidViewModel(app) {
    private val settings = Settings(app)
    private val store = Store(app)
    private val occasions = Occasions(settings)
    private val engine = SuggestionEngine(store, GroqClient(settings), settings)

    private val _state = MutableStateFlow(HomeState())
    val state: StateFlow<HomeState> = _state.asStateFlow()

    private val _people = MutableStateFlow(PeopleState())
    val people: StateFlow<PeopleState> = _people.asStateFlow()

    init { loadPending(); refreshRecipients() }

    // نقرأ الأشخاص والشخص المختار من الإعدادات - بننده دي كل ما نفتح الشاشة
    // أو نغيّر الاختيار عشان الواجهة تفضل مظبوطة على الشخص الحالي.
    fun refreshRecipients() {
        _people.value = PeopleState(
            recipients = settings.recipients,
            selectedId = settings.selectedRecipientId,
            current = settings.currentRecipient(),
        )
    }

    // اختيار شخص من الشاشة الرئيسية مباشرة: كل الخيارات (النبرة، الرقم، المناسبات،
    // زر الواتساب) بتتظبط عليه فوراً. بنمسح الاقتراحات القديمة لأنها كانت لشخص تاني.
    fun selectRecipient(id: String) {
        if (id == settings.selectedRecipientId) return
        settings.selectedRecipientId = id
        store.clearPending()
        refreshRecipients()
        val name = _people.value.current?.let { it.name.ifBlank { Relations.labelOf(it.relation) } } ?: "الشخص"
        _state.value = HomeState(info = "دلوقتي بتكتب لـ $name — دوس اقتراح فوري ✨")
    }

    // عند فتح التطبيق: لو فيه جولة محفوظة (من إشعار) نعرضها.
    fun loadPending() {
        val p = store.getPending() ?: return
        _state.value = HomeState(
            items = p.items,
            slot = p.slot,
            themesShown = p.themesShown,
            occasionLabel = p.occasionLabel,
        )
    }

    // آخر نيّة/سياق اتستخدموا - عشان "🔄 جديد" يعيد بنفس القصد.
    private var lastIntent: String? = null
    private var lastContext: String = ""

    fun generate(
        slot: String = "manual",
        occasion: Occasion? = null,
        intentId: String? = null,
        context: String = "",
    ) {
        val occ = occasion ?: if (slot == "occasion") occasions.todaysOccasion() else null
        val effectiveSlot = if (occ != null) "occasion" else slot
        lastIntent = intentId
        lastContext = context
        _state.value = _state.value.copy(loading = true, error = null, info = null)
        viewModelScope.launch {
            try {
                val res = engine.generate(effectiveSlot, occ, intentId, context)
                store.setPending(PendingRound(res.slot, res.themesShown, res.items, occ?.label))
                _state.value = HomeState(
                    items = res.items,
                    slot = res.slot,
                    themesShown = res.themesShown,
                    occasionLabel = occ?.label,
                    info = res.note, // لو رجعنا للجاهز، نوضّح السبب للمستخدم
                )
            } catch (e: Exception) {
                _state.value = _state.value.copy(loading = false, error = e.message ?: "حصل خطأ")
            }
        }
    }

    fun requestOccasion() {
        val r = settings.currentRecipient()
        val occ = (r?.let { com.wifeassistant.data.Occasions.recipientOccasionToday(it) })
            ?: occasions.todaysOccasion()
            ?: Occasion("manual", "لمسة حب من القلب")
        generate("occasion", occ)
    }

    private fun themes() = _state.value.themesShown
    private fun rid() = settings.currentRecipient()?.id ?: ""

    fun choose(idx: Int) {
        val items = _state.value.items
        if (idx !in items.indices) return
        val chosen = items[idx]
        val theme = themes().getOrNull(idx) ?: themes().firstOrNull()
        store.addStyleExample(chosen.text, theme, rid())
        if (theme != null) store.bumpThemeWeight(theme, +0.3)
        val other = themes().getOrNull(if (idx == 0) 1 else 0)
        if (other != null && other != theme) store.bumpThemeWeight(other, -0.1)
        store.addFeedback(
            Feedback(DateUtil.todayISO(), _state.value.slot, themes(), if (idx == 0) "pick1" else "pick2", chosen.text, rid())
        )
        store.markContacted(rid())
        store.clearPending()
        _state.value = _state.value.copy(info = "حفظت أسلوبك من الاختيار ده 👌")
    }

    fun edit(text: String) {
        val t = text.trim()
        if (t.isEmpty()) return
        val theme = themes().firstOrNull()
        store.addStyleExample(t, theme, rid())
        if (theme != null) store.bumpThemeWeight(theme, +0.3)
        store.addFeedback(Feedback(DateUtil.todayISO(), _state.value.slot, themes(), "edited", t, rid()))
        store.markContacted(rid())
        store.clearPending()
        _state.value = _state.value.copy(info = "سجّلت نسختك المعدّلة وضفتها لأسلوبي 🌟")
    }

    fun ignore() {
        themes().forEach { store.bumpThemeWeight(it, -0.2) }
        store.addFeedback(Feedback(DateUtil.todayISO(), _state.value.slot, themes(), "ignore", null, rid()))
        store.clearPending()
        _state.value = HomeState(info = "تمام، تجاهلنا دي 🙈")
    }

    fun regenerate() {
        val occ = _state.value.occasionLabel?.let { Occasion("manual", it) }
        store.addFeedback(Feedback(DateUtil.todayISO(), _state.value.slot, themes(), "regen", null, rid()))
        generate(if (occ != null) "occasion" else _state.value.slot, occ, lastIntent, lastContext)
    }
}
