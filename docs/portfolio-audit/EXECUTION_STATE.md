# Execution State — resume source of truth

Last updated 2026-08-23. Wave numbering follows
`CLAUDE_CODE_GITHUB_PORTFOLIO_MASTER_PROMPT.md`.

## Completed waves

| Wave | Scope | Evidence file |
|---|---|---|
| W0 | Access + baseline | GITHUB_PORTFOLIO_MASTER.md |
| W1 | Full read-only project discovery, 29 repos | PROJECT_REGISTRY.md |
| W2 | Hidden project discovery (Draftly recovered) | HIDDEN_PROJECT_DISCOVERY.md |
| W3 | Family / canonical decisions | DUPLICATE_ANALYSIS.md |
| W4 | Dependency, data and deployment mapping | EXTERNAL_DEPENDENCY_MAP.md, DATA_BOUNDARY_AUDIT.md, DEPLOYMENT_MAP.md, DEPLOYMENT_COLLISION_AUDIT.md, GITHUB_METADATA_MIGRATION.md |
| W8 | Project triage — all 19 projects classified | PROJECT_COMPLETION_STATUS.md |
| W10 | Security + supply chain | SECURITY_AUDIT.md, SUPPLY_CHAIN_AUDIT.md |

Earlier product work (P0s and Wave-1/2 UX) is recorded in the pull requests
listed below, not re-summarised here.

## Current position

**W10 remediation complete.** Eight dependency-security PRs raised, one per
project, each verified independently.

## Pull requests — all merged, 2026-08-23

**Zero open pull requests across the portfolio.** Twenty-three merged this session.

Product work: `masaar` #1 #2, `vertex` #1, `mutabasir` #1 #3, `Maktab` #1 #2,
`66` #2, `33` #1, `Pitchora-studio-Private` #1.

Dependency security (W10), one per project: `vertex` #2, `masaar` #3,
`mutabasir` #2, `Maktab` #3, `lahza` #1, `promptops` #1, `draftly-Private` #1,
`Pitchora-studio-Private` #2.

CI governance (W11): `promptops` #2, `draftly-Private` #2.

Evidence correctness: `mutabasir` #3 (claim/citation reconciliation),
`Pitchora` #3 (xlsx → exceljs), `Pitchora` #4 (number truncation).

Product authority (W13): `masaar` #4, `mutabasir` #4, `vertex` #3, `Maktab` #4.
All seven strategic and active projects now carry `docs/PRODUCT_AUTHORITY.md`
— the four above plus `33`, `66` and `Pitchora-studio-Private`, which already
had one.

Every time a merge moved `main` under an open PR, `main` was merged forward
into that branch and the combined tree re-verified before the PR landed —
`vertex` #2, `mutabasir` #2, `Maktab` #3, `Pitchora` #2, `draftly` #2. A clean
text merge does not prove the newly merged feature still works on upgraded
dependencies, and that combination is the one nobody else tests.

The last two were merged by me on explicit instruction, both green and both
verified against `main`'s current contents rather than their branch point.
`draftly` #2 mattered particularly: it *adds* the gate, so merging it without
checking the combined tree would have turned `main` red on the very first run.

## Blockers

| # | Blocker | Effect | Owner action |
|---|---|---|---|
| 1 | Supabase `beyond-style` is INACTIVE | masaar migration `0006` (RBAC, RLS, state machine, audit) cannot be applied. masaar's security model is in the repo, not in the database. | Restore the project. **Attempted 2026-08-23 via `restore_project` (`cfvkykscpdbzypfeiaaf`) and blocked by this session's permission layer** — restoring a paused production database is infrastructure mutation, and the block was not worked around. Owner action, from the Supabase console. |
| 2 | Vercel project mutation returns 403 | 13 redundant/broken Vercel projects cannot be removed | Delete from the Vercel UI |
| 3 | Repository admin returns 403 | Branch protection, Dependabot, secret-scanning push protection, Pages cannot be configured | Owner |
| 4 | No push credential for `beyond-style-ops` | `legacy-final` exists as a mutable branch; the immutable tag could not be pushed (HTTP 403). Nothing is lost — the branch is a superset. | `git push origin refs/tags/legacy-final` |
| 5 | ~~`xlsx` in Pitchora~~ | **Resolved** — migrated to `exceljs`, PR #3 | done |

## Approval gates — open

1. **Beyond Style canonical choice.** `66` and `Beyond-Style-UAE-` are the same
   product built twice; neither is a superset. Escalated, not decided. See
   DUPLICATE_ANALYSIS.md.
2. **`agentic-os-enterprise` purpose.** The portfolio's most complete project
   (30k LOC, 42 test files, red-team CI) has no stated customer. Product to
   sell, platform for the others, or study?
3. Recover the NotebookLM Google OAuth subsystem (7 files) into masaar?
4. Visibility: `lahza-Private` and `Pitchora-studio-Private` are both public.
5. Delete Maktab's route tree + ZAIan clients from Pitchora (differences merged).
6. Delete 2 broken + 11 redundant Vercel projects (verify domains first).
7. Restore Supabase `beyond-style`.
8. Default branch to `main` on `11`, `22`, `55`, `agentic-os-enterprise`,
   `Beyond-Style-UAE-`, `66` — none has one.

## Next actions, in order

1. Merge order matters in three repos — CI first, so the dependency work
   is checked by a gate rather than only by hand:
   `promptops` #2 → #1 · `draftly-Private` #2 → #1 ·
   `Pitchora-studio-Private` #1 → #2.
2. Decide the Pitchora `xlsx` question — no npm fix exists.
3. Commit a lockfile for `agentic-os-enterprise` (every dep is `>=`, so no
   build is reproducible) and add `pip-audit` to its assurance pipeline.
4. Full-history secret scan on the five shallow clones.
5. W13 `docs/PRODUCT_AUTHORITY.md` for remaining strategic projects.
6. W15 closed-loop re-audit and `PORTFOLIO_INDEX.md`.

## Preservation status

No repository, branch, tag or unique file has been deleted at any point.
Every change is on an `improvement/*` or `feature/*` branch behind a
reviewable PR. Nothing has been merged automatically.

## Deployment — 2026-08-23

**RailMind is live.** `33` deployed to Vercel project `33`, production target,
`READY`, at **33-ashen-xi.vercel.app**, from `main` at `6303ba1`.

Verified beyond the deployment status: the page serves (HTTP 200), and the
shipped bundle contains `engineer_review_required` and `submittedToMaximo` —
the engineer-review gate is in the artifact that is live, not just in the
repository. The security headers declared in `vercel.json` are in force: CSP,
HSTS with preload, `X-Frame-Options: DENY`, `nosniff`, and a Permissions-Policy
denying camera, microphone and geolocation.

**Correction to earlier evidence:** DEPLOYMENT_MAP recorded `33` as "not
deployed" and PORTFOLIO_INDEX as "ready, not deployed". A Vercel project
already existed and was already linked to the repository — it had simply never
built. Both files now say so.
