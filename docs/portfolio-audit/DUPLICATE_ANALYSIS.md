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
