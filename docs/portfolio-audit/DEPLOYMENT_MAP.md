# Deployment Map — W3

Source: Vercel `list_projects` (team `celia2026-3923s-projects`), 2026-08-23,
cross-checked against the repository inventory.

## Live / correct

| Vercel project | Repo | Root | State | Note |
|---|---|---|---|---|
| `masaar` | masaar | (root) | READY | production + PR previews |
| `mutabasir` | mutabasir | (root) | READY | |
| `maktab` | Maktab | (root) | READY | |
| `vertex` | vertex | (root) | READY | root corrected by owner after the platform promotion |
| `66` | 66 | (root) | READY | |
| `33` | 33 | (root) | **READY — deployed 2026-08-23** | RailMind. **Correction:** this project already existed and was linked; the earlier "not deployed" entry was wrong. It had simply never built. |
| `lahza` | lahza | — | unverified | |
| `wisal` | wisal | — | **ERROR since `b3f469a`** | Broken by my own commit, not a pre-existing fault: that commit removed the root Vite app (Lahza's storefront, now in `lahza`) and left the project building a root with no web app in it. Last green deploy `ed53249`. Fix open as `wisal#2` — root `vercel.json` with `outputDirectory: wisal-web`. |
| `beyond-style-ops` | beyond-style-ops | — | legacy | repo is a legacy snapshot |
| `promptops` | promptops | — | unverified | **correction 2026-08-23:** previously listed as not deployed; a Vercel project exists |

## Broken — stale root directories (fails on every commit)

| Vercel project | Repo | Root | Why it fails |
|---|---|---|---|
| `vertex-platform` | **vertex** | `vertex-platform` | Directory no longer exists; contents promoted to repo root |
| `beyond-style-uae` | **vertex** | `beyond-style-uae` | Directory never existed in this repo |

Both point at the same repo as the healthy `vertex` project, so every push to
`vertex` produces one success and two guaranteed failures.
**Owner action: delete both projects.** Not attempted — Vercel project
mutation returns 403 for this session, and pausing could drop a live URL.

## Duplicate projects on one repo

| Repo | Vercel projects | Count |
|---|---|---|
| `desktop-tutorial` (archive) | `desktop-tutorial`, `1`, `desktop-tutorial-58zf`, `desktop-tutorial-ndwf`, `desktop-tutorial-fch7`, `vercel`, `project-sa1ea`, `wisal-cloud-api`, `desktop-tutorial-fz1m` | **9** |
| `vertex` | `vertex`, `vertex-platform`, `beyond-style-uae` | 3 |
| `pitchora` / `pitchora2` | `pitchora`, `pitchora-u3c2`, `pitchora2` | 3 (repos are **empty**) |
| `beyond-style-ops` | `beyond-style-ops`, `beyond-style-ops-vgt1` | 2 |

`project-kyhpj` is linked to no repository at all.

## Not deployed

`Pitchora-studio-Private`,
`data-value-studio`, `exeflow`, `annual-operation-plan-2026`
(GitHub Pages, disabled), `11`, `22`, `44`, `55`, `agentic-os-enterprise`,
`Beyond-Style-UAE-`, `draftly-Private`.
