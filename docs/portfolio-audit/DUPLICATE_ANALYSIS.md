# Duplicate Analysis — the Beyond Style family

Only one true duplicate remains in the portfolio after W6. It is significant,
and it is **not** resolvable by the usual rules, so it is escalated rather than
acted on.

## The finding

Two repositories implement the same product twice, in two languages, neither a
superset of the other.

| | `66` | `Beyond-Style-UAE-` (BSOS) |
|---|---|---|
| Language | TypeScript | Python + a Vite/React UI |
| Code LOC | 6,329 | 12,448 |
| Test files | 12 (90 tests) | 15 |
| CI | `ci.yml` (added this session) | `ci.yml` |
| UI | 2 static HTML pages (`web/`) | 8-page React app, i18n, brand assets |
| Persistence | none — in-memory | SQLite + Alembic migrations |
| Deployment | Vercel project `66`, static site | `deploy/vercel/studio.py` only, not wired |
| Default branch | `claude/beyond-style-uae-os-ji8ygo` | `claude/bsos-agentic-os-t1jehu` |
| Last commit | 2026-08-23 (this session) | 2026-08-22 |

## Why these are one project, not two

Applying the spec's identity test (rule 5) rather than the code-similarity test:

- **Customer:** Beyond Style UAE, Dubai — the same single business, both.
- **Job to be done:** originate a personalised Arabic-calligraphy jewellery
  design, prove it is original, price it, and hand a manufacturable
  specification to the in-house workshop. Both.
- **Business outcome:** a shippable, compliant, priced piece. Both.
- **Data ownership:** both claim the same asset corpus, the same concept
  records, the same workshop specification.
- **Release lifecycle:** neither is released; both are pre-production.

Same customer, same job, same outcome, same data, one workshop. That is one
product with two implementations — an evolutionary duplicate, which the spec
says to resolve by recovering unique value into a canonical, never by picking
the newer or the larger.

The parallel structure is close enough to be conclusive:

| Concern | `66` | BSOS |
|---|---|---|
| Kernel / policy | `platform/kernel.ts`, `platform/security/rbac.ts` | `bsos/kernel/{policy,guard,grants}` |
| Orchestration | `platform/orchestration/{orchestrator,state-machine}` | `bsos/orchestrator/{planner,dispatcher,state_machine,pipeline}` |
| Event bus | `platform/event-bus/event-bus.ts` | `bsos/kernel/bus.py` |
| Audit | `platform/audit/audit-log.ts` | `bsos/kernel/ledger.py` (hash-chained) |
| Model gateway | `platform/model-gateway/` | `bsos/adapters/llm.py` |
| Arabic typography | `features/arabic-design/master-artwork.ts` | `bsos/design_studio/typography.py` (HarfBuzz) |
| Design studio | `features/design-studio/` | `bsos/design_studio/` + `skills/design_studio.py` |
| Originality gate | `features/originality/originality-agent.ts` | `skills/` + `tests/test_originality_gate.py` |
| Costing | `features/costing/cost-engine.ts` | `bsos/design_studio/pricing.py` |
| Workshop spec | `features/manufacturing/` | `bsos/skills/spec_workshop.py` |
| CAD export | `features/cad/exporters/{dxf,svg}` | `bsos/design_studio/exports.py` |

## Why neither can simply absorb the other

Each side holds capability the other does not have at all.

**Only in `66`:**
- child-safety gate (`features/safety/`) with its own tests — a legal
  requirement for children's jewellery, absent from BSOS
- QA agent, brand agent, marketing agent, commercial agent
- market-intelligence agent (`features/analytics/`)
- product passport (`features/products/passport.ts`)
- materials model (`features/materials/`)
- **Arabic/English natural-language intent parser** and readiness score — added
  this session, currently in open PR #2
- concept versioning

**Only in BSOS:**
- licensed asset custody and a licence gate (`test_licence_gate.py`) — the
  provenance control that keeps the studio out of copyright trouble
- corpus synthesis and trend abstraction
- vision extraction from photo **and video**
- image generation adapter
- MCP adapter with per-tool grants
- Second Brain (SQLite FTS5), vector memory, provenance memory
- transliteration
- Alembic migrations, Prometheus metrics, hash-chained ledger
- the entire working user interface

Merging in either direction is a cross-language port of roughly half a product.
Neither "delete the smaller" nor "delete the older" is defensible: `66` is
smaller but holds the safety gate; BSOS is larger but holds no safety gate.

## Status: ESCALATED — owner decision required

This is a spec STOP CONDITION ("ambiguous canonical project with risk of
data/code loss"). Nothing has been merged, moved, renamed or deleted. Both
repositories are intact at the SHAs recorded above. All unrelated work
continued.

**Recommendation, for the owner to accept or reject:** make **BSOS the
canonical implementation** — it has the persistence, the UI, the ledger, the
licence gate and twice the code — and port four things into it from `66`:
the child-safety gate (first, it is the legal one), the intent parser, the
product passport, and the costing engine. Retire `66` to an archived snapshot
tag only after those four land and pass tests in BSOS, never before.

**The counter-argument the owner should weigh:** `66` is the one that is
deployed and the one that received this session's UX work. If the intent is to
ship something to a customer this quarter, the cheaper path is the reverse —
keep `66` canonical and port BSOS's licence gate and asset custody into it,
accepting that the React UI is rebuilt.

The deciding question is not technical. It is whether Beyond Style needs a
governed internal operating system (BSOS) or a customer-facing design studio
(`66`) first. That is the owner's call, and it is the reason this is not being
decided here.

## Not duplicates

Checked and rejected as duplicate candidates:

- `beyond-style-ops` — same customer, different job (Streamlit back-office
  order verification, last touched 2026-06-20). Already a legacy snapshot.
- `11` vs `agentic-os-enterprise` — both say "agentic OS", different customers
  and different jobs (analyst producing a report vs. enterprise governing
  agents). Code similarity is secondary; identity says these are distinct.
- `22` vs `agentic-os-enterprise` — same reasoning; `22` serves one named
  operator, `agentic-os-enterprise` serves a platform team.
- `55` vs anything — an implementation kit, not an application.

---

## Update — 2026-08-23: `66` PR #2 merged and is live

The Co-Design Studio shipped to production. Verified by fetching the live page
at `https://66-ten-tawny.vercel.app/co-design.html` (HTTP 200, 09:55 UTC): the
full five-step RTL journey is served — describe → understood brief → concepts →
design gates → approval — with the deterministic-engine framing intact
("الخط بالهندسة الحقيقية، لا صور ذكاء اصطناعي") and the manufacturing footnote
that AI imagery depicts concepts only while SVG/DXF derive from the
deterministic engine behind human approval.

**Not verified:** the live `POST /api/intent` round-trip. This session's egress
proxy refuses CONNECT to `*.vercel.app` (HTTP 403), and the Vercel fetch tool
is GET-only. The parser is covered by 90 passing tests and its CI is green, but
the deployed function has not been exercised from here. Recorded as
PARTIALLY_VERIFIED rather than claimed.

### What this changes about the canonical decision

It moves `66` further ahead on the "shippable now" axis and no further on the
"complete product" axis:

- `66` is now **deployed, live, and demonstrably usable by a customer** — a
  real Arabic-first journey a person can complete today.
- BSOS still holds everything `66` lacks structurally: licensed asset custody
  and the licence gate, corpus synthesis, vision/video extraction, MCP, the
  Second Brain, provenance memory, Alembic migrations, Prometheus metrics, the
  hash-chained ledger, and a full eight-page UI. None of it is deployed.

So the trade is now sharper, not softer. `66` is the thing that works in front
of a customer; BSOS is the thing that would survive an audit. The
recommendation in this document stands unchanged — BSOS canonical, port the
child-safety gate first — but the counter-argument has gained weight: if the
goal is revenue this quarter rather than governance, `66` is already earning
it and BSOS is not.

This remains the owner's decision. Nothing has been merged, moved or deleted.

## Update — 2026-08-23 late: there is a **third** repository

`beyond-style-uae-v6` implements Beyond Style UAE a third time. It appeared in
no registry row, no family table and nowhere in this document, for the same
reason HADER AI didn't: it was never in the repo list this audit was seeded
from.

It was found by looking at pull-request activity rather than at the list — the
same method that found the 20th project an hour earlier. Two unregistered
repositories in one evening is a pattern, not a coincidence: **the seed list is
not a reliable enumeration of this portfolio.**

| | `beyond-style-uae-v6` |
|---|---|
| Origin | v0 bootstrap (`v0.app` project `prj_tMiK8WzE…`), package still named `my-project` |
| Stack | Next.js 16.3.0, TypeScript |
| Scope | **One feature**: a pricing workbench |
| Substance | `lib/pricing-engine.ts`, `components/pricing-workbench.tsx` |
| Tests | **none** — self-scored 2/10 on testing |
| Self-assessment | `QUALITY_SCORECARD.md`, **58/100**, "Not a production candidate" |

### Why this one is different, and why that matters

`66` and BSOS are rival *whole-product* implementations — that is what makes
choosing between them expensive, and it is why the decision is escalated.

`beyond-style-uae-v6` is not a third rival. It is a **single capability**
neither of the other two has: deterministic pricing with decimal-safe rounding
at money boundaries, isolated in one pure module with no framework coupling.

That changes the shape of the canonical decision rather than adding to it. The
pricing engine is a candidate to **absorb into** whichever implementation wins,
not a third option to weigh against them. `lib/pricing-engine.ts` is pure and
has no dependency on this repo's UI, so absorbing it is a file move plus a test
suite — the tests it never had.

Its own scorecard is worth crediting: it states plainly that there is no auth,
no RLS, no persistence, no CI and no automated tests, and refuses to call
itself production-ready. That is the standard this audit asks for, applied by
whoever wrote it.

### What is still owner-decided

Unchanged. Which of `66` or BSOS is canonical is still escalated, and this
finding does not resolve it — it adds one asset to move once the decision is
made, and one more repository to the list of things the Permanent Portfolio
Rule's "one canonical source of truth per product" is currently not true of.

Beyond Style now spans **five** repositories: `66`, `Beyond-Style-UAE-`,
`beyond-style-uae-v6`, `beyond-style-ops` (legacy snapshot) and
`beyond-style-uae-Private` (unaudited predecessor).


## Update — 2026-08-24: `desktop-tutorial` is a second live copy of Maktab

The registry calls `desktop-tutorial` a **migration archive**. It is not. Its
`package.json` is named `maktab`, it has its own CI, its own Vercel project,
and it has **already diverged** from the canonical `maktab` repo.

| | `maktab` (canonical) | `desktop-tutorial` |
|---|---|---|
| `package.json` name | `maktab` | `maktab` |
| Tracked files | 191 | 220 |
| `src/` tree hash | `037b10a` | `e532735` — **different** |
| Only here | `StudyCommandCenter.tsx`, `readiness.ts`, `readiness.test.ts` | `desktop/`, `extension/`, `mobile/` shells |

Neither is a superset. The Learning Command Center work landed in `maktab`;
the desktop, browser-extension and mobile shells exist only in
`desktop-tutorial`. Both receive commits.

### How it surfaced

PR #112 proposed restructuring Maktab's UI — 23 pages into 5 tabs — **against
`desktop-tutorial`**, not against `maktab`. That is the cost this duplication
imposes: a contributor cannot tell which repo is the product, so significant
work gets aimed at the copy.

### Why PR #112 was not merged

Separately from the duplication, that PR could not be merged on its own terms.
Its branch forks from `ff73de2`, before the portfolio split, and:

- contains **none** of the 5-tab work its description claims — no `src/app/`
  exists on it at all;
- resurrects 283 files across six directories that were deliberately moved out
  (`agentic-os/` 162, `android-wife-assistant/` 66, `telegram-wife-assistant/`
  25, `landing/` 20, `agent-os/` 10, `operational-plan/` 2), two of which are
  now canonical in `wisal` and one in `masaar`;
- deletes `src/middleware.ts`, `src/lib/supabase/server.ts`, `src/lib/env.ts`
  and `src/lib/safe-fetch.ts`, which exist nowhere on the branch under any
  name — the auth gate and the Next 15 async-cookies migration among them.

Its 29,749/32,263 diff is an artifact of the stale base, not a restructure.
Recorded on the PR with the evidence.

### Owner decision

Which repo is canonical for Maktab. This is the same class of question as
Beyond Style but far cheaper to settle now: the divergence is three source
files against three platform shells, not two full implementations. Left
alone it will grow, and it is already misdirecting contributions.

## Resolved — 2026-08-24: owner named both canonicals

| Product | Canonical | Non-canonical |
|---|---|---|
| **Maktab** | `maktab` | `desktop-tutorial`, and the Maktab app sitting inside `promptops` |
| **Beyond Style** | `Beyond-Style-UAE-` | `66`, `beyond-style-uae-v6`, `beyond-style-ops` (legacy) |

### Beyond Style — done

`beyond-style-uae-v6`'s pricing engine is absorbed into the canonical repo as
`bsos/design_studio/cost_model.py`, ported to Python with 18 tests it never
had. It is not a duplicate of `pricing.py`: that one answers *what do we
quote*, this one answers *what does the piece cost*. The join is the floor —
`pricing.py` floored every quote at a flat AED 265, which is far above a
silver pendant's true cost and can be below a gold coin's. `floor_for_quote()`
now takes the higher of the flat floor and the computed per-piece floor.

`66`'s work stays recoverable through its branches, both of which remain. They
had diverged in both directions, so both SHAs are recorded here rather than
relying on either alone:

| ref | SHA at 2026-08-24 |
|---|---|
| `66` `main` | `f1521d1` |
| `66` `claude/beyond-style-uae-os-ji8ygo` (its default branch) | `eecc953` |

Snapshot tags could not be pushed — the session's git proxy returns **403** on
tag pushes to `66`, with any tag name. Nothing is being deleted there, so the
branches themselves are the record; the SHAs above survive a branch moving.

### Maktab — a live bug blocks the obvious cleanup

`maktab` is ahead and the decision is easy to act on in principle: 937
insertions against 152 deletions across 52 files, the Next 15 async-cookies
migration at 38 call sites that `desktop-tutorial` still lacks, and
`StudyCommandCenter.tsx` + `readiness.ts` (556 lines) which supersede the 113
lines that exist only in the copy. Nothing unique would be lost.

**But `desktop-tutorial` cannot be retired yet, and the reason is a bug.**

`promptops` ships ZAIan Studio's desktop (Electron), mobile (Capacitor) and
browser-extension clients. All four entry points default to the same host:

| file | default |
|---|---|
| `promptops/desktop/main.js` | `https://desktop-tutorial-kappa-five.vercel.app` |
| `promptops/mobile/capacitor.config.ts` | same |
| `promptops/extension/content.js` | same |
| `promptops/extension/options.js` | same |

That host serves **Maktab** — verified live: HTTP 200, `<title>Maktab · مكتب ·
Your MBA on one desk`, redirecting to `/dashboard`.

So every installed ZAIan Studio client opens an MBA study platform. Taking
`desktop-tutorial`'s deployment down would move those clients from *wrong app*
to *dead app*, so it stays up until the shells point somewhere correct.

### Why there is nowhere correct to point them yet

`promptops` is registered as PromptOps — prompt lifecycle. Its README states
the Product Authority in full, with an explicit non-goal of *"being a feature
inside Maktab"*. Its `package.json` is named `maktab`, and its routes are
`ask-mba/`, `flashcards/`, `grades/`, `courses/`, `group-project/`.

It is a hybrid, not simply a mislabelled copy. Real PromptOps code is there —
`src/lib/services/template.ts` renders prompt skeletons from a template and
Q&A, alongside `formatter.ts`, `clarification.ts`, `orchestration.ts` and
`llm/` — and those four test files are the 18 tests this audit credited to
PromptOps. That code is grafted onto a Maktab application shell.

So ZAIan Studio has no deployment of its own to point at. Repointing the URL
is blocked on PromptOps existing as a deployed app, which is a build decision,
not a config edit. Recorded rather than guessed at.

### Three Maktab-named repositories, not two

An earlier entry in this document said `desktop-tutorial` was a second live
copy. There are three, all with `package.json` name `maktab` and all with
different `src/` trees:

| repo | tracked files | `src/` tree |
|---|---|---|
| `maktab` | 191 | `037b10a` |
| `desktop-tutorial` | 220 | `e532735` |
| `promptops` | 202 | `a1c6607` |
