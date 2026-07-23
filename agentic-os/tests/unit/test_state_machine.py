"""State-transition tests (spec sections 11, 36)."""

import pytest

from agentic_os.exceptions import StateTransitionError
from agentic_os.orchestration.state_machine import assert_transition, is_terminal


@pytest.mark.parametrize(
    ("src", "dst"),
    [
        ("backlog", "ready"),
        ("ready", "in-progress"),
        ("in-progress", "verification"),
        ("verification", "done"),
        ("in-progress", "blocked"),
        ("blocked", "in-progress"),
        ("backlog", "cancelled"),
        ("ready", "cancelled"),
        ("verification", "in-progress"),
    ],
)
def test_valid_transitions(src: str, dst: str) -> None:
    assert_transition(src, dst)


@pytest.mark.parametrize(
    ("src", "dst"),
    [
        ("backlog", "done"),
        ("backlog", "in-progress"),
        ("ready", "verification"),
        ("in-progress", "done"),
        ("done", "in-progress"),
        ("cancelled", "ready"),
        ("blocked", "done"),
    ],
)
def test_invalid_transitions(src: str, dst: str) -> None:
    with pytest.raises(StateTransitionError):
        assert_transition(src, dst)


def test_unknown_state_rejected() -> None:
    with pytest.raises(StateTransitionError):
        assert_transition("weird", "done")


def test_terminal_states() -> None:
    assert is_terminal("done") and is_terminal("cancelled")
    assert not is_terminal("ready")
