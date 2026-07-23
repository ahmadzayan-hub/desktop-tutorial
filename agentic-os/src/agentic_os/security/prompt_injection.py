"""Prompt-injection detection over untrusted content (spec section 18).

All retrieved content — files, PDFs, emails, web pages, tool output, memory
retrieval — is untrusted data. This module detects instruction-override
attempts so they can be logged and refused. Detection is TECHNICALLY-ENFORCED
only where callers route untrusted text through :func:`detect`; the routing
itself is policy for a human/LLM operator (see guardrails.md).
"""

from __future__ import annotations

import re
from dataclasses import dataclass

INJECTION_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("ignore-instructions", re.compile(
        r"(?i)\b(ignore|disregard|forget)\b.{0,40}\b(previous|prior|above|earlier|all)\b"
        r".{0,40}\b(instruction|prompt|rule|guideline)s?\b")),
    ("reveal-prompt", re.compile(
        r"(?i)\b(reveal|show|print|repeat|output)\b.{0,40}\b(system prompt|hidden prompt|"
        r"initial instructions|your instructions)\b")),
    ("reveal-credentials", re.compile(
        r"(?i)\b(reveal|show|print|send|exfiltrate|leak)\b.{0,40}\b(secret|credential|"
        r"api[_ -]?key|token|password|\.env)\b")),
    ("upload-exfiltrate", re.compile(
        r"(?i)\b(upload|post|send|transmit)\b.{0,50}\b(file|content|data|repo)\b"
        r".{0,50}\b(to|towards)\b.{0,50}(http|ftp|server|endpoint|url)")),
    ("hidden-command", re.compile(
        r"(?i)\b(execute|run|eval)\b.{0,30}\b(hidden|embedded|following|this)\b"
        r".{0,30}\b(command|script|shell|code)\b")),
    ("disable-verification", re.compile(
        r"(?i)\b(skip|disable|bypass|turn off)\b.{0,40}\b(verification|verifier|checks?|"
        r"validation|guardrails?|safety)\b")),
    ("change-guardrails", re.compile(
        r"(?i)\b(edit|change|modify|overwrite|rewrite)\b.{0,40}\b(guardrails?\.md|os\.md|"
        r"approval[- ]policy|security\.yaml|domains\.yaml)\b")),
    ("cross-domain", re.compile(
        r"(?i)\b(read|access|copy|use)\b.{0,50}\b(another|other|different)\b"
        r".{0,20}\bdomain'?s?\b")),
    ("install-packages", re.compile(
        r"(?i)\b(pip|npm|apt|brew|uv)\b.{0,15}\binstall\b")),
    ("send-external", re.compile(
        r"(?i)\b(email|e-mail|message|dm|post)\b.{0,40}"
        r"\b(this|the (file|content|data|report))\b.{0,40}\b(to|at)\b")),
    ("destroy-data", re.compile(
        r"(?i)\b(delete|remove|wipe|encrypt|destroy)\b.{0,40}\b(all|every|the)\b"
        r".{0,30}\b(files?|data|repo|backups?|history)\b")),
    ("new-system-role", re.compile(
        r"(?i)\byou are now\b|\bnew (system )?instructions?:\b|\bact as (the )?system\b")),
]


@dataclass
class InjectionFinding:
    """One detected instruction-override attempt in untrusted content."""

    pattern_name: str
    line_number: int
    excerpt: str


def detect(text: str) -> list[InjectionFinding]:
    """Return all injection findings in a block of untrusted text."""
    findings: list[InjectionFinding] = []
    for lineno, line in enumerate(text.splitlines(), start=1):
        for name, pattern in INJECTION_PATTERNS:
            match = pattern.search(line)
            if match:
                findings.append(InjectionFinding(name, lineno, match.group(0)[:120]))
    return findings


def is_suspicious(text: str) -> bool:
    """Convenience wrapper: any finding at all."""
    return bool(detect(text))
