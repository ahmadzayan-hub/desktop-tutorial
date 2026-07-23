"""Risk- and capability-based routing (spec section 10).

Start at the cheapest capable role; escalate on capability failure or after
one corrected retry; a fourth HEAVY call in a session requires approval.
"""

from __future__ import annotations

from dataclasses import dataclass

from agentic_os.exceptions import ApprovalRequiredError

# task-type -> initial role (cheapest capable first)
TASK_TYPE_ROLE: dict[str, str] = {
    "extraction": "light",
    "classification": "light",
    "formatting": "light",
    "scanning": "light",
    "triage": "light",
    "coding": "standard",
    "drafting": "standard",
    "synthesis": "standard",
    "tool-use": "standard",
    "report-assembly": "standard",
    "architecture": "heavy",
    "high-risk-analysis": "heavy",
    "executive-decision": "heavy",
    "strategic-writing": "heavy",
    "verification": "verifier",
}

ESCALATION_ORDER = ("light", "standard", "heavy")
HEAVY_CALLS_REQUIRING_APPROVAL = 4  # the fourth call needs approval


@dataclass
class RoutingDecision:
    """One recorded routing decision."""

    task_id: str
    task_type: str
    role: str
    reason: str


def initial_role(task_type: str) -> str:
    """Cheapest capable role for a task type; unknown types go to STANDARD."""
    return TASK_TYPE_ROLE.get(task_type, "standard")


def escalate(current_role: str, reason: str) -> str:
    """Next role up after a capability failure or failed corrected retry."""
    if current_role not in ESCALATION_ORDER:
        raise ValueError(f"role {current_role!r} cannot be escalated")
    idx = ESCALATION_ORDER.index(current_role)
    if idx + 1 >= len(ESCALATION_ORDER):
        raise ApprovalRequiredError(
            f"HEAVY already failed ({reason}); human decision required"
        )
    return ESCALATION_ORDER[idx + 1]


def check_heavy_budget(heavy_calls_this_session: int, approved: bool = False) -> None:
    """Enforce the HEAVY-call session limit (spec sections 10, 24, 25)."""
    if heavy_calls_this_session + 1 >= HEAVY_CALLS_REQUIRING_APPROVAL and not approved:
        raise ApprovalRequiredError(
            "a fourth HEAVY call in one session requires explicit approval"
        )
