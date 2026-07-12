# Projects in this repository

This repository is a **multi-project workspace**, not a single app. It hosts
several independent product lines. They share no application code — each folder
is self-contained and can be split into its own GitHub repository and deployment
without touching the others.

> Deploy note: Vercel/Netlify pointed at the repo **root** build **Lahza only**
> (the root `vite` app). The sibling folders are ignored by the root build, so
> Lahza already "works separately" today. The other projects each ship their own
> build/deploy config and are extracted as shown below.

## Product line 1 — Lahza (لحظة)

| | |
| --- | --- |
| **Path** | `/` (repository root: `src/`, `public/`, `index.html`) |
| **What** | Bilingual (EN/AR) web app for personalised coffee gifts, event coffee stations and corporate campaigns |
| **Stack** | Vite + React + TypeScript + Tailwind |
| **Deploy** | Vercel or Netlify from the repo root (`vercel.json`, `netlify.toml`) |
| **Standalone** | Yes — builds and deploys from root today |

## Product line 2 — Wisal (وصال) / رسايل القلب

A family-messaging assistant delivered across four surfaces. These are **surfaces
of one product, not duplicates**: a web landing page, an Android app, a Telegram
bot, and a Windows desktop app.

| Path | Surface | Stack | Deploy target |
| --- | --- | --- | --- |
| `wisal-web/` | Landing + download page | Static HTML/CSS/JS (own `vercel.json`, `manifest`, `sitemap`, `robots`, `llms.txt`) | Vercel/Netlify as a **separate project** with Root Directory = `wisal-web` |
| `android-wife-assistant/` | Android app | Kotlin + Gradle | Google Play / signed APK |
| `telegram-wife-assistant/` | Telegram bot | Node.js (PM2 `ecosystem.config.js`) | Any always-on host (VPS/Render/Railway) via PM2 |
| `wisal-desktop/` | Windows desktop app | Electron (own CI installer build) | Signed installer via `.github/workflows/desktop.yml` |

## Product line 3 — Beyond Style UAE (landing page)

| | |
| --- | --- |
| **Path** | `landing/` |
| **What** | Bilingual (Arabic-first/EN) static landing page for the personalised-jewelry brand; ordering via WhatsApp + a Google order form (no backend) |
| **Stack** | Pure static HTML/CSS/JS (no build step) |
| **Deploy** | **GitHub Pages** via `.github/workflows/deploy-landing.yml` (auto-deploys on pushes touching `landing/**`); also hostable on Vercel/Netlify/Cloudflare Pages |
| **Standalone** | Yes — static files, host anywhere |

## Product line 4 — Beyond Style UAE — Order Control Console

An internal, human-approved sales operating console for the same jewelry brand
(AI drafts → owner approves → system tracks). Fully self-contained in its own
folder — it does **not** touch the root Lahza app or the `landing/` page.

| | |
| --- | --- |
| **Path** | `beyond-style-uae/` (own `src/`, `package.json`, `next.config.mjs`, `tsconfig.json`, `vercel.json`) |
| **What** | Order-control console: form intake → WhatsApp confirmation gate → live queue, payments, delivery & margin dashboard |
| **Stack** | Next.js 14 (App Router) + TypeScript + Tailwind + Vitest; optional Supabase + a standalone Python LangGraph backend (`beyond-style-uae/python-agent/`) |
| **Deploy** | Vercel as a **separate project** with Root Directory = `beyond-style-uae` (it has its own `vercel.json`) |
| **Standalone** | Yes — `cd beyond-style-uae && npm install && npm run dev` (port 3000) |

`docs/` holds shared threat models (`THREAT_MODEL.md`, `THREAT_MODEL_WISAL.md`).

## No duplication

There is **no duplicated project or copied application code** in the tree. Lahza
lives only at the root (`src/`); the Wisal surfaces are distinct implementations
(web / Android / bot / desktop) of one product; the Beyond Style UAE landing
(`landing/`) is a separate static site; and the Beyond Style UAE console is
isolated under `beyond-style-uae/` — verified: no shared or duplicated source
folders, and no root-path or config collisions across projects.

> Two distinct static "landing" folders exist but are **not duplicates**:
> `wisal-web/` markets the Wisal messaging app (with the APK download), while
> `landing/` markets the Beyond Style UAE jewelry brand. Different products,
> different content, different deploy targets. The Beyond Style **console**
> (`beyond-style-uae/`) is a separate Next.js app, not a landing page.

## Deploy each project separately (no extraction required)

- **Lahza** — import this repo into Vercel/Netlify; Root Directory `.`. Done.
- **wisal-web** — new Vercel/Netlify project from this repo, Root Directory
  `wisal-web` (it has its own `vercel.json`). Fully independent build.
- **telegram-wife-assistant** — `cd telegram-wife-assistant && npm i && pm2 start
  ecosystem.config.js` on any always-on host. Needs `GROQ_API_KEY` +
  `TELEGRAM_BOT_TOKEN` (see its `README.md`).
- **android-wife-assistant** — open in Android Studio, or `./gradlew assembleRelease`.
- **wisal-desktop** — `cd wisal-desktop && npm install && npm start`; installers
  build in CI via `desktop.yml`.
- **landing (Beyond Style UAE)** — already auto-deploys to GitHub Pages via
  `deploy-landing.yml`; or host the `landing/` folder as-is on any static host.
- **beyond-style-uae** — new Vercel project from this repo, Root Directory
  `beyond-style-uae` (own `vercel.json`). Runs with zero keys via mock providers;
  set Supabase / AI / WhatsApp env vars to go live (see its `README.md`).

## Split a project into its own GitHub repository (history-preserving)

To move any subfolder into a brand-new repo while keeping its git history:

```bash
# 1. Split the folder into a standalone branch (keeps only its history)
git subtree split --prefix=<folder> -b split-<folder>
#    e.g. --prefix=wisal-web  |  --prefix=telegram-wife-assistant  |  --prefix=beyond-style-uae

# 2. Create an empty new repo on GitHub, then push the split branch as main
git push git@github.com:<you>/<new-repo>.git split-<folder>:main

# 3. In the new repo, that folder's contents are now at the root.
```

For Lahza itself (already the root app), the inverse is simpler: create its repo
from the root and delete the sibling folders **in that copy only** — this
workspace stays intact.
