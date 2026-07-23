"""Task state machine (spec section 11). Only ORCHESTRATOR changes state."""

from __future__ import annotations

from agentic_os.exceptions import StateTransitionError

VALID_TRANSITIONS: dict[str, frozenset[str]] = {
    "backlog": frozenset({"ready", "cancelled"}),
    "ready": frozenset({"in-progress", "cancelled"}),
    "in-progress": frozenset({"verification", "blocked"}),
    "blocked": frozenset({"in-progress"}),
    "verification": frozenset({"done", "in-progress"}),
    "done": frozenset(),
    "cancelled": frozenset(),
}


def assert_transition(current: str, target: str) -> None:
    """Raise :class:`StateTransitionError` for any transition not in the spec."""
    allowed = VALID_TRANSITIONS.get(current)
    if allowed is None:
        raise StateTransitionError(f"unknown state: {current!r}")
    if target not in allowed:
        raise StateTransitionError(
            f"invalid transition {current!r} -> {target!r}; allowed: {sorted(allowed)}"
        )


def is_terminal(state: str) -> bool:
    """Whether a task can no longer change state."""
    return state in ("done", "cancelled")
