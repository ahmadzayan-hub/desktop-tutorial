"""Tool governance record (spec section 20). Tools are denied by default."""

from __future__ import annotations

from dataclasses import dataclass, field

from agentic_os.models.base import check_enum, check_nonempty

HEALTH_STATUSES = (
    "healthy",
    "degraded",
    "authentication-failed",
    "unavailable",
    "untested",
)


@dataclass
class ToolRecord:
    """Registered tool with roles, domains, scopes, and approval policy."""

    tool_id: str
    purpose: str
    provider: str
    owner_roles: list[str] = field(default_factory=list)
    allowed_domains: list[str] = field(default_factory=list)
    allowed_actions: list[str] = field(default_factory=list)
    forbidden_actions: list[str] = field(default_factory=list)
    authentication_method: str = "none"
    secret_location: str = "none"
    read_scope: str = ""
    write_scope: str = ""
    external_side_effect: bool = False
    approval_required: bool = False
    rate_limits: str = ""
    cost_model: str = "unknown"
    last_tested: str = ""
    last_used: str = ""
    health_status: str = "untested"
    fallback: str = ""

    def __post_init__(self) -> None:
        check_nonempty("tool_id", self.tool_id)
        check_nonempty("purpose", self.purpose)
        check_enum("health_status", self.health_status, HEALTH_STATUSES)
        if self.health_status == "healthy" and not self.last_tested:
            raise ValueError("a tool cannot be healthy without a recorded test")
