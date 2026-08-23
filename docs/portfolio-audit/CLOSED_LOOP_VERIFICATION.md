# W15 — Closed-Loop Verification

An independent re-check of the portfolio, run against live state rather than
against this audit's own running notes. 2026-08-23.

The point of this pass is to catch claims made earlier in the session that are
no longer true, or were never true. It found two things worth recording, one of
which was a fault in the verification itself.

## Method

Fresh `git fetch` of each canonical repository's default branch, then direct
inspection of the tree. Live API for pull-request state. No reliance on
`EXECUTION_STATE.md` or any other artifact written during the session.

## 1. CI coverage — 11 / 11 ✅

| Repo | Workflows on default branch |
|---|---|
| `masaar`, `mutabasir`, `lahza`, `33`, `promptops`, `draftly-Private`, `Pitchora-studio-Private`, `66` | 1 |
| `Maktab`, `vertex` | 2 |
| `wisal` | 4 |

Every canonical repository has a working CI gate. Three of them — `promptops`,
`draftly-Private`, `Pitchora-studio-Private` — had none at the start of the
session.

### The verification's own false negative

The first run of this check reported **`promptops` workflows = 0**, which
would have meant a CI pull request I reported as merged had not landed.

It had landed. `.github/workflows/ci.yml` is on `main` at `767e08e`, merged at
10:44. The check was wrong: it read a **stale local `origin/main` ref**,
because the script's blanket `git fetch origin` did not refresh the tracking
branch the next command then read.

Recorded rather than quietly corrected, because it is the same class of error
this session found twice in application code — a tool reporting on cached
state and being believed. A verification pass that reads stale refs is not a
verification pass. The check was re-run with an explicit
`fetch origin main:refs/remotes/origin/main` per repository; the table above is
from that run.

## 2. Product authority — 7 / 7 strategic and active ✅

Present: `masaar`, `Maktab`, `mutabasir`, `vertex`, `33`, `66`,
`Pitchora-studio-Private`.

Absent: `lahza`, `promptops`, `draftly-Private`, `wisal` — all P2/P3, outside
the strategic-and-active set the spec requires them for. Not a gap; a scope
boundary. Worth adding if any of them is promoted.

## 3. A suspicion that turned out to be nothing

`wisal` carrying **four** workflows looked like the stale-workflow problem
cleaned out of `desktop-tutorial` and `lahza` earlier — workflows left behind
pointing at directories that had moved.

Checked rather than assumed. All four working directories exist on `main`:
`android-wife-assistant` (104 files), `wisal-cloud-api` (8),
`wisal-desktop` (11), `wisal-direct-relay` (16). The workflows build the four
real surfaces of the product. Nothing to fix.

Two of its directories — `wisal-web` and `telegram-wife-assistant` — have no
workflow. Minor, and not worth a change while Wisal is a prototype.

## 4. Pull requests — 1 open

`66` #3, opened during this pass: bring `main` up to date with the branch that
actually ships. Everything else merged; 23 this session.

## 5. Deployment

`33` RailMind is live at **33-ashen-xi.vercel.app**, production target,
`READY`, from `main` at `6303ba1`. Verified by fetching the page (HTTP 200)
and confirming the shipped bundle contains `engineer_review_required` and
`submittedToMaximo` — the engineer-review gate is in the live artifact, not
only in the repository.

## 6. Security

All 21 repositories scanned across full history. Zero true positives. See
SECURITY_AUDIT.md. Every runtime dependency advisory in the portfolio is
closed; see SUPPLY_CHAIN_AUDIT.md.

## What remains untrue of the portfolio

Stated plainly, because a closing audit that reads as a victory lap is not
worth writing:

1. **No project is PRODUCTION_READY**, and none claims to be. Masaar's security
   model is merged but not applied; no project carries a version tag; no
   deployment has been cut over under the spec's staging-and-rollback protocol.
2. **`66` still has two divergent heads**, and the one that ships is a
   `claude/*` working branch. PR #3 fixes the first half; the default-branch
   switch needs repository admin.
3. **Two owner actions are blocked by permissions, not judgement** — restoring
   Supabase `beyond-style` (`restore_project` denied), and removing 13
   redundant or broken Vercel projects (no delete capability exists in this
   session's tooling; `pause_project` returns 403). Domain safety for all
   deletion candidates has been verified — none holds a custom domain.
