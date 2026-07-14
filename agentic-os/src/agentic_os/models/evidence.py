"""Evidence contract models (spec section 14)."""

from __future__ import annotations

from dataclasses import dataclass, field

from agentic_os.models.base import check_enum, check_nonempty

AUTHORITY_LEVELS = ("primary", "official-secondary", "internal", "informal")
FRESHNESS_CLASSES = ("static", "slow-changing", "dynamic", "real-time")


@dataclass
class SourceEntry:
    """One entry in a deliverable's source manifest."""

    source_id: str
    source_type: str
    title_or_file: str
    location: str
    retrieved_or_accessed: str
    supports_claims: str
    freshness: str
    authority_level: str
    limitations: str = ""

    def __post_init__(self) -> None:
        check_nonempty("source_id", self.source_id)
        check_nonempty("title_or_file", self.title_or_file)
        check_enum("authority_level", self.authority_level, AUTHORITY_LEVELS)


@dataclass
class EvidenceBundle:
    """Evidence attached to every fact-bearing deliverable."""

    verification_scope: str
    verification_date: str
    source_manifest: list[SourceEntry] = field(default_factory=list)
    calculations: list[str] = field(default_factory=list)
    assumptions: list[str] = field(default_factory=list)
    inferences: list[str] = field(default_factory=list)
    unverified_items: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        check_nonempty("verification_scope", self.verification_scope)
        check_nonempty("verification_date", self.verification_date)
