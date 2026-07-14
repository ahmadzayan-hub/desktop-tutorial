"""Risk register entry (spec section 30)."""

from __future__ import annotations

from dataclasses import dataclass

from agentic_os.models.base import check_enum, check_nonempty
from agentic_os.models.task import VALID_DOMAINS

LEVELS = ("high", "medium", "low")


@dataclass
class Risk:
    """One tracked risk with scoring and controls."""

    risk_id: str
    description: str
    domain: str
    cause: str
    consequence: str
    likelihood: str
    impact: str
    detectability: str
    controls: str
    owner: str
    residual_risk: str
    review_date: str
    status: str = "open"

    def __post_init__(self) -> None:
        check_nonempty("risk_id", self.risk_id)
        check_nonempty("description", self.description)
        check_enum("domain", self.domain, VALID_DOMAINS)
        check_enum("likelihood", self.likelihood, LEVELS)
        check_enum("impact", self.impact, LEVELS)
        check_enum("status", self.status, ("open", "mitigated", "accepted", "closed"))

    @property
    def risk_score(self) -> int:
        """Simple 1-9 score: likelihood x impact (low=1, medium=2, high=3)."""
        scale = {"low": 1, "medium": 2, "high": 3}
        return scale[self.likelihood] * scale[self.impact]
