# Portfolio Audit

Evidence from the portfolio-wide discovery, consolidation, security and
completion pass of 2026-08-23, across 29 repositories and 20 canonical
projects.

**Start here:** [`PORTFOLIO_INDEX.md`](./PORTFOLIO_INDEX.md) — one row per
project, with build, test and deployment *reality* rather than claims.

## Why these files live in this repository

They describe the portfolio, not any one product, so they belong to none of
the canonical product repositories. `desktop-tutorial` is the migration
archive and already holds the provenance record for the splits these
documents trace, which makes it the least wrong home.

If portfolio governance grows beyond a directory of markdown, a dedicated
repository would be cleaner than an archive.

## What is here

| File | Answers |
|---|---|
| `PORTFOLIO_INDEX.md` | What exists, where it lives, and what state it is really in |
| `PROJECT_REGISTRY.md` | The canonical identity of every project, once each |
| `PROJECT_COMPLETION_STATUS.md` | Triage: strategic, active, incubation, experiment, utility |
| `DUPLICATE_ANALYSIS.md` | The one genuine duplicate, and why it is escalated rather than resolved |
| `HIDDEN_PROJECT_DISCOVERY.md` | Projects found inside other repositories' branches |
| `PROJECT_MIGRATION_LEDGER.md` | Every structural change, with its rollback ref |
| `SECURITY_AUDIT.md` | Secret scanning across 21 repositories, full history |
| `SUPPLY_CHAIN_AUDIT.md` | Dependency advisories, what was fixed, and what was traded |
| `DEPLOYMENT_MAP.md` · `DEPLOYMENT_COLLISION_AUDIT.md` | What deploys from where, and the 13 projects that should not exist |
| `EXTERNAL_DEPENDENCY_MAP.md` · `DATA_BOUNDARY_AUDIT.md` | What breaks if a repository moves |
| `GITHUB_METADATA_MIGRATION.md` | Refs, tags and the non-code assets a retirement would lose |
| `CLOSED_LOOP_VERIFICATION.md` | An independent re-check of all of the above |
| `EXECUTION_STATE.md` | Resume point: what is done, what is blocked, what is next |

## How to read them

Two habits are worth knowing about, because they change how the claims should
be taken.

**Limitations are stated, not implied.** No project is marked
PRODUCTION_READY, and `CLOSED_LOOP_VERIFICATION.md` closes with what remains
untrue rather than a summary of what went well. Where a check could not be
run, it says so instead of omitting it.

**Corrections are kept, not overwritten.** Several entries record that an
earlier finding in the same session was wrong — `33` was reported undeployed
when its Vercel project already existed; `66` was reported to have no `main`
when it had a divergent one; a CI check was reported missing when the audit
script had read a stale git ref. Those are left in place. A document that
only ever agreed with itself would be less useful, not more.
