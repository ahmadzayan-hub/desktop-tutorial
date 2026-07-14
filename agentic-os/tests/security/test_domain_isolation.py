"""Domain-isolation tests (spec sections 5, 6, 36)."""

import pytest

from agentic_os.exceptions import DomainIsolationError
from agentic_os.security.domain_isolation import (
    check_read_access,
    check_transfer,
    check_write_access,
    knowledge_domain_of,
)


def test_domain_detection() -> None:
    assert knowledge_domain_of("agentic-os/brain/knowledge/rta/notes.md") == "rta"
    assert knowledge_domain_of("brain/knowledge/brand/logo.md") == "brand"
    assert knowledge_domain_of("src/app.py") is None


def test_cross_domain_read_blocked() -> None:
    with pytest.raises(DomainIsolationError):
        check_read_access("brand", "brain/knowledge/rta/ops.md")


def test_same_domain_read_allowed() -> None:
    check_read_access("rta", "brain/knowledge/rta/ops.md")


def test_cross_domain_write_blocked() -> None:
    with pytest.raises(DomainIsolationError):
        check_write_access("mba", "brain/knowledge/personal/journal.md")


def test_unapproved_transfer_blocked() -> None:
    with pytest.raises(DomainIsolationError):
        check_transfer("rta", "brand", approved=False)


def test_approved_transfer_allowed() -> None:
    check_transfer("rta", "brand", approved=True)


def test_same_domain_transfer_free() -> None:
    check_transfer("system", "system", approved=False)
