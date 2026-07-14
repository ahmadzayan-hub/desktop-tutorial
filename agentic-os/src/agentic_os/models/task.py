"""Task record — the unit of routed, governed work (spec section 11)."""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from agentic_os.models.base import check_enum, check_nonempty

VALID_DOMAINS = ("system", "rta", "bcgt", "mba", "brand", "personal")
VALID_CLASSIFICATIONS = ("public", "internal", "restricted", "confidential")
VALID_PRIORITIES = ("critical", "high", "medium", "low")
VALID_RISKS = ("high", "medium", "low")
VALID_STATUSES = (
    "backlog",
    "ready",
    "in-progress",
    "blocked",
    "verification",
    "done",
    "cancelled",
)
VALID_ROLES = ("orchestrator", "heavy", "standard", "light", "verifier")
VALID_AUTONOMY = (
    "observe",
    "draft",
    "execute-reversible",
    "execute-controlled",
    "prohibited",
)
VALID_APPROVAL = ("not-required", "pending", "approved", "rejected")
VALID_VERIFICATION_LEVELS = (
    "none",
    "basic",
    "standard",
    "enhanced",
    "human-mandatory",
)

TASK_ID_RE = re.compile(r"^TASK-\d{8}-\d{3}$")

# Default limits per spec section 24.
DEFAULT_LIMITS: dict[str, int] = {
    "max_agent_turns": 12,
    "max_tool_calls": 20,
    "max_retries": 1,
    "max_heavy_calls": 3,
    "max_runtime_seconds": 1800,
}


@dataclass
class Task:
    """A single governed task. Only the ORCHESTRATOR changes ``status``."""

    task_id: str
    title: str
    domain: str
    classification: str
    requested_by: str
    created: str
    priority: str = "medium"
    risk: str = "low"
    status: str = "backlog"
    assigned_role: str = "standard"
    skill: str = ""
    autonomy_level: str = "draft"
    approval_status: str = "not-required"
    approved_actions: str = ""
    prohibited_actions: str = ""
    dependencies: str = ""
    input_files: str = ""
    expected_output: str = ""
    output_path: str = ""
    verification_level: str = "standard"
    max_agent_turns: int = DEFAULT_LIMITS["max_agent_turns"]
    max_tool_calls: int = DEFAULT_LIMITS["max_tool_calls"]
    max_retries: int = DEFAULT_LIMITS["max_retries"]
    max_heavy_calls: int = DEFAULT_LIMITS["max_heavy_calls"]
    max_runtime_seconds: int = DEFAULT_LIMITS["max_runtime_seconds"]
    max_input_tokens: int = 0
    max_output_tokens: int = 0
    stop_conditions: str = ""
    cost_estimate: str = "unavailable"
    actual_cost: str = "unavailable"
    last_updated: str = field(default="")

    def __post_init__(self) -> None:
        if not TASK_ID_RE.match(self.task_id):
            raise ValueError(f"task_id must match TASK-YYYYMMDD-NNN: {self.task_id!r}")
        check_nonempty("title", self.title)
        check_enum("domain", self.domain, VALID_DOMAINS)
        check_enum("classification", self.classification, VALID_CLASSIFICATIONS)
        check_enum("priority", self.priority, VALID_PRIORITIES)
        check_enum("risk", self.risk, VALID_RISKS)
        check_enum("status", self.status, VALID_STATUSES)
        check_enum("assigned_role", self.assigned_role, VALID_ROLES)
        check_enum("autonomy_level", self.autonomy_level, VALID_AUTONOMY)
        check_enum("approval_status", self.approval_status, VALID_APPROVAL)
        check_enum(
            "verification_level", self.verification_level, VALID_VERIFICATION_LEVELS
        )
        if self.risk == "high" and self.verification_level in ("none", "basic", "standard"):
            raise ValueError(
                "high-risk tasks require enhanced or human-mandatory verification"
            )
        if not self.last_updated:
            self.last_updated = self.created
