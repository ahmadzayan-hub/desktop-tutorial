# Supported locales

Status of every locale the app can display. A locale appears in the in-app
language selector **only** if it is registered in
`android-wife-assistant/.../data/Locales.kt`. No flags represent languages.

| Locale | Native name | Direction | UI coverage | Review status | Selector |
|---|---|---|---|---|---|
| `ar` | العربية | RTL | 100% (inline source) | Native-reviewed (source language) | ✅ |
| `en` | English | LTR | 100% (inline source) | Reviewed | ✅ |
| `es` | Español | LTR | ~93% via pack, rest falls back to English | **Machine-drafted — pending native review** | ✅ shown as "Español (beta)" |

## Architecture (Level C framework)

- `ar`/`en` live inline at call sites: `t("عربي", "English")`.
- Every other locale is a **pack**: `Map<English source string → translation>`
  (`LocalePackEs.kt`), resolved by `t()` with a safe fallback to English —
  a missing key can never clip text or crash.
- `Locales.kt` is the single registry: BCP 47 code, native name, direction,
  and `machineDrafted` review flag. Adding locale N+1 = one registry entry +
  one pack file; no screen changes. Layout direction everywhere derives from
  the registry (`Locales.isRtl`), never from `lang == "en"` checks.

## Known limitations (honest)

1. **Interpolated strings** (~20 of ~300, e.g. `"$streak warm days in a row"`)
   evaluate before lookup, so packs can't match them; they display in English
   for pack locales. Fix planned when moving to keyed resources with
   placeholders; tracked, not hidden.
2. **Spanish is machine-drafted.** It is labeled "(beta)" in the selector and
   must not be marketed as a completed Level A language until a native
   speaker reviews the pack (see `docs/native-review-process.md` — to be
   written with the first external reviewer).
3. A unit test (`LocalesTest.packHasNoInterpolatedKeysAndNoEmptyValues`)
   enforces pack hygiene: no dead interpolated keys, no empty translations.

## Next locales (Level A candidates, in order)

`hi`, `fr`, `pt-BR`, `id`, `tr` — architecture-ready today; each ships only
after translation + native review + RTL/LTR render test (the pattern used by
`welcomeScreenComposesInSpanish`).
