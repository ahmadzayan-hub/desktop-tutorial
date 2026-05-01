# Changelog

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
