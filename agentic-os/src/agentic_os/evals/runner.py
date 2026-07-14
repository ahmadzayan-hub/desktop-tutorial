"""Golden-task eval runner (spec section 33)."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from agentic_os.evals.graders import GRADERS
from agentic_os.utils.dates import utc_now_iso


@dataclass
class EvalReport:
    """Results of one eval run over the golden-task set."""

    run_at: str
    total: int = 0
    passed: int = 0
    results: list[dict[str, object]] = field(default_factory=list)

    @property
    def pass_rate(self) -> float:
        return self.passed / self.total if self.total else 0.0


def run_golden_tasks(golden_dir: Path, results_dir: Path | None = None) -> EvalReport:
    """Run every ``*.json`` golden task through its grader and store results."""
    report = EvalReport(run_at=utc_now_iso())
    for spec_path in sorted(golden_dir.glob("*.json")):
        spec = json.loads(spec_path.read_text(encoding="utf-8"))
        grader = GRADERS.get(spec.get("grader", ""))
        report.total += 1
        if grader is None:
            report.results.append(
                {"id": spec.get("id", spec_path.stem), "passed": False,
                 "detail": f"unknown grader {spec.get('grader')!r}"}
            )
            continue
        try:
            passed, detail = grader(spec)
        except Exception as exc:  # a grader crash is a failed eval, recorded
            passed, detail = False, f"grader raised {type(exc).__name__}: {exc}"
        report.passed += int(passed)
        report.results.append(
            {"id": spec.get("id", spec_path.stem), "passed": passed, "detail": detail}
        )
    if results_dir is not None:
        results_dir.mkdir(parents=True, exist_ok=True)
        stamp = report.run_at.replace(":", "").replace("+", "Z")
        out = results_dir / f"eval-{stamp}.json"
        out.write_text(
            json.dumps(
                {"run_at": report.run_at, "total": report.total,
                 "passed": report.passed, "results": report.results},
                indent=2,
            ) + "\n",
            encoding="utf-8",
        )
    return report
