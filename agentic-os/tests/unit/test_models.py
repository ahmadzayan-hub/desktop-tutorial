"""Schema/model validation tests (spec section 36)."""

import json
from pathlib import Path

import pytest

from agentic_os.models.task import Task
from agentic_os.models.tool import ToolRecord
from agentic_os.verification.deterministic import load_schema, validate_against_schema

SCHEMAS = Path(__file__).resolve().parents[2] / "schemas"


def test_task_validates(sample_task_kwargs: dict) -> None:
    task = Task(**sample_task_kwargs)
    assert task.status == "backlog"
    assert task.autonomy_level == "draft"  # default autonomy is draft


def test_task_rejects_bad_domain(sample_task_kwargs: dict) -> None:
    with pytest.raises(ValueError, match="domain"):
        Task(**{**sample_task_kwargs, "domain": "finance"})


def test_task_rejects_bad_id(sample_task_kwargs: dict) -> None:
    with pytest.raises(ValueError, match="task_id"):
        Task(**{**sample_task_kwargs, "task_id": "TASK-1"})


def test_high_risk_needs_enhanced_verification(sample_task_kwargs: dict) -> None:
    with pytest.raises(ValueError, match="high-risk"):
        Task(**{**sample_task_kwargs, "risk": "high", "verification_level": "basic"})
    Task(**{**sample_task_kwargs, "risk": "high", "verification_level": "enhanced"})


def test_tool_cannot_be_healthy_untested() -> None:
    with pytest.raises(ValueError, match="healthy"):
        ToolRecord(tool_id="x", purpose="y", provider="local", health_status="healthy")


def test_task_instance_matches_json_schema(sample_task_kwargs: dict) -> None:
    import dataclasses

    schema = load_schema(SCHEMAS / "task.schema.json")
    instance = dataclasses.asdict(Task(**sample_task_kwargs))
    assert validate_against_schema(instance, schema) == []


def test_all_schemas_parse() -> None:
    files = list(SCHEMAS.glob("*.schema.json"))
    assert len(files) == 8
    for f in files:
        data = json.loads(f.read_text())
        assert data["type"] == "object" and data["required"]
