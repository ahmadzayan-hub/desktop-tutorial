"""Migration map builder (spec section 28)."""

from __future__ import annotations

from dataclasses import dataclass, field

from agentic_os.migration.classifier import classify_path
from agentic_os.migration.scanner import Inventory

VALID_ACTIONS = ("keep", "copy", "move", "archive", "rename", "ask-me")


@dataclass
class MapRow:
    """One migration-map row (columns per spec section 28)."""

    current_path: str
    proposed_path: str
    domain: str
    classification: str
    action: str
    reason: str
    conflict: str
    hash: str
    rollback: str

    def __post_init__(self) -> None:
        if self.action not in VALID_ACTIONS:
            raise ValueError(f"invalid migration action: {self.action!r}")


@dataclass
class MigrationMap:
    """Full migration plan; default action is keep (nothing is deleted)."""

    rows: list[MapRow] = field(default_factory=list)

    @property
    def ask_me_rows(self) -> list[MapRow]:
        return [r for r in self.rows if r.action == "ask-me"]

    @property
    def changing_rows(self) -> list[MapRow]:
        return [r for r in self.rows if r.action in ("copy", "move", "archive", "rename")]


def build_map(inventory: Inventory) -> MigrationMap:
    """Plan the migration: every file keeps its place unless a rule says
    otherwise; low-confidence classifications become ask-me rows."""
    duplicate_names = inventory.duplicates_by_name
    rows: list[MapRow] = []
    for entry in inventory.files:
        cls = classify_path(entry.path)
        name = entry.path.rsplit("/", 1)[-1]
        conflict = "duplicate-name" if name in duplicate_names else ""
        action = "ask-me" if cls.ask_me else "keep"
        rows.append(
            MapRow(
                current_path=entry.path,
                proposed_path=entry.path,
                domain=cls.domain,
                classification=cls.classification,
                action=action,
                reason=cls.reason,
                conflict=conflict,
                hash=entry.sha256,
                rollback="n/a (file not moved)",
            )
        )
    return MigrationMap(rows=rows)


def to_markdown_table(mig_map: MigrationMap, limit: int | None = None) -> str:
    """Render the map as a markdown table."""
    header = ("| Current path | Proposed path | Domain | Classification | Action |"
              " Reason | Conflict | Hash | Rollback |\n"
              "| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    rows = mig_map.rows[:limit] if limit else mig_map.rows
    lines = [header]
    for r in rows:
        lines.append(
            f"| {r.current_path} | {r.proposed_path} | {r.domain} |"
            f" {r.classification} | {r.action} | {r.reason} | {r.conflict} |"
            f" {r.hash[:12]} | {r.rollback} |"
        )
    return "\n".join(lines)
