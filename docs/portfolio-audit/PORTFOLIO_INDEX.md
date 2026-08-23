# Portfolio Index

The single source of truth. One row per canonical project, 2026-08-23.
**20 canonical projects** — HADER AI was found on 2026-08-23 and had never been registered.

| Project | Canonical repo | Family | Status | Priority | Score | Build | Tests | Production URL | Last validation |
|---|---|---|---|---|---|---|---|---|---|
| Masaar — commerce ops control tower | `masaar` | Commerce | PRODUCTION_CANDIDATE | P0 | 78 | pass | 79 | masaar (Vercel) | 2026-08-23 |
| Maktab — learning OS | `Maktab` | Learning | ACTIVE_DEVELOPMENT | P1 | 72 | pass | 40 | maktab (Vercel) | 2026-08-23 |
| Mutabasir — evidence intelligence | `mutabasir` | Intelligence | ACTIVE_DEVELOPMENT | P0 | 76 | pass | 83 | mutabasir (Vercel) | 2026-08-23 |
| VERTEX — contract compliance | `vertex` | Intelligence | ACTIVE_DEVELOPMENT | P1 | 80 | pass | 63 + 15 e2e | vertex (Vercel) | 2026-08-23 |
| Beyond Style — jewellery design & production | `66` **(canonical undecided)** | Commerce | ACTIVE_DEVELOPMENT | P1 | 70 | pass | 90 | 66-ten-tawny.vercel.app | 2026-08-23 |
| RailMind — rail maintenance intelligence | `33` | Industrial | PRODUCTION_CANDIDATE | P1 | 76 | pass | 38 | **33-ashen-xi.vercel.app — live** | 2026-08-23 |
| Pitchora — boardroom presentation studio | `Pitchora-studio-Private` | Intelligence | ACTIVE_DEVELOPMENT | P1 | 74 | pass | 125 | not deployed | 2026-08-23 |
| Lahza — coffee gifts & events | `lahza` | Commerce | ACTIVE_DEVELOPMENT | P2 | 58 | pass | none | lahza (Vercel **+ Netlify**) | 2026-08-23 |
| Draftly · صياغة | `draftly-Private` | Productivity | ACTIVE_DEVELOPMENT | P2 | 66 | pass | 62 | not deployed | 2026-08-23 |
| PromptOps — prompt lifecycle | `promptops` | Productivity | PROTOTYPE | P2 | 60 | pass | 18 | promptops (Vercel) | 2026-08-23 |
| Wisal — relationship intelligence | `wisal` | Intelligence | PROTOTYPE | P3 | 35 | pass | **33** | wisal (Vercel) — **3 deployable surfaces** | 2026-08-23 |
| HADER AI — lecture assistance | `qwen-lecture-ai-2` | Learning | ACTIVE_DEVELOPMENT | P2 | — | pass | 46 | not deployed | 2026-08-23 |
| Annual Operation Plan 2026 | `annual-operation-plan-2026` | Industrial | PROTOTYPE | P3 | 30 | n/a | none | **3 hosting configs — Netlify + Vercel + Pages** | 2026-08-23 |
| Agentic OS Enterprise | `agentic-os-enterprise` | Platform | PRODUCTION_CANDIDATE | **owner decision** | 85 | unverified | 42 files | not deployed | 2026-08-23 |
| Agentic Analytics | `11` | Platform | INCUBATION | P3 | 55 | unverified | 19 files | not deployed | 2026-08-23 |
| ALKAHTANI OS | `22` | Platform | EXPERIMENTAL | P3 | 25 | unverified | 0 | not deployed | 2026-08-23 |
| Local AI Workstation kit | `55` | Utility | ARCHIVED-ready | P3 | n/a | n/a | n/a | n/a — a procedure, not an app | 2026-08-23 |
| Data Value Studio | `data-value-studio` | Intelligence | CHARTERED | P3 | 10 | n/a | none | not deployed | 2026-08-23 |
| ExecFlow | `exeflow` | Productivity | CHARTERED | P3 | 10 | n/a | none | not deployed | 2026-08-23 |
| AI Assurance Lab | `44` | Platform | NOT_STARTED | P3 | 0 | n/a | none | not deployed | — |
| BSOS — Beyond Style agentic OS | `Beyond-Style-UAE-` | Commerce | **REPLACED-or-canonical, undecided** | blocked | 73 | unverified | 15 files | not deployed | 2026-08-23 |

**Score** is a rough composite of build health, test depth, CI presence,
security posture and deployment reality. It is a triage aid, not a measurement
— treat a five-point gap as noise.

## Not projects

| Repo | Role |
|---|---|
| `lahza-Private` | Historical archive, 74 branches. **The provenance record — do not retire.** |
| `desktop-tutorial` | Migration archive |
| `beyond-style-ops` | Legacy snapshot (`legacy-final` branch) |
| `pitchora`, `pitchora2` | Empty — zero commits |
| `prompt-orchestrator-Private`, `beyond-style-uae-Private`, `mutabasir-director-lens-Private` | Private predecessors |

## What "PRODUCTION_READY" would still require

No project claims it, and that is deliberate. Three things are missing
portfolio-wide:

1. **Masaar's security model is not in force.** RBAC, role-scoped RLS, the
   enforced state machine and the append-only audit log are merged in the
   repository, but migration `0006` cannot run while Supabase `beyond-style`
   is INACTIVE. Code that describes a guarantee is not the guarantee.
2. **No project has a version tag.** Rollback rests on branches, which are
   mutable. Three tags exist across 24 repos and all three are moving
   pointers.
3. **No deployment has been cut over under the spec's protocol** — staging,
   smoke, critical-flow, environment validation, production, domain check,
   post-deploy test, rollback validation. Every live URL predates this audit.

## Cheapest next wins

| Action | Why |
|---|---|
| Restore Supabase `beyond-style` | Unblocks masaar's entire security model. Highest value in the portfolio. |
| Decide Beyond Style canonical | Two implementations of one product, both maintained, neither a superset. The cost compounds. |
| Delete 2 broken Vercel projects | Every push to `vertex` produces one success and two guaranteed failures. |

## Corrections to this document

Recorded rather than silently edited, per the audit's own rule.

| Was | Is | How it was found |
|---|---|---|
| Wisal — `Tests: none` | **33 tests, all passing** | Went to check whether Wisal had any tests before calling it a prototype. `telegram-wife-assistant` alone holds 29 — the largest single suite in the portfolio — and no workflow ran them. Fixed in `wisal#1`. |
| Wisal — `Build: n/a` | **pass** | Same pass. Five workflows now build and test android, desktop, telegram and two services on every push and pull request. |
| 19 canonical projects | **20** | `qwen-lecture-ai-2` (HADER AI) held an open pull request and appeared in no registry row, no family, no duplicate analysis. It was never discovered because it was never in the repo list this audit was seeded from. |
| Beyond Style is built **twice** | **three times** | `beyond-style-uae-v6` — a v0-bootstrapped pricing workbench, 58/100 on its own scorecard, no tests. Found the same way, an hour later. Not a third rival implementation but a single capability the other two lack; see DUPLICATE_ANALYSIS.md. |
| Seven projects listed as having open PRs | **all merged** | The Status column was never refreshed after the merges. Checked against the PR search rather than assumed. |
