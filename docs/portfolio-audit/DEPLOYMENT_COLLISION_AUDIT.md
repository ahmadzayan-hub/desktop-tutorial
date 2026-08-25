# Deployment Collision Audit — W3

Source: Vercel `list_projects`, team `celia2026-3923s-projects`
(`team_hHsRBxzmo0SJmyT400ArhQzc`), re-read 2026-08-23. 25 projects for 19
canonical software projects.

## Collision classes

### 1. Same repo, multiple Vercel projects — 4 collisions, 17 projects

| Repo | Projects | Count | Verdict |
|---|---|---|---|
| `desktop-tutorial` | `desktop-tutorial`, `1`, `desktop-tutorial-58zf`, `desktop-tutorial-ndwf`, `desktop-tutorial-fch7`, `desktop-tutorial-fz1m`, `vercel`, `project-sa1ea`, `wisal-cloud-api` | **9** | 8 redundant. The repo is now a migration archive; its content moved to `Maktab`. |
| `vertex` | `vertex`, `vertex-platform`, `beyond-style-uae` | 3 | 2 **actively broken** — stale root directories |
| `pitchora` / `pitchora2` | `pitchora`, `pitchora-u3c2`, `pitchora2` | 3 | All 3 point at repos with **zero commits** |
| `beyond-style-ops` | `beyond-style-ops`, `beyond-style-ops-vgt1` | 2 | 1 redundant; repo is a legacy snapshot |

Every push to `vertex` currently produces one successful deployment and two
guaranteed failures, because `vertex-platform` and `beyond-style-uae` build
from root directories that do not exist in that repository. This is the only
collision causing ongoing, repeating failure, so it is the one worth fixing
first.

### 2. Orphan

`project-kyhpj` — `link: null`. Connected to no repository. Cannot build,
cannot be triggered, cannot be traced back to an owner.

### 3. Misleading names — a real operational hazard

Three projects are named after something other than what they build:

| Project | Name suggests | Actually builds |
|---|---|---|
| `wisal-cloud-api` | the Wisal product | `desktop-tutorial` |
| `beyond-style-uae` | the Beyond Style product | `vertex` |
| `vercel`, `1`, `project-sa1ea` | nothing | `desktop-tutorial` |

A name is not evidence of what a project deploys (spec rule 4). Anyone
debugging Wisal by opening `wisal-cloud-api` would be looking at the wrong
repository. This is worth correcting even if the duplicates are kept.

### 4. Domain collisions

**Status: VERIFIED for every deletion candidate, 2026-08-23.**

Each was checked with `get_project` before any action was proposed:

| Project | Domains | Latest deployment |
|---|---|---|
| `vertex-platform` | auto `.vercel.app` only | **ERROR** |
| `beyond-style-uae` | auto `.vercel.app` only | **ERROR** |
| `project-kyhpj` | **none** | none — never built |
| `1` | auto only (`1-theta-bice.vercel.app`) | READY |
| `vercel` | auto only (`vercel-alpha-gules-49.vercel.app`) | READY |
| `wisal-cloud-api` | auto only | **ERROR** |
| `pitchora` | **none** | none — never built |

**No custom domain is attached to any deletion candidate on Vercel.**

**This verification is Vercel-only, and that is a real limit.** Netlify was
later found attached to `desktop-tutorial` (two sites) and `lahza` — see the
correction at the end of EXTERNAL_DEPENDENCY_MAP.md. Nothing here says whether
a Netlify site serves a domain for the same repository. Nothing in this
list is answering on a real hostname, so removing them cannot break a link
anyone has published on a domain they own. Two of them — `1` and `vercel` —
are READY and do still serve stale `desktop-tutorial` content on their
auto-generated `.vercel.app` URLs.

Earlier status for the wider account: Custom-domain enumeration requires per-project domain
reads that this session's Vercel credentials do not grant (project reads
succeed; mutations return 403). No collision is claimed and none is ruled out.
The one previously confirmed domain fault is recorded in the Pitchora work:
its mobile `PRODUCTION_URL` pointed at `desktop-tutorial-kappa-five.vercel.app`
— a different product's preview host — and was corrected in `Pitchora-studio-Private` PR #1.

Before any production domain is reassigned, the owner must confirm which
project currently answers on it. Domain reassignment is approval-gated
(spec §3) and nothing was attempted.

## Recommended actions, in risk order

**Execution status, 2026-08-23: none of these could be carried out.**

The Vercel MCP surface available to this session exposes `create`, `get`,
`list`, `pause`, `unpause` and deployment-protection settings. **There is no
delete-project capability at all** — so deletion is not something that was
declined, it is something that cannot be expressed.

`pause_project` was attempted on both broken `vertex` projects as a
reversible substitute (it stops a project serving and can be undone with
`unpause_project`). Both returned **403 Forbidden**.

Every action below therefore remains an owner action from the Vercel
dashboard.

| # | Action | Risk | Blocked by |
|---|---|---|---|
| 1 | Delete Vercel projects `vertex-platform` and `beyond-style-uae` | Low — both fail every build already | Vercel mutation 403; owner action |
| 2 | Delete `project-kyhpj` | Low — linked to nothing | same |
| 3 | Delete the 8 redundant `desktop-tutorial` projects | Medium — **verify no custom domain first** | same |
| 4 | Delete the 3 `pitchora*` projects | Low — repos are empty | same |
| 5 | Delete `beyond-style-ops-vgt1` | Low | same |

Deleting a Vercel project is not reversible and can drop a live URL, so none
of these were attempted, and #3 is explicitly gated on the domain check that
this session could not perform.
