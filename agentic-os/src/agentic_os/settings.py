"""Central settings loaded from ``config/*.yaml`` (spec sections 21, 25, 37)."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from agentic_os.utils import yaml_io
from agentic_os.utils.paths import find_os_root


@dataclass
class Settings:
    """Resolved runtime settings with secure defaults."""

    os_root: Path
    default_environment: str = "sandbox"
    production_actions_enabled: bool = False
    external_actions_enabled: bool = False
    per_session_cost_ceiling: float | None = None
    weekly_cost_ceiling: float | None = None
    heavy_call_limit_per_session: int = 3
    currency: str = "USD"
    timezone: str = "Asia/Dubai"
    raw: dict[str, dict[str, Any]] = field(default_factory=dict)


def _num_or_none(value: Any) -> float | None:
    if isinstance(value, (int, float)):
        return float(value)
    return None  # "TODO" or missing -> no ceiling configured yet


def load_settings(os_root: Path | None = None) -> Settings:
    """Load every config file that exists; missing files keep secure defaults."""
    root = os_root or find_os_root()
    raw: dict[str, dict[str, Any]] = {}
    config_dir = root / "config"
    for name in ("models", "routing", "budgets", "domains", "approval-policy",
                 "verification", "security", "environments", "logging"):
        path = config_dir / f"{name}.yaml"
        raw[name] = yaml_io.load(path) if path.is_file() else {}
    envs = raw.get("environments", {})
    budgets = raw.get("budgets", {})
    return Settings(
        os_root=root,
        default_environment=str(envs.get("default-environment", "sandbox")),
        production_actions_enabled=bool(envs.get("production-actions-enabled", False)),
        external_actions_enabled=bool(envs.get("external-actions-enabled", False)),
        per_session_cost_ceiling=_num_or_none(budgets.get("per-session-cost-ceiling")),
        weekly_cost_ceiling=_num_or_none(budgets.get("weekly-cost-ceiling")),
        heavy_call_limit_per_session=int(budgets.get("heavy-call-limit-per-session", 3)),
        currency=str(budgets.get("cost-currency", "USD")),
        raw=raw,
    )
