"""Routing, escalation, HEAVY budget, and limit tests (spec sections 10, 24)."""

import pytest

from agentic_os.exceptions import ApprovalRequiredError, LimitExceededError
from agentic_os.orchestration.limits import LimitTracker
from agentic_os.orchestration.router import check_heavy_budget, escalate, initial_role


def test_cheapest_capable_first() -> None:
    assert initial_role("extraction") == "light"
    assert initial_role("coding") == "standard"
    assert initial_role("architecture") == "heavy"
    assert initial_role("verification") == "verifier"
    assert initial_role("something-new") == "standard"


def test_escalation_path() -> None:
    assert escalate("light", "capability") == "standard"
    assert escalate("standard", "retry failed") == "heavy"
    with pytest.raises(ApprovalRequiredError):
        escalate("heavy", "still failing")


def test_fourth_heavy_call_needs_approval() -> None:
    check_heavy_budget(2)  # third call fine
    with pytest.raises(ApprovalRequiredError):
        check_heavy_budget(3)  # fourth call gated
    check_heavy_budget(3, approved=True)


def test_tool_call_limit_stops() -> None:
    tracker = LimitTracker(max_tool_calls=3)
    for _ in range(3):
        tracker.record_tool_call()
    with pytest.raises(LimitExceededError):
        tracker.record_tool_call()


def test_repeated_failure_stops() -> None:
    tracker = LimitTracker()
    tracker.record_failure("TypeError in foo")
    with pytest.raises(LimitExceededError):
        tracker.record_failure("TypeError in foo")


def test_retry_limit() -> None:
    tracker = LimitTracker(max_retries=1)
    tracker.record_retry()
    with pytest.raises(LimitExceededError):
        tracker.record_retry()
