"""Dispatcher: assigns a role to a task and records the routing decision."""

from __future__ import annotations

from typing import TYPE_CHECKING

from agentic_os.orchestration.router import RoutingDecision, initial_role

if TYPE_CHECKING:  # pragma: no cover
    from agentic_os.memory.sqlite_store import SqliteStore


def dispatch(store: SqliteStore, task_id: str, task_type: str) -> RoutingDecision:
    """Choose the cheapest capable role and persist the routing event."""
    role = initial_role(task_type)
    decision = RoutingDecision(
        task_id=task_id,
        task_type=task_type,
        role=role,
        reason=f"initial routing: task-type={task_type} -> cheapest capable role",
    )
    store.record_routing_event(task_id, role, decision.reason)
    return decision


def record_escalation(
    store: SqliteStore, task_id: str, from_role: str, to_role: str, reason: str
) -> RoutingDecision:
    """Persist an escalation decision (after capability failure or retry)."""
    decision = RoutingDecision(
        task_id=task_id,
        task_type="escalation",
        role=to_role,
        reason=f"escalated {from_role} -> {to_role}: {reason}",
    )
    store.record_routing_event(task_id, to_role, decision.reason)
    return decision
