"""CLI smoke tests over an isolated tree (spec sections 34, 36)."""

import json
from pathlib import Path

import pytest

from agentic_os import cli


def run(args: list[str], capsys: pytest.CaptureFixture[str]) -> tuple[int, str]:
    code = cli.main(args)
    return code, capsys.readouterr().out


def test_init_and_status(os_root: Path, capsys: pytest.CaptureFixture[str]) -> None:
    code, _ = run(["init"], capsys)
    assert code == 0
    code, out = run(["status"], capsys)
    assert code == 0
    assert len(out.strip().splitlines()) < 25  # spec section 35


def test_task_lifecycle(os_root: Path, capsys: pytest.CaptureFixture[str]) -> None:
    code, out = run(["--json", "task", "create", "Draft weekly report",
                     "--domain", "system"], capsys)
    assert code == 0
    task_id = json.loads(out)["task_id"]
    code, _ = run(["task", "update", task_id, "--status", "ready"], capsys)
    assert code == 0
    code, out = run(["--json", "task", "list", "--status", "ready"], capsys)
    assert task_id in out
    code, _ = run(["task", "update", task_id, "--status", "done"], capsys)
    assert code == 1  # invalid transition -> non-zero exit


def test_route_and_verify(os_root: Path, capsys: pytest.CaptureFixture[str]) -> None:
    _, out = run(["--json", "task", "create", "Extract invoice fields",
                  "--domain", "system"], capsys)
    task_id = json.loads(out)["task_id"]
    code, out = run(["--json", "route", task_id, "--task-type", "extraction"], capsys)
    assert code == 0 and json.loads(out)["role"] == "light"
    code, out = run(["--json", "verify", task_id, "--level", "basic"], capsys)
    assert code == 0 and json.loads(out)["result"] in ("PASS", "PASS-WITH-LIMITATIONS")


def test_scan_and_migration_plan(os_root: Path,
                                 capsys: pytest.CaptureFixture[str]) -> None:
    (os_root.parent / "somefile.txt").write_text("data")
    code, out = run(["--json", "scan"], capsys)
    assert code == 0 and json.loads(out)["files"] >= 1
    code, out = run(["--json", "migration-plan"], capsys)
    assert code == 0
    rows = json.loads(out)["rows"]
    assert all(r["action"] in ("keep", "ask-me") for r in rows)


def test_migrate_execute_without_approval_fails(
    os_root: Path, capsys: pytest.CaptureFixture[str]
) -> None:
    assert cli.main(["migrate", "--execute"]) == 1


def test_rollback_without_map(os_root: Path,
                              capsys: pytest.CaptureFixture[str]) -> None:
    assert cli.main(["rollback"]) == 1


def test_tool_list_and_health(os_root: Path,
                              capsys: pytest.CaptureFixture[str]) -> None:
    code, out = run(["--json", "tool", "list"], capsys)
    assert code == 0 and "filesystem-local" in out
    code, out = run(["--json", "tool", "health", "filesystem-local"], capsys)
    assert code == 0 and json.loads(out)["status"] == "healthy"
    code, _ = run(["tool", "health", "ghost"], capsys)
    assert code == 1


def test_eval_run_and_exports(os_root: Path,
                              capsys: pytest.CaptureFixture[str]) -> None:
    code, out = run(["--json", "eval", "run"], capsys)
    assert code == 0 and json.loads(out)["passed"] == 10
    code, _ = run(["export-markdown"], capsys)
    assert code == 0
    assert (os_root / "memory" / "progress.md").exists()


def test_risk_and_incident_lists(os_root: Path,
                                 capsys: pytest.CaptureFixture[str]) -> None:
    assert cli.main(["risk", "list"]) == 0
    assert cli.main(["incident", "list"]) == 0


def test_audit_log_written(os_root: Path, capsys: pytest.CaptureFixture[str]) -> None:
    run(["status"], capsys)
    audit_file = os_root / "memory" / "audit.jsonl"
    assert audit_file.exists()
    assert any("cli:status" in line for line in audit_file.read_text().splitlines())
