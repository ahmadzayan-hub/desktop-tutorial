"""Append-only audit log for CLI invocations and controlled actions."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from agentic_os.utils.dates import utc_now_iso


def audit_log_path(os_root: Path) -> Path:
    """JSONL audit file (gitignored, lives beside the state DB)."""
    return os_root / "memory" / "audit.jsonl"


def record(os_root: Path, event: str, detail: dict[str, Any] | None = None) -> None:
    """Append one structured audit line. Secrets must be redacted upstream."""
    path = audit_log_path(os_root)
    path.parent.mkdir(parents=True, exist_ok=True)
    entry = {"at": utc_now_iso(), "event": event, "detail": detail or {}}
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")


def tail(os_root: Path, limit: int = 20) -> list[dict[str, Any]]:
    """Most recent audit entries (newest last)."""
    path = audit_log_path(os_root)
    if not path.is_file():
        return []
    lines = path.read_text(encoding="utf-8").splitlines()[-limit:]
    return [json.loads(line) for line in lines if line.strip()]
