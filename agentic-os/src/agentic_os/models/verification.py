"""Verification result model (spec sections 9, 15, 16)."""

from __future__ import annotations

from dataclasses import dataclass, field

from agentic_os.models.base import check_enum, check_nonempty

VERIFICATION_RESULTS = (
    "PASS",
    "PASS-WITH-LIMITATIONS",
    "FAIL",
    "NOT-INDEPENDENTLY-VERIFIABLE",
)


@dataclass
class VerificationResult:
    """Outcome of a VERIFIER run. The verifier never rewrites deliverables."""

    task_id: str
    level: str
    result: str
    checks_performed: list[str] = field(default_factory=list)
    findings: list[str] = field(default_factory=list)
    # verifier-independence record (spec section 16)
    same_model: bool = True
    separate_context: bool = False
    independent_sources: bool = False
    deterministic_checks: bool = False
    human_review_required: bool = False
    verified_at: str = ""

    def __post_init__(self) -> None:
        check_nonempty("task_id", self.task_id)
        check_enum("result", self.result, VERIFICATION_RESULTS)
        check_enum(
            "level", self.level, ("none", "basic", "standard", "enhanced", "human-mandatory")
        )
