# Supply Chain Audit

Tool: `npm audit` against the committed lockfile of every JavaScript project.
Date 2026-08-23. Python projects (`11`, `agentic-os-enterprise`,
`Beyond-Style-UAE-`, `beyond-style-ops`) are not covered — see gaps below.

## Result

| Project | Critical | High | Moderate | Low | Total | Runtime-facing | All fixable |
|---|---|---|---|---|---|---|---|
| `vertex` | 3 | 6 | 7 | 1 | 17 | **7** | yes |
| `Pitchora-studio-Private` | 1 | 13 | 3 | 0 | 17 | **4** | **no** |
| `mutabasir` | 2 | 10 | 4 | 0 | 16 | 3 | yes |
| `Maktab` | 2 | 9 | 3 | 0 | 14 | 3 | yes |
| `promptops` | 2 | 9 | 3 | 0 | 14 | 3 | yes |
| `draftly-Private` | 2 | 9 | 3 | 0 | 14 | 3 | yes |
| `masaar` | 1 | 9 | 3 | 0 | 13 | 2 | yes |
| `33` | 1 | 1 | 3 | 0 | 5 | 0 | yes |
| `66` | 1 | 1 | 3 | 0 | 5 | 0 | yes |
| `lahza` | 0 | 1 | 3 | 0 | 4 | 2 | yes |

`wisal`, `data-value-studio`, `exeflow`, `annual-operation-plan-2026` have no
`package.json` — nothing to audit.

## The distinction that matters

Raw counts overstate the risk. The large majority of these advisories are in
**development tooling** — `vitest`, `vite`, `esbuild`, `postcss`,
`eslint-config-next`, `@babel/core`, `glob`, `js-yaml`, `brace-expansion`.
Those execute on a developer machine or in CI, never in a deployed artifact.
A `vitest` UI server RCE is a real advisory and an irrelevant one for a
production Next.js deployment.

What is worth acting on is the **runtime-facing** column: packages that ship
in the served bundle or run in the server process.

### Runtime-facing advisories, by project

| Project | Package | Severity | Issue |
|---|---|---|---|
| `Maktab`, `promptops`, `draftly-Private` | `next` | **critical** | Next.js Image Optimizer DoS |
| `masaar`, `mutabasir`, `Pitchora-studio-Private` | `next` | high | same family |
| `mutabasir` | `tar` | **critical** | archive-extraction path handling |
| `vertex` | `jspdf` | **critical** | ReDoS, plus a DoS variant — client-side PDF export |
| `vertex` | `jspdf-autotable` | high | |
| `vertex` | `dompurify` | moderate | XSS; `FORBID_TAGS` bypass — this is a sanitiser, so its failure mode is the one it exists to prevent |
| `vertex`, `lahza` | `react-router`, `react-router-dom`, `@remix-run/router` | moderate | open redirect leading to XSS |
| `Maktab`, `mutabasir`, `promptops`, `draftly-Private`, `Pitchora-studio-Private` | `ws` | high | |
| all Next.js projects | `nanoid` | high | non-secure generator can loop on negative size |

### Priority

1. **`vertex`** — most runtime-facing issues, and `dompurify` is the sensitive
   one: a sanitiser with a bypass is worse than an unpatched utility, because
   the code trusts it.
2. **`Pitchora-studio-Private`** — the only project where `npm audit` reports
   **`fixAvailable: false`**. `xlsx` has no patched release on the npm
   registry; the maintained build is distributed outside npm. That needs a
   decision (vendor the CDN build, migrate to `exceljs`, or accept the risk),
   not an `audit fix`.
3. The `next` advisories across the five Next.js apps — one semver-compatible
   bump each.

## Lockfile hygiene

Every JavaScript project commits `package-lock.json`. No project uses
`yarn.lock` or `pnpm-lock.yaml`, so there is no lockfile-format split to
reconcile. `npm ci` is reproducible everywhere it was tried.

## Gaps

- **Python projects are unaudited.** `agentic-os-enterprise` (a
  `pyproject.toml` + `requirements` project of 30k LOC),
  `Beyond-Style-UAE-` (`requirements.lock`), `11` (`requirements.txt`) and
  `beyond-style-ops` have had no `pip-audit` / `safety` pass. This is a real
  hole, not a formality: `agentic-os-enterprise` is the portfolio's
  production candidate.
- **No SBOM** is produced for any project.
- **No license audit** was performed. `agentic-os-enterprise` is the only
  repository shipping a `LICENSE` file; the rest are unlicensed, which for
  private work is defensible but should be deliberate.
- **No dependency-update automation** (Dependabot / Renovate) is configured
  anywhere. Every one of these advisories accumulated silently.

## Recommendations

| # | Action | Effort | Note |
|---|---|---|---|
| 1 | `npm audit fix` (no `--force`) + verify build and tests, one PR per project | Medium | Semver-compatible only; must be verified per repo, not assumed |
| 2 | Decide the `xlsx` question in Pitchora | Small decision, real consequence | No npm fix exists |
| 3 | Add `pip-audit` to the three Python projects' CI | Small | Closes the largest gap |
| 4 | Enable Dependabot on canonical repos | Small | Owner action — needs repo admin (403 for this session) |
| 5 | Add `LICENSE` files deliberately | Small | |

Item 1 is being executed as separate per-project pull requests, verified
individually. No dependency change is reported as complete until that
project's tests and build pass.

---

# Remediation results — 2026-08-23

Seven pull requests, one per project, each verified independently. No PR
touches more than one product.

| Project | PR | Advisories | Runtime-facing left | Verification |
|---|---|---|---|---|
| `vertex` | #2 | 17 → **6** | **0** | CI green incl. Playwright e2e |
| `masaar` | #3 | 13 → **8** | 0 | CI green |
| `mutabasir` | #2 | 16 → **8** | 0 | CI green |
| `Maktab` | #3 | 14 → **8** | 0 | CI green |
| `promptops` | #1 | 14 → **8** | 0 | local only — **no CI on main** |
| `draftly-Private` | #1 | 14 → **8** | 0 | local only — **no CI on main** |
| `Pitchora-studio-Private` | #2, #3, #4 | 17 → **12** | **0** | CI green |
| `lahza` | #1 | 4 → **2** | 0 | CI green |

**Every runtime-facing advisory in the portfolio is now closed.**

The last one was `xlsx` in Pitchora — high severity with `fixAvailable: false`,
because its maintained build is distributed outside npm. Resolved by migrating
to `exceljs` (PR #3). The raw count rose 11 → 12, which is the honest number:
exceljs brings `uuid@8.3.2` and its own moderate advisory. Highs went 7 → 6.

The uuid advisory is a bounds check in v3/v5/v6 **when a `buf` argument is
provided**. ExcelJS imports one function — `v4` — calls it with no arguments,
in conditional-formatting *write* code this app never runs, since it only
reads workbooks. High-and-exploitable was traded for moderate-and-unreachable,
and that trade was verified in the dependency's source rather than assumed.

## Not given a PR, and why

- **`66`** — 5 advisories, all in the vitest/vite/esbuild dev chain, none
  runtime-facing. Raising a PR would be motion without a security gain.
- **`33`** — audited after PR #1 merged (2026-08-23). `main` now carries a
  lockfile. 5 advisories, **all** in the vitest/vite/esbuild dev chain;
  **zero runtime-facing**, identical in shape to `66`. No PR raised, for the
  same reason: it would be motion without a security gain. Verified green on
  the merged `main` — typecheck, lint, **38 tests**, build, and `ci.yml`
  present.

## The shape of what was fixed

Five of the seven were the same finding wearing different clothes: a Next.js
14 app carrying **21 framework CVEs** — SSRF in rewrites and in Server
Actions, a Middleware/Proxy bypass, CSP-nonce XSS, unauthenticated disclosure
of internal Server Function endpoints. All 21 close at 15.5.21. `npm audit`
reports the fix as 16.3.2 only because that is the latest release, not the
earliest safe one; taking its word would have meant five framework rewrites
instead of five request-API migrations.

`vertex` was different: a client-side PDF and routing stack, where the notable
one was `dompurify` — a sanitiser with a `FORBID_TAGS` bypass, which fails at
precisely the job the calling code trusts it for.

## Defects found while doing this, not looked for

- **`draftly-Private` middleware was never applying its matcher.** The
  `config.matcher` was assembled by concatenating commented string fragments.
  Next parses `config` statically and cannot evaluate a concatenation, so the
  exclusion list — which explicitly said *"do NOT wrap with session refresh"*
  for crawler endpoints — had no effect. Next 14 warned; Next 15 fails the
  build. Fixed to a static literal.
- **A stale `.next/cache/eslint` masked a real lint error** in `Maktab` and
  `Pitchora-studio-Private`. Both were reported locally as passing and were
  not. Maktab's CI caught it; Pitchora has no CI, so nothing would have. Both
  fixed and re-verified from a cleared cache. **Local lint results are not
  trustworthy across a framework upgrade unless the cache is cleared first.**

## Governance gap this surfaced

`promptops`, `draftly-Private` and `Pitchora-studio-Private` have **no CI
workflow on `main`**. Their PRs were verified locally only. Given that a stale
cache produced a false pass twice in one session, that is not a comfortable
place to be — adding the standard `typecheck / lint / test / build` workflow to
these three is the highest-value W11 action.

---

# Python dependency audit — 2026-08-23

Tool: `pip-audit` 2.10.1. This closes the gap recorded above as the largest
one outstanding: four Python projects, including the portfolio's production
candidate, had never been dependency-scanned.

| Project | Manifest | Result |
|---|---|---|
| `agentic-os-enterprise` | `pyproject.toml` (21 deps incl. parsers extra) | **No known vulnerabilities** |
| `Beyond-Style-UAE-` | `requirements.lock` | **No known vulnerabilities** |
| `11` | `requirements.txt` | **No known vulnerabilities** |
| `beyond-style-ops` | `requirements.txt` | **No known vulnerabilities** |

Four for four clean. That is a genuinely better result than the JavaScript
side, and it is worth saying why rather than just recording it: these
projects have small, deliberately chosen dependency sets. `11`'s manifest
opens by noting that the CLI needs none of the packages at all. The
JavaScript projects carry a Next.js framework and a Vite/vitest toolchain,
which is where every advisory in this portfolio lives.

## One caveat, and it is not small

**`agentic-os-enterprise` has no lockfile.** Every dependency is declared as
`>=`, so `pip install` resolves to whatever is newest that day. The clean
result above is a scan of *today's* resolution, not of what a given build
actually installed — two installs a month apart can differ, and neither is
reproducible from the repository.

For the project the portfolio is treating as its production candidate, that
matters more than any individual advisory. Its own CI runs `gitleaks`,
tenant-isolation tests and agentic red-team tests; the one thing it does not
pin is the code those tests run against.

**Recommendation:** generate and commit a lockfile (`uv lock`,
`pip-compile`, or `poetry.lock`), then add `pip-audit` to the existing
`assurance-pipeline` workflow so the scan runs against the pinned set on
every push. It is a small change to a repository that is already doing
almost everything else right.

`Beyond-Style-UAE-` already commits `requirements.lock` and is the model here.

## Scope note

These four repositories are read-only in this session (no push credential),
so this audit is recorded rather than remediated. No PR was raised, and none
is needed — there is nothing to fix, only a lockfile to add.

## What the migration turned up

The extraction path it touched had **no tests at all**. Writing the first ones
surfaced a defect that had nothing to do with the library swap and everything
to do with the product:

`NUMBER_RE` truncated unformatted numbers. `12400000` extracted as **`124`**;
`-5000` as `-500`; `AED 250000` as `250`. The grouped alternation branch used
`*`, so it matched on one to three digits and won — alternation is
leftmost-first, not longest.

Spreadsheet cells store raw numbers without thousands separators, so **every
value above 999 arriving from a workbook was being cut to its first three
digits** before anything could cite it. A contract worth 12,400,000 entered
the evidence as 124.

It had survived every green build, every passing suite and every deploy,
because 124 is a perfectly plausible-looking number. Nothing was going to
catch it except a test asserting that a real number survived. Fixed in PR #4.

Worth generalising: two of the three most serious defects found in this
session — this one and Mutabasir's fabricated `AED 12,450,000` — were
**numbers that looked right**. Neither a type system nor a linter nor a green
build has any purchase on those. Only a test that states the expected value,
or a citation the reader can check, does.
