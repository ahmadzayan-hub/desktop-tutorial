"""VERIFIER role implementation (spec sections 9, 15, 16).

Runs check suites by verification level and returns a
:class:`VerificationResult`. It never creates or rewrites deliverables, and a
PASS is never based on writing quality or confidence alone — every check here
is deterministic.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from agentic_os.models.verification import VerificationResult
from agentic_os.security.domain_isolation import knowledge_domain_of
from agentic_os.security.secrets import scan_text
from agentic_os.utils.dates import utc_now_iso
from agentic_os.verification.deterministic import check_markdown_header
from agentic_os.verification.evidence_checks import check_bundle, expired_sources


def verify(
    task_id: str,
    level: str,
    *,
    artifact_paths: list[Path] | None = None,
    artifact_text: str = "",
    evidence_bundle: dict[str, Any] | None = None,
    task_domain: str | None = None,
    approvals_ok: bool = True,
) -> VerificationResult:
    """Run the deterministic check suite for a verification level."""
    checks: list[str] = []
    findings: list[str] = []
    paths = artifact_paths or []

    if level == "none":
        return VerificationResult(
            task_id=task_id, level=level, result="NOT-INDEPENDENTLY-VERIFIABLE",
            checks_performed=["none requested"], deterministic_checks=False,
            verified_at=utc_now_iso(),
        )

    # basic and above: structure, formatting, file integrity, contradictions
    checks.append("structure")
    for path in paths:
        if not path.exists():
            findings.append(f"artifact missing: {path}")
        elif path.suffix == ".md":
            findings.extend(check_markdown_header(path))

    if level in ("standard", "enhanced", "human-mandatory"):
        checks.append("evidence-and-sources")
        if evidence_bundle is not None:
            findings.extend(check_bundle(evidence_bundle))
            stale = expired_sources(evidence_bundle)
            findings.extend(f"expired source supports claims: {s}" for s in stale)
        checks.append("domain-isolation")
        if task_domain:
            for path in paths:
                owner = knowledge_domain_of(path)
                if owner and owner != task_domain:
                    findings.append(
                        f"domain leak: {path} belongs to {owner}, task is {task_domain}"
                    )

    if level in ("enhanced", "human-mandatory"):
        checks.append("security-secrets")
        if artifact_text:
            findings.extend(
                f"secret in deliverable ({f.pattern_name}) line {f.line_number}"
                for f in scan_text(artifact_text)
            )
        checks.append("approvals")
        if not approvals_ok:
            findings.append("required approvals not recorded")

    if level == "human-mandatory":
        checks.append("human-review")
        return VerificationResult(
            task_id=task_id, level=level,
            result="FAIL" if findings else "NOT-INDEPENDENTLY-VERIFIABLE",
            checks_performed=checks,
            findings=findings or ["awaiting explicit human approval"],
            deterministic_checks=True, human_review_required=True,
            verified_at=utc_now_iso(),
        )

    result = "PASS" if not findings else "FAIL"
    if not findings and evidence_bundle is None and level in ("standard", "enhanced"):
        result = "PASS-WITH-LIMITATIONS"
        findings.append("no evidence bundle supplied; factual claims unverified")
    return VerificationResult(
        task_id=task_id, level=level, result=result, checks_performed=checks,
        findings=findings, deterministic_checks=True, verified_at=utc_now_iso(),
    )
