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

class HomeViewModel(app: Application) : AndroidViewModel(app) {
    private val settings = Settings(app)
    private val store = Store(app)
    private val occasions = Occasions(settings)
    private val engine = SuggestionEngine(store, GroqClient(settings), settings)

    private val _state = MutableStateFlow(HomeState())
    val state: StateFlow<HomeState> = _state.asStateFlow()

    init { loadPending() }

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

    fun generate(slot: String = "manual", occasion: Occasion? = null) {
        val occ = occasion ?: if (slot == "occasion") occasions.todaysOccasion() else null
        val effectiveSlot = if (occ != null) "occasion" else slot
        _state.value = _state.value.copy(loading = true, error = null, info = null)
        viewModelScope.launch {
            try {
                val res = engine.generate(effectiveSlot, occ)
                store.setPending(PendingRound(res.slot, res.themesShown, res.items, occ?.label))
                _state.value = HomeState(
                    items = res.items,
                    slot = res.slot,
                    themesShown = res.themesShown,
                    occasionLabel = occ?.label,
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
        generate(if (occ != null) "occasion" else _state.value.slot, occ)
    }
}
