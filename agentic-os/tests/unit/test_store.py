"""SQLite store behavior: audit history, orchestrator-only transitions."""

import pytest

from agentic_os.exceptions import AgenticOSError, StateTransitionError
from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.models.task import Task


def test_task_roundtrip_and_events(store: SqliteStore, sample_task_kwargs: dict) -> None:
    store.create_task(Task(**sample_task_kwargs))
    task = store.get_task("TASK-20260713-001")
    assert task.title == "sample task"
    store.update_task_status(task.task_id, "ready")
    store.update_task_status(task.task_id, "in-progress")
    events = store.task_events(task.task_id)
    assert [e["event"] for e in events] == ["created", "status-change", "status-change"]


def test_only_orchestrator_changes_state(store: SqliteStore,
                                         sample_task_kwargs: dict) -> None:
    store.create_task(Task(**sample_task_kwargs))
    with pytest.raises(AgenticOSError, match="orchestrator"):
        store.update_task_status("TASK-20260713-001", "ready", actor="standard")


def test_invalid_transition_rejected_in_store(store: SqliteStore,
                                              sample_task_kwargs: dict) -> None:
    store.create_task(Task(**sample_task_kwargs))
    with pytest.raises(StateTransitionError):
        store.update_task_status("TASK-20260713-001", "done")


def test_idempotency_record(store: SqliteStore) -> None:
    key = "TASK-20260713-001:send-report:client-x"
    assert store.check_idempotent(key) is None
    store.record_idempotent(key, "send-report", "client-x", "success")
    record = store.check_idempotent(key)
    assert record is not None and record["result"] == "success"


def test_heavy_call_counting(store: SqliteStore, sample_task_kwargs: dict) -> None:
    store.create_task(Task(**sample_task_kwargs))
    store.record_routing_event("TASK-20260713-001", "heavy", "architecture")
    store.record_routing_event("TASK-20260713-001", "standard", "coding")
    assert store.heavy_calls_since("2000-01-01T00:00:00+00:00") == 1
