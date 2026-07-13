# SKILL.md — /status Health Check
<!-- purpose: Report system health in under 25 lines when Ahmed types /status -->
<!-- owner: Fable -->
<!-- last-updated: 2026-07-14 -->

## Output Contract

- **deliverable:** inline text response (no file)
- **structure:** 6 sections in order (see below)
- **language:** en
- **length:** ≤ 25 lines
- **domain:** personal
- **min-tier:** haiku (read-only scan; Fable synthesizes)

---

## Trigger

Ahmed types `/status` or "status" → Fable generates this report immediately.

---

## Report Structure (6 sections, ≤ 25 lines total)

```
## Status — YYYY-MM-DD HH:MM

### 1. Progress by Domain
- rta: [done / in progress / blocked]
- bcgt: [done / in progress / blocked]
- mba: [done / in progress / blocked]
- brand: [done / in progress / blocked]
- personal: [done / in progress / blocked]

### 2. Top 5 Queue Items
1. [domain] [task title] — [status]
...

### 3. Memory Health
- Raw session logs: [N]
- Last compaction: [date or NEVER]
- Stale files (>30 days): [list or "none"]

### 4. Tool Health
- MCP tools failing auth: [list or "none"]
- MCP tools unused >30 days: [list or "none"]

### 5. Cost This Week
- Estimated cost: [from routing-log.md or "no data"]
- Opus calls this week: [N]

### 6. Open TODOs Requiring Ahmed's Input
- [list or "none"]
```
