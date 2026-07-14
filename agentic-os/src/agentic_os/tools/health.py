"""Tool health tracking and automatic suspension (spec sections 20, 31)."""

from __future__ import annotations

from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.utils.dates import utc_now_iso

SUSPEND_AFTER_CONSECUTIVE_FAILURES = 3


def record_test(store: SqliteStore, tool_id: str, healthy: bool, note: str = "") -> str:
    """Record a health test; returns the resulting status.

    A tool is only ever marked healthy through a recorded test. Three
    consecutive failures suspend the tool and open an incident.
    """
    status = "healthy" if healthy else "unavailable"
    store.record_tool_health(tool_id, status, note)
    if healthy:
        return status
    failures = store.consecutive_tool_failures(tool_id)
    if failures >= SUSPEND_AFTER_CONSECUTIVE_FAILURES:
        suspend(store, tool_id, f"{failures} consecutive failures")
        return "suspended"
    return status


def suspend(store: SqliteStore, tool_id: str, reason: str) -> None:
    """Suspend a tool and open a linked incident record."""
    store.record_tool_health(tool_id, "unavailable", f"SUSPENDED: {reason}")
    incident_id = f"INC-{utc_now_iso()[:10].replace('-', '')}-{tool_id}"
    store.upsert_incident(
        incident_id,
        {
            "incident_id": incident_id,
            "date": utc_now_iso(),
            "task_id": "",
            "domain": "system",
            "severity": "medium",
            "description": f"tool {tool_id} auto-suspended: {reason}",
            "detected_by": "tool-health-monitor",
            "affected_tools": tool_id,
            "status": "open",
        },
        status="open",
        severity="medium",
    )
    store.log_security_event("tool-suspension", tool_id, reason)
