"""Approval gates and safe command classification (spec sections 3, 4, 22)."""

from __future__ import annotations

import re

from agentic_os.exceptions import ApprovalRequiredError

# Action classes per spec section 22.
READ_ONLY = "read-only"
REVERSIBLE = "reversible-write"
ENV_CHANGING = "environment-changing"
EXTERNAL_DESTRUCTIVE = "external-or-destructive"

ACTION_CLASSES = (READ_ONLY, REVERSIBLE, ENV_CHANGING, EXTERNAL_DESTRUCTIVE)

# Checkpoint mapping: which action classes require which checkpoint.
CHECKPOINT_FOR_CLASS = {
    ENV_CHANGING: "C",
    EXTERNAL_DESTRUCTIVE: "D",
}

_DESTRUCTIVE_RE = re.compile(
    r"(^|\s|;|&&|\|\|)\s*(rm\s|rmdir|del\s|shred|truncate\s|git\s+push\s+.*--force"
    r"|git\s+push\s+-f\b|drop\s+table|drop\s+database|mkfs|dd\s+if=|:>\s|curl\s+.*-X\s*"
    r"(POST|PUT|DELETE)|mail\s|sendmail|deploy|publish)",
    re.IGNORECASE,
)
_ENV_CHANGING_RE = re.compile(
    r"(^|\s|;|&&|\|\|)\s*(pip3?\s+install|npm\s+i(nstall)?\b|uv\s+(pip|add)|apt(-get)?\s+install"
    r"|brew\s+install|alembic\s+upgrade|.*\bmigrate\b|systemctl|service\s|crontab"
    r"|docker\s+(run|build)|terraform|kubectl\s+(apply|create|delete))",
    re.IGNORECASE,
)
_WRITE_RE = re.compile(
    r"(^|\s|;|&&|\|\|)\s*(git\s+(add|commit|checkout\s+-b|switch\s+-c|merge)|touch\s|mkdir"
    r"|cp\s|mv\s|tee\s|sed\s+-i|echo\s+.*>)",
    re.IGNORECASE,
)


def classify_command(command: str) -> str:
    """Classify a shell command into one of the four action classes.

    Heuristic and deliberately conservative: destructive patterns win over
    environment-changing, which win over reversible writes; anything not
    matched is treated as read-only ONLY if it also matches no write pattern.
    Unknown commands default to reversible-write (never silently read-only
    destructive).
    """
    if _DESTRUCTIVE_RE.search(command):
        return EXTERNAL_DESTRUCTIVE
    if _ENV_CHANGING_RE.search(command):
        return ENV_CHANGING
    if _WRITE_RE.search(command):
        return REVERSIBLE
    known_read_only = re.match(
        r"^\s*(ls|cat|head|tail|grep|rg|find|git\s+(status|log|diff|show|branch)"
        r"|pytest|python3?\s+-m\s+pytest|ruff\s+check|wc|stat|file|du|df)\b",
        command,
    )
    return READ_ONLY if known_read_only else REVERSIBLE


def requires_approval(action_class: str, autonomy_level: str) -> bool:
    """Whether an action needs explicit approval under the given autonomy."""
    if autonomy_level == "prohibited":
        return True
    if action_class in (ENV_CHANGING, EXTERNAL_DESTRUCTIVE):
        return True  # Checkpoints C and D always require approval
    if action_class == REVERSIBLE:
        return autonomy_level in ("observe",)
    return False


def assert_approved(
    action_class: str, autonomy_level: str, approval_status: str, action: str
) -> None:
    """Gate an action: raise unless approval requirements are satisfied."""
    if autonomy_level == "prohibited":
        raise ApprovalRequiredError(f"action prohibited by policy: {action}")
    if requires_approval(action_class, autonomy_level) and approval_status != "approved":
        checkpoint = CHECKPOINT_FOR_CLASS.get(action_class, "task-scope")
        raise ApprovalRequiredError(
            f"{action_class} action needs approval (checkpoint {checkpoint}): {action}"
        )
