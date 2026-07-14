"""Evidence-bundle completeness checks (spec section 14)."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

REQUIRED_BUNDLE_FIELDS = (
    "verification_scope", "source_manifest", "calculations", "assumptions",
    "inferences", "unverified_items", "verification_date",
)
REQUIRED_SOURCE_FIELDS = (
    "source_id", "source_type", "title_or_file", "location",
    "retrieved_or_accessed", "supports_claims", "freshness", "authority_level",
)


def check_bundle(bundle: dict[str, Any]) -> list[str]:
    """Structural problems with an evidence bundle (empty = pass)."""
    problems = [f"evidence bundle missing '{f}'" for f in REQUIRED_BUNDLE_FIELDS
                if f not in bundle]
    for i, source in enumerate(bundle.get("source_manifest", [])):
        problems.extend(
            f"source[{i}] missing '{f}'" for f in REQUIRED_SOURCE_FIELDS
            if f not in source
        )
    return problems


def expired_sources(bundle: dict[str, Any], now_iso: str | None = None) -> list[str]:
    """Sources past ``valid_until`` — they may not support current claims."""
    now = now_iso or datetime.now(UTC).isoformat()
    expired: list[str] = []
    for source in bundle.get("source_manifest", []):
        valid_until = source.get("valid_until")
        if valid_until and str(valid_until) < now:
            expired.append(source.get("source_id", "?"))
    return expired
