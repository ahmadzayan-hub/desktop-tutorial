"""Export human-readable markdown summaries from the SQLite store.

Markdown under ``memory/`` is a rendered view; SQLite remains authoritative.
"""

from __future__ import annotations

from pathlib import Path

from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.utils.dates import utc_now_iso


def _header(purpose: str, status: str = "active") -> str:
    return (
        "---\n"
        f"purpose: {purpose}\n"
        "owner: Ahmed Zaian\n"
        f"last-updated: {utc_now_iso()[:10]}\n"
        "domain: system\n"
        "classification: internal\n"
        f"status: {status}\n"
        "---\n\n"
    )


def export_progress(store: SqliteStore, path: Path) -> None:
    """Write ``memory/progress.md``: task counts by domain and status."""
    tasks = store.list_tasks()
    lines = [_header("Generated progress export from the SQLite state store"),
             "# Progress\n"]
    by_domain: dict[str, dict[str, int]] = {}
    for task in tasks:
        by_domain.setdefault(task.domain, {}).setdefault(task.status, 0)
        by_domain[task.domain][task.status] += 1
    if not by_domain:
        lines.append("No tasks recorded yet.\n")
    for domain in sorted(by_domain):
        counts = ", ".join(f"{s}: {n}" for s, n in sorted(by_domain[domain].items()))
        lines.append(f"- **{domain}** — {counts}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def export_queue(store: SqliteStore, path: Path) -> None:
    """Write ``memory/queue.md``: actionable (ready/in-progress/blocked) tasks."""
    lines = [_header("Generated actionable queue export"), "# Queue\n"]
    actionable = [t for t in store.list_tasks() if t.status in
                  ("ready", "in-progress", "blocked", "verification")]
    if not actionable:
        lines.append("Queue is empty.\n")
    for task in sorted(actionable, key=lambda t: (t.priority, t.task_id)):
        lines.append(
            f"- `{task.task_id}` [{task.status}] ({task.priority}, {task.domain}) "
            f"{task.title}"
        )
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def export_routing_log(store: SqliteStore, path: Path) -> None:
    """Write ``memory/routing-log.md`` from routing events."""
    lines = [_header("Generated routing-decision export"), "# Routing log\n"]
    events = store.routing_events(limit=100)
    if not events:
        lines.append("No routing events recorded yet.\n")
    for event in events:
        lines.append(f"- {event['at']} `{event['task_id']}` -> **{event['role']}** — "
                     f"{event['reason']}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def export_all(store: SqliteStore, memory_dir: Path) -> list[Path]:
    """Regenerate all derived markdown exports; returns written paths."""
    targets = {
        memory_dir / "progress.md": export_progress,
        memory_dir / "queue.md": export_queue,
        memory_dir / "routing-log.md": export_routing_log,
    }
    for path, fn in targets.items():
        fn(store, path)
    return list(targets)
