# Wisal — Implementation Roadmap (vertical slices)

> Every phase ends with: lint/checks, tests, builds green in CI, results recorded here.

## Phase 0 — Audit & recovery ✅ DONE
- Deep assessment with measured evidence: `docs/DEEP_ASSESSMENT.md`.
- H1/H2 (atomic storage + process-wide lock), M3 (desktop CI), M4/M5 (webhook signature + rate limit) fixed and CI-verified.
- Dangerous placeholder scan: no hard-coded secrets; Groq key in Android Keystore; backups exclude the key.

## Phase 1 — Design foundation ✅ DONE (this iteration)
- Global design tokens (Porcelain/Midnight/Coral/Amber/Teal) on Android theme + web CSS variables. Light-first, Midnight dark as user option.
- New Living Link logo (native SVG: logo + favicon variants, works at 16px).
- AR/EN i18n layer with instant RTL/LTR switch; all 10 Android screens bilingual; language picker in Settings; no flags for languages.
- Web rebuilt on the global identity with honest trust claims (NO E2EE claim — not built yet).

## Phase 2 — Personal AI assistant ✅ SHIPPED (pre-existing, kept)
- People/occasions/notes, two suggestions, polish, smart reply, style learning (local), history, reminders.
- Remaining in-phase work: style-learning transparency screen («ما الذي تعلّمه وصال؟») with editable rules; local model provider abstraction (today: Groq external provider with disclosure; template fallback exists offline).

## Phase 3 — Wisal Direct (E2EE) 🗺️ NOT STARTED — release-gated by security
1. ADR: E2EE library evaluation (libsignal vs MLS implementations) incl. Android+Windows support, licensing, maintenance.
2. Identity: device-generated IDs, QR/expiring-link pairing, no contact-book upload.
3. Relay backend (new service — NOT wisal-cloud-api): encrypted envelopes only, delivery state, expiry; automated plaintext-leak tests.
4. Chat UI (one-to-one), offline delivery, privacy-neutral push.
- **Rule: no E2EE marketing claims until implementation + tests genuinely support it. Mock transports must be DEMO_ONLY-flagged and blocked in production builds.**

## Phase 4 — Windows adaptive UI 🗺️
- Rail/sidebar + chat-list pane + conversation pane; keyboard shortcuts; window resize/scaling tests; QR device linking.

## Phase 5 — Website expansion 🗺️
- Pages: how-it-works, privacy, security architecture, AI principles, FAQ, business (separate), localized routes + hreflang for Level A locales; real screenshots from running apps.

## Phase 6 — Family Circles 🗺️ (after 1:1 is stable)
## Phase 7 — Wisal Business workspace 🗺️
- Separate surface, consent records (source/date/purpose/status), consent-gated sending, audit trail, opt-out. Today's business mode already enforces per-person manual review and no bulk send.

## Verification log
- 2026-08-13: Android CI green at eb959ea (83 tests); cloud-api CI green at e76e619; desktop tests green locally+CI; web validated (HTML balance, JS syntax, screenshots light/dark/mobile/desktop, zero console errors). Localization commit 5a37f22 pending CI — see Actions.
