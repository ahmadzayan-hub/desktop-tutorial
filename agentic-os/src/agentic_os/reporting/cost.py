"""Cost governance (spec section 25). Costs are never fabricated."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

from agentic_os.exceptions import LimitExceededError
from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.utils.dates import utc_now, utc_now_iso


def record_llm_call(
    store: SqliteStore,
    *,
    task_id: str | None,
    role: str,
    model: str,
    provider: str,
    usage_type: str,
    input_units: int | None = None,
    output_units: int | None = None,
    estimated_cost: str = "unavailable",
    actual_cost: str = "unavailable",
    currency: str = "USD",
    calculation_basis: str = "",
    confidence: str = "low",
) -> None:
    """Append one ledger entry; subscription usage records cost unavailable."""
    if usage_type == "subscription":
        actual_cost = "unavailable"
    store.record_cost(
        {
            "task_id": task_id, "date": utc_now_iso(), "role": role, "model": model,
            "provider": provider, "usage_type": usage_type,
            "input_units": input_units, "output_units": output_units,
            "estimated_cost": estimated_cost, "actual_cost": actual_cost,
            "currency": currency, "calculation_basis": calculation_basis,
            "confidence": confidence,
        }
    )


def weekly_totals(store: SqliteStore) -> dict[str, Any]:
    """Measured/estimated totals for the trailing 7 days."""
    since = (utc_now() - timedelta(days=7)).isoformat(timespec="seconds")
    events = store.cost_events_since(since)
    measured = 0.0
    estimated = 0.0
    unavailable = 0
    for event in events:
        for key, bucket in (("actual_cost", "measured"), ("estimated_cost", "estimated")):
            value = event.get(key, "unavailable")
            try:
                amount = float(value)
            except (TypeError, ValueError):
                if key == "actual_cost":
                    unavailable += 1
                continue
            if bucket == "measured":
                measured += amount
            else:
                estimated += amount
    return {"calls": len(events), "measured_usd": measured,
            "estimated_usd": estimated, "actual_unavailable": unavailable}


def weekly_cost_line(store: SqliteStore) -> str:
    """One /status line; says 'cost unavailable' rather than inventing."""
    totals = weekly_totals(store)
    if totals["calls"] == 0:
        return "Weekly cost: no LLM calls recorded"
    if totals["measured_usd"] > 0:
        return (f"Weekly cost: {totals['measured_usd']:.2f} USD measured"
                f" ({totals['calls']} calls)")
    if totals["estimated_usd"] > 0:
        return (f"Weekly cost: ~{totals['estimated_usd']:.2f} USD estimated"
                f" ({totals['calls']} calls)")
    return f"Weekly cost: cost unavailable ({totals['calls']} calls, subscription/unknown)"


def check_session_ceiling(spent_usd: float, ceiling_usd: float | None) -> None:
    """Stop before exceeding the configured session ceiling."""
    if ceiling_usd is not None and spent_usd >= ceiling_usd:
        raise LimitExceededError(
            f"session cost {spent_usd:.2f} USD reached ceiling {ceiling_usd:.2f} USD"
        )
