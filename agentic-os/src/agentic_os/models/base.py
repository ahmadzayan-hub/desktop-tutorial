"""Shared validation helpers for the model layer."""

from __future__ import annotations

import dataclasses
from typing import Any


def check_enum(name: str, value: str, allowed: tuple[str, ...]) -> None:
    """Raise ValueError when *value* is not one of *allowed*."""
    if value not in allowed:
        raise ValueError(f"{name}={value!r} not in {allowed}")


def check_nonempty(name: str, value: str) -> None:
    """Raise ValueError when a required string field is blank."""
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must be a non-empty string")


def as_dict(obj: Any) -> dict[str, Any]:
    """Dataclass instance to plain dict (for JSON / SQLite storage)."""
    return dataclasses.asdict(obj)
