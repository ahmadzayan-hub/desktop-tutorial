# Canonical Project Registry

Invariant (spec §11): every discovered project identity appears exactly once.
**19 canonical projects** across 29 repos. W7 complete: all 19 audited, none unaudited.

| # | Project | Canonical repo | Status | Historical identities absorbed |
|---|---|---|---|---|
| 1 | Masaar — commerce ops control tower | `masaar` | ACTIVE · PR#1 merged, PR#2 open | `wasl`, `beyond-style-uae`, `beyond-connect-console` |
| 2 | Maktab — learning OS | `maktab` | ACTIVE · PR#1,#2 open | `tweenz-ai` |
| 3 | Mutabasir — evidence intelligence | `mutabasir` | ACTIVE · PR#1 open | `mutabasir-director-lens` |
| 4 | VERTEX — contract compliance | `vertex` | ACTIVE · PR#1 open | — |
| 5 | Beyond Style — jewellery design & production | `66` *(canonical undecided)* | ACTIVE · PR#2 open · **duplicate of `Beyond-Style-UAE-`, escalated** | `beyond-style-ops` (legacy snapshot) |
| 6 | RailMind — rail maintenance intelligence | `33` | ACTIVE · PR#1 open (greenfield) | — |
| 7 | Pitchora — evidence presentation studio | `Pitchora-studio-Private` | ACTIVE · PR#1 open | `pitchora-studio` |
| 8 | Lahza — coffee gifts & events | `lahza` | ACTIVE | `beyond-coffee-moments` |
| 9 | Wisal — relationship intelligence | `wisal` | PROTOTYPE | — |
| 10 | Annual Operation Plan 2026 | `annual-operation-plan-2026` | PROTOTYPE | `operational-plan-v03` |
| 11 | PromptOps — prompt lifecycle | `promptops` | PROTOTYPE | `prompt-orchestrator`, `zaian-studio` |
| 12 | **Draftly · صياغة** | `draftly-Private` | ACTIVE (v1.0.1) — **not previously in the portfolio list** | `archive/draftly/main` |
| 13 | Data Value Studio | `data-value-studio` | CHARTERED | — |
| 14 | ExecFlow | `exeflow` | CHARTERED | — |
| 15 | AI Assurance Lab | `44` | NOT STARTED | — |
| 16 | Agentic Analytics | `11` | INCUBATION — audited W7 | — |
| 17 | ALKAHTANI OS | `22` | EXPERIMENT — audited W7 | — |
| 18 | Local AI Workstation | `55` | USEFUL_UTILITY — audited W7, an implementation kit not an app | — |
| 19 | Agentic OS Enterprise | `agentic-os-enterprise` | PRODUCTION_CANDIDATE — audited W7; owner must state its purpose before P0/P1 | — |
| — | BSOS | `Beyond-Style-UAE-` | **Not a distinct project** — second implementation of #5. Canonical choice ESCALATED, see DUPLICATE_ANALYSIS.md | — |
| — | Commerce Policy Engine (future) | `beyond-style-ops` | LEGACY SNAPSHOT | — |

## Containers / non-projects

| Repo | Role | Note |
|---|---|---|
| `lahza-Private` | Historical mixed container, 74 branches | **Public despite the `-Private` name.** Every identity inside resolves to a canonical repo above. |
| `desktop-tutorial` | Migration archive | — |
| `pitchora`, `pitchora2` | **Empty — zero commits** | Verified by clone. No content to preserve. |
| `prompt-orchestrator-Private`, `beyond-style-uae-Private`, `mutabasir-director-lens-Private` | Private predecessors, unaudited | Named `-Private`; visibility not yet verified per repo |
| `sherifkaroub83-cell/talabat-retention-agentic-os` | External collaboration | Not owned |

## Naming / visibility mismatch (owner action — approval gated)

`lahza-Private` is **public**. `Pitchora-studio-Private` is **public**.
Visibility changes are approval-gated (spec §3) and not attempted.
