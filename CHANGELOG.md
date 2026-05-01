# Changelog

## v0.11.0 — 2026-05-01 — Reverse mode, A/B, library, admin

The "every idea on the roadmap, shipped" release — all ten v0.11 ideas plus
patterns drawn from PromptHero studies (visual style packs, saved library,
template categories).

- 🔍 **Reverse mode**: paste a polished prompt and learn why it works. Pure
  local analyser (`lib/reverse-analyzer.ts`) returns intent, quality
  breakdown, structural skeleton, strengths list, and one specific
  improvement target. Build / Reverse toggle at the top of the workspace.
- 🎓 **Onboarding tour**: dismissible 3-step intro on first visit.
- ⚡ **Voice-to-final smart submit**: opt-in toggle (⚡ button next to mic).
  When the user stops speaking for 2.5 s and the recogniser has captured a
  final transcript, the workspace auto-generates the prompt. Persisted in
  localStorage.
- 🛡 **Anti-hallucination guardrails**: a five-rule "Trust & accuracy"
  block is now appended to every report and research scaffold (cite
  verifiable sources only / distinguish facts from inferences / mark
  speculation / quote with source / acknowledge gaps). Both EN and AR.
- 🖼 **Shareable PNG cards**: render the final prompt as a 1200×1500
  branded image, downloadable or shareable via the OS share sheet
  (uses `navigator.share({ files })` where supported).
- ⚖️ **A/B variant comparison**: alongside the multi-model comparison,
  generate Concise + Detailed versions of the same prompt. The user picks
  the winner, choice posts to `/api/feedback` with
  `comment: "variant_winner: concise|detailed"` so the platform learns
  which length lands better per intent.
- ⭐ **Saved prompts library** (PromptHero-inspired): each history item now
  has a star toggle. New All / Saved tabs filter the list. "Clear" only
  removes un-starred items so the user's library survives.
- 🎨 **Image style packs** (PromptHero-inspired): 10 curated visual styles
  — Cinematic, Editorial, Anime, Oil, Cyberpunk, Minimalist, 3D Render,
  Vintage Film, Watercolor, Pixel Art — each one click appends a
  battle-tested set of modifiers. Picker auto-shows when the prompt is
  detected as `image` or `design`.
- 📊 **Admin feedback dashboard**: `/admin/feedback` with KPI cards,
  by-intent and by-model bar charts, top complaint tags, locale split,
  and the latest 20 rows. Reads from `/api/admin/feedback` which trusts
  Supabase RLS to gate access to org owners/admins.
- 🧩 **Browser extension polished**: rebranded to Prompt ZAI@n, MV3 hotkey
  Alt+P added, contextMenus permission for future right-click integration,
  full README with install + packaging instructions.
- 🔌 **Public API v1**: stable `/api/v1/enhance` endpoint (POST, bearer
  API key) for third-party integrations. Returns `api_version: "v1"` so
  callers can branch on schema changes safely. Existing
  `/api/extension/enhance` kept for backward compat.
- ✅ **Quality**: 59 tests (was 54), typecheck, production build all pass.

## v0.10.0 — 2026-05-01 — Multi-domain, professional voice, mobile

The "every kind of prompt, on every device" release.

- 🎙 **Voice recording rebuilt for real-world use**:
  - Explicit `getUserMedia` pre-flight so the browser's microphone prompt
    appears immediately and clearly. No more silent failures.
  - Live audio-level meter (RMS off the analyser node) → users can *see* the
    mic is working as they speak.
  - Interim transcripts are now streamed to the textarea — words appear as
    spoken, then commit when finalised. Final results replace interims
    cleanly so nothing duplicates.
  - Distinct error states for "denied", "no device", "unsupported", etc.,
    with actionable messages.
  - Continues recording across silence pauses; only stops when the user
    explicitly stops.
- 🖼 **Multi-domain prompt orchestration** — six new specialised intents
  with their own clarifying questions and output scaffolds:
  - **Image** (Midjourney/SDXL/Flux/DALL·E): subject + style + lighting +
    composition + negative prompt + diffusion params
  - **Video** (Runway/Sora/Pika/Veo): duration, aspect ratio, shot list,
    voice-over, music, hook + CTA
  - **Audio** (ElevenLabs/Suno/Udio): format, voice character, pacing,
    music & SFX cues, deliverable spec
  - **Software**: platform, stack, MVP features, data model, auth,
    acceptance tests, explicit out-of-scope
  - **Website**: purpose, page outline, hero copy, visual system,
    components, breakpoints, A11y, SEO
  - **Report**: executive summary, methodology, findings, recommendations,
    risks, references — decision-grade structure
  - 15 new unit tests for intent detection + reconstruction.
- ⚖️ **Side-by-side model comparison**: one click generates the same prompt
  formatted for ChatGPT, Claude, and Gemini in parallel cards with token
  estimates so the user can pick the best fit. All local, instant.
- 🌗 **Dark mode**: three-state toggle (light / dark / system), persisted
  in localStorage, applied before first paint to avoid a flash. Tracks
  OS preference live in system mode. Tailwind `darkMode: "class"`, dark
  variants on every surface.
- 💡 **Inline lint hints** under the textarea — at most two chips at a time
  ("Add audience", "Specify format", "Mention what to avoid") that appear
  only when the prompt actually needs them. A green "looking good" when
  the prompt is healthy.
- 📲 **Share + Install**: Web Share API integration for one-tap sharing on
  WhatsApp, Telegram, X, Mail, Messages, AirDrop — anywhere the OS share
  sheet exposes. Native PWA install button appears on Chromium/Android
  when the browser fires `beforeinstallprompt`.
- 🍎 **iOS native shell** (Capacitor scaffolded): full mobile/README.md
  with iOS + Android build instructions, microphone permission setup,
  share-sheet integration. Bundle id rebrand to `com.zaian.promptzaian`.
  Android shell remains supported and now compatible with API 22+ (≈99%
  of devices). Both shells share the live web app for instant updates.
- ✅ **Quality**: 54 tests (was 39), typecheck, production build all pass.

## v0.9.0 — 2026-05-01 — Dialects, token budget, drafts, diff

The "tangible value per session" release.

- 🇦🇪🇪🇬🇸🇦 **Voice dialect picker with country flags**: replaces the old MSA default. Arabic users see 🇦🇪 الإمارات (default), 🇸🇦 السعودية, 🇪🇬 مصر, 🇰🇼, 🇶🇦, 🇧🇭, 🇴🇲, 🇯🇴, 🇱🇧, 🇸🇾 الشام, 🇮🇶, 🇾🇪, 🇲🇦, 🇩🇿, 🇹🇳, 🇱🇾. English users see 🇺🇸/🇬🇧/🇦🇺/🇨🇦/🇮🇳. Selection persists in localStorage. Picker is a 36×36 button right next to the mic — flag-first, scannable.
- 📏 **Token-budget meter**: every final-prompt card now shows estimated tokens (low–mid–high) against the active model's context window (Generic 8k, ChatGPT 128k, Claude 200k, Copilot 64k, Gemini 1M). Colour-coded: emerald = fits, amber = getting full, rose = trim before sending. Pure-function estimator with 11 unit tests; honest ±15% range so users see uncertainty rather than false precision.
- 💾 **Auto-save drafts**: raw prompt + target model are saved to localStorage on every keystroke (debounced 500 ms, 7-day TTL). On reload, the workspace shows a soft amber "Draft restored" strip with a "Discard" button. Completing or abandoning a session clears the draft.
- 🔍 **Before/after diff viewer**: collapsible card under the final prompt, highlighting in emerald the lines the orchestrator added. Line-level LCS — pure function, 4 unit tests, bounded so a 5k-line input still renders instantly.
- ✅ **Quality**: 39 tests (was 24), typecheck, production build all pass. Zero failures.

## v0.8.0 — 2026-05-01 — Brand identity + sharper learning loop

The "Prompt ZAI@n / موجة زيان" release.

- 🪪 **New brand**: the platform is now **Prompt ZAI@n** in English and **موجة زيان** in Arabic. Wordmark component shows the active form prominently with the other form as a small subtitle so both audiences recognise it. Logo, manifest, page titles, OG/Twitter metadata, JSON-LD schema, app-name keys all updated. PWA install name = "ZAI@n".
- 🇦🇪 **"Made in UAE — free for the world"** is now visible on every page: a soft gradient pill above the hero, a one-paragraph note under the CTAs, and a refreshed footer line. The trial banner reinforces it.
- 📊 **Prompt-quality score (0-100)** with a 5-dimension breakdown — clarity, specificity, structure, audience, format. Renders as a circular gauge + horizontal bars on every final-prompt card, with a "+Δ vs your raw input" delta so users see the value the orchestrator added at a glance. Pure-function scorer in `lib/quality-score.ts`, fully unit-tested (6 new tests).
- 🎯 **Two-step feedback**: when a user thumbs-down, six reason chips appear (too long / too short / off-topic / bad format / wrong tone / wrong language) plus an optional note. Tags are stored alongside the rating, giving the learning loop a much sharper signal than a binary rating alone.
- 🏠 **Home empty-state polish**: three concrete example cards under the hero ("Refactor a slow component", "Marketing tweet", "Summarise a topic"). Tapping any card pre-loads the workspace with that prompt + the right target model.
- 🔍 **SEO**: new JSON-LD WebApplication schema published in the page head — `countryOfOrigin: UAE`, `isAccessibleForFree: true`, multilingual, free offer.
- ✅ **Quality**: 24 tests (was 18), typecheck, production build all pass.

## v0.7.0 — 2026-05-01 — Phase-1 public trial

The "real-time learning loop" release.

- 📥 **Feedback widget + `/api/feedback`**: thumbs up/down + optional note on every generated prompt. Anonymous-friendly. Persists to a new `feedback` table when Supabase is configured (`0002_feedback.sql` migration), logs to console otherwise so the UI never blocks. The team can read aggregate signal in real time and steer the engine — this is the learning loop for the public trial.
- 🕘 **Anonymous local history**: every browser keeps its last 20 prompts in `localStorage`, with quick "Restore" / "Remove" / "Clear". Non-logged-in users now get a real history experience without any backend.
- ✉️ **Contact**: `ahmad.zaian@outlook.com` is now visible in the footer, in a dismissible public-trial banner at the top of every page, and as a single-source-of-truth `lib/contact.ts` for site-wide reuse.
- ⌨️ **Power-user UX**: Cmd/Ctrl+Enter starts a session, +Shift does quick-enhance. New "Regenerate" and "Download .md" buttons on the final card. Skip-to-content link, focus-visible rings, ARIA roles on alerts/status, label–for/id wiring on every input. Loading skeleton replaces the bare disabled state.
- 🌍 **i18n polish**: intent badges now translate (coding/writing/research/analysis/planning/creative/design/conversation/other) so the Arabic UI is end-to-end Arabic. New strings for feedback, contact, history, trial banner.
- 🛡 **Operational hardening**: `next.config.mjs` adds X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS to every response. Open-Graph + Twitter cards for social shares. `robots.txt` + `sitemap.xml` for indexing. Privacy note on file uploads.
- ✅ **Quality**: 18 tests, typecheck, production build all pass. Zero failures.

## v0.6.0 — 2026-05-01

The "zero-fail Vercel functions" release.

- 🛡 **Vercel functions zero-fail**: every API route is now wrapped in `safeRoute`, which detects "backend not configured" (the default state on a free-tier Vercel deploy without Supabase) and returns `200 { unavailable: true }` instead of a 5xx. The 48.5% error rate observed on Vercel Observability is fixed at the source. Client `safe-fetch` normalises this envelope to "fall through to local mode."
- 🎙 **Long-form voice recording**: the mic now records until the user explicitly stops. Web Speech recognisers auto-end after a silence window (especially on mobile Chrome) — we transparently restart the recogniser as long as the user is still in listening mode, with a live elapsed-time indicator.
- 📎 **Universal file upload**: the upload widget now accepts *any* file — images, PDFs, docs, archives, code — up to 10 MB each. Text-like files are extracted as before; images are inlined as data URLs (vision-capable models can read them); other binaries are surfaced to the prompt as filename + size + MIME type so the model knows the user attached them.
- 🎨 **Responsive redesign**: the workspace now uses a 2-column layout on `lg+` (input left, output right) and a clean stack on tablet/mobile, reaching `max-w-7xl`. Home, header, footer, templates, history all aligned to the new wide layout. The "Try a starter" row was removed from the workspace — templates page already covers that need.
- ✅ **Quality**: 18 tests, typecheck, production build all clean.

## v0.3.0 — 2026-05-01

The "it works on my phone" release.

- ✅ Bug fix: client-side `Failed to execute 'json' on 'Response'` is gone (safeFetch wrapper + handles empty/non-JSON bodies).
- 🌍 Multilingual: full English + Arabic dictionaries, `<html dir="rtl">` switching, language toggle persisted in cookie + localStorage, RTL-safe layouts using logical properties.
- 📱 Mobile: PWA manifest + service worker (installable on Android), responsive header with hamburger menu, Capacitor scaffold for a true `.apk`.
- 🛠 Local engine: full client-side prompt orchestration — intent detection (EN+AR), question generation, model-specific reconstruction (ChatGPT, Claude, Copilot, Gemini, generic). Workspace falls back to local engine on any backend failure, so the app *always* produces a result.
- 🎨 Brand mark: prompt-cursor + spark logo on a brand→violet→pink gradient.
- ✨ Visual aids: hero illustration (raw note → spark → polished card), line-art step icons (Pen, Chat, Sparkle), coloured intent badges, decorative corner sparks.
- ✅ Quality: 18 vitest tests, typecheck and production build clean.

Tag: `v0.3.0` (local, on commit `526fa8c`).

## v0.2.0

- Vitest harness with 18 unit tests across 4 service modules.
- Quick-enhance mode (skip clarifications).
- Six starter prompts on workspace, before/after compare panel, history search.
- Gemini target_model end-to-end, graceful LLM-unreachable 503.

## v0.1.0

- Initial multi-tenant SaaS scaffold: Next.js + Supabase + Ollama + Vercel.
- Browser extension (MV3) for ChatGPT / Claude / Copilot / Gemini.
- Self-contained interactive demo at `/demo.html`.
