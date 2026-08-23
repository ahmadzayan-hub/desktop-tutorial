# Security Audit — secret scanning

Tool: gitleaks v8 (installed for this audit), run with `detect` over the **full
git history** of every locally available clone, 2026-08-23.

**No secret value appears in this file, in the chat transcript, or in any
committed artifact.** Triage was performed programmatically: findings were
classified by variable name, match shape and length, with the value itself
masked. The unredacted scan output was written to a session-local scratch path
and deleted after triage.

## Coverage

21 repositories scanned. Full history for the 16 previously cloned repos;
**shallow (depth 1)** for `11`, `22`, `55`, `agentic-os-enterprise`,
`Beyond-Style-UAE-`, which were cloned this session.

**Coverage gap — now closed.** Those five were initially scanned at their
default-branch tip only. They have since been unshallowed and re-scanned
across full history:

| Repo | Commits | Findings |
|---|---|---|
| `11` | 27 | 2 — the same two placeholders already triaged below |
| `22` | 12 | 0 |
| `55` | 12 | 0 |
| `agentic-os-enterprise` | 25 | 0 |
| `Beyond-Style-UAE-` | 24 | 0 |

Nothing new appeared in history. **All 21 repositories have now been scanned
across their full history**, and the result stands unchanged.

One detail worth recording rather than glossing: the tip-only pass reported
two findings in `agentic-os-enterprise` and the full-history pass reports
none. That is not a scan getting weaker. A shallow clone has no commit
history to walk, so gitleaks falls back to scanning the working directory and
its `.gitleaksignore` never applies. With real history it does — and that
file is worth copying elsewhere: every entry is a **finding fingerprint**
(commit, file, rule, line), not a path glob, so an exception can never
silently cover a different secret. A real leak on another line still fails
the scan.

## Result

| Repos scanned | Raw findings | True positives | False positives |
|---|---|---|---|
| 21 | 19 unique (54 including cross-repo duplicates) | **0** | 19 |

**No leaked credential was found.** No owner action is required, and no secret
rotation is warranted.

## Triage detail

Every finding resolved to one of four benign shapes.

### 1. Browser storage keys mistaken for API keys — 16 findings

`gitleaks`'s `generic-api-key` rule fires on any assignment to an identifier
ending in `KEY`. All 16 are `localStorage` key names:

- `src/components/TrialBanner.tsx` L7 — `const KEY = "…"`, used only as
  `localStorage.getItem(KEY)` / `setItem(KEY, "1")`. Verified by reading the
  file at `2eba5d66`. Present in 9 repos, all inheriting the same ancestor
  commit.
- `Annual_Operational_Plan_2026_V0_{2..6}.html` — `STORAGE_KEY` and
  `LEGACY_KEY`, 19 characters each, in a standalone HTML document with no
  network calls. 14 hits across `annual-operation-plan-2026`,
  `desktop-tutorial`, `Maktab`, `lahza`, `wisal`.
- `src/lib/pinned-prompts.ts` L9 (`draftly-Private`) — same shape.

### 2. Documentation example against localhost — 1 finding

`docs/DEPLOY.md` L60, rule `curl-auth-header`. The line is a `curl` example
against `http://localhost:3000` with a literal placeholder bearer token.
Present in 10 repos from a shared ancestor.

### 3. Test fixtures in security tests — 2 findings

`agentic-os-enterprise`:
- `tests/redteam/test_agentic_red_team.py` L389
- `tests/security/test_tool_gateway.py` L306

Both are `api_key` literals inside tests whose purpose is to attack the
gateway. Fake credentials in adversarial tests are correct practice, not a
leak. The repository already ships a `.gitleaksignore` and runs gitleaks in
its own CI.

### 4. Placeholder auth values in e2e config — 2 findings

`11`:
- `frontend/playwright.config.ts` L69 — `SUPABASE_ANON_KEY: '…'`, **19
  characters**. A real Supabase anon key is a JWT of roughly 200+ characters,
  so this cannot be one.
- `frontend/e2e/auth.spec.ts` L15 — `TOKEN = '…'`, 37 characters, `eyJ`
  prefixed. JWT-shaped but far too short to be a valid signed token; a
  hand-written test fixture.

## Standing controls confirmed

- **No `.env` file is committed in any repository.** Only `.env.example`.
- `.gitignore` excludes `.env` in every repo carrying one.
- `agentic-os-enterprise` is the only project running secret scanning in its
  own CI. Every other repository relies on this audit alone.

## Recommendations

| # | Action | Priority | Why |
|---|---|---|---|
| 1 | Add a gitleaks step to the shared CI workflow across canonical repos | Medium | One repo scans itself; eighteen do not. A future leak would go unnoticed. |
| 2 | Run a full-history, all-refs scan on `11`, `22`, `55`, `agentic-os-enterprise`, `Beyond-Style-UAE-` | Medium | Closes the stated coverage gap. Needs `--unshallow`. |
| 3 | Rename the `KEY` constants to `STORAGE_KEY_*` | Low | Cosmetic, but it removes 16 recurring false positives and makes future scans readable. |
| 4 | Enable GitHub secret scanning + push protection on canonical repos | Medium | Owner action — requires repository admin, which this session lacks (403). |

Nothing here blocks any wave.
