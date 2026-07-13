# guardrails.md — Permissions, Cost Controls, Forbidden Actions
<!-- purpose: Binding rules enforced by Fable on every task before execution -->
<!-- owner: Ahmed Zaian (only Ahmed may edit this file) -->
<!-- last-updated: 2026-07-14 -->

## Write Permissions

| Agent | Write Scope |
|---|---|
| Haiku | Read-only everywhere except its assigned output folder for the current task |
| Sonnet | `/agentic-os/` and project working directories only. Never `_archive/`, never `guardrails.md`, never `CLAUDE.md` |
| Opus | Same as Sonnet |
| Verifier | Read everything; write only verification reports to the designated output location |
| Fable | All of the above + `memory/` files (only Fable updates memory) |

---

## Cost Controls

- **Per-session API cost ceiling:** `TODO: [SET VALUE — e.g. 5 USD]`
  Fable stops and asks Ahmed before exceeding this amount.
- Opus calls require a one-line justification in `memory/routing-log.md`.
- More than **3 Opus calls in one session** requires Ahmed's approval before proceeding.

---

## Forbidden Without Explicit Human Approval (same session)

- Deleting any file (archive to `_archive/` instead — never `rm`).
- Sending anything external: email, WhatsApp, Slack messages, social media posts, API writes to third-party systems.
- Installing packages or modifying system/OS configuration.
- Editing `guardrails.md` or `CLAUDE.md`.
- Force-pushing to `main` or any protected branch.
- Committing secrets, tokens, or private information (.env files, credentials).

---

## Privacy Rules (permanent — applies to all agents and all outputs)

- Never include references to RTA, Emirates Airlines, Emirates Group, Etihad Airways, Noon.com in any output that could be published or shared.
- Replace employer/workplace names with generic terms ("the company", "the organization") in any non-internal deliverable.
- Domain `rta` content is strictly internal and never leaks into `brand`, `bcgt`, or `mba` outputs.

---

## Accuracy Rules (binding on all agents)

- No invented facts, figures, sources, prices, clauses, or technical details.
- Uncertainty → state it explicitly.
- Unverifiable items → mark `UNVERIFIED: [what must be checked]`.
- Inference → label it as inference.
