# Canonical Project Registry

Invariant (spec §11): every discovered project identity appears exactly once.
**20 canonical projects** across 31 repos. W7 complete for the original 19; #20 was
found on 2026-08-23 and audited the same day.

| # | Project | Canonical repo | Status | Historical identities absorbed |
|---|---|---|---|---|
| 1 | Masaar — commerce ops control tower | `masaar` | ACTIVE · all PRs merged | `wasl`, `beyond-style-uae`, `beyond-connect-console` |
| 2 | Maktab — learning OS | `maktab` | ACTIVE · all PRs merged | `tweenz-ai` |
| 3 | Mutabasir — evidence intelligence | `mutabasir` | ACTIVE · all PRs merged | `mutabasir-director-lens` |
| 4 | VERTEX — contract compliance | `vertex` | ACTIVE · all PRs merged | — |
| 5 | Beyond Style — jewellery design & production | **`Beyond-Style-UAE-`** — owner decision 2026-08-24 | ACTIVE · v6's pricing engine absorbed as `cost_model.py` with 18 new tests | `66` (f1521d1 / eecc953), `beyond-style-uae-v6`, `beyond-style-ops` (legacy snapshot) |
| 6 | RailMind — rail maintenance intelligence | `33` | ACTIVE · all PRs merged (greenfield) | — |
| 7 | Pitchora — evidence presentation studio | `Pitchora-studio-Private` | ACTIVE · all PRs merged | `pitchora-studio` |
| 8 | Lahza — coffee gifts & events | `lahza` | ACTIVE | `beyond-coffee-moments` |
| 9 | Wisal — relationship intelligence | `wisal` | PROTOTYPE · PR#1 merged, PR#2 open (Vercel fix) · **33 tests, previously recorded as none** | — |
| 10 | Annual Operation Plan 2026 | `annual-operation-plan-2026` | PROTOTYPE | `operational-plan-v03` |
| 11 | PromptOps — prompt lifecycle | `promptops` | **PROTOTYPE — repo is a hybrid.** Real PromptOps code (`template.ts`, `formatter.ts`, `clarification.ts`, `llm/`, and the 18 tests) is grafted onto a **Maktab** app shell: `package.json` name is `maktab`, routes are `ask-mba/`, `flashcards/`, `grades/`. Its README declares a non-goal of "being a feature inside Maktab". | `prompt-orchestrator`, `zaian-studio` |
| 12 | **Draftly · صياغة** | `draftly-Private` | ACTIVE (v1.0.1) — **not previously in the portfolio list** | `archive/draftly/main` |
| 13 | Data Value Studio | `data-value-studio` | CHARTERED | — |
| 14 | ExecFlow | `exeflow` | CHARTERED | — |
| 15 | AI Assurance Lab | `44` | NOT STARTED | — |
| 16 | Agentic Analytics | `11` | INCUBATION — audited W7 | — |
| 17 | ALKAHTANI OS | `22` | EXPERIMENT — audited W7 | — |
| 18 | Local AI Workstation | `55` | USEFUL_UTILITY — audited W7, an implementation kit not an app | — |
| 19 | Agentic OS Enterprise | `agentic-os-enterprise` | PRODUCTION_CANDIDATE — audited W7; owner must state its purpose before P0/P1 | — |
| 20 | **HADER AI — lecture assistance** | `qwen-lecture-ai-2` | ACTIVE_DEVELOPMENT · all PRs merged — **was in no registry row until 2026-08-23** | `hader-ai` (package name) |
| — | BSOS | `Beyond-Style-UAE-` | **Not a distinct project** — second implementation of #5. Canonical choice still ESCALATED, see DUPLICATE_ANALYSIS.md. PR#1 merged 2026-08-23: 17,214 lines moved off `claude/bsos-agentic-os-t1jehu` onto `main`. **That branch is still the repository default** — a `claude/*` branch as a product's permanent home is what the Permanent Portfolio Rule forbids, and changing the default is a repo-settings action only the owner can take. | — |
| — | Commerce Policy Engine (future) | `beyond-style-ops` | LEGACY SNAPSHOT | — |

## Containers / non-projects

| Repo | Role | Note |
|---|---|---|
| `lahza-Private` | Historical mixed container, 74 branches | **Public despite the `-Private` name.** Every identity inside resolves to a canonical repo above. |
| `desktop-tutorial` | **NOT an archive — a second live copy of Maktab, non-canonical as of 2026-08-24. Must stay deployed:** its URL is what ZAIan Studio's shipped clients open | `package.json` is named `maktab`; own CI, own Vercel project, `src/` already diverged from the canonical `maktab`. See DUPLICATE_ANALYSIS.md. Canonical choice is an owner decision. |
| `pitchora`, `pitchora2` | **Empty — zero commits** | Verified by clone. No content to preserve. |
| `prompt-orchestrator-Private`, `beyond-style-uae-Private`, `mutabasir-director-lens-Private` | Private predecessors, unaudited | Named `-Private`; visibility not yet verified per repo |
| `sherifkaroub83-cell/talabat-retention-agentic-os` | External collaboration | Not owned |

## Naming / visibility mismatch (owner action — approval gated)

`lahza-Private` is **public**. `Pitchora-studio-Private` is **public**.
Visibility changes are approval-gated (spec §3) and not attempted.
