# Threat Model Index

This is a multi-project workspace (see [`PROJECTS.md`](../PROJECTS.md) for the
full map). Each product line owns its own threat model so security decisions
stay next to the code they govern — this index catalogues them, calls out the
trust boundaries that only exist because the projects live in one repo, and
lists the workspace-level controls that apply to all of them.

## Per-project threat models

| Product | Path | Threat model | Method | Language |
| --- | --- | --- | --- | --- |
| Lahza (root Vite app) | `/src`, `/public` | [`THREAT_MODEL.md`](THREAT_MODEL.md) | STRIDE | English |
| Wisal (three surfaces) | `wisal-web/`, `android-wife-assistant/`, `telegram-wife-assistant/` | [`THREAT_MODEL_WISAL.md`](THREAT_MODEL_WISAL.md) | STRIDE + platform notes | Arabic |
| Beyond Style UAE landing | `landing/` | *(none — static site, no backend, no forms; WhatsApp deep-link only; JSON-LD + `robots.txt` in the tree; deploy target GitHub Pages)* | n/a | n/a |
| Agentic OS scaffold | `agent-os/` | *(no external attack surface — private workflow scaffolding)* | n/a | n/a |

If a new product ships in this repo, add a threat model here first and link it
from this index. That is a hard rule; do not merge a new product line without
its threat model.

## Cross-project trust boundaries (workspace-only concerns)

These would not exist if each product lived in its own repo. They matter here
because a shared history + shared CI + shared workflows create shared risk.

| Boundary | Risk | Control |
| --- | --- | --- |
| Root CI has access to every product tree | A malicious PR touching one project could run steps against another | Per-workflow `paths:` filters (`lahza-ci.yml`, `wisal-web-ci.yml`, `telegram-bot-ci.yml`, `landing-ci.yml`, `android.yml`, `deploy-landing.yml`) — every workflow scopes to its own subtree. |
| One GitHub Actions runner sees the whole checkout | Any workflow could exfiltrate any file | Workflows run in ephemeral runners; no cross-workflow secrets; deploys are per-workflow with `permissions:` scoped down. |
| Secrets are shared across workflows in GitHub | Wisal's `TELEGRAM_BOT_TOKEN` visible to Lahza CI, etc. | Never export bot / API tokens in CI without an explicit business reason. `telegram-bot-ci.yml` deliberately **does not** export `TELEGRAM_BOT_TOKEN` / `GROQ_API_KEY` so any regression that reaches network fails loudly instead of silently spending credits. |
| CODEOWNERS review of cross-cutting files | A single-product PR could quietly change workspace configs | [`/.github/CODEOWNERS`](../.github/CODEOWNERS) requires `@ahmadzayan-hub` review on every path, with per-product scopes so ownership is explicit. |
| Split-out via `git subtree` (see PROJECTS.md §"Split a project") | If a subtree is moved to its own repo, its threat model must move with it | Threat-model files live under `docs/`, so a `git subtree split --prefix=docs/THREAT_MODEL_WISAL.md` is not enough; when splitting, copy the relevant threat model into the new repo's `docs/` in the same PR. |

## Workspace-wide controls (apply to every product)

- **CodeQL / secret scanning / Dependabot** — enable at the repo level in
  GitHub Settings → Security. This is repo-scoped, so it covers every subtree
  automatically. Not something workflow files can turn on.
- **PR template** ([`/.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md))
  requires every PR to state which product line it touches, so a
  "cross-cutting" change that quietly modifies two products at once is
  visible in review.
- **CODEOWNERS** ([`/.github/CODEOWNERS`](../.github/CODEOWNERS)) requires
  owner review on every path.
- **Branch protection** on `main` (repo settings) — should require CODEOWNERS
  review + green CI status on the workflows that match the changed paths.
  Currently manual; verify in repo Settings → Branches.

## Refresh cadence

Each threat model is a living document. Revisit whenever:

1. A new trust boundary is introduced (backend, vendor, integration).
2. A new external identity or role is added.
3. A shared secret changes scope (new workflow gains access to an existing token).
4. A product is split out or a new one is added — update this index in the
   same PR.
