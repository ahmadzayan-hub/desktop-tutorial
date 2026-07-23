"""Tool permission checks: role, domain, action, environment must ALL pass.

Deny by default (spec section 20).
"""

from __future__ import annotations

from agentic_os.exceptions import ToolPolicyError
from agentic_os.models.tool import ToolRecord

VALID_ENVIRONMENTS = ("sandbox", "development", "staging", "production")


def check_permission(
    tool: ToolRecord,
    role: str,
    domain: str,
    action: str,
    environment: str = "sandbox",
    production_actions_enabled: bool = False,
) -> None:
    """Raise :class:`ToolPolicyError` unless every dimension is allowed."""
    if environment not in VALID_ENVIRONMENTS:
        raise ToolPolicyError(f"unknown environment: {environment!r}")
    if tool.health_status in ("unavailable", "authentication-failed"):
        raise ToolPolicyError(f"tool {tool.tool_id} is {tool.health_status}")
    if role not in tool.owner_roles:
        raise ToolPolicyError(f"role {role!r} not allowed for tool {tool.tool_id}")
    if domain not in tool.allowed_domains:
        raise ToolPolicyError(f"domain {domain!r} not allowed for tool {tool.tool_id}")
    if action in tool.forbidden_actions:
        raise ToolPolicyError(f"action {action!r} forbidden for tool {tool.tool_id}")
    if action not in tool.allowed_actions:
        raise ToolPolicyError(f"action {action!r} not registered for tool {tool.tool_id}")
    if environment == "production" and not production_actions_enabled:
        raise ToolPolicyError("production actions are disabled by configuration")
