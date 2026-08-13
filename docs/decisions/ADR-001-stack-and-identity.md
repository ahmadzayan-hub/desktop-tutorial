# ADR-001: Keep the existing stack; adopt the global Living Link identity

Date: 2026-08-13 · Status: Accepted

## Context
The master brief allows a rewrite (e.g. Flutter) if the current stack can't serve Android+Windows. The repo has a shipped, tested product: Kotlin/Compose Android (83+ CI tests), Electron Windows app with a tested pure core, a static web presence, and a hardened WhatsApp Business Cloud API backend.

## Decision
1. **Extend, don't rewrite.** The existing stack passes the Architecture Decision Gate for Phases 0–2 and 5. A cross-platform re-evaluation (Flutter/KMP) is deferred to the start of Phase 3 (Wisal Direct), where E2EE SDK compatibility (libsignal/MLS), secure storage, and push must be validated per platform before any framework choice.
2. **Adopt the global identity now** across Android, web, and future Windows work: tokens Midnight `#061827`, Coral `#FF6E72`, Amber `#F2C56B`, Teal `#35B8A6`, Porcelain `#F8F5EF`, Mist `#AAB8C4`; light-first with Midnight dark option; coral→amber gradient reserved for primary CTAs/brand moments; Living Link logo as native SVG.
3. **i18n via inline `t(ar,en)`** for the two Level A languages, with a documented migration path to resource files at the third language (see localization-strategy).
4. **No E2EE claims** anywhere until Phase 3 ships with tests; business backend (`wisal-cloud-api`) is explicitly not the future Direct relay.

## Consequences
- Fast, low-risk delivery of design + localization on the shipped product; zero regression risk to working flows.
- Phase 3 carries an explicit ADR-002 (E2EE protocol + client architecture) before any code.
- Raster mockups remain references only; all UI is native components (Compose/HTML), no text baked into images.
