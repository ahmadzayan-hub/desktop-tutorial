"""Skill output-contract checks (spec section 13).

The ORCHESTRATOR rejects non-compliant output before verification and names
the exact violation; these helpers make that check deterministic.
"""

from __future__ import annotations

from pathlib import Path

from agentic_os.verification.deterministic import parse_frontmatter

REQUIRED_SKILL_FIELDS = (
    "purpose", "owner", "last-updated", "domain", "classification", "status",
    "minimum-role", "write-scope", "deliverable", "structure", "language",
    "length", "input-contract", "output-contract", "verification-level",
    "success-criteria", "acceptance-tests", "required-evidence",
    "prohibited-content", "failure-conditions", "review-owner",
)


def check_skill_contract(skill_md: Path) -> list[str]:
    """Missing contract fields in a SKILL.md header (empty = pass)."""
    fields = parse_frontmatter(skill_md.read_text(encoding="utf-8", errors="ignore"))
    return [
        f"{skill_md}: skill contract missing '{name}'"
        for name in REQUIRED_SKILL_FIELDS
        if name not in fields or not fields[name]
    ]


def check_output_against_contract(
    output_text: str, prohibited_terms: list[str], required_sections: list[str]
) -> list[str]:
    """Named violations of a deliverable against its contract (empty = pass)."""
    problems: list[str] = []
    lowered = output_text.lower()
    for term in prohibited_terms:
        if term.lower() in lowered:
            problems.append(f"prohibited content present: {term!r}")
    for section in required_sections:
        if section.lower() not in lowered:
            problems.append(f"required section missing: {section!r}")
    return problems
