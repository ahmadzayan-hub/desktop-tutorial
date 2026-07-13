# tools-registry.md — MCP Tools Registry
<!-- purpose: Per-tool: what it does, auth status, limits, and which agents may call it -->
<!-- owner: Fable -->
<!-- last-updated: 2026-07-14 -->

## Active MCP Servers

### Supabase
- **URL:** `https://mcp.supabase.com/mcp?project_ref=borurrzvunlzdnxiossh`
- **Auth:** Project ref in URL (no separate token required via MCP)
- **Purpose:** Database queries, migrations, edge functions, logs, advisors for Tweenz AI backend
- **Domain:** mba
- **Agents allowed:** Sonnet, Opus, Fable
- **Limits:** apply_migration goes directly to remote — use with caution; always review before applying
- **Last verified:** 2026-07-14

---

## Claude.ai Connectors (available in web session)

The following connectors are available but require authentication per session:

| Connector | Purpose | Domain | Notes |
|---|---|---|---|
| Google Calendar | Schedule and time management | personal | Requires OAuth |
| Gmail | Email drafting and search | personal | Requires OAuth |
| Google Drive | File access and sharing | personal | Requires OAuth |
| Figma | Design file reading and generation | brand / mba | Requires OAuth |
| Gamma | Presentation generation | brand / mba | Requires OAuth |
| Canva | Design creation | brand | Requires OAuth |
| Vercel | Deployment management | mba | Requires OAuth |
| Buffer | Social media scheduling | brand | Requires OAuth |

---

## Agents Allowed to Call External Tools

| Tool Category | Haiku | Sonnet | Opus | Fable | Verifier |
|---|---|---|---|---|---|
| Read (Supabase SELECT, Drive read) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Write (Supabase mutations, Drive create) | ❌ | ✅* | ✅* | ✅* | ❌ |
| External send (email, post, message) | ❌ | ❌ | ❌ | ✅** | ❌ |
| Deploy / CI trigger | ❌ | ❌ | ✅* | ✅* | ❌ |

`*` = Requires Fable review and guardrail check before execution
`**` = Requires explicit Ahmed approval in the same session
