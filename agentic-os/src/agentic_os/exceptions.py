"""Exception hierarchy for the Agentic OS.

Every error raised by this package derives from :class:`AgenticOSError` so
callers can distinguish OS failures from programming errors.
"""


class AgenticOSError(Exception):
    """Base class for all Agentic OS errors."""


class ConfigError(AgenticOSError):
    """Configuration file is missing, unparseable, or invalid."""


class StateTransitionError(AgenticOSError):
    """An invalid task state transition was attempted."""


class LockError(AgenticOSError):
    """A work lock could not be acquired or is in conflict."""


class ApprovalRequiredError(AgenticOSError):
    """The action requires explicit approval that has not been recorded."""


class LimitExceededError(AgenticOSError):
    """A hard limit (turns, tool calls, cost, runtime) was reached."""


class SecurityError(AgenticOSError):
    """Base class for security violations."""


class SecretDetectedError(SecurityError):
    """A candidate secret was found where secrets must not be stored."""


class InjectionDetectedError(SecurityError):
    """Untrusted content attempted to override instructions or policy."""


class DomainIsolationError(SecurityError):
    """A task attempted to cross a domain boundary without approval."""


class ToolPolicyError(AgenticOSError):
    """A tool call was denied by the tool governance policy."""


class VerificationError(AgenticOSError):
    """Verification could not be completed."""


class MigrationError(AgenticOSError):
    """A migration precondition or batch check failed."""
