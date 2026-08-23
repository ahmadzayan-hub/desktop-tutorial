# Hidden Project Discovery — W1/W2

Container audited: `lahza-Private` (public despite the name) — 74 branches:
`archive/*` 72, `main` 1, `lint-setup` 1.

## Result: no new independent projects. Every identity resolves to an existing canonical repo.

Method: `git for-each-ref` + `git show <ref>:package.json` + README first line.
No full-tree reads. Bare `--filter=blob:none` clone.

| Identity found in archive | Evidence | Resolution | Canonical |
|---|---|---|---|
| `draftly` 1.0.0 | `archive/draftly/main` | Canonical repo **already exists** and is ahead (v1.0.1, 2026-07-25) | `draftly-Private` |
| `wasl` 0.1.0 | `archive/wasl`, 2 `claude/*` | **Earlier name of masaar.** Same product, same routes, same tagline "AI drafts, owner approves" | `masaar` |
| `beyond-coffee-moments` | 3 `claude/*` | **Earlier name of Lahza.** Description is word-for-word identical to `lahza` | `lahza` |
| `tweenz-ai` | 1 `claude/*` | **Earlier name of Maktab** | `maktab` |
| `zaian-studio` | 1 `claude/*` | ZAIan Studio lineage | `promptops` |
| `prompt-orchestrator` 0.18.0 | `archive/legacy/prompt-orchestrator` + 3 `claude/*` | Superseded lineage | `promptops` |
| `mutabasir-director-lens` 0.1.0 | `archive/mutabasir/director-lens-platform` | | `mutabasir` |
| `pitchora-studio` 0.5.0 | `archive/pitchora` | Same version as canonical | `Pitchora-studio-Private` |
| `beyond-style-uae` 0.1.0 | `archive/beyond-connect-console`, `archive/beyond-style-uae-snapshot`, 18 `claude/*` | | `masaar` |
| `lahza` 1.0.0 | `archive/lahza*`, `archive/operational-plan-v03`, 24 `claude/*` | | `lahza` |
| `maktab` 0.19.0 | `archive/main`, `archive/HEAD` | | `maktab` |
| `archive/Zaian` | no package.json, GitHub Desktop default README | No project | — |

**Correction to the prior baseline:** the spec listed
`lahza-Private:archive/draftly/main → Draftly` as a hidden project needing
extraction. It does not need extraction — `draftly-Private` already exists,
carries the same package at a **higher** version, and is the canonical home.
W5 extraction is therefore NOT required for Draftly.

## Recoverable delta found (W6)

`archive/wasl` (masaar's predecessor) carries assets masaar lost in the rename:

| Asset | Status | Decision |
|---|---|---|
| `src/app/manifest.ts` | masaar has none | **RECOVER** — PWA installability for an ops console used on phones |
| `src/app/robots.ts`, `src/app/sitemap.ts` | masaar has none | **DO NOT RECOVER** — masaar deliberately sets `robots: { index: false }` as an internal tool; recovering these would contradict a current product decision |
| `src/app/integrations/page.tsx` + `src/lib/integrations/{notebooklm,notebooklm-session,secure-store}.ts` + 3 OAuth API routes | masaar has none | **OWNER DECISION** — a complete Google OAuth (NotebookLM) subsystem, ~7 files. Recovering it re-introduces a third-party OAuth surface and secret handling into masaar. Not recovered unilaterally. |
