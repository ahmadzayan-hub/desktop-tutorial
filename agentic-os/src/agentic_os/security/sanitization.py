"""Sanitization for controlled cross-domain exports (spec section 6)."""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from agentic_os.security.secrets import redact

_EMAIL_RE = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.]+\b")
_PHONE_RE = re.compile(r"(?<!\w)\+?\d[\d\s().-]{7,}\d(?!\w)")
_EMIRATES_ID_RE = re.compile(r"\b784-?\d{4}-?\d{7}-?\d\b")


@dataclass
class SanitizationReport:
    """What was removed before a cross-domain export."""

    secrets_redacted: bool = False
    emails_removed: int = 0
    phones_removed: int = 0
    ids_removed: int = 0
    notes: list[str] = field(default_factory=list)


def sanitize_for_export(text: str) -> tuple[str, SanitizationReport]:
    """Strip secrets and personal identifiers from an export candidate.

    This is a mechanical minimum; the sanitized extract must still go through
    confidentiality review and explicit approval before leaving its domain.
    """
    report = SanitizationReport()
    redacted = redact(text)
    report.secrets_redacted = redacted != text
    redacted, report.ids_removed = _EMIRATES_ID_RE.subn("[REDACTED-ID]", redacted)
    redacted, report.emails_removed = _EMAIL_RE.subn("[REDACTED-EMAIL]", redacted)
    redacted, report.phones_removed = _PHONE_RE.subn("[REDACTED-PHONE]", redacted)
    if report.secrets_redacted:
        report.notes.append("candidate secrets were redacted; investigate the source")
    return redacted, report
