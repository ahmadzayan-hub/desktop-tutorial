"""Migration rollback: inverse of executed moves (spec section 28)."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from agentic_os.exceptions import MigrationError


def save_rollback_map(entries: list[tuple[str, str]], path: Path) -> None:
    """Persist (current_location, original_location) pairs as JSON."""
    path.write_text(
        json.dumps({"entries": [{"from": a, "to": b} for a, b in entries]}, indent=2)
        + "\n",
        encoding="utf-8",
    )


def load_rollback_map(path: Path) -> list[tuple[str, str]]:
    """Read a saved rollback map."""
    data = json.loads(path.read_text(encoding="utf-8"))
    return [(e["from"], e["to"]) for e in data.get("entries", [])]


def rollback(entries: list[tuple[str, str]], project_root: Path) -> list[str]:
    """Move files back to their original locations; returns actions taken."""
    actions: list[str] = []
    for current, original in reversed(entries):
        src = project_root / current
        dst = project_root / original
        if not src.exists():
            raise MigrationError(f"rollback source missing: {current}")
        if dst.exists():
            raise MigrationError(f"rollback destination occupied: {original}")
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(src), str(dst))
        actions.append(f"restored {original}")
    return actions
