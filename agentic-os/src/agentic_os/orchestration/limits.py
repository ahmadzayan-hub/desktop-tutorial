"""Hard limits and stop conditions (spec section 24)."""

from __future__ import annotations

import time
from dataclasses import dataclass, field

from agentic_os.exceptions import LimitExceededError
from agentic_os.models.task import DEFAULT_LIMITS


@dataclass
class LimitTracker:
    """Tracks consumption against a task's hard limits.

    Every ``record_*`` call raises :class:`LimitExceededError` the moment a
    ceiling is crossed, which is a mandatory stop condition.
    """

    max_agent_turns: int = DEFAULT_LIMITS["max_agent_turns"]
    max_tool_calls: int = DEFAULT_LIMITS["max_tool_calls"]
    max_retries: int = DEFAULT_LIMITS["max_retries"]
    max_heavy_calls: int = DEFAULT_LIMITS["max_heavy_calls"]
    max_runtime_seconds: int = DEFAULT_LIMITS["max_runtime_seconds"]
    started_at: float = field(default_factory=time.monotonic)
    agent_turns: int = 0
    tool_calls: int = 0
    retries: int = 0
    heavy_calls: int = 0
    _repeated_failures: dict[str, int] = field(default_factory=dict)

    def record_turn(self) -> None:
        self.agent_turns += 1
        self._check("agent turns", self.agent_turns, self.max_agent_turns)
        self.check_runtime()

    def record_tool_call(self) -> None:
        self.tool_calls += 1
        self._check("tool calls", self.tool_calls, self.max_tool_calls)

    def record_retry(self) -> None:
        self.retries += 1
        self._check("retries", self.retries, self.max_retries)

    def record_heavy_call(self) -> None:
        self.heavy_calls += 1
        self._check("heavy calls", self.heavy_calls, self.max_heavy_calls)

    def record_failure(self, signature: str) -> None:
        """Stop when the same failure repeats twice (spec section 24)."""
        count = self._repeated_failures.get(signature, 0) + 1
        self._repeated_failures[signature] = count
        if count >= 2:
            raise LimitExceededError(f"same failure repeated twice: {signature}")

    def check_runtime(self) -> None:
        elapsed = time.monotonic() - self.started_at
        if elapsed > self.max_runtime_seconds:
            raise LimitExceededError(
                f"runtime {elapsed:.0f}s exceeded max {self.max_runtime_seconds}s"
            )

    def _check(self, label: str, value: int, ceiling: int) -> None:
        if value > ceiling:
            raise LimitExceededError(f"{label} {value} exceeded limit {ceiling}")
