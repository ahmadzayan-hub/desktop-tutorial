"""Date helpers: UTC internally, Asia/Dubai for display."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta, timezone

try:  # zoneinfo ships with CPython >= 3.9 but tzdata may be absent on Windows
    from zoneinfo import ZoneInfo

    DUBAI = ZoneInfo("Asia/Dubai")
except Exception:  # pragma: no cover - fallback for missing tzdata
    DUBAI = timezone(timedelta(hours=4), name="Asia/Dubai")


def utc_now() -> datetime:
    """Current time as an aware UTC datetime."""
    return datetime.now(UTC)


def utc_now_iso() -> str:
    """Current UTC time in ISO-8601 with seconds precision."""
    return utc_now().isoformat(timespec="seconds")


def today_stamp() -> str:
    """UTC date as YYYYMMDD, used in task IDs."""
    return utc_now().strftime("%Y%m%d")


def display_dubai(iso_utc: str) -> str:
    """Render a stored UTC ISO timestamp in Asia/Dubai for humans."""
    dt = datetime.fromisoformat(iso_utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt.astimezone(DUBAI).strftime("%Y-%m-%d %H:%M (%Z)")
