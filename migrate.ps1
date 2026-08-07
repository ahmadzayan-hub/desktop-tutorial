# Repository split migration · PowerShell native version.
# Works on Windows PowerShell without Git Bash / WSL. Same behavior as migrate.sh.
#
# BEFORE RUNNING:
#   - Create the 6 empty target repos on GitHub under ahmadzayan-hub.
#   - Edit the $Projects table below so the KEY matches the repo name you
#     actually created (numbers "11".."66", OR names like "lahza", OR anything
#     else). VALUE = "canonical branch on origin | human label".
#   - Run this script from the root of a fresh desktop-tutorial clone.
#
# USAGE:
#   .\migrate.ps1                          # push all 6 projects, stop before destructive step
#   .\migrate.ps1 -ForceMainToMaktab       # AFTER verifying, replace main with Maktab

param(
  [switch]$ForceMainToMaktab
)

$ErrorActionPreference = "Stop"
$Owner = "ahmadzayan-hub"

# ==== EDIT THIS TABLE if your repo names differ ==============================
# Key = repo name on GitHub. Value = "source branch|human label"
$Projects = [ordered]@{
  "11" = "main|lahza"
  "22" = "beyond-connect-console|beyond-style-uae"
  "33" = "legacy/prompt-orchestrator|prompt-orchestrator"
  "44" = "draftly/main|draftly"
  "55" = "pitchora|pitchora-studio"
  "66" = "mutabasir/director-lens-platform|mutabasir-director-lens"
}
# ============================================================================

function Info($msg) { Write-Host "==> $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "!!  $msg" -ForegroundColor Yellow }
function Die($msg)  { Write-Host "xx  $msg" -ForegroundColor Red; exit 1 }

# Safety: confirm we are inside desktop-tutorial.
$originUrl = (git config --get remote.origin.url) 2>$null
if (-not $originUrl -or $originUrl -notmatch "desktop-tutorial") {
  Die "This script must run inside the desktop-tutorial repo. Current origin: $originUrl"
}

Info "Fetching every branch from origin..."
git fetch origin --prune

# --- Step 3: mirror each canonical branch into its new repo ------------------
foreach ($repo in $Projects.Keys) {
  $spec       = $Projects[$repo]
  $srcBranch  = $spec.Split("|")[0]
  $label      = $spec.Split("|")[1]
  $remoteName = "mig_$($repo -replace '[^a-zA-Z0-9]', '_')"
  $remoteUrl  = "https://github.com/$Owner/$repo.git"

  Info "Project $repo ($label)  <-  origin/$srcBranch  ->  $remoteUrl"

  git rev-parse --verify "origin/$srcBranch" *> $null
  if ($LASTEXITCODE -ne 0) {
    Die "origin/$srcBranch missing. Aborting to avoid partial migration."
  }

  git remote get-url $remoteName *> $null
  if ($LASTEXITCODE -eq 0) {
    Warn "Remote $remoteName already exists, updating URL."
    git remote set-url $remoteName $remoteUrl
  } else {
    git remote add $remoteName $remoteUrl
  }

  Info "Pushing history..."
  git push $remoteName "refs/remotes/origin/${srcBranch}:refs/heads/main"
  if ($LASTEXITCODE -ne 0) {
    Die "Push failed for $repo. Fix the repo name / permissions, then rerun."
  }

  Info "$label migrated -> $remoteUrl"
  Write-Host ""
}

Write-Host "-------------------------------------------------------------"
Write-Host " All 6 projects pushed. Verify each new repo BEFORE the next step."
Write-Host ""
Write-Host " PowerShell one-liner to smoke-test one repo (use ; not &&):"
Write-Host "   git clone https://github.com/$Owner/11.git tmp-verify ; cd tmp-verify ; npm install ; npm run typecheck ; npm run build"
Write-Host ""
Write-Host " When ALL 6 pass, re-run:"
Write-Host "   .\migrate.ps1 -ForceMainToMaktab"
Write-Host "-------------------------------------------------------------"

# --- Step 5: force main -> Maktab (only with explicit flag) ------------------
if ($ForceMainToMaktab) {
  git rev-parse --verify origin/main *> $null
  if ($LASTEXITCODE -ne 0) { Die "origin/main missing." }
  git rev-parse --verify origin/claude/platform-cleanup-DhTNz *> $null
  if ($LASTEXITCODE -ne 0) { Die "origin/claude/platform-cleanup-DhTNz missing." }

  $maktabSha  = (git rev-parse origin/claude/platform-cleanup-DhTNz).Trim()
  $oldMainSha = (git rev-parse origin/main).Trim()

  Info "Force-pushing main -> Maktab ($maktabSha), was $oldMainSha"
  git push `
    --force-with-lease="main:$oldMainSha" `
    origin `
    "refs/remotes/origin/claude/platform-cleanup-DhTNz:refs/heads/main"
  if ($LASTEXITCODE -ne 0) {
    Die "Force-push failed. Old main is untouched."
  }
  Info "main is now Maktab. Old Lahza main preserved at github.com/$Owner/11."
}
