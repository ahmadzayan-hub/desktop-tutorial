# Changelog

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
