"""Artifact manifest model — produced files with integrity hashes."""

from __future__ import annotations

from dataclasses import dataclass

from agentic_os.models.base import check_enum, check_nonempty
from agentic_os.models.task import VALID_CLASSIFICATIONS, VALID_DOMAINS


@dataclass
class ArtifactManifest:
    """One produced artifact, tied to a task and integrity-hashed."""

    artifact_id: str
    task_id: str
    path: str
    domain: str
    classification: str
    sha256: str
    created: str
    description: str = ""

    def __post_init__(self) -> None:
        check_nonempty("artifact_id", self.artifact_id)
        check_nonempty("path", self.path)
        check_enum("domain", self.domain, VALID_DOMAINS)
        check_enum("classification", self.classification, VALID_CLASSIFICATIONS)
        if len(self.sha256) != 64:
            raise ValueError("sha256 must be a 64-char hex digest")
