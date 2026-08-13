# Wisal — Localization Strategy

> Principle: globalization is architecture, not an afterthought. But we never claim a language is "supported" before translation + native review + QA pass.

## Support levels

- **Level A (fully reviewed)** — today: **العربية (ar, مصري default)** and **English (en)**. Both: full UI translation, RTL/LTR verified, AI-composer quality verified.
- **Level A candidates (next)**: ar-EG, ar-AE, en-US/GB, es/es-419, hi, zh-Hans/Hant, fr, pt-BR/PT, bn, ur, id, ru, ja, de, tr, ko, vi, fa, sw — each gated by the locale-release checklist below.
- **Level B (prepared, not exposed)**: pa, mr, te, ta, th, fil, ms, it, nl, pl, uk, ro, ha, am, gu, kn, ml, my, ne.
- **Level C (framework)**: any CLDR locale addable via resources without changing product logic.

## Separate language preferences (implemented / planned)

| Preference | Status |
|---|---|
| App/UI language (menus, buttons, settings) | ✅ `Settings.appLanguage` — instant switch + direction flip |
| Message language per person | ✅ per-recipient `language` (auto/ar/en) |
| Dialect per person | ✅ per-recipient `dialect` (مصري/خليجي/شامي/مغاربي/فصحى) |
| Secondary language, local draft detection | 🗺️ planned — detection stays on-device («يتم تحديد لغة المسودة على جهازك.») |

## Engineering rules

- UTF-8 everywhere; BCP 47 tags ("ar", "en", later "ar-EG"…).
- Direction follows locale metadata, not hard-coded left/right: Compose `LocalLayoutDirection` switches with app language; web uses logical properties (`inset-inline-start`, `padding-inline`).
- **No flags represent languages.** Language names shown in their native form (العربية, English…).
- Current mechanism: inline `t(ar, en)` pairs — readable and reviewable at the call site. Migration path to resource files (`strings.xml` per locale) when a third Level A language lands; the `t()` call sites make extraction mechanical.
- Mixed-direction content: Arabic UI keeps Latin tokens (URLs, "Business API") inline; verified in screenshots. Bidi isolation to be added around user-generated names when Direct chat lands.

## CI gates (to add with the third language)
- Missing/empty/unused keys, placeholder validation, plural categories, direction metadata, untranslated-English detection, terminology consistency vs `terminology-glossary`.

## Honest AI-language labeling
AI generation quality is tracked separately from UI translation: today Arabic (Egyptian default, 4 dialects) and English are "Full AI support"; any future UI locale ships with an explicit label (Full / Basic / Template assistance / Translation only / Coming later) and a reviewed template fallback.
