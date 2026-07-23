"""Secret detection and redaction (spec section 19).

Secrets must never live in markdown, source, logs, prompts, fixtures, memory,
or git history. Findings are redacted as ``[REDACTED-SECRET]``.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

REDACTION = "[REDACTED-SECRET]"

# (name, compiled pattern) — patterns target values, not variable names alone.
SECRET_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("aws-access-key", re.compile(r"\b(AKIA|ASIA)[0-9A-Z]{16}\b")),
    ("private-key-block", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("github-token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}\b")),
    ("slack-token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")),
    ("openai-style-key", re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b")),
    ("anthropic-key", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b")),
    ("jwt", re.compile(
        r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b")),
    ("telegram-bot-token", re.compile(r"\b\d{8,10}:AA[A-Za-z0-9_-]{30,}\b")),
    (
        "generic-assignment",
        re.compile(
            r"(?i)\b(api[_-]?key|secret|token|passwd|password)\b\s*[:=]\s*"
            r"['\"]([A-Za-z0-9+/_\-]{16,})['\"]"
        ),
    ),
]

_SKIP_DIRS = {".git", "node_modules", "dist", "__pycache__", ".venv", "_compacted",
              ".pytest_cache", ".ruff_cache", "*.egg-info"}
_TEXT_SUFFIXES = {
    ".py", ".md", ".txt", ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg",
    ".js", ".ts", ".tsx", ".kt", ".sh", ".env", ".html", ".css", ".xml",
}


@dataclass
class SecretFinding:
    """One candidate secret occurrence."""

    pattern_name: str
    path: str
    line_number: int
    redacted_line: str


def redact(text: str) -> str:
    """Replace every candidate secret value with the redaction token."""
    for _, pattern in SECRET_PATTERNS:
        text = pattern.sub(REDACTION, text)
    return text


def scan_text(text: str, source: str = "<text>") -> list[SecretFinding]:
    """Scan a string and report findings with values already redacted."""
    findings: list[SecretFinding] = []
    for lineno, line in enumerate(text.splitlines(), start=1):
        for name, pattern in SECRET_PATTERNS:
            if pattern.search(line):
                findings.append(
                    SecretFinding(name, source, lineno, redact(line.strip())[:200])
                )
    return findings


def scan_path(root: Path) -> list[SecretFinding]:
    """Recursively scan text files under *root*, skipping vendor/VCS dirs."""
    findings: list[SecretFinding] = []
    for path in sorted(root.rglob("*")):
        if any(part in _SKIP_DIRS for part in path.parts):
            continue
        if not path.is_file() or path.is_symlink():
            continue
        if path.suffix.lower() not in _TEXT_SUFFIXES and path.name != ".env.example":
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        findings.extend(scan_text(text, str(path)))
    return findings
