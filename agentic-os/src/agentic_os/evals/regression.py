"""Compare eval runs across versions (spec sections 32, 33)."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class RegressionDelta:
    """Difference between the two most recent eval runs."""

    previous_run: str
    latest_run: str
    newly_failing: list[str] = field(default_factory=list)
    newly_passing: list[str] = field(default_factory=list)

    @property
    def regressed(self) -> bool:
        return bool(self.newly_failing)


def compare_latest(results_dir: Path) -> RegressionDelta | None:
    """Compare the two newest stored eval result files; None if fewer than 2."""
    files = sorted(results_dir.glob("eval-*.json"))
    if len(files) < 2:
        return None
    prev = json.loads(files[-2].read_text(encoding="utf-8"))
    latest = json.loads(files[-1].read_text(encoding="utf-8"))
    prev_state = {r["id"]: r["passed"] for r in prev["results"]}
    latest_state = {r["id"]: r["passed"] for r in latest["results"]}
    delta = RegressionDelta(previous_run=prev["run_at"], latest_run=latest["run_at"])
    for eval_id, passed in latest_state.items():
        before = prev_state.get(eval_id)
        if before is True and not passed:
            delta.newly_failing.append(eval_id)
        if before is False and passed:
            delta.newly_passing.append(eval_id)
    return delta
