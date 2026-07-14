"""Content hashing used by migration safety and file-integrity checks."""

from __future__ import annotations

import hashlib
from pathlib import Path


def sha256_text(text: str) -> str:
    """SHA-256 hex digest of a string."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_file(path: Path) -> str:
    """SHA-256 hex digest of a file, streamed in 64 KiB chunks."""
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()
