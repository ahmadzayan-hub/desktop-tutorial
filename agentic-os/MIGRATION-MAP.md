# MIGRATION-MAP.md — Awaiting Owner Approval (prompt §9.2)
purpose: Proposed classification of current repo files into the Agentic OS structure. NOTHING is moved until the owner approves. Move/delete gated by guardrails.md.
owner: Ahmed Zaian
last-updated: 2026-07-14

## Headline finding
This repository is a **multi-project code monorepo**, not a personal-knowledge workspace. The
Agentic OS domains (`rta | bcgt | mba | brand | personal`) are your **work/life** domains and do
**not** describe application code. Therefore the honest recommendation is:

> **Keep all existing projects exactly where they are. Do not migrate code into OS domains.**
> The `agentic-os/` folder is an **additive orchestration layer** that sits beside them.

Forcing code into `rta/bcgt/mba/brand/personal` would misfile it and break builds. So every code
row below is **KEEP IN PLACE**, and domain-content rows are **NONE FOUND** in this repo.

## Proposed classification (current path → new path → domain → reason)
| Current path | Proposed action → new path | Domain | Reason |
| --- | --- | --- | --- |
| `src/`, `index.html`, `vite.config.ts`, `public/`, `package.json`, `netlify.toml`, `vercel.json`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js`, `README.md` (Lahza root app) | **KEEP IN PLACE** | n/a (code) | Root Vite app; moving it breaks the root build/deploy |
| `wisal-web/`, `android-wife-assistant/`, `telegram-wife-assistant/`, `wisal-desktop/` | **KEEP IN PLACE** | n/a (code) | Wisal product surfaces; each self-contained per PROJECTS.md |
| `beyond-style-uae/` | **KEEP IN PLACE** | n/a (code) | Beyond Style orders console (PR #14); self-contained |
| `landing/` | **KEEP IN PLACE** | n/a (code) | Beyond Style static landing page |
| `docs/`, `PROJECTS.md`, `.github/`, `.mcp.json`, `.env.example` | **KEEP IN PLACE** | n/a | Repo-level infra/docs |
| `agentic-os/**` (new) | **NEW — additive layer** | system | The OS itself; created this session |
| _personal-OS domain content (rta/bcgt/mba/brand/personal notes, knowledge, templates)_ | **NONE FOUND** in this repo | — | This repo has no such content to migrate |

## Items flagged "ask me"
1. **Where should `agentic-os/` live?** Options: (a) its **own new repo** `claude-os` (cleanest —
   keeps it out of the code monorepo and off the Beyond Style PR branch); (b) a **new branch** in
   this repo; (c) stay in the working tree of this branch (not recommended — pollutes PR #14).
   **Recommendation: (a) own repo.**
2. Do you actually intend to run the OS **against a different location** (e.g. a Google Drive / notes
   vault holding your rta/bcgt/mba/brand content)? If so, point me there and I'll classify that.

## Nothing has been moved
No file was moved, edited, or deleted. On your approval I will only then act — and any delete
becomes an archive to `_archive/` per `guardrails.md`.
