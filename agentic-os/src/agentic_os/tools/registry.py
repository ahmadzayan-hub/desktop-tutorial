"""Tool registry backed by ``tools/tools-config.json`` (spec section 20).

Tools are denied by default: an unregistered tool ID always fails lookup.
"""

from __future__ import annotations

import dataclasses
import json
from pathlib import Path

from agentic_os.exceptions import ToolPolicyError
from agentic_os.models.tool import ToolRecord


def load_registry(config_path: Path) -> dict[str, ToolRecord]:
    """Load and validate all registered tools."""
    if not config_path.is_file():
        return {}
    raw = json.loads(config_path.read_text(encoding="utf-8"))
    registry: dict[str, ToolRecord] = {}
    for entry in raw.get("tools", []):
        record = ToolRecord(**entry)
        registry[record.tool_id] = record
    return registry


def get_tool(registry: dict[str, ToolRecord], tool_id: str) -> ToolRecord:
    """Deny-by-default lookup."""
    tool = registry.get(tool_id)
    if tool is None:
        raise ToolPolicyError(f"tool {tool_id!r} is not registered (denied by default)")
    return tool


def save_registry(registry: dict[str, ToolRecord], config_path: Path) -> None:
    """Persist the registry back to JSON."""
    payload = {"tools": [dataclasses.asdict(t) for t in registry.values()]}
    config_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
