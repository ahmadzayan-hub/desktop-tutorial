# W7 — Completion Triage

Triage of the five previously unaudited repositories. Evidence gathered from a
shallow clone of each default branch (not from README claims — spec rule 4).

Validation date: 2026-08-23.

## Volatile facts captured

| Repo | Default branch | HEAD | Last commit | Code LOC | Test files | CI |
|---|---|---|---|---|---|---|
| `11` | `claude/agentic-os-final-project-53j6ql` | `ad234b6` | 2026-08-15 | 12,418 | 19 | `ci.yml` |
| `22` | `claude/agentic-os-build-dp93ao` | `12bde88` | 2026-08-22 | 1,891 | 0 | `nextjs.yml` only |
| `55` | `claude/local-ai-windows-setup-yv2ekh` | `df4e30c` | 2026-08-18 | 1,601 | 0 | none |
| `agentic-os-enterprise` | `claude/agentic-os-enterprise-v3.1-ogi9cq` | `9aa6d76` | 2026-08-18 | 30,005 | 42 | `ci.yml`, `release.yml` |
| `Beyond-Style-UAE-` | `claude/bsos-agentic-os-t1jehu` | `b2c4cdb` | 2026-08-22 | 12,448 | 15 | `ci.yml` |

**Governance finding, all five:** none has a `main` branch. Every repository's
default branch is a `claude/*` working branch. Per the spec's CI/main
governance section the default branch should normally be `main`. Renaming is a
non-destructive rename of the default branch pointer, but it changes the name
production tooling may reference, so it is listed as a governance action rather
than performed silently — see EXECUTION_STATE.md.

## Triage

### `11` — Agentic Analytics
- **Primary user:** a business analyst or owner with a dataset and a question.
- **Job to be done:** turn a raw dataset into a *validated* business-analytics
  report across all four analytics types, with every claim traceable to a
  calculation.
- **Business outcome:** a decision-grade report published into an
  Obsidian-compatible vault behind an explicit approval bound to an artifact hash.
- **Classification: INCUBATION.** Real engineering (19 test files, CI, a
  provider-neutral gateway that is deterministic by default), but no deployment,
  no owner, and no production consumer.
- **Capabilities:** orchestration REAL · analytics agents REAL · approval gate
  REAL · model narration PARTIAL (optional, deterministic default) · PWA REAL.
- **Notable strength worth preserving regardless of this project's fate:** the
  gateway never lets the model see the dataset or produce a number — the model
  only phrases already-verified facts. That is the same discipline Mutabasir and
  VERTEX need, expressed here as a working implementation.

### `22` — ALKAHTANI OS
- **Primary user:** one named human Operator (the portfolio owner).
- **Job to be done:** run the owner's own business through one conductor agent
  over a pgvector knowledge core.
- **Classification: EXPERIMENT.** 1,891 LOC, **zero test files**, and the only
  workflow is a Next.js build. The README describes 35 agents and six crews; the
  repository contains a Fastify API, a Next.js web app, and generated seed data.
  The 35 agents exist as **markdown identity files in `vault/`**, not as running
  code.
- **Capabilities:** G-Brain ingest/search PARTIAL · 35 agents SIMULATED (vault
  markdown + seed rows, no execution path) · dashboard PARTIAL · Grok invocation
  UNVERIFIED (requires `XAI_API_KEY`; no test exercises it).
- **Do not overengineer.** Spec: experiments do not receive P0/P1 completion.

### `55` — Local AI Workstation kit
- **Primary user:** one engineer setting up a Windows 11 laptop.
- **Job to be done:** stand up a private, local-first, source-grounded RAG
  assistant, gate by gate, without anything leaving the machine.
- **Classification: USEFUL_UTILITY.** This is **not an application** — it is a
  phased implementation kit: PowerShell scripts plus 18 documents with ten
  explicit pass/fail gates. Judging it by "0 tests, no CI" would be a category
  error; its deliverable is the procedure, and the procedure is executable.
- **Capabilities:** audit/install/benchmark/privacy-check scripts REAL ·
  retrieval quality gates REAL as documented procedure · nothing to deploy.
- **Recommendation:** keep as-is. It needs no build pipeline. It would benefit
  from a `main` branch and a one-line note that it targets a specific laptop.

### `agentic-os-enterprise` — Agentic OS Enterprise
- **Primary user:** an enterprise platform/security team governing AI agents.
- **Job to be done:** let agents act on real business systems without ever
  letting one reach production directly — identity → authorization → risk →
  policy → approval → gateway → verification → audit → evidence.
- **Classification: STRATEGIC (candidate).** By a wide margin the most complete
  project in the portfolio: 30,005 LOC, 42 test files, and a CI pipeline that is
  itself the strongest evidence — format/lint/mypy, registry and agent-contract
  validation, migrations, tenant-isolation tests, RAG leakage tests, security
  control tests, **agentic red-team tests**, a load test, a JUnit-derived
  evidence report, and gitleaks.
- **Capabilities:** model invocation REAL (`ai/providers.py`) · RLS REAL ·
  policy/approval engine REAL · hash-chained audit REAL · retrieval ACL-aware
  REAL · evaluation REAL (evidence engine derives status from JUnit).
- **The maturity number is not accepted at face value.** The README's
  "92.79 / 100" is a CI-computed figure; the repository also ships
  `docs/assurance/FINAL_GAP_AUDIT.md` stating what the build has *not* proved.
  A project that publishes its own gap audit is behaving correctly. Status
  remains **PRODUCTION_CANDIDATE, not PRODUCTION_READY** — no deployment, no
  Evidence Pack, and CI has not been re-run in this session.
- **Blocker to promotion:** this project has no stated business owner or
  customer inside the portfolio. It is enterprise infrastructure built by a rail
  maintenance engineer. Before it receives P0/P1 investment the owner needs to
  say whether it is a product to sell, a platform the other products will run
  on, or a study.

### `Beyond-Style-UAE-` — BSOS
- **Primary user / JTBD / outcome:** identical to `66` — Beyond Style UAE,
  Dubai, personalised Arabic-calligraphy jewellery, market signal to shippable
  product.
- **Classification: ACTIVE, and one half of a genuine duplicate.** See
  DUPLICATE_ANALYSIS.md. Not triaged independently, because triaging it apart
  from `66` would be the exact mistake the spec warns against.

## Registry corrections arising from W7

| Registry row | Was | Now |
|---|---|---|
| 16 `11` | PROTOTYPE (unaudited) | **INCUBATION**, audited |
| 17 `22` | PROTOTYPE (unaudited) | **EXPERIMENT**, audited |
| 18 `55` | PROTOTYPE (unaudited) | **USEFUL_UTILITY**, audited (not an application) |
| 19 `agentic-os-enterprise` | PROTOTYPE (unaudited) | **PRODUCTION_CANDIDATE**, audited; owner decision required before investment |
| — `Beyond-Style-UAE-` | PROTOTYPE (unaudited) | **Not a separate project** — second implementation of project 5 |
