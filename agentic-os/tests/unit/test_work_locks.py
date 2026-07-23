"""Work-lock tests (spec sections 12, 36)."""

import pytest

from agentic_os.exceptions import LockError
from agentic_os.memory import locks
from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.models.task import Task


def _task(store: SqliteStore, kwargs: dict, n: int = 1) -> Task:
    task = Task(**{**kwargs, "task_id": f"TASK-20260713-{n:03d}"})
    store.create_task(task)
    return task


def test_no_concurrent_writes_same_artifact(store: SqliteStore,
                                            sample_task_kwargs: dict) -> None:
    t1 = _task(store, sample_task_kwargs, 1)
    t2 = _task(store, sample_task_kwargs, 2)
    locks.acquire(store, t1.task_id, "reports/output.md", "standard")
    with pytest.raises(LockError):
        locks.acquire(store, t2.task_id, "reports/output.md", "standard")


def test_release_allows_reacquire(store: SqliteStore, sample_task_kwargs: dict) -> None:
    task = _task(store, sample_task_kwargs)
    lid = locks.acquire(store, task.task_id, "a.md", "light")
    locks.release(store, lid)
    locks.acquire(store, task.task_id, "a.md", "light")


def test_release_unknown_lock_fails(store: SqliteStore) -> None:
    with pytest.raises(LockError):
        locks.release(store, "LOCK-nope")


def test_orphan_locks_surfaced_not_removed(store: SqliteStore,
                                           sample_task_kwargs: dict) -> None:
    task = _task(store, sample_task_kwargs)
    locks.acquire(store, task.task_id, "b.md", "standard", ttl_minutes=-5)
    orphans = locks.review_orphans(store)
    assert len(orphans) == 1
    # still active in the table — review, never silent removal
    assert store.list_locks("active")
