"""Migration and rollback tests (spec sections 28, 36)."""

from pathlib import Path

import pytest

from agentic_os.exceptions import ApprovalRequiredError, MigrationError
from agentic_os.migration.executor import execute
from agentic_os.migration.planner import MapRow, MigrationMap, build_map
from agentic_os.migration.rollback import load_rollback_map, rollback, save_rollback_map
from agentic_os.migration.scanner import scan
from agentic_os.utils.hashing import sha256_file


@pytest.fixture()
def project(tmp_path: Path) -> Path:
    (tmp_path / "landing").mkdir()
    (tmp_path / "landing" / "index.html").write_text("<h1>brand page</h1>")
    (tmp_path / "notes.txt").write_text("hello")
    (tmp_path / "node_modules").mkdir()
    (tmp_path / "node_modules" / "junk.js").write_text("ignored")
    return tmp_path


def test_scan_inventories_and_hashes(project: Path) -> None:
    inv = scan(project)
    paths = [f.path for f in inv.files]
    assert "landing/index.html" in paths and "notes.txt" in paths
    assert "node_modules/junk.js" not in paths
    assert all(len(f.sha256) == 64 for f in inv.files)


def test_map_defaults_to_keep_or_ask_me(project: Path) -> None:
    mig_map = build_map(scan(project))
    assert all(r.action in ("keep", "ask-me") for r in mig_map.rows)
    landing = next(r for r in mig_map.rows if r.current_path == "landing/index.html")
    assert landing.domain == "brand" and landing.action == "keep"


def test_execute_without_approval_refused(project: Path) -> None:
    with pytest.raises(ApprovalRequiredError):
        execute(MigrationMap(rows=[]), project, approved=False, dry_run=False)


def test_dry_run_changes_nothing(project: Path) -> None:
    row = MapRow("notes.txt", "docs/notes.txt", "system", "internal", "move",
                 "test", "", sha256_file(project / "notes.txt"), "docs->root")
    result = execute(MigrationMap(rows=[row]), project, approved=False, dry_run=True)
    assert result.dry_run and (project / "notes.txt").exists()
    assert not (project / "docs" / "notes.txt").exists()


def test_execute_verifies_hashes_and_rollback_restores(project: Path) -> None:
    digest = sha256_file(project / "notes.txt")
    row = MapRow("notes.txt", "docs/notes.txt", "system", "internal", "move",
                 "test", "", digest, "restore to root")
    result = execute(MigrationMap(rows=[row]), project, approved=True, dry_run=False)
    assert (project / "docs" / "notes.txt").exists()
    map_path = project / "rollback.json"
    save_rollback_map(result.rollback_entries, map_path)
    actions = rollback(load_rollback_map(map_path), project)
    assert actions == ["restored notes.txt"]
    assert (project / "notes.txt").exists()


def test_refuses_overwrite(project: Path) -> None:
    (project / "docs").mkdir()
    (project / "docs" / "notes.txt").write_text("occupied")
    row = MapRow("notes.txt", "docs/notes.txt", "system", "internal", "move",
                 "test", "", "", "")
    with pytest.raises(MigrationError, match="refusing to overwrite"):
        execute(MigrationMap(rows=[row]), project, approved=True, dry_run=False)


def test_delete_is_not_a_valid_action() -> None:
    with pytest.raises(ValueError):
        MapRow("a", "b", "system", "internal", "delete", "", "", "", "")
