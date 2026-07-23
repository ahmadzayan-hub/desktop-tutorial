"""Incident record (spec section 31)."""

from __future__ import annotations

from dataclasses import dataclass

from agentic_os.models.base import check_enum, check_nonempty
from agentic_os.models.task import VALID_DOMAINS

SEVERITIES = ("critical", "high", "medium", "low")


@dataclass
class Incident:
    """One incident with containment and corrective/preventive actions."""

    incident_id: str
    date: str
    task_id: str
    domain: str
    severity: str
    description: str
    detected_by: str
    affected_artifacts: str = ""
    affected_tools: str = ""
    containment: str = ""
    root_cause: str = ""
    corrective_action: str = ""
    preventive_action: str = ""
    owner: str = "Ahmed Zaian"
    status: str = "open"

    def __post_init__(self) -> None:
        check_nonempty("incident_id", self.incident_id)
        check_enum("domain", self.domain, VALID_DOMAINS)
        check_enum("severity", self.severity, SEVERITIES)
        check_enum("status", self.status, ("open", "contained", "resolved", "closed"))
        check_nonempty("description", self.description)
