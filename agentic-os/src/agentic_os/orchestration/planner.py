"""Task creation and decomposition helpers used by the ORCHESTRATOR."""

from __future__ import annotations

from agentic_os.models.task import VALID_DOMAINS, Task
from agentic_os.utils.dates import today_stamp, utc_now_iso

DOMAIN_DEFAULT_CLASSIFICATION = {
    "system": "internal",
    "rta": "restricted",
    "bcgt": "confidential",
    "mba": "internal",
    "brand": "internal",
    "personal": "confidential",
}


def next_task_id(existing_ids: list[str]) -> str:
    """Allocate the next TASK-YYYYMMDD-NNN for today."""
    stamp = today_stamp()
    prefix = f"TASK-{stamp}-"
    todays = [int(t.rsplit("-", 1)[1]) for t in existing_ids if t.startswith(prefix)]
    return f"{prefix}{(max(todays) + 1 if todays else 1):03d}"


def new_task(
    title: str,
    domain: str,
    existing_ids: list[str],
    requested_by: str = "Ahmed Zaian",
    **overrides: object,
) -> Task:
    """Build a validated Task with domain-default classification."""
    if domain not in VALID_DOMAINS:
        raise ValueError(f"invalid domain {domain!r}; valid: {VALID_DOMAINS}")
    fields: dict[str, object] = {
        "task_id": next_task_id(existing_ids),
        "title": title,
        "domain": domain,
        "classification": DOMAIN_DEFAULT_CLASSIFICATION[domain],
        "requested_by": requested_by,
        "created": utc_now_iso(),
    }
    fields.update(overrides)
    return Task(**fields)  # type: ignore[arg-type]


def split_cross_domain(title: str, domains: list[str]) -> list[tuple[str, str]]:
    """Decompose a multi-domain request into isolated per-domain subtasks.

    Returns ``(subtask_title, domain)`` pairs. Information transfer between
    the resulting tasks must go through the controlled exchange workflow.
    """
    unknown = [d for d in domains if d not in VALID_DOMAINS]
    if unknown:
        raise ValueError(f"invalid domains: {unknown}")
    if len(set(domains)) <= 1:
        return [(title, domains[0])] if domains else []
    return [(f"{title} [{d} scope only]", d) for d in dict.fromkeys(domains)]
