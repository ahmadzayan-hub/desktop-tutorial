# Audit Master Prompt · v2

Reusable template for a deep, evidence-based audit and improvement pass on any
project in this repo (or in a fresh repo). Version 2 folds in twelve material
gaps that v1 did not adequately cover — release scoping, scalable analytics,
metric governance, causal inference, UAE PDPL controls, business continuity,
supply-chain assurance, complete Android release lifecycle, collaboration and
RACI, Obsidian privacy lifecycle, FinOps, and Architecture Decision Records —
plus four new capability agents and a note on Vercel's durable Python workflows.

> **How to use.** Copy the prompt below into a Claude Code session (or any
> capable coding agent), fill in the seven placeholder values in §2, and run
> it against the target repository. The prompt is designed to survive being
> reused — every section is self-contained and skip-able for projects whose
> scope does not need it.

---

## 0. Release scope — pick ONE tier before starting

Claude cannot realistically ship every enterprise concern in one pass. Declare
which tier this audit targets so effort and gates match the promise.

| Tier | Definition | Realistic in one audit? |
| --- | --- | --- |
| **Academic MVP** | Single-tenant, in-memory or SQLite, ≤ 3 external services, no PII beyond user's own account, no billing, no on-call. Ships to `.vercel.app`. | Yes. |
| **Production MVP** | Multi-tenant with RLS, real auth, real payments, real telemetry, one-week backup cadence, single-region residency, documented incident-response owner. | Only if pre-existing scaffolding is strong. Split across 2–3 audit passes otherwise. |
| **Enterprise Release** | Every gap in this document treated as a first-class requirement: SLOs, error budgets, on-call, SBOM, signed artifacts, DPIA, causal-inference workflow, tenant quotas, ADRs. | No. This is a multi-quarter program. Use the prompt to plan the roadmap, not to implement the whole thing. |

The rest of this prompt applies to **all three tiers** unless a section
explicitly names a tier.

---

## 1. Roles

You are acting as this coordinated team simultaneously. Each role has a
distinct point of view; when they disagree, name the disagreement in the
report rather than papering over it.

**Core (17):**
1. Principal Software Architect
2. Senior Full Stack Engineer
3. AI and LLM Solutions Architect
4. Product Manager
5. Senior UI and UX Designer
6. Accessibility Specialist
7. Performance Engineer
8. Application Security Engineer
9. DevOps and Site Reliability Engineer
10. Quality Assurance and Test Automation Lead
11. Data Architect
12. Business Analyst
13. Responsible AI and Governance Specialist
14. Arabic RTL and Localization Quality Lead
15. Independent Technical Auditor
16. Principal Product Strategist
17. Business Process and Customer Journey Consultant

**Additional capability agents (4).** Not decorative — each owns a
governance surface that is otherwise unowned in most codebases:
18. **Data Platform and Data Contract Agent.** Owns §4 data plane, §5 metric
   governance, dataset contracts, warehouse push-down policy.
19. **Experiment and Causal Inference Agent.** Owns §6 experimentation +
   causal inference. Prevents "we saw a lift, so the change worked" errors.
20. **Pluggable Domain Expert Agent.** Slot-fills a subject-matter expert
   (finance, healthcare, legal, education, retail) into the review so
   domain-specific requirements do not get invented by non-experts.
21. **Reliability and Incident Management Agent.** Owns §8 continuity, error
   budgets, on-call, drills, provider-exit.

Do **not** add a decorative army of agents beyond these. Twenty-two agents
do not create quality automatically; strong data contracts, measurable
release gates, accountable owners, and reliable recovery do.

---

## 2. Placeholders (fill BEFORE running)

| Field | Value |
| --- | --- |
| Repository URL | `[INSERT]` |
| Project name | `[INSERT]` |
| Primary users | `[INSERT — e.g. MBA students, UAE small merchants, ...]` |
| Release tier (from §0) | `[Academic MVP · Production MVP · Enterprise Release]` |
| Primary deploy platform | `[Vercel · Netlify · Cloudflare · GitHub Pages · AWS · other]` |
| Production URL if any | `[INSERT or "none yet"]` |
| Target languages | `[English · Arabic · Bilingual]` |
| Data residency requirement | `[UAE · EU · US · none]` |
| Primary business outcome | `[INSERT]` |

Do not proceed until every field is filled. Missing placeholders are the
number-one cause of misdirected audits (see §14).

---

## 3. Non-negotiable operating rules

1. Read repo instructions first: `CLAUDE.md`, `AGENTS.md`, `README.md`,
   `PROJECTS.md`, contribution guidelines, architecture docs, environment
   examples, deployment configuration, package manifests, database schemas,
   API specifications, existing product requirements, design documentation,
   test configuration.
2. Inspect the whole relevant codebase before changing architecture.
3. Preserve working functionality unless a verified improvement requires
   replacement.
4. Do not delete user data, production resources, migrations, branches, or
   working features.
5. Never expose or commit secrets, credentials, tokens, personal data,
   private files, or production environment values.
6. Use a dedicated improvement branch: `improvement/production-uiux-performance`
   (or `improvement/<tier>-<focus>` for a scoped pass).
7. Before changing files, check: current branch, working tree status,
   uncommitted changes, remotes, runtime versions, available scripts,
   current build and test status.
8. Treat existing user changes as intentional. Do not overwrite unrelated
   work.
9. Use small, reviewable, logically grouped changes.
10. Do not push, merge, open a PR, modify production data, or deploy to
    production unless the operator explicitly authorises it.
11. Do not claim a feature works because the code compiles. Verify the
    real user journey.
12. Do not claim 100% unless every defined gate has passed with
    reproducible evidence.
13. If a dependency prevents a perfect result, state: the exact dependency,
    the measured effect, the evidence, the best mitigation, the residual
    risk.
14. Do not use fake data, invented citations, fabricated market
    information, or simulated test results in final production outputs.
15. Continue autonomously through safe, reversible decisions. Ask only
    when a missing decision materially changes the business model, data,
    security, cost, or production operation.

---

## 4. Analytics data plane (Data Platform and Data Contract Agent)

Applies whenever the product reads or writes analytical data.

- **Warehouse push-down.** Complex aggregations run in the warehouse
  (Snowflake / BigQuery / Redshift / Postgres) via SQL, not by hydrating
  raw rows into the app. Document which queries are push-down and which
  are hydrate-then-aggregate; hydrate-then-aggregate needs a size cap.
- **Local analysis engine.** Where the workload is small enough to run
  locally, use **DuckDB** or **Polars** — never `pandas` on untrusted
  input, never a naive JS loop over 10⁵+ rows.
- **Resumable large-file uploads.** All upload paths that accept files
  above 25 MB must support resume (tus.io, Uppy, native S3 multipart).
  Otherwise a flaky mobile network guarantees data loss.
- **Dataset size and memory limits.** Every ingest path declares a hard
  ceiling (rows, bytes, uploaded files per hour) and returns 413 with a
  friendly message when hit. No unbounded reducers.
- **Partitioning and sampling.** Analytical tables partition by tenant +
  event_date. Reports over > 30 days must sample or paginate; a full
  scan is a bug.
- **Prohibition on sending raw datasets to LLMs.** LLMs receive
  aggregated, redacted, or per-record derived features — never a raw
  export of the entire table. Enforce with a middleware that inspects
  token count and blocks over a threshold.
- **Restricted-data egress controls.** Any table tagged `pii`,
  `financial`, or `sensitive` cannot leave the primary region without
  an approved cross-border transfer record (see §7). Egress attempts
  are logged and alerted.

---

## 5. Metric governance (Data Platform and Data Contract Agent)

- **Business glossary.** Every metric (`activation_rate`, `paid_ratio`,
  `revenue_aed_7d`) has a one-sentence definition, a formula, an owner,
  and a fiscal-calendar treatment. Lives in `docs/METRICS.md` or a
  dbt-style YAML, not in code comments.
- **Certified KPI workflow.** Metrics have a state machine:
  `draft → proposed → certified → deprecated`. Only `certified` metrics
  appear on executive dashboards. Certification requires the metric
  owner + the Data Architect role.
- **Metric ownership and approval.** Every certified metric has a
  named human owner. Ownership is versioned; if the owner leaves,
  the metric is marked `orphaned` and cannot ship in new dashboards.
- **Fiscal calendars.** Date roll-ups honour the customer's fiscal
  year (UAE = Gregorian, but many companies use non-Jan-1 fiscal). The
  glossary states which calendar each metric uses.
- **Slowly changing dimensions.** Customer and product tables use SCD
  Type 2 (effective_from / effective_to) so historical reports stay
  correct after entity renames. Type 1 overwrite is a bug for any
  attribute that appears in a KPI.
- **Schema evolution and impact analysis.** Adding, renaming, or
  dropping a column requires a downstream-impact report (which
  dashboards, models, exports depend on it?). Automate with a lineage
  scan on PR.
- **Row and column-level security.** Enforce at the database (Postgres
  RLS, BigQuery row-access policies) — not just in the app layer. App
  layer is defence-in-depth, database layer is defence-in-truth.
- **Entity resolution and master-data rules.** Duplicate customer
  detection (fuzzy name + phone + email), merged records preserve
  history, and the merge decision is auditable.

---

## 6. Experimentation and causal inference (Experiment and Causal Inference Agent)

Applies whenever the product reports "this change caused a lift".

- **Power analysis.** Before an experiment starts, compute minimum
  detectable effect given traffic, split, and variance. If MDE is
  larger than the expected effect, do not run the experiment; it will
  be underpowered and produce noise.
- **Sample-ratio mismatch (SRM).** Every experiment ships with an
  automated SRM check on assignment counts. SRM > 0.001 halts the
  experiment and flags the assignment path as broken.
- **A/B testing.** Assignment is deterministic (hash of user_id +
  experiment_id), never sticky-session or IP-based. Assignment is
  logged before the exposure event.
- **Multiple testing correction.** Any dashboard that shows > 5
  concurrent experiments applies Bonferroni or BH correction to the
  displayed p-values. Report the correction method.
- **Sequential testing.** Peeking at daily results without a
  sequential-test correction (mSPRT, always-valid CIs) inflates
  false-positive rates. Ship only with proper sequential analysis.
- **Confounding.** Document every plausible confounder (seasonality,
  channel mix, price changes shipped in the same window) before
  reporting causal claims.
- **Counterfactual assumptions.** State the identification strategy
  (randomisation, DiD, IV, propensity score) and its assumptions in
  the experiment writeup. If none apply, the report is descriptive,
  not causal.
- **Causal limitations.** Correlation reports must be labelled
  correlational, not causal. LLM-generated summaries must not turn
  correlations into causal claims.

---

## 7. UAE PDPL controls (Application Security Engineer + Responsible AI)

Applies whenever `Data residency = UAE` in §2, or when the product
serves UAE users.

- **Data residency.** Primary storage (Postgres, object storage), backups,
  logs, telemetry, and vector embeddings live in a UAE region. Vercel,
  Supabase, Cloudflare and AWS all offer UAE / GCC-adjacent regions;
  document which you chose and why.
- **Cross-border transfers.** UAE PDPL specifically regulates cross-border
  personal-data processing. Every non-UAE processor (e.g. an LLM provider
  hosted outside the UAE) requires: a legal basis, a documented processor
  register entry, and a data-transfer impact assessment. Reference:
  <https://u.ae/en/about-the-uae/digital-uae/data/data-protection>.
- **Processor register.** Maintain a versioned CSV / YAML listing every
  third-party processor of personal data: name, purpose, categories of
  data, legal basis, region, contract reference, expiry.
- **Consent evidence.** Consent for photo processing, marketing, and
  analytics is stored with timestamp, IP, page URL, and consent-text
  hash — not just a boolean. On DSR request, this record is produced.
- **Privacy impact assessments (DPIA).** Any new processor or new data
  category triggers a DPIA before rollout. Template lives in
  `docs/PRIVACY_IMPACT_ASSESSMENT.md`; each instance is a dated copy.
- **Deletion across all stores.** A data-subject-request (DSR) delete
  removes the record from: primary storage, backups (or documents a
  deferred-delete honoured on next restore), embedding stores, telemetry,
  logs, and any cache. Test the flow end-to-end with a synthetic user;
  do not rely on assumptions.

---

## 8. Business continuity and reliability (Reliability and Incident Management Agent)

- **SLA and SLO targets.** Public SLA per user tier; internal SLO tighter
  than SLA. Both stated in `docs/SLA_SLO.md` with clear scope
  (which endpoint, which region, availability vs. latency).
- **Error budgets.** Monthly error budget derived from the SLO. Budget-
  burn dashboard drives deploy freeze policy (e.g. no non-fix deploys
  when 50% of the monthly budget is spent in the first week).
- **RPO and RTO.** Recovery Point Objective (how much data can we lose?)
  and Recovery Time Objective (how long to restore?) declared per
  data store. Both are contractual with the business, not
  engineering guesses.
- **Point-in-time recovery.** Primary database supports PITR to any
  timestamp within retention. Supabase, RDS, Cloud SQL all support this;
  document retention length.
- **Backup restoration drills.** Restore a backup into a scratch project
  once per quarter, measure the RTO, log it. A backup that has never been
  restored is not a backup.
- **Incident classification.** Sev-1 (customer-facing outage), Sev-2
  (degraded but functioning), Sev-3 (internal), Sev-4 (planned). Each has
  a response-time SLO and a post-mortem requirement.
- **On-call ownership.** Every production service has a named on-call
  human, not "the team". Rotation is at least two humans deep. Escalation
  path documented.
- **Load, soak, failover, and chaos testing.** Load = normal traffic ×
  expected peak. Soak = normal traffic held for 24h. Failover = force a
  region flip; measure RTO. Chaos = random pod kill; verify no user-
  visible impact.
- **Provider-exit procedures.** For every SaaS the product depends on
  (payment gateway, LLM provider, analytics, email), document how to
  migrate to a substitute in ≤ 30 days. Prevents vendor lock-in becoming
  existential.

---

## 9. Supply-chain assurance

- **SBOM.** Generated on every release (`syft`, `cyclonedx-npm`,
  `cyclonedx-cli`). Stored as a release artifact and re-checked by
  CI on the next PR to detect unexpected additions.
- **Signed release artifacts.** APK / AAB / Docker images / npm
  packages signed with a key committed to hardware or KMS. Verify on
  pull.
- **Build provenance.** SLSA level 3 attestation from the CI runner
  (`slsa-github-generator`). Downstream consumers can verify that the
  binary they run was built from the commit hash it claims.
- **Dependency-license scanning.** No GPL / AGPL creep in a proprietary
  bundle; no expired licenses. `license-checker` in CI blocks on
  forbidden licenses.
- **Pinned actions and packages.** GitHub Actions pinned to commit SHA,
  not tag (tags are mutable). npm/pnpm/pip pinned via lockfile; renovate
  bot proposes upgrades one at a time.
- **Model and connector vendor register.** Every LLM provider, MCP
  server, and third-party API in use listed with: purpose, version, key
  rotation cadence, escalation contact, cost per unit.
- **Third-party contingency plans.** For each vendor, name the
  substitute and the migration playbook. Rank vendors by "if this
  disappears tomorrow, how many hours does the product survive?" — any
  vendor scoring < 24h needs a cache or fallback.

NIST AI RMF treats third-party failures as governance risks; use it as
the framing reference.

---

## 10. Android complete release lifecycle

Building an AAB is insufficient. Add:

- **Android developer verification.** Starts regionally 30 September 2026
  and expands globally through 2027. Register the developer account and
  complete identity verification well ahead of the deadline; without it,
  Play distribution stops.
- **Play App Signing.** Google holds the upload key; you keep the
  signing key. Document key rotation cadence and emergency recovery.
- **Internal and closed testing tracks.** Every release goes through
  internal → closed alpha → open beta → production, not push-to-prod.
- **Privacy policy and Data Safety declaration.** Required on Play
  Console before any store listing. Data Safety declaration must match
  reality — mis-declaration is a policy violation.
- **Play Integrity for sensitive actions.** Payments, admin operations,
  and anti-abuse checks call Play Integrity API to verify the caller
  is running an unmodified app on a certified device.
- **Crash and ANR monitoring.** Firebase Crashlytics or equivalent
  wired into every build. Crash-free-user rate is a release gate:
  ship-block if < 99.5%.
- **Android vitals.** Weekly review of slow-cold-start rate, slow-
  rendering-frame rate, wakeup count. Regressions block the next
  release.
- **Baseline Profiles.** Ship a Baseline Profile for critical paths
  (home, chat, checkout). 20–30% cold-start improvement typical.
- **Real-device test matrix.** Minimum: 1 low-end Android 8 device,
  1 mid-range Android 12 device, 1 recent Pixel or Samsung. Firebase
  Test Lab or a physical rack.

---

## 11. Collaboration, accountability, and RACI

- **Comments and mentions.** Every user-visible object (project,
  document, dashboard, plan) supports comments and @-mentions.
- **Delegated approvals.** A user can delegate their approvals to
  another user for a bounded window (out-of-office).
- **Decision ownership.** Every material decision (schema change,
  new vendor, launch, deprecation) has a named decider, a named
  RACI table, and a versioned decision record (see §14 ADRs).
- **Artifact sharing permissions.** Sharing an artifact grants a
  specific role (viewer / commenter / editor), not "anyone with the
  link" by default.
- **Concurrent editing.** Two users editing the same document either
  see live cursors (CRDT / OT) or receive a merge-conflict prompt.
  Last-write-wins on shared docs is a P1 defect.
- **Notification centre.** Every user has one place to see mentions,
  requests, and decision outcomes. Not scattered across email + Slack
  + product.
- **RACI matrix template.** Per feature: Responsible / Accountable /
  Consulted / Informed. Blank cells are the audit finding.

---

## 12. Obsidian privacy lifecycle

Applies when the product syncs to or from an Obsidian vault.

- **Local-only mode.** A user can operate entirely offline; nothing
  leaves their device.
- **Zero-server-copy option.** When cloud sync is off, no vault content
  ever touches your servers — not even for indexing or preview.
- **Encryption-key ownership.** Vault-at-rest encryption keys live on
  the user's device, not on your servers. E2E if sync is enabled.
- **Embedding deletion.** When a note is deleted from the vault, its
  vector embedding is deleted from every store within the tenant's
  agreed RPO. Test this quarterly.
- **Backup deletion policy.** DSR delete removes the note from all
  backups within the documented deferred-delete window.
- **Sync-health diagnostics.** The user sees vault size, last sync
  time, next sync ETA, and any conflicts. Silent sync failures are
  a top-tier defect.
- **Plugin release-review requirements.** Any bundled or recommended
  Obsidian plugin is code-reviewed and version-pinned; auto-update
  disabled. Community plugins are a common privacy leak vector.
- Existing use of conflict-safe `Vault.process()` is correct — do not
  regress to `Vault.modify()` or `Vault.read` + `Vault.modify` (race
  window). Reference: Obsidian Vault API.

---

## 13. FinOps and value realization

- **Tenant quotas.** Per-tenant hard caps on LLM tokens, storage,
  seats, API calls. Exceeding a cap returns a friendly upgrade prompt,
  not a 500.
- **Cost centres.** Every cloud resource tagged with `product`,
  `environment`, `tenant_class`. Untagged spend is a monthly finding.
- **Usage budgets.** Per team / per tenant / per feature budget with
  alerts at 50 / 80 / 100%.
- **Provider cost reconciliation.** Monthly diff between predicted
  cost (from usage × unit price) and invoiced cost (from provider).
  Variance > 10% triggers an investigation.
- **ROI tracking.** Every launched feature has a hypothesis of
  business value (revenue lift, retention, cost reduction) and a
  post-launch measurement recorded 90 days later.
- **Realized-vs-predicted business value.** Rolling table in
  `docs/VALUE_REGISTER.md` showing predicted vs. actual per feature.
  Persistent over-promising is a signal to fix the estimation
  process, not just the feature.

---

## 14. Architecture Decision Records

- **Versioned ADRs.** `docs/adr/NNNN-title.md`, immutable once
  accepted. `superseded-by` links replace, never delete.
- **Required coverage.** At minimum one ADR per: primary database,
  object storage, workflow engine, model providers, authentication
  approach, analytics engine, Obsidian synchronisation strategy,
  Android distribution approach.
- **ADR template:**
  ```
  # ADR NNNN · Title

  ## Status
  Proposed | Accepted YYYY-MM-DD | Deprecated | Superseded by ADR-NNNN

  ## Context
  What forced the decision? Business + technical constraints.

  ## Options considered
  Option A · Option B · Option C — each with a one-line trade-off.

  ## Decision
  We chose Option X because …

  ## Consequences
  Positive · Negative · Neutral. What follow-on decisions become
  cheaper / harder?

  ## References
  Links, benchmarks, PRs.
  ```

---

## 15. Vercel Python durable workflows

If the tech stack includes Python, evaluate **Vercel Workflows for
Python** directly — do not hand-wave "if supported". They ship
pause/resume, retry, and durable state, which removes the need for
Celery + Redis + a worker fleet on many workloads. Reference:
<https://vercel.com/docs/workflows>.

Score against: (a) does the workload need durability > 5 min? (b) is the
state graph acyclic? (c) does the alternative (self-managed queue) add
enough operational cost to justify migration? Record the decision as an
ADR (§14).

---

## 16. Discovery phase (baseline BEFORE editing)

Same as v1. Inspect repo instructions, technology stack, folder
structure, routes, roles, data flows, trust boundaries, dependencies,
CI. Run existing commands (install, build, typecheck, lint, tests,
audit). Capture in `docs/PROJECT_AUDIT_BASELINE.md` with severity
classification (Critical · High · Medium · Low). Do not edit
production code until the baseline is documented, except where a
minimal change is needed to make diagnostic tooling work.

---

## 17. Product and UX review (from v1)

- Map user roles → capabilities matrix.
- Map ≥ 15 critical user journeys with objective / entry / friction /
  error state / completion criteria / KPI per journey.
- Redesign to clarity-first principles: one primary action per screen,
  progressive disclosure, autosave + recovery, factual/assumption/
  calculation/suggestion labels on every AI output.
- Design system: colour tokens · typography · spacing · icons · buttons ·
  forms · alerts · empty/loading/success/error states · Arabic RTL.
- Accessibility target: **WCAG 2.2 AA**.

---

## 18. AI quality (from v1, updated)

- Model-provider abstraction; structured outputs with schema
  validation.
- Prompt versioning; prompts live in `src/prompts/*.md` (or equivalent),
  not scattered in code.
- Retrieval grounding, citation handling, hallucination-rate
  measurement.
- Prompt injection resistance tested; data leakage tested.
- Evaluation suite: factual consistency · instruction-following ·
  business-plan completeness (if the app generates plans) · numerical
  accuracy · Arabic-English parity · refusal correctness · recovery
  from incomplete inputs.
- **New:** enforce §4 "no raw datasets to LLMs" middleware.
- **New:** enforce §6 "no causal claims without identification
  strategy" review step on LLM-generated business summaries.

---

## 19. Performance (from v1)

Targets unchanged: Lighthouse 100 / LCP ≤ 2.5s / INP ≤ 200ms / CLS ≤
0.1 on public pages. Budgets in CI. Do not damage usability to improve
a synthetic score.

---

## 20. Security + Responsible AI (from v1, updated)

OWASP Top 10, OWASP API Security Top 10, OWASP LLM Top 10. Add:
- §7 UAE PDPL controls.
- §9 supply-chain assurance.
- §14 ADRs for every security-relevant decision (auth method,
  encryption, session, RBAC design).
- **New:** every LLM tool call runs through an allow-list of tools; no
  arbitrary tool execution. Excessive agency is a P0 finding.

---

## 21. Implementation order

1. Critical security and data-integrity defects (P0)
2. Broken critical user journeys (P0/P1)
3. Build, runtime, and deployment failures
4. Authentication and authorization defects
5. AI accuracy and grounding defects
6. Accessibility blockers
7. Major usability problems
8. Performance bottlenecks
9. Visual-system consistency
10. Maintainability / technical debt
11. Lower-priority enhancements

For each change: state the audit finding, state the business impact,
implement the smallest complete solution, add or update tests, verify
the actual user journey, confirm no regression, log the decision (ADR
if material).

Do not perform cosmetic redesign while critical functionality is
broken.

---

## 22. Testing pyramid (from v1)

Unit · integration · end-to-end (Playwright) · visual regression at
360 / 390 / 768 / 1024 / 1440 px + wide desktop. Manual verification of
keyboard-only, mobile touch, screen-reader, slow network, empty data,
Arabic, server errors, expired sessions, interrupted AI generation.

Automated tests do not replace manual verification.

---

## 23. Release gates

Same seven gates as v1 (A–G: build · testing · UX · performance ·
security · AI quality · documentation) **plus three new v2 gates**:

- **Gate H · Data plane.** §4 controls documented and enforced.
  Warehouse push-down for KPI queries. Egress controls verified with a
  synthetic sensitive record.
- **Gate I · Continuity.** §8 SLOs published. Backup restoration drill
  passed in the last 90 days. On-call named. Provider-exit playbook
  exists for every vendor scoring < 24h survival.
- **Gate J · Supply chain.** §9 SBOM published. Signed release. Pinned
  actions. Vendor register up to date.

If any gate fails, state clearly that the project is not fully
release-ready and identify the tier (§0) it currently meets.

---

## 24. Required deliverables

Same as v1 plus:

- `docs/AUDIT_MASTER_PROMPT.md` — this document, or a link to it
- `docs/METRICS.md` — business glossary + certified KPI workflow (§5)
- `docs/PRIVACY_IMPACT_ASSESSMENT.md` — DPIA template + instances (§7)
- `docs/SLA_SLO.md` — targets + error budget (§8)
- `docs/INCIDENT_PLAYBOOK.md` — sev classification + on-call (§8)
- `docs/PROCESSOR_REGISTER.md` — third-party data processors (§7)
- `docs/VALUE_REGISTER.md` — realised vs. predicted business value (§13)
- `docs/adr/` — one file per material decision (§14)
- `docs/RELEASE_READINESS_REPORT.md` — gates A–J with evidence

---

## 25. Final report format

**Executive outcome.** Not release-ready · Conditionally release-ready ·
Release-ready. State which tier from §0 the project currently meets.

**Implemented improvements.** By business outcome, not by file.

**Verification evidence.** Actual results for build · typecheck · lint ·
unit · integration · e2e · Lighthouse · axe · security scan · SBOM · AI
evaluation · supply-chain (Gate J) · continuity (Gate I).

**Before-and-after.** Verified numbers only. No adjectives without
numbers.

**Remaining issues.** Every unresolved Critical, High, and material
Medium.

**Files changed.** Major files with one-line purpose.

**Reproduction commands.** Exact, copy-pasteable.

**Deployment status.** State whether deployment occurred. Do not imply
deployment if it did not.

**Recommendation.** The single most important next action, tied to
tier from §0.

---

## 26. Start now

1. Fill placeholders in §2.
2. Read all repository instructions.
3. Check git and working-tree status.
4. Map the repository.
5. Install dependencies using the detected package manager.
6. Run existing build + quality checks.
7. Inspect the application in production mode.
8. Test the critical user journeys.
9. Create `docs/PROJECT_AUDIT_BASELINE.md`.
10. Present a short implementation priority list.
11. Continue directly into safe implementation.

Do not stop after the plan. Do not make unsupported claims. Do not
optimise only for appearance.

The final result must be measurably faster, clearer, safer, more
accessible, easier to maintain, and more effective for its intended
users — at the tier declared in §0.

---

_Version history_

- **v2** (this document) · added §0 release-scope tiers, §4 analytics
  data plane, §5 metric governance, §6 experimentation + causal
  inference, §7 UAE PDPL controls, §8 continuity + reliability, §9
  supply-chain assurance, §10 complete Android release lifecycle, §11
  collaboration + RACI, §12 Obsidian privacy lifecycle, §13 FinOps,
  §14 ADR requirement, §15 Vercel durable Python workflows note, four
  new capability agents (Data Platform · Experimentation · Domain
  Expert · Reliability), Gates H/I/J, additional deliverables.
- **v1** · original 17-role prompt with phases 1–6 (discovery, UX,
  functional/AI, performance, security, implementation).
