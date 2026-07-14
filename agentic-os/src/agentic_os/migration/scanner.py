"""Read-only project scanner (spec sections 28, 40 Phase 0)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from agentic_os.utils.hashing import sha256_file

SKIP_DIRS = {".git", "node_modules", "dist", "__pycache__", ".venv",
             ".pytest_cache", ".ruff_cache", ".gradle", "build"}
LARGE_BINARY_BYTES = 1_000_000
GENERATED_NAMES = {"package-lock.json", "yarn.lock", "uv.lock", "gradlew.bat"}


@dataclass
class FileEntry:
    """One inventoried file."""

    path: str  # relative to project root, posix separators
    size: int
    sha256: str
    is_symlink: bool
    is_large_binary: bool
    is_generated: bool


@dataclass
class Inventory:
    """Full read-only scan result."""

    root: str
    files: list[FileEntry]

    @property
    def duplicates_by_name(self) -> dict[str, list[str]]:
        """File names appearing in more than one directory."""
        seen: dict[str, list[str]] = {}
        for entry in self.files:
            seen.setdefault(Path(entry.path).name, []).append(entry.path)
        return {k: v for k, v in seen.items() if len(v) > 1}

    @property
    def symlinks(self) -> list[str]:
        return [f.path for f in self.files if f.is_symlink]


def scan(root: Path, skip_extra: set[str] | None = None) -> Inventory:
    """Walk the tree read-only and hash every regular file."""
    skip = SKIP_DIRS | (skip_extra or set())
    files: list[FileEntry] = []
    for path in sorted(root.rglob("*")):
        rel_parts = path.relative_to(root).parts
        if any(part in skip for part in rel_parts):
            continue
        if path.is_symlink():
            files.append(FileEntry(path.relative_to(root).as_posix(), 0, "", True,
                                   False, False))
            continue
        if not path.is_file():
            continue
        size = path.stat().st_size
        files.append(
            FileEntry(
                path=path.relative_to(root).as_posix(),
                size=size,
                sha256=sha256_file(path),
                is_symlink=False,
                is_large_binary=size > LARGE_BINARY_BYTES,
                is_generated=path.name in GENERATED_NAMES,
            )
        )
    return Inventory(root=str(root), files=files)
