# tools-registry.md — MCP Tool Registry
purpose: Per-tool record — what it does, auth, limits, and which agents may call it.
owner: Ahmed Zaian
last-updated: 2026-07-14

> **TODO (owner):** populate with the real MCP tools you connect. One row per tool. Any tool that
> **writes externally** (email, WhatsApp, social, third-party API writes) requires in-session
> owner approval per `../guardrails.md` §3, regardless of what is listed here.

| Tool | What it does | Auth | Limits / cost | May be called by | Read/Write | Last checked |
| --- | --- | --- | --- | --- | --- | --- |
| _TODO example_ | _e.g. web search_ | _API key / OAuth_ | _rate limit_ | Sonnet, Haiku | read | `TODO` |
| _TODO example_ | _e.g. send email_ | _OAuth_ | — | Fable only (owner-approved) | **write (approval)** | `TODO` |

## Health rules (surfaced by /status §4)
- Flag any tool **failing auth**.
- Flag any tool **unused for 30+ days**.
- Write-capable tools are listed but **gated** behind same-session owner approval.
