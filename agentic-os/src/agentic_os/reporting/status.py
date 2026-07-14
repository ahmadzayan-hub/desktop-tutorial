"""/status report in fewer than 25 lines (spec section 35).

Never invents unavailable metrics — missing data is reported as unavailable.
"""

from __future__ import annotations

from datetime import timedelta
from pathlib import Path

from agentic_os.memory.locks import review_orphans
from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.reporting.cost import weekly_cost_line
from agentic_os.utils.dates import utc_now, utc_now_iso

STALE_DAYS = 30


def _stale_files(memory_dir: Path) -> int:
    cutoff = utc_now().timestamp() - STALE_DAYS * 86400
    count = 0
    for path in memory_dir.rglob("*.md"):
        if path.is_file() and path.stat().st_mtime < cutoff:
            count += 1
    return count


def build_status(store: SqliteStore, os_root: Path) -> str:
    """Assemble the <25-line status snapshot."""
    tasks = store.list_tasks()
    by_domain: dict[str, int] = {}
    for task in tasks:
        if task.status not in ("done", "cancelled"):
            by_domain[task.domain] = by_domain.get(task.domain, 0) + 1
    domains = ", ".join(f"{d}:{n}" for d, n in sorted(by_domain.items())) or "none open"

    queue = [t for t in tasks if t.status == "ready"][:5]
    blocked = [t for t in tasks if t.status == "blocked"]
    locks = store.list_locks("active")
    orphans = review_orphans(store)
    raw_sessions, compacted_sessions = store.session_counts()
    week_ago = (utc_now() - timedelta(days=7)).isoformat(timespec="seconds")
    heavy = store.heavy_calls_since(week_ago)
    tools = store.list_tools()
    failing = [t["tool_id"] for t in tools
               if t.get("health_status") in ("unavailable", "authentication-failed")]
    untested = [t["tool_id"] for t in tools if t.get("health_status") == "untested"]
    security = store.security_events(limit=5)
    leaks = [e for e in security if e["kind"].startswith("domain")]
    incidents_open = len(store.list_incidents("open"))

    lines = [
        f"# Status — {utc_now_iso()}",
        f"Open tasks by domain: {domains}",
        "Top queue: " + ("; ".join(f"{t.task_id} {t.title[:40]}" for t in queue) or "empty"),
        "Blocked (needs you): " + (", ".join(t.task_id for t in blocked) or "none"),
        f"Active work locks: {len(locks)} (orphaned: {len(orphans)})",
        f"Sessions: {raw_sessions} raw, {compacted_sessions} compacted",
        f"Stale memory files (>{STALE_DAYS}d): {_stale_files(os_root / 'memory')}",
        f"Tools failing: {', '.join(failing) or 'none'}; untested: "
        f"{', '.join(untested) or 'none'}",
        f"HEAVY calls this week: {heavy}",
        weekly_cost_line(store),
        f"Security alerts (last 5): {len(security)}; domain-isolation alerts: {len(leaks)}",
        f"Open incidents: {incidents_open}",
        "Open protected-file changes: none recorded",
        "Open TODOs: see agentic-os/memory/queue.md and config TODO markers",
    ]
    return "\n".join(lines)
