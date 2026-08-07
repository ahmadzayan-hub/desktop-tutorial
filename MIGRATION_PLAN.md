# Repository Split · Migration Plan

**Decision:** This repo (`ahmadzayan-hub/desktop-tutorial`) will host **Maktab** only.
Every other project moves to its own dedicated repo. Nothing gets deleted until
the target repos are proven green and the owner has confirmed the move.

## Project inventory (as of this plan)

Confirmed by reading `package.json` on each canonical branch.

| # | Project | `package.json.name` | Current canonical branch on origin | Target new repo |
|---|---|---|---|---|
| 1 | **Maktab** (keep in this repo) | `maktab` | `claude/platform-cleanup-DhTNz` | *(stays here → becomes new `main`)* |
| 2 | Lahza (currently on `main`) | `lahza` | `main` | `ahmadzayan-hub/lahza` |
| 3 | Beyond Style UAE ops console | `beyond-style-uae` | `beyond-connect-console` | `ahmadzayan-hub/beyond-style-uae` |
| 4 | Prompt Orchestrator (archived) | `prompt-orchestrator` | `legacy/prompt-orchestrator` | `ahmadzayan-hub/prompt-orchestrator` |
| 5 | Draftly | `draftly` | `draftly/main` | `ahmadzayan-hub/draftly` |
| 6 | Pitchora Studio | `pitchora-studio` | `pitchora` | `ahmadzayan-hub/pitchora-studio` |
| 7 | Mutabasir · Director's Lens | `mutabasir-director-lens` | `mutabasir/director-lens-platform` | `ahmadzayan-hub/mutabasir-director-lens` |

Duplicate / older snapshots of the same projects (delete once their canonical
branch has migrated safely):

- `beyond-style-uae-snapshot` (dup of #3)
- `claude/masaar-launch`, `claude/wisal-android-arabic`, `operational-plan-v03`
  (variants of `lahza`)
- Every `claude/beyond-style-*`, `claude/rta-*`, `claude/vertex-*`,
  `claude/coffee-*`, `claude/social-*`, `claude/telegram-*`, `claude/oauth-*`,
  `claude/notebooklm-*`, `claude/build-presentiq-*`,
  `claude/create-dashboard-*`, `claude/mutabasir-platform-v1-*`,
  `claude/prompt-orchestrator-saas-*`, `claude/orchestrator-features-*`,
  `claude/monorepo-*`, `claude/repo-separation-*`, `claude/debug-green-fixes`,
  `Zaian`, `claude/add-prompt-trends-*` — all scratch, delete after migration.

## Execution steps

### Step 1 · Verify Maktab still builds green *(safety, non-destructive)*

Run locally, in a fresh clone:

```bash
git clone https://github.com/ahmadzayan-hub/desktop-tutorial.git maktab-verify
cd maktab-verify
git checkout claude/platform-cleanup-DhTNz
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

If any of the above fails, **stop and fix** before continuing. Do not proceed
to Step 3 until Maktab is proven green on this branch.

### Step 2 · Create the six new empty GitHub repos *(you, via GitHub UI)*

Create these six repos under `ahmadzayan-hub`. Leave all six **empty** (no
README, no license, no `.gitignore` — we push a full history in Step 4).

- `lahza`
- `beyond-style-uae`
- `prompt-orchestrator`
- `draftly`
- `pitchora-studio`
- `mutabasir-director-lens`

### Step 3 · Push each project's canonical branch to its new repo *(one-time git remote add)*

For each project, from the current repo working copy:

```bash
# Example for Lahza
git remote add lahza      https://github.com/ahmadzayan-hub/lahza.git
git push lahza refs/remotes/origin/main:refs/heads/main

# Example for Beyond Style UAE
git remote add beyondstyle https://github.com/ahmadzayan-hub/beyond-style-uae.git
git push beyondstyle refs/remotes/origin/beyond-connect-console:refs/heads/main

# Example for Prompt Orchestrator
git remote add prompt      https://github.com/ahmadzayan-hub/prompt-orchestrator.git
git push prompt refs/remotes/origin/legacy/prompt-orchestrator:refs/heads/main

# Example for Draftly
git remote add draftly     https://github.com/ahmadzayan-hub/draftly.git
git push draftly refs/remotes/origin/draftly/main:refs/heads/main

# Example for Pitchora
git remote add pitchora    https://github.com/ahmadzayan-hub/pitchora-studio.git
git push pitchora refs/remotes/origin/pitchora:refs/heads/main

# Example for Mutabasir
git remote add mutabasir   https://github.com/ahmadzayan-hub/mutabasir-director-lens.git
git push mutabasir refs/remotes/origin/mutabasir/director-lens-platform:refs/heads/main
```

Each push preserves the full commit history of the canonical branch.

### Step 4 · Verify each new repo builds green *(you or CI)*

Clone each new repo fresh and run its verification suite. Do not delete the
old branch on `desktop-tutorial` until the new repo is confirmed working.

### Step 5 · Point Maktab at `main` in this repo *(destructive · single command)*

**Only after Steps 1–4 succeed** and you say "go":

```bash
git push --force-with-lease=main:$(git rev-parse origin/main) \
  origin refs/remotes/origin/claude/platform-cleanup-DhTNz:refs/heads/main
```

This replaces `main` with the Maktab commit tree. Old `main` (Lahza) is
already safe on `github.com/ahmadzayan-hub/lahza` from Step 3.

### Step 6 · Delete every stale branch on the old repo *(you, via GitHub UI)*

The GitHub proxy in this sandbox refuses `git push --delete`, and the GitHub
MCP tools exposed do not include a delete-branch operation. So this is a
manual cleanup:

1. Open https://github.com/ahmadzayan-hub/desktop-tutorial/branches
2. Delete every branch except `main`
3. Delete every tag that no longer maps to a live commit

## What I will do next (safe, non-destructive)

If you reply **"go plan"**, I will:

- Commit this plan to the current branch (`lahza-lint-setup`)
- Fetch each canonical branch shallow-locally and produce a `verify-*.md`
  short report with build/lint/test status per project
- Wait for your explicit **"go split"** before executing any push to a new
  remote or any force-push on `main`

## What I will NOT do without your explicit confirmation

- Force-push over `main`
- Delete any branch on origin
- Create the new GitHub repos (I can, via GitHub MCP, but this is
  irreversible on your account — I want your explicit greenlight per repo)
- Rewrite git history

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Force-push over `main` clobbers Lahza | We push Lahza to its own repo (Step 3) before the force-push (Step 5) |
| A new repo is created with the wrong name | I'll only run `create_repository` after you say the exact name |
| CI/CD or Vercel projects pointed at old branches break silently | I'll produce a checklist of the branches each active Vercel project uses so you can re-point them before deletion |
| A scratch branch actually held work no one else copied | Step 3 preserves every canonical branch to its new repo before Step 6 deletes anything |

## Post-migration ownership

After the split, this repo (`ahmadzayan-hub/desktop-tutorial`) is Maktab.
Rename it in GitHub Settings → General → Repository name → `maktab` so the
URL matches the product.
