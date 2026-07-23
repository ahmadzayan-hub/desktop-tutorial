"""Deterministic validation — preferred verification method (spec section 16)."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from agentic_os.utils.hashing import sha256_file

REQUIRED_MD_HEADER_FIELDS = (
    "purpose", "owner", "last-updated", "domain", "classification", "status",
)


def parse_frontmatter(text: str) -> dict[str, str]:
    """Parse the leading ``--- ... ---`` block of a markdown file."""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    fields: dict[str, str] = {}
    for line in lines[1:]:
        if line.strip() == "---":
            return fields
        if ":" in line:
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip()
    return {}


def check_markdown_header(path: Path) -> list[str]:
    """Missing required header fields for a markdown file (empty = pass)."""
    fields = parse_frontmatter(path.read_text(encoding="utf-8", errors="ignore"))
    if not fields:
        return [f"{path}: missing markdown frontmatter header"]
    return [
        f"{path}: header missing '{name}'"
        for name in REQUIRED_MD_HEADER_FIELDS
        if name not in fields or not fields[name]
    ]


def check_file_integrity(path: Path, expected_sha256: str) -> list[str]:
    """Compare a file hash against its recorded value."""
    if not path.is_file():
        return [f"{path}: file missing"]
    actual = sha256_file(path)
    if actual != expected_sha256:
        return [f"{path}: hash mismatch (expected {expected_sha256[:12]}…,"
                f" got {actual[:12]}…)"]
    return []


def validate_against_schema(
    instance: Any, schema: dict[str, Any], where: str = ""
) -> list[str]:
    """Minimal JSON-Schema-subset validator: type, required, enum, properties.

    Full JSON Schema needs a third-party library; this covers the subset our
    own schemas use and is honest about that limitation.
    """
    problems: list[str] = []
    expected_type = schema.get("type")
    type_map = {"object": dict, "array": list, "string": str, "integer": int,
                "number": (int, float), "boolean": bool}
    if expected_type and not isinstance(instance, type_map.get(expected_type, object)):
        problems.append(f"{where or 'value'}: expected {expected_type}")
        return problems
    if "enum" in schema and instance not in schema["enum"]:
        problems.append(f"{where or 'value'}: {instance!r} not in enum")
    if expected_type == "object":
        for req in schema.get("required", []):
            if req not in instance:
                problems.append(f"{where or 'object'}: missing required '{req}'")
        for key, subschema in schema.get("properties", {}).items():
            if key in instance:
                problems.extend(
                    validate_against_schema(instance[key], subschema, f"{where}.{key}")
                )
    if expected_type == "array" and "items" in schema:
        for i, item in enumerate(instance):
            problems.extend(
                validate_against_schema(item, schema["items"], f"{where}[{i}]")
            )
    return problems


def load_schema(path: Path) -> dict[str, Any]:
    """Load a JSON schema file."""
    return json.loads(path.read_text(encoding="utf-8"))
