"""Domain classification of project paths (spec sections 5, 28).

Rules are conservative: anything not confidently matched is ``ask-me``.
"""

from __future__ import annotations

from dataclasses import dataclass

# (path-prefix, domain, classification, confident)
# Domain assignments below were owner-approved on 2026-07-14 (Checkpoint A):
# Lahza -> bcgt, Wisal family -> personal, legacy agent-os/ stays as system.
_RULES: list[tuple[str, str, str, bool]] = [
    ("agentic-os/", "system", "internal", True),
    (".github/", "system", "internal", True),
    ("docs/", "system", "internal", True),
    ("agent-os/", "system", "internal", True),       # legacy Wisal docs, kept in place
    ("landing/", "brand", "internal", True),          # Beyond Style UAE
    ("wisal-web/", "personal", "confidential", True),
    ("wisal-desktop/", "personal", "confidential", True),
    ("android-wife-assistant/", "personal", "confidential", True),
    ("telegram-wife-assistant/", "personal", "confidential", True),
    ("src/", "bcgt", "confidential", True),           # Lahza app
    ("public/", "bcgt", "confidential", True),
]

_ROOT_INFRA = {
    "package.json", "package-lock.json", "tsconfig.json", "vite.config.ts",
    "tailwind.config.ts", "postcss.config.js", "vercel.json", "netlify.toml",
    ".gitignore", ".env.example", ".mcp.json", "README.md", "PROJECTS.md",
    "index.html", "CLAUDE.md", "AGENTS.md",
}


@dataclass
class Classification:
    """Domain assignment for one path."""

    path: str
    domain: str
    classification: str
    ask_me: bool
    reason: str


def classify_path(path: str) -> Classification:
    """Assign exactly one domain to a path, or flag it ask-me."""
    for prefix, domain, level, confident in _RULES:
        if path.startswith(prefix):
            return Classification(
                path=path, domain=domain, classification=level,
                ask_me=not confident,
                reason=f"prefix rule {prefix!r}" + ("" if confident else " (low confidence)"),
            )
    name = path.rsplit("/", 1)[-1]
    if "/" not in path and name in _ROOT_INFRA:
        return Classification(path, "system", "internal", False, "root infrastructure file")
    return Classification(path, "system", "internal", True,
                          "no rule matched; needs owner decision")
