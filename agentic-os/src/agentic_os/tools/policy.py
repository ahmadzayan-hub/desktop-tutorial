"""Tool policy evaluation: permissions + external-side-effect approval."""

from __future__ import annotations

from agentic_os.exceptions import ApprovalRequiredError
from agentic_os.models.tool import ToolRecord
from agentic_os.security.permissions import check_permission


def evaluate(
    tool: ToolRecord,
    *,
    role: str,
    domain: str,
    action: str,
    environment: str = "sandbox",
    approval_status: str = "not-required",
    production_actions_enabled: bool = False,
) -> None:
    """Full policy gate for one tool call; raises on any denial.

    Order: hard permissions first (role/domain/action/environment), then
    approval requirements for external side effects (Checkpoint D).
    """
    check_permission(
        tool, role=role, domain=domain, action=action, environment=environment,
        production_actions_enabled=production_actions_enabled,
    )
    if (tool.external_side_effect or tool.approval_required) and (
        approval_status != "approved"
    ):
        raise ApprovalRequiredError(
            f"tool {tool.tool_id} action {action!r} has external side effects; "
            "explicit approval required in this session (Checkpoint D)"
        )
