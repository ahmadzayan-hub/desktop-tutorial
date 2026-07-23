"""Work-lock helpers (spec section 12).

No concurrent writes to the same artifact; expired locks are surfaced for
review (never silently removed); parallel execution stays disabled in v1.
"""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.utils.dates import utc_now, utc_now_iso

DEFAULT_TTL_MINUTES = 120
PARALLEL_EXECUTION_ENABLED = False  # v1: single-writer only


def lock_id_for(task_id: str, artifact: str, sequence: int = 0) -> str:
    """Lock ID; ``sequence`` disambiguates re-acquisitions (history is kept)."""
    safe = artifact.replace("/", "_").replace(" ", "-")[:80]
    return f"LOCK-{task_id}-{safe}-{sequence:03d}"


def acquire(
    store: SqliteStore,
    task_id: str,
    artifact: str,
    owner_role: str,
    ttl_minutes: int = DEFAULT_TTL_MINUTES,
) -> str:
    """Acquire an exclusive artifact lock, returning the lock ID."""
    expires = (utc_now() + timedelta(minutes=ttl_minutes)).isoformat(timespec="seconds")
    sequence = store.lock_history_count(task_id, artifact)
    lid = lock_id_for(task_id, artifact, sequence)
    store.acquire_lock(lid, task_id, artifact, owner_role, expires)
    return lid


def release(store: SqliteStore, lock_id: str) -> None:
    """Release a held lock."""
    store.release_lock(lock_id)


def review_orphans(store: SqliteStore) -> list[dict[str, Any]]:
    """Expired-but-active locks needing human review (shown in /status)."""
    return store.orphan_locks(utc_now_iso())
