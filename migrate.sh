#!/usr/bin/env bash
# Repository split migration script for ahmadzayan-hub/desktop-tutorial.
#
# What this does, in order:
#   1) Verifies you are on the desktop-tutorial working copy.
#   2) Fetches every branch from origin.
#   3) For each of the 6 projects that move out, pushes its canonical branch
#      to a fresh remote (which you must create on GitHub UI first).
#   4) Fast-forwards this repo's `main` to Maktab and pushes it (destructive).
#   5) Prints a checklist of stale branches to delete via the GitHub UI.
#
# BEFORE RUNNING:
#   - The 6 empty target repos MUST already exist on GitHub under ahmadzayan-hub.
#     Owner has created them named simply as numbers:
#         11  -> lahza                       (from origin/main)
#         22  -> beyond-style-uae            (from origin/beyond-connect-console)
#         33  -> prompt-orchestrator         (from origin/legacy/prompt-orchestrator)
#         44  -> draftly                     (from origin/draftly/main)
#         55  -> pitchora-studio             (from origin/pitchora)
#         66  -> mutabasir-director-lens     (from origin/mutabasir/director-lens-platform)
#   - Confirm you have push access from your local machine to all 6.
#   - Run this script from the root of a fresh `desktop-tutorial` clone.

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

info()  { echo -e "${GREEN}==>${NC} $*"; }
warn()  { echo -e "${YELLOW}!!${NC} $*"; }
die()   { echo -e "${RED}xx${NC} $*"; exit 1; }

# Safety: confirm working tree is desktop-tutorial.
git rev-parse --is-inside-work-tree > /dev/null 2>&1 || die "Not in a git repo."
CURRENT_REPO=$(git config --get remote.origin.url || echo "")
[[ "$CURRENT_REPO" == *"desktop-tutorial"* ]] || die "origin is not desktop-tutorial. Aborting."

info "Fetching every branch from origin..."
git fetch origin --prune

# --- Project → canonical branch mapping (edit carefully) --------------------
# owner is fixed for this migration.
OWNER="ahmadzayan-hub"

# Target repos on GitHub. Owner named them with the literal "-Private" suffix
# (two of them are accidentally public — fix visibility in Settings after).
# Key = repo name on GitHub, Value = "canonical branch on origin | human label"
declare -A PROJECTS=(
  ["lahza-Private"]="main|lahza"
  ["beyond-style-uae-Private"]="beyond-connect-console|beyond-style-uae"
  ["prompt-orchestrator-Private"]="legacy/prompt-orchestrator|prompt-orchestrator"
  ["draftly-Private"]="draftly/main|draftly"
  ["Pitchora-studio-Private"]="pitchora|pitchora-studio"
  ["mutabasir-director-lens-Private"]="mutabasir/director-lens-platform|mutabasir-director-lens"
)

# --- Step 3: mirror each canonical branch into its new repo ----------------
for proj in "${!PROJECTS[@]}"; do
  spec="${PROJECTS[$proj]}"
  src_branch="${spec%%|*}"
  label="${spec##*|}"
  remote_name="mig_${proj}"
  remote_url="https://github.com/${OWNER}/${proj}.git"

  info "Project ${proj} (${label})  ←  origin/${src_branch}  →  ${remote_url}"

  # Verify the source branch exists on origin.
  git rev-parse --verify "origin/${src_branch}" > /dev/null 2>&1 \
    || die "origin/${src_branch} missing. Aborting to avoid partial migration."

  # Add remote idempotently.
  if git remote get-url "$remote_name" > /dev/null 2>&1; then
    warn "Remote $remote_name already exists, updating URL."
    git remote set-url "$remote_name" "$remote_url"
  else
    git remote add "$remote_name" "$remote_url"
  fi

  # Push the canonical branch as `main` on the new remote.
  info "Pushing history..."
  git push "$remote_name" "refs/remotes/origin/${src_branch}:refs/heads/main"

  info "${label} migrated → ${remote_url}"
  echo ""
done

# --- Step 4: reader-facing verification pause ------------------------------
cat <<HERE
────────────────────────────────────────────────────────────────
 All 6 new repos now hold their project on `main`.
 Verify each one clones + builds + tests green BEFORE the final step.

 Suggested per-repo smoke test:
   git clone https://github.com/${OWNER}/<repo>.git tmp-verify
   cd tmp-verify && npm install && npm run typecheck && npm run build

 When every repo passes, run this script again with:
   ./migrate.sh --force-main-to-maktab
 to complete Step 5.
────────────────────────────────────────────────────────────────
HERE

# --- Step 5: force main to Maktab (opt-in with an explicit flag) -----------
if [[ "${1:-}" == "--force-main-to-maktab" ]]; then
  info "Verifying local origin/main and origin/claude/platform-cleanup-DhTNz..."
  git rev-parse --verify origin/main > /dev/null 2>&1                       || die "origin/main missing."
  git rev-parse --verify origin/claude/platform-cleanup-DhTNz > /dev/null 2>&1 || die "origin/claude/platform-cleanup-DhTNz missing."

  MAKTAB_SHA=$(git rev-parse origin/claude/platform-cleanup-DhTNz)
  OLD_MAIN_SHA=$(git rev-parse origin/main)

  info "Force-pushing main → Maktab ($MAKTAB_SHA), was $OLD_MAIN_SHA"
  git push \
    --force-with-lease="main:${OLD_MAIN_SHA}" \
    origin "refs/remotes/origin/claude/platform-cleanup-DhTNz:refs/heads/main"

  info "main is now Maktab. Old Lahza main preserved at github.com/${OWNER}/lahza."
fi

# --- Step 6: manual cleanup list -------------------------------------------
cat <<'HERE'
────────────────────────────────────────────────────────────────
 Manual cleanup on GitHub UI (this script cannot delete branches
 because the sandbox proxy blocks branch deletion):

 Open:   https://github.com/ahmadzayan-hub/desktop-tutorial/branches

 Delete everything except `main`. Especially:
   - claude/rta-* (name leaks work topic)
   - beyond-style-uae-snapshot
   - Every claude/beyond-style-*, claude/beyond-coffee-*,
     claude/vertex-*, claude/coffee-*, claude/social-*,
     claude/telegram-*, claude/oauth-notebooklm-*,
     claude/notebooklm-setup-*, claude/monorepo-*,
     claude/mutabasir-platform-v1-*, claude/create-dashboard-*,
     claude/build-presentiq-*, claude/prompt-orchestrator-saas-*,
     claude/orchestrator-features-*, claude/add-prompt-trends-*,
     claude/repo-separation-*, claude/debug-green-fixes,
     claude/wisal-android-arabic, claude/masaar-launch,
     operational-plan-v03, Zaian,
     lahza-lint-setup (this branch — merge or delete after)

 Then GitHub Settings → General → Repository name → rename
 desktop-tutorial to maktab.
────────────────────────────────────────────────────────────────
HERE
