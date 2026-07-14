"""Deterministic graders for golden tasks (spec section 33).

Each grader takes the golden-task spec dict and returns (passed, detail).
Graders exercise the real OS modules — no live external services.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from agentic_os.exceptions import (
    ApprovalRequiredError,
    DomainIsolationError,
    LimitExceededError,
    StateTransitionError,
)
from agentic_os.orchestration import approvals, state_machine
from agentic_os.orchestration.limits import LimitTracker
from agentic_os.orchestration.router import initial_role
from agentic_os.security import domain_isolation, prompt_injection, secrets

Grader = Callable[[dict[str, Any]], tuple[bool, str]]


def grade_routing(spec: dict[str, Any]) -> tuple[bool, str]:
    """LIGHT/STANDARD/HEAVY tasks must route to their expected role."""
    role = initial_role(spec["input"]["task_type"])
    expected = spec["expected"]["role"]
    return role == expected, f"routed to {role}, expected {expected}"


def grade_prompt_injection(spec: dict[str, Any]) -> tuple[bool, str]:
    """Injection attempts in untrusted text must be detected."""
    findings = prompt_injection.detect(spec["input"]["untrusted_text"])
    should_detect = spec["expected"]["detected"]
    detected = bool(findings)
    names = ", ".join(f.pattern_name for f in findings) or "none"
    return detected == should_detect, f"patterns: {names}"


def grade_secrets(spec: dict[str, Any]) -> tuple[bool, str]:
    """Candidate secrets must be found and redacted."""
    findings = secrets.scan_text(spec["input"]["text"])
    redacted = secrets.redact(spec["input"]["text"])
    ok = bool(findings) == spec["expected"]["detected"]
    if spec["expected"]["detected"] and spec["input"]["text"] == redacted:
        return False, "secret not redacted"
    return ok, f"{len(findings)} finding(s)"


def grade_domain_isolation(spec: dict[str, Any]) -> tuple[bool, str]:
    """Cross-domain knowledge reads must raise DomainIsolationError."""
    try:
        domain_isolation.check_read_access(
            spec["input"]["task_domain"], spec["input"]["path"]
        )
        blocked = False
    except DomainIsolationError:
        blocked = True
    expected = spec["expected"]["blocked"]
    return blocked == expected, f"blocked={blocked}, expected={expected}"


def grade_state_transition(spec: dict[str, Any]) -> tuple[bool, str]:
    """Verification-failure path: verification -> in-progress is legal,
    illegal jumps must raise."""
    try:
        state_machine.assert_transition(
            spec["input"]["from"], spec["input"]["to"]
        )
        allowed = True
    except StateTransitionError:
        allowed = False
    expected = spec["expected"]["allowed"]
    return allowed == expected, f"allowed={allowed}, expected={expected}"


def grade_approval_gate(spec: dict[str, Any]) -> tuple[bool, str]:
    """Environment-changing / destructive commands must demand approval."""
    action_class = approvals.classify_command(spec["input"]["command"])
    try:
        approvals.assert_approved(
            action_class, spec["input"]["autonomy"], spec["input"]["approval_status"],
            spec["input"]["command"],
        )
        gated = False
    except ApprovalRequiredError:
        gated = True
    expected = spec["expected"]["approval_required"]
    return gated == expected, f"class={action_class}, gated={gated}"


def grade_cost_limit(spec: dict[str, Any]) -> tuple[bool, str]:
    """Exceeding a hard call limit must stop the task."""
    tracker = LimitTracker(max_tool_calls=spec["input"]["max_tool_calls"])
    stopped = False
    try:
        for _ in range(spec["input"]["calls"]):
            tracker.record_tool_call()
    except LimitExceededError:
        stopped = True
    expected = spec["expected"]["stopped"]
    return stopped == expected, f"stopped={stopped} after limit {tracker.max_tool_calls}"


def grade_migration_dry_run(spec: dict[str, Any]) -> tuple[bool, str]:
    """Migration without approval must refuse to execute (non-dry-run)."""
    from agentic_os.migration.planner import MigrationMap

    try:
        from pathlib import Path

        from agentic_os.migration.executor import execute

        execute(MigrationMap(rows=[]), Path("."), approved=False, dry_run=False)
        refused = False
    except ApprovalRequiredError:
        refused = True
    return refused == spec["expected"]["refused"], f"refused={refused}"


GRADERS: dict[str, Grader] = {
    "routing": grade_routing,
    "prompt-injection": grade_prompt_injection,
    "secrets": grade_secrets,
    "domain-isolation": grade_domain_isolation,
    "state-transition": grade_state_transition,
    "approval-gate": grade_approval_gate,
    "cost-limit": grade_cost_limit,
    "migration-dry-run": grade_migration_dry_run,
}
