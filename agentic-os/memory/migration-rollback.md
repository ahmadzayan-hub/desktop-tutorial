---
purpose: Rollback map for executed migrations
owner: Ahmed Zaian
last-updated: 2026-07-14
domain: system
classification: internal
status: active
---

# Migration rollback

No migration has been executed — nothing to roll back. When
`agentic-os migrate --execute --approved` runs, the inverse move list is
written to memory/rollback-map.json and applied by `agentic-os rollback`.
