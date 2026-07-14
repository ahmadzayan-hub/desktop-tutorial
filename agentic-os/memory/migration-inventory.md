---
purpose: Phase 0 read-only inventory of the project (2026-07-14)
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Migration inventory — Phase 0 scan (2026-07-14)

Command: `agentic-os scan` (excludes .git, node_modules, dist, build,
caches, and the agentic-os tree itself). Hashes: sha256 per file,
recorded in the migration map.

- Files inventoried: 225
- Symlinks: 0
- Large binaries (>1 MB): 0
- Generated files (lockfiles etc.): 3
- Duplicate file names across directories: 16 names / 47 files (mostly
  README.md, package.json, .gitignore, index.html — expected in a
  multi-project workspace, no content duplication per PROJECTS.md)
- Secrets found in tracked files: none (pattern scan; .env is gitignored)
- External references: GitHub Pages/Vercel/Netlify deploy configs at root
  and per project; .github/workflows (android.yml, deploy-landing.yml,
  desktop.yml)

Project lines (per PROJECTS.md): Lahza (root src/, public/), Wisal
(wisal-web/, wisal-desktop/, android-wife-assistant/,
telegram-wife-assistant/), Beyond Style UAE (landing/), shared docs/,
plus the legacy agent-os/ documentation workspace from PR #65.
