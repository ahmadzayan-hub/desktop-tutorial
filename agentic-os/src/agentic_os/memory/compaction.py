"""Weekly session-log compaction (spec section 27).

Summarize logs older than the latest five (max 10 lines each), move the
original into ``sessions/_compacted/`` (never delete), link summary to source.
"""

from __future__ import annotations

import shutil
from dataclasses import dataclass
from pathlib import Path

from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.utils.dates import utc_now_iso

KEEP_LATEST = 5
SUMMARY_MAX_LINES = 10


@dataclass
class CompactionResult:
    """What one compaction run did."""

    compacted: list[str]
    kept: int


def _summarize(text: str, source_name: str) -> str:
    """Deterministic extractive summary: headings + first content lines."""
    picked: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("---"):
            continue
        if stripped.startswith("#") or len(picked) < 3:
            picked.append(stripped.lstrip("# "))
        if len(picked) >= SUMMARY_MAX_LINES - 1:
            break
    picked.append(f"(source: sessions/_compacted/{source_name})")
    return "\n".join(f"- {p}" for p in picked[:SUMMARY_MAX_LINES])


def compact_sessions(
    store: SqliteStore, sessions_dir: Path, archive_summaries: Path
) -> CompactionResult:
    """Compact all but the latest ``KEEP_LATEST`` raw session logs."""
    compacted_dir = sessions_dir / "_compacted"
    compacted_dir.mkdir(parents=True, exist_ok=True)
    logs = sorted(
        p for p in sessions_dir.glob("*.md") if p.is_file() and not p.name.startswith("_")
    )
    to_compact = logs[:-KEEP_LATEST] if len(logs) > KEEP_LATEST else []
    done: list[str] = []
    for log in to_compact:
        summary = _summarize(log.read_text(encoding="utf-8"), log.name)
        with archive_summaries.open("a", encoding="utf-8") as fh:
            fh.write(f"\n## {log.name} (compacted {utc_now_iso()[:10]})\n{summary}\n")
        shutil.move(str(log), str(compacted_dir / log.name))
        store.mark_session_compacted(f"sessions/{log.name}")
        done.append(log.name)
    return CompactionResult(compacted=done, kept=len(logs) - len(done))
