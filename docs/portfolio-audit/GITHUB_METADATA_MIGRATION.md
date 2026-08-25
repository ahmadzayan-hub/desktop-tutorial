# GitHub Metadata Migration — W3

Purpose: no source repository may be retired before its non-code assets are
accounted for. Inventory taken 2026-08-23 by `git ls-remote` (refs) and the
GitHub API (pull requests, checks).

## Ref inventory — all 24 accessible repos

| Repo | Branches | Tags |
|---|---|---|
| `lahza-Private` | **74** | 0 |
| `66` | 4 | 0 |
| `desktop-tutorial` | 3 | 2 (`android-latest`, `windows-latest`) |
| `masaar`, `Maktab`, `Beyond-Style-UAE-`, `agentic-os-enterprise` | 3 | 0 |
| `beyond-style-ops`, `mutabasir`, `vertex`, `33`, `Pitchora-studio-Private`, `11`, `22`, `55` | 2 | 0 |
| `lahza`, `annual-operation-plan-2026`, `promptops`, `data-value-studio`, `exeflow`, `draftly-Private` | 1 | 0 |
| `wisal` | 1 | 1 (`android-latest`) |
| `pitchora`, `pitchora2` | **0** | 0 |

## Findings

### 1. The portfolio is almost entirely untagged

Three tags exist across 24 repositories, and all three are moving pointers
(`android-latest`, `windows-latest`) rather than release marks. **No project
has a version tag.** `draftly-Private` is recorded in the registry as v1.0.1;
that version exists in its files, not as a git tag, so there is no immutable
ref to roll back to.

Consequence: the spec's rollback requirement currently rests on branches, which
are mutable. This is the portfolio's weakest preservation link.

### 2. The `beyond-style-ops` snapshot is a branch, not a tag

The legacy snapshot was recorded as complete. It is real, but it is a
**branch** — `refs/heads/legacy-final` at `471c62f`, identical to `master`.
The intended immutable tag exists only in the local clone, at `c4cc1f1`.

Verified: `c4cc1f1` is an ancestor of `471c62f`, so the remote branch is a
superset and **nothing is lost**. But a branch can be moved or deleted; a tag
signals intent. Pushing `refs/tags/legacy-final` was attempted and returned
**HTTP 403** — this session has no push credential for `beyond-style-ops`.

Owner action: `git push origin refs/tags/legacy-final` from a credentialed
checkout, or create the tag in the GitHub UI at `471c62f`.

### 3. Two repositories with zero refs

`pitchora` and `pitchora2` have no branches, no tags, no commits — confirmed
twice, by clone and by `ls-remote`. There is no metadata to migrate and no
content to preserve. They are safe to delete on the sole ground that they are
empty. Deletion remains approval-gated.

### 4. `lahza-Private`: 74 branches, the portfolio's real archive

This is where recovered work has been coming from — `masaar`'s PWA manifest and
icons were recovered from `wasl @ 5f052157` inside it. It is a container, not a
project, and **it must not be retired**: it is the provenance record for
several canonical repositories, and the only copy of history that predates the
splits.

It is also **public despite its `-Private` name** — recorded in
PROJECT_REGISTRY.md as an approval-gated visibility item.

### 5. Default branches are `claude/*` on five repos

`11`, `22`, `55`, `agentic-os-enterprise`, `Beyond-Style-UAE-` all default to a
`claude/*` working branch; none has `main`. Governance item, not a migration
blocker.

## Not inspected

Issues, Discussions, Projects, Secrets metadata, Variables, Environments,
Webhooks, Deploy Keys, Rulesets, Branch Protection, CODEOWNERS and Pages
settings were **not** enumerated per repository. Repository settings and admin
endpoints return 403 for this session's credentials, so these are recorded as
UNVERIFIED rather than reported as empty.

This matters for one decision only: **do not retire `desktop-tutorial` or
`lahza-Private` until the owner confirms their issue and webhook state from an
account with admin access.** Every other retirement candidate (`pitchora`,
`pitchora2`) is provably empty.

## Pull request state — all green, 2026-08-23

| Repo | PR | Checks |
|---|---|---|
| `masaar` #2 | PWA manifest recovery | pass |
| `Maktab` #1 | Study Command Center | pass |
| `Maktab` #2 | copy repairs | pass (drift check fixed at `394d47e`) |
| `mutabasir` #1 | Evidence Split View | pass |
| `vertex` #1 | Compliance Matrix | pass, incl. Playwright e2e |
| `66` #2 | Co-Design Studio | pass |
| `33` #1 | RailMind greenfield | pass |
| `Pitchora-studio-Private` #1 | canonical identity + CI | pass |

`masaar` #1 was merged by the owner. Eight PRs remain open and mergeable; none
is blocked. `66` #2 targeted `claude/beyond-style-uae-os-ji8ygo`, not `main`.

### Correction — `66` does have a `main`, and that is the problem

An earlier note in this file said `66` has no `main` branch. That was wrong:
`main` exists. It is simply not the default branch, and the two have
**diverged**.

| Branch | Head | Files |
|---|---|---|
| `main` | `f1521d1` "Merge pull request #1" | 62 |
| `claude/beyond-style-uae-os-ji8ygo` *(default)* | `eecc953` "Merge pull request #2" | 71 |

`git merge-base --is-ancestor` reports **divergent histories** — neither is an
ancestor of the other.

Checked for content loss before drawing any conclusion, per PRESERVE >
INVESTIGATE > DELETE:

- **Zero files exist only on `main`.**
- Nine files exist only on the default branch — the whole Co-Design Studio,
  `ci.yml`, and `docs/PRODUCT_AUTHORITY.md`.
- Ten common files differ. Every line unique to `main`'s side is a
  *superseded* older version: the synchronous `generateConcepts(brief)`
  before it took a gateway, `StubProvider` before the Anthropic provider
  replaced it, the old dev-server route, the old test. Nothing unique.

So the default branch is a strict content superset, and `main` is a stale
head that nothing builds from — while looking authoritative to anyone who
clones the repo and lands on `main` by habit.

**Recommendation:** merge the default branch into `main` (additive, no
history rewrite, nothing to lose), then make `main` the default. Production
is unaffected either way — Vercel tracks the default branch, not `main`.
