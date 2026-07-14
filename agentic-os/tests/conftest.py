"""Shared fixtures: every test gets an isolated agentic-os tree + store."""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest

from agentic_os.memory.sqlite_store import SqliteStore

REAL_OS_ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture()
def os_root(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Isolated agentic-os root with real config/schemas/evals copied in."""
    root = tmp_path / "agentic-os"
    for sub in ("config", "schemas", "tools", "skills", "agents"):
        src = REAL_OS_ROOT / sub
        if src.is_dir():
            shutil.copytree(src, root / sub)
    (root / "evals").mkdir()
    shutil.copytree(REAL_OS_ROOT / "evals" / "golden-tasks",
                    root / "evals" / "golden-tasks")
    (root / "memory" / "sessions" / "_compacted").mkdir(parents=True)
    (root / "brain" / "knowledge").mkdir(parents=True)
    monkeypatch.setenv("AGENTIC_OS_ROOT", str(root))
    return root


@pytest.fixture()
def store(os_root: Path) -> SqliteStore:
    s = SqliteStore(os_root / "memory" / "state.db")
    yield s
    s.close()


@pytest.fixture()
def sample_task_kwargs() -> dict:
    return {
        "task_id": "TASK-20260713-001",
        "title": "sample task",
        "domain": "system",
        "classification": "internal",
        "requested_by": "Ahmed Zaian",
        "created": "2026-07-13T12:00:00+00:00",
    }
