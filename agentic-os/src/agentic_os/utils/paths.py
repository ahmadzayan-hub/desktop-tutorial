"""Path discovery for the Agentic OS tree.

The OS lives under ``<project-root>/agentic-os``. All state and exports are
resolved relative to that root so the CLI works from any subdirectory.
"""

from __future__ import annotations

import os
from pathlib import Path

from agentic_os.exceptions import ConfigError

OS_DIR_NAME = "agentic-os"


def find_os_root(start: Path | None = None) -> Path:
    """Locate the ``agentic-os`` directory by walking up from *start*.

    Honors the ``AGENTIC_OS_ROOT`` environment variable first (used by tests).
    """
    env = os.environ.get("AGENTIC_OS_ROOT")
    if env:
        root = Path(env)
        if root.is_dir():
            return root
        raise ConfigError(f"AGENTIC_OS_ROOT does not exist: {env}")
    cur = (start or Path.cwd()).resolve()
    for candidate in (cur, *cur.parents):
        if candidate.name == OS_DIR_NAME:
            return candidate
        child = candidate / OS_DIR_NAME
        if child.is_dir():
            return child
    raise ConfigError("agentic-os directory not found; run from the project tree")


def project_root(os_root: Path) -> Path:
    """The project root is the parent of the agentic-os directory."""
    return os_root.parent


def db_path(os_root: Path) -> Path:
    """Authoritative SQLite state store (gitignored)."""
    return os_root / "memory" / "state.db"
