"""Strict domain isolation over the knowledge tree (spec sections 5, 6).

One domain must never read another domain's knowledge. Cross-domain movement
happens only via the controlled exchange workflow under ``exchange/``.
"""

from __future__ import annotations

from pathlib import Path, PurePosixPath

from agentic_os.exceptions import DomainIsolationError
from agentic_os.models.task import VALID_DOMAINS

KNOWLEDGE_ROOT = PurePosixPath("brain/knowledge")


def knowledge_domain_of(path: str | Path) -> str | None:
    """Domain owning a path under ``brain/knowledge/<domain>/``, else None."""
    parts = PurePosixPath(str(path).replace("\\", "/")).parts
    for i in range(len(parts) - 2):
        if parts[i] == "brain" and parts[i + 1] == "knowledge":
            candidate = parts[i + 2]
            return candidate if candidate in VALID_DOMAINS else None
    return None


def check_read_access(task_domain: str, path: str | Path) -> None:
    """Deny reads of another domain's knowledge.

    Paths outside ``brain/knowledge`` are not domain-partitioned here and are
    governed by tool read scopes instead.
    """
    owner = knowledge_domain_of(path)
    if owner is not None and owner != task_domain:
        raise DomainIsolationError(
            f"task in domain {task_domain!r} may not read {owner!r} knowledge: {path}"
        )


def check_write_access(task_domain: str, path: str | Path) -> None:
    """Deny writes into another domain's knowledge (or unpartitioned writes
    into a domain folder from a task without that domain)."""
    owner = knowledge_domain_of(path)
    if owner is not None and owner != task_domain:
        raise DomainIsolationError(
            f"task in domain {task_domain!r} may not write {owner!r} knowledge: {path}"
        )


def check_transfer(source_domain: str, destination_domain: str, approved: bool) -> None:
    """Cross-domain transfer is allowed only via an approved exchange record."""
    if source_domain == destination_domain:
        return
    if source_domain not in VALID_DOMAINS or destination_domain not in VALID_DOMAINS:
        raise DomainIsolationError("transfer involves an unknown domain")
    if not approved:
        raise DomainIsolationError(
            f"cross-domain transfer {source_domain} -> {destination_domain} requires "
            "an approved exchange record (see agentic-os/exchange/)"
        )
