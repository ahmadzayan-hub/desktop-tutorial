"""Migration executor: small verified batches, never deletes (spec section 28)."""

from __future__ import annotations

import shutil
from dataclasses import dataclass, field
from pathlib import Path

from agentic_os.exceptions import ApprovalRequiredError, MigrationError
from agentic_os.migration.planner import MapRow, MigrationMap
from agentic_os.utils.hashing import sha256_file

BATCH_SIZE = 25


@dataclass
class ExecutionResult:
    """Outcome of a migrate run."""

    dry_run: bool
    executed: list[str] = field(default_factory=list)
    skipped: list[str] = field(default_factory=list)
    rollback_entries: list[tuple[str, str]] = field(default_factory=list)  # (dst, src)


def execute(
    mig_map: MigrationMap,
    project_root: Path,
    *,
    approved: bool,
    dry_run: bool = True,
) -> ExecutionResult:
    """Apply copy/move/archive/rename rows in verified batches.

    ``keep`` rows are no-ops; ``ask-me`` rows are always skipped; delete does
    not exist. A real run requires Checkpoint A approval.
    """
    if not dry_run and not approved:
        raise ApprovalRequiredError(
            "migration execution requires Checkpoint A approval of the migration map"
        )
    result = ExecutionResult(dry_run=dry_run)
    changing = mig_map.changing_rows
    for start in range(0, len(changing), BATCH_SIZE):
        batch = changing[start:start + BATCH_SIZE]
        for row in batch:
            result.executed.append(f"{row.action}: {row.current_path} -> {row.proposed_path}")
            if not dry_run:
                _apply(row, project_root)
                result.rollback_entries.append((row.proposed_path, row.current_path))
        if not dry_run:
            _verify_batch(batch, project_root)
    result.skipped = [r.current_path for r in mig_map.ask_me_rows]
    return result


def _apply(row: MapRow, root: Path) -> None:
    src = root / row.current_path
    dst = root / row.proposed_path
    if not src.exists():
        raise MigrationError(f"source missing: {row.current_path}")
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists() and row.action != "copy":
        raise MigrationError(f"destination exists, refusing to overwrite: {dst}")
    if row.action == "copy":
        shutil.copy2(src, dst)
    elif row.action in ("move", "archive", "rename"):
        shutil.move(str(src), str(dst))
    else:  # pragma: no cover - planner validates actions
        raise MigrationError(f"unsupported action {row.action!r}")


def _verify_batch(batch: list[MapRow], root: Path) -> None:
    """Hash-compare every migrated file against its inventory hash."""
    for row in batch:
        dst = root / row.proposed_path
        if not dst.is_file():
            raise MigrationError(f"post-migration check failed, missing: {dst}")
        if row.hash and sha256_file(dst) != row.hash:
            raise MigrationError(f"post-migration hash mismatch: {dst}")
