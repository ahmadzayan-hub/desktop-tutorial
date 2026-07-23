"""Abstract state-store interface.

SQLite (:mod:`agentic_os.memory.sqlite_store`) is the authoritative backend;
markdown files under ``memory/`` are human-readable exports, never the source
of truth.
"""

from __future__ import annotations

from typing import Any, Protocol

from agentic_os.models.task import Task


class StateStore(Protocol):
    """Minimum contract every state store backend must satisfy."""

    def create_task(self, task: Task) -> None: ...

    def get_task(self, task_id: str) -> Task: ...

    def list_tasks(self, status: str | None = None) -> list[Task]: ...

    def update_task_status(self, task_id: str, new_status: str, actor: str) -> None: ...

    def record_routing_event(self, task_id: str, role: str, reason: str) -> None: ...

    def record_cost(self, entry: dict[str, Any]) -> None: ...

    def close(self) -> None: ...
