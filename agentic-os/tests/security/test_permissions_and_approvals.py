"""Permission and approval-gate tests (spec sections 3, 20, 21, 22, 36)."""

import pytest

from agentic_os.exceptions import ApprovalRequiredError, ToolPolicyError
from agentic_os.models.tool import ToolRecord
from agentic_os.orchestration.approvals import (
    ENV_CHANGING,
    EXTERNAL_DESTRUCTIVE,
    READ_ONLY,
    REVERSIBLE,
    assert_approved,
    classify_command,
)
from agentic_os.tools.policy import evaluate
from agentic_os.tools.registry import get_tool


def _tool(**overrides: object) -> ToolRecord:
    base: dict = {
        "tool_id": "t1", "purpose": "test", "provider": "local",
        "owner_roles": ["standard"], "allowed_domains": ["system"],
        "allowed_actions": ["read"], "health_status": "untested",
    }
    base.update(overrides)
    return ToolRecord(**base)


def test_unregistered_tool_denied() -> None:
    with pytest.raises(ToolPolicyError, match="denied by default"):
        get_tool({}, "ghost-tool")


def test_role_domain_action_all_checked() -> None:
    tool = _tool()
    evaluate(tool, role="standard", domain="system", action="read")
    with pytest.raises(ToolPolicyError):
        evaluate(tool, role="light", domain="system", action="read")
    with pytest.raises(ToolPolicyError):
        evaluate(tool, role="standard", domain="rta", action="read")
    with pytest.raises(ToolPolicyError):
        evaluate(tool, role="standard", domain="system", action="write")


def test_production_disabled_by_default() -> None:
    tool = _tool()
    with pytest.raises(ToolPolicyError, match="production"):
        evaluate(tool, role="standard", domain="system", action="read",
                 environment="production")


def test_external_side_effect_needs_approval() -> None:
    tool = _tool(external_side_effect=True)
    with pytest.raises(ApprovalRequiredError):
        evaluate(tool, role="standard", domain="system", action="read")
    evaluate(tool, role="standard", domain="system", action="read",
             approval_status="approved")


def test_command_classification() -> None:
    assert classify_command("git status") == READ_ONLY
    assert classify_command("mkdir out && cp a b") == REVERSIBLE
    assert classify_command("pip install requests") == ENV_CHANGING
    assert classify_command("git push --force origin main") == EXTERNAL_DESTRUCTIVE
    assert classify_command("rm -rf build") == EXTERNAL_DESTRUCTIVE
    assert classify_command("some-unknown-binary --do-things") == REVERSIBLE


def test_checkpoint_gates() -> None:
    with pytest.raises(ApprovalRequiredError, match="checkpoint C"):
        assert_approved(ENV_CHANGING, "execute-reversible", "not-required", "pip install x")
    with pytest.raises(ApprovalRequiredError, match="checkpoint D"):
        assert_approved(EXTERNAL_DESTRUCTIVE, "execute-controlled", "pending", "deploy")
    assert_approved(EXTERNAL_DESTRUCTIVE, "execute-controlled", "approved", "deploy")
    with pytest.raises(ApprovalRequiredError, match="prohibited"):
        assert_approved(READ_ONLY, "prohibited", "approved", "anything")
