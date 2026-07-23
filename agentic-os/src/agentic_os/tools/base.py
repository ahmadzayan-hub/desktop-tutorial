"""Base tool wrapper: every execution passes policy first."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from agentic_os.models.tool import ToolRecord
from agentic_os.tools.policy import evaluate


class GovernedTool:
    """Wraps a callable so it can only run after a policy pass.

    The wrapped callable receives the action name and keyword arguments; the
    policy check (role + domain + action + environment + approval) happens on
    every call, not just at registration.
    """

    def __init__(self, record: ToolRecord, impl: Callable[..., Any]) -> None:
        self.record = record
        self._impl = impl

    def execute(
        self,
        action: str,
        *,
        role: str,
        domain: str,
        environment: str = "sandbox",
        approval_status: str = "not-required",
        production_actions_enabled: bool = False,
        **kwargs: Any,
    ) -> Any:
        """Policy-checked execution; raises before running on any denial."""
        evaluate(
            self.record, role=role, domain=domain, action=action,
            environment=environment, approval_status=approval_status,
            production_actions_enabled=production_actions_enabled,
        )
        return self._impl(action, **kwargs)
