# Projects in this repository

This repository is a **multi-project workspace**, not a single app. It hosts two
independent product lines. They share no application code — each folder is
self-contained and can be split into its own GitHub repository and deployment
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

A family-messaging assistant delivered across three surfaces. These are **three
surfaces of one product, not duplicates**: a web landing page, an Android app,
and a Telegram bot.

| Path | Surface | Stack | Deploy target |
| --- | --- | --- | --- |
| `wisal-web/` | Landing + download page | Static HTML/CSS/JS (own `vercel.json`, `manifest`, `sitemap`, `robots`, `llms.txt`) | Vercel/Netlify as a **separate project** with Root Directory = `wisal-web` |
| `android-wife-assistant/` | Android app | Kotlin + Gradle | Google Play / signed APK |
| `telegram-wife-assistant/` | Telegram bot | Node.js (PM2 `ecosystem.config.js`) | Any always-on host (VPS/Render/Railway) via PM2 |

`docs/` holds shared threat models (`THREAT_MODEL.md`, `THREAT_MODEL_WISAL.md`).

## No duplication

There is **no duplicated project or copied application code** in the tree. Lahza
lives only at the root (`src/`), and the three Wisal surfaces are distinct
implementations (web / Android / bot) of the same product — verified: no shared
or duplicated source folders across projects.

## Deploy each project separately (no extraction required)

- **Lahza** — import this repo into Vercel/Netlify; Root Directory `.`. Done.
- **wisal-web** — new Vercel/Netlify project from this repo, Root Directory
  `wisal-web` (it has its own `vercel.json`). Fully independent build.
- **telegram-wife-assistant** — `cd telegram-wife-assistant && npm i && pm2 start
  ecosystem.config.js` on any always-on host. Needs `GROQ_API_KEY` +
  `TELEGRAM_BOT_TOKEN` (see its `README.md`).
- **android-wife-assistant** — open in Android Studio, or `./gradlew assembleRelease`.

## Split a project into its own GitHub repository (history-preserving)

To move any subfolder into a brand-new repo while keeping its git history:

```bash
# 1. Split the folder into a standalone branch (keeps only its history)
git subtree split --prefix=<folder> -b split-<folder>
#    e.g. --prefix=wisal-web  |  --prefix=telegram-wife-assistant

# 2. Create an empty new repo on GitHub, then push the split branch as main
git push git@github.com:<you>/<new-repo>.git split-<folder>:main

# 3. In the new repo, that folder's contents are now at the root.
```

For Lahza itself (already the root app), the inverse is simpler: create its repo
from the root and delete the sibling folders **in that copy only** — this
workspace stays intact.
