"""Eval-system tests (spec sections 33, 36)."""

import json
from pathlib import Path

from agentic_os.evals.regression import compare_latest
from agentic_os.evals.runner import run_golden_tasks


def test_golden_tasks_all_pass(os_root: Path) -> None:
    report = run_golden_tasks(os_root / "evals" / "golden-tasks")
    failed = [r for r in report.results if not r["passed"]]
    assert report.total == 10
    assert not failed, failed


def test_results_stored_and_regressions_compared(os_root: Path, tmp_path: Path) -> None:
    results_dir = tmp_path / "results"
    run_golden_tasks(os_root / "evals" / "golden-tasks", results_dir)
    assert compare_latest(results_dir) is None  # one run only
    # simulate an earlier run where one eval passed that now fails
    files = sorted(results_dir.glob("eval-*.json"))
    old = json.loads(files[0].read_text())
    old["run_at"] = "2000-01-01T00:00:00+00:00"
    old["results"][0]["passed"] = not old["results"][0]["passed"]
    (results_dir / "eval-2000.json").write_text(json.dumps(old))
    delta = compare_latest(results_dir)
    assert delta is not None


def test_unknown_grader_is_failure(tmp_path: Path) -> None:
    golden = tmp_path / "golden"
    golden.mkdir()
    (golden / "bad.json").write_text(json.dumps({"id": "bad", "grader": "nope"}))
    report = run_golden_tasks(golden)
    assert report.passed == 0 and report.total == 1
