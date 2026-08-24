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
| `wisal` | wisal | `wisal-web` | **READY — verified 2026-08-24** | Broken by my own commit, not a pre-existing fault: that commit removed the root Vite app (Lahza's storefront, now in `lahza`) and left the project building a root with no web app in it. Last green deploy `ed53249`. **FIXED and verified 2026-08-24.** `outputDirectory: wisal-web` alone still failed — `vite: command not found`, exit 127 — because the project's saved dashboard settings held the Vite framework and build command from when the root was Lahza's storefront. The fix (`wisal#2`, `8aed216` + `334e38b`) also sets `framework: null` and empties `buildCommand`/`installCommand`, which `vercel.json` takes precedence over the dashboard for. Verified on `dpl_GbTdfTds`: build log reads `Build Completed in /vercel/output [29ms]` with no install and no vite step, and the URL returns **200** serving the Wisal landing page. **All six security headers now apply** — CSP, HSTS, Permissions-Policy, Referrer-Policy, X-Content-Type-Options, X-Frame-Options — confirmed in the live response. They were defined in `wisal-web/vercel.json` and had never taken effect, because Vercel reads only the root file. |
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

## Nested deploy configs — swept 2026-08-24

Prompted by wisal, where six security headers sat in `wisal-web/vercel.json`
and had never applied: Vercel reads only the **root** `vercel.json`, so a
config file one directory down looks correct, fails silently, and protects
nothing.

Checked every cloned repo for `vercel.json` / `netlify.toml` below the root.

| Repo | Nested config | Verdict |
|---|---|---|
| `wisal` | `wisal-web/vercel.json` | Was inert. Superseded by the root file, which now carries the headers — verified live. Left in place as the config that would apply if that directory moves to its own repo. |
| `wisal` | `wisal-cloud-api/vercel.json`, `wisal-direct-relay/vercel.json` | `functions.maxDuration: 15` only. No headers, no routes — nothing security-relevant is silently absent. Each applies only under a Vercel project whose Root Directory is set to that folder. |
| everything else | none | `33`, `66`, `annual-operation-plan-2026`, `desktop-tutorial`, `lahza`, `maktab`, `masaar`, `mutabasir`, `Pitchora-studio-Private`, `promptops`, `vertex` all keep `vercel.json` (and `netlify.toml` where present) at the repo root, where it is read. |

So wisal was the only instance. The lesson generalises even though the sweep
came back clean: a deploy config in the wrong directory produces no error and
no warning, which makes it indistinguishable from one that works. It is worth
re-running this check whenever a directory is promoted out of a repo or a repo
root is restructured — both of which happened in this portfolio this week.
