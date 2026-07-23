"""SQLite authoritative state store (spec section 26).

Transactions, foreign keys, UTC timestamps, full audit history — state is
appended or updated explicitly, never silently overwritten. Schema changes
after v1 must go through an approved migration (Checkpoint C).
"""

from __future__ import annotations

import dataclasses
import json
import sqlite3
from pathlib import Path
from typing import Any

from agentic_os.exceptions import AgenticOSError, LockError
from agentic_os.models.task import Task
from agentic_os.orchestration.state_machine import assert_transition
from agentic_os.utils.dates import utc_now_iso

SCHEMA_VERSION = 1

_SCHEMA = """
CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY, data TEXT NOT NULL, status TEXT NOT NULL,
    domain TEXT NOT NULL, created TEXT NOT NULL, last_updated TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS task_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL REFERENCES tasks(task_id),
    event TEXT NOT NULL, actor TEXT NOT NULL, at TEXT NOT NULL, detail TEXT);
CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT REFERENCES tasks(task_id),
    checkpoint TEXT NOT NULL, action TEXT NOT NULL, status TEXT NOT NULL,
    approved_by TEXT, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS routing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL REFERENCES tasks(task_id),
    role TEXT NOT NULL, reason TEXT NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS artifacts (
    artifact_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(task_id),
    path TEXT NOT NULL, domain TEXT NOT NULL, classification TEXT NOT NULL,
    sha256 TEXT NOT NULL, created TEXT NOT NULL, description TEXT);
CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL REFERENCES tasks(task_id),
    bundle TEXT NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT NOT NULL REFERENCES tasks(task_id),
    level TEXT NOT NULL, result TEXT NOT NULL, detail TEXT NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tools (
    tool_id TEXT PRIMARY KEY, data TEXT NOT NULL, health_status TEXT NOT NULL,
    updated TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tool_health (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_id TEXT NOT NULL REFERENCES tools(tool_id),
    status TEXT NOT NULL, note TEXT, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS cost_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id TEXT REFERENCES tasks(task_id),
    date TEXT NOT NULL, role TEXT NOT NULL, model TEXT NOT NULL,
    provider TEXT NOT NULL, usage_type TEXT NOT NULL,
    input_units INTEGER, output_units INTEGER,
    estimated_cost TEXT NOT NULL, actual_cost TEXT NOT NULL,
    currency TEXT NOT NULL, calculation_basis TEXT, confidence TEXT);
CREATE TABLE IF NOT EXISTS risks (
    risk_id TEXT PRIMARY KEY, data TEXT NOT NULL, status TEXT NOT NULL,
    updated TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS incidents (
    incident_id TEXT PRIMARY KEY, data TEXT NOT NULL, status TEXT NOT NULL,
    severity TEXT NOT NULL, updated TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS work_locks (
    lock_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(task_id),
    artifact TEXT NOT NULL, owner_role TEXT NOT NULL,
    created TEXT NOT NULL, expires TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS knowledge_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL, domain TEXT NOT NULL, source_date TEXT,
    captured_date TEXT NOT NULL, review_date TEXT, valid_until TEXT,
    freshness_class TEXT NOT NULL, authority_level TEXT NOT NULL,
    verification_status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS transfers (
    transfer_id TEXT PRIMARY KEY, data TEXT NOT NULL, status TEXT NOT NULL,
    at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS improvement_proposals (
    proposal_id TEXT PRIMARY KEY, data TEXT NOT NULL, status TEXT NOT NULL,
    at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS session_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL, topic TEXT NOT NULL, path TEXT NOT NULL,
    compacted INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL, source TEXT NOT NULL, detail TEXT NOT NULL, at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS idempotency (
    idempotency_key TEXT PRIMARY KEY, action_type TEXT NOT NULL,
    target TEXT NOT NULL, first_attempt TEXT NOT NULL,
    last_attempt TEXT NOT NULL, result TEXT NOT NULL);
"""


class SqliteStore:
    """Authoritative operational state, one SQLite file under ``memory/``."""

    def __init__(self, path: Path | str) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(self.path))
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON")
        with self.conn:
            self.conn.executescript(_SCHEMA)
            self.conn.execute(
                "INSERT OR IGNORE INTO schema_meta (key, value) VALUES ('version', ?)",
                (str(SCHEMA_VERSION),),
            )

    def close(self) -> None:
        self.conn.close()

    def __enter__(self) -> SqliteStore:
        return self

    def __exit__(self, *exc: object) -> None:
        self.close()

    # -- tasks ------------------------------------------------------------
    def create_task(self, task: Task) -> None:
        data = json.dumps(dataclasses.asdict(task))
        with self.conn:
            self.conn.execute(
                "INSERT INTO tasks (task_id, data, status, domain, created, last_updated)"
                " VALUES (?, ?, ?, ?, ?, ?)",
                (task.task_id, data, task.status, task.domain, task.created,
                 task.last_updated),
            )
            self._event(task.task_id, "created", "orchestrator", f"status={task.status}")

    def get_task(self, task_id: str) -> Task:
        row = self.conn.execute(
            "SELECT data FROM tasks WHERE task_id = ?", (task_id,)
        ).fetchone()
        if row is None:
            raise AgenticOSError(f"no such task: {task_id}")
        return Task(**json.loads(row["data"]))

    def list_tasks(self, status: str | None = None) -> list[Task]:
        query, params = "SELECT data FROM tasks", ()
        if status:
            query += " WHERE status = ?"
            params = (status,)  # type: ignore[assignment]
        query += " ORDER BY task_id"
        return [Task(**json.loads(r["data"])) for r in self.conn.execute(query, params)]

    def task_ids(self) -> list[str]:
        return [r["task_id"] for r in self.conn.execute("SELECT task_id FROM tasks")]

    def update_task_status(
        self, task_id: str, new_status: str, actor: str = "orchestrator"
    ) -> Task:
        """Validated state transition; records a task event. ORCHESTRATOR only."""
        if actor != "orchestrator":
            raise AgenticOSError("only the orchestrator changes task state")
        task = self.get_task(task_id)
        assert_transition(task.status, new_status)
        old = task.status
        task.status = new_status
        task.last_updated = utc_now_iso()
        with self.conn:
            self.conn.execute(
                "UPDATE tasks SET data = ?, status = ?, last_updated = ? WHERE task_id = ?",
                (json.dumps(dataclasses.asdict(task)), new_status, task.last_updated,
                 task_id),
            )
            self._event(task_id, "status-change", actor, f"{old} -> {new_status}")
        return task

    def _event(self, task_id: str, event: str, actor: str, detail: str = "") -> None:
        self.conn.execute(
            "INSERT INTO task_events (task_id, event, actor, at, detail)"
            " VALUES (?, ?, ?, ?, ?)",
            (task_id, event, actor, utc_now_iso(), detail),
        )

    def task_events(self, task_id: str) -> list[dict[str, Any]]:
        rows = self.conn.execute(
            "SELECT event, actor, at, detail FROM task_events WHERE task_id = ?"
            " ORDER BY id", (task_id,))
        return [dict(r) for r in rows]

    # -- approvals ---------------------------------------------------------
    def record_approval(
        self, checkpoint: str, action: str, status: str,
        approved_by: str = "", task_id: str | None = None,
    ) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO approvals (task_id, checkpoint, action, status,"
                " approved_by, at) VALUES (?, ?, ?, ?, ?, ?)",
                (task_id, checkpoint, action, status, approved_by, utc_now_iso()),
            )

    # -- routing / cost ----------------------------------------------------
    def record_routing_event(self, task_id: str, role: str, reason: str) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO routing_events (task_id, role, reason, at) VALUES (?,?,?,?)",
                (task_id, role, reason, utc_now_iso()),
            )

    def routing_events(self, limit: int = 50) -> list[dict[str, Any]]:
        rows = self.conn.execute(
            "SELECT task_id, role, reason, at FROM routing_events ORDER BY id DESC"
            " LIMIT ?", (limit,))
        return [dict(r) for r in rows]

    def heavy_calls_since(self, since_iso: str) -> int:
        row = self.conn.execute(
            "SELECT COUNT(*) AS n FROM routing_events WHERE role = 'heavy' AND at >= ?",
            (since_iso,)).fetchone()
        return int(row["n"])

    def record_cost(self, entry: dict[str, Any]) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO cost_events (task_id, date, role, model, provider,"
                " usage_type, input_units, output_units, estimated_cost, actual_cost,"
                " currency, calculation_basis, confidence)"
                " VALUES (:task_id, :date, :role, :model, :provider, :usage_type,"
                " :input_units, :output_units, :estimated_cost, :actual_cost,"
                " :currency, :calculation_basis, :confidence)",
                {"task_id": None, "input_units": None, "output_units": None,
                 "calculation_basis": "", "confidence": "low", **entry},
            )

    def cost_events_since(self, since_iso: str) -> list[dict[str, Any]]:
        rows = self.conn.execute(
            "SELECT * FROM cost_events WHERE date >= ? ORDER BY id", (since_iso,))
        return [dict(r) for r in rows]

    # -- work locks ----------------------------------------------------------
    def acquire_lock(
        self, lock_id: str, task_id: str, artifact: str, owner_role: str, expires: str
    ) -> None:
        active = self.conn.execute(
            "SELECT lock_id, task_id FROM work_locks WHERE artifact = ? AND"
            " status = 'active'", (artifact,)).fetchone()
        if active:
            raise LockError(
                f"artifact {artifact!r} already locked by {active['lock_id']}"
                f" (task {active['task_id']})"
            )
        with self.conn:
            self.conn.execute(
                "INSERT INTO work_locks (lock_id, task_id, artifact, owner_role,"
                " created, expires, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
                (lock_id, task_id, artifact, owner_role, utc_now_iso(), expires),
            )

    def release_lock(self, lock_id: str) -> None:
        with self.conn:
            cur = self.conn.execute(
                "UPDATE work_locks SET status = 'released' WHERE lock_id = ? AND"
                " status = 'active'", (lock_id,))
        if cur.rowcount == 0:
            raise LockError(f"no active lock: {lock_id}")

    def list_locks(self, status: str = "active") -> list[dict[str, Any]]:
        rows = self.conn.execute(
            "SELECT * FROM work_locks WHERE status = ? ORDER BY created", (status,))
        return [dict(r) for r in rows]

    def lock_history_count(self, task_id: str, artifact: str) -> int:
        """Total locks ever taken by a task on an artifact (for ID sequencing)."""
        row = self.conn.execute(
            "SELECT COUNT(*) AS n FROM work_locks WHERE task_id = ? AND artifact = ?",
            (task_id, artifact)).fetchone()
        return int(row["n"])

    def orphan_locks(self, now_iso: str) -> list[dict[str, Any]]:
        """Expired-but-active locks. Reviewed, never silently removed."""
        rows = self.conn.execute(
            "SELECT * FROM work_locks WHERE status = 'active' AND expires < ?",
            (now_iso,))
        return [dict(r) for r in rows]

    # -- tools ---------------------------------------------------------------
    def upsert_tool(self, tool_id: str, data: dict[str, Any], health: str) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO tools (tool_id, data, health_status, updated)"
                " VALUES (?, ?, ?, ?) ON CONFLICT(tool_id) DO UPDATE SET"
                " data = excluded.data, health_status = excluded.health_status,"
                " updated = excluded.updated",
                (tool_id, json.dumps(data), health, utc_now_iso()),
            )

    def get_tool(self, tool_id: str) -> dict[str, Any] | None:
        row = self.conn.execute(
            "SELECT data FROM tools WHERE tool_id = ?", (tool_id,)).fetchone()
        return json.loads(row["data"]) if row else None

    def list_tools(self) -> list[dict[str, Any]]:
        rows = self.conn.execute(
            "SELECT data, health_status FROM tools ORDER BY tool_id")
        # the health_status column is live (updated by record_tool_health);
        # the JSON blob may hold the stale registration-time value
        return [
            {**json.loads(r["data"]), "health_status": r["health_status"]}
            for r in rows
        ]

    def record_tool_health(self, tool_id: str, status: str, note: str = "") -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO tool_health (tool_id, status, note, at) VALUES (?,?,?,?)",
                (tool_id, status, note, utc_now_iso()),
            )
            self.conn.execute(
                "UPDATE tools SET health_status = ?, updated = ? WHERE tool_id = ?",
                (status, utc_now_iso(), tool_id),
            )

    def consecutive_tool_failures(self, tool_id: str) -> int:
        rows = self.conn.execute(
            "SELECT status FROM tool_health WHERE tool_id = ? ORDER BY id DESC LIMIT 10",
            (tool_id,))
        count = 0
        for row in rows:
            if row["status"] in ("unavailable", "authentication-failed", "degraded"):
                count += 1
            else:
                break
        return count

    # -- risks / incidents / security ------------------------------------------
    def upsert_risk(self, risk_id: str, data: dict[str, Any], status: str) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO risks (risk_id, data, status, updated) VALUES (?,?,?,?)"
                " ON CONFLICT(risk_id) DO UPDATE SET data = excluded.data,"
                " status = excluded.status, updated = excluded.updated",
                (risk_id, json.dumps(data), status, utc_now_iso()),
            )

    def list_risks(self, status: str | None = None) -> list[dict[str, Any]]:
        query, params = "SELECT data FROM risks", ()
        if status:
            query += " WHERE status = ?"
            params = (status,)  # type: ignore[assignment]
        return [json.loads(r["data"]) for r in self.conn.execute(query, params)]

    def upsert_incident(
        self, incident_id: str, data: dict[str, Any], status: str, severity: str
    ) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO incidents (incident_id, data, status, severity, updated)"
                " VALUES (?,?,?,?,?) ON CONFLICT(incident_id) DO UPDATE SET"
                " data = excluded.data, status = excluded.status,"
                " severity = excluded.severity, updated = excluded.updated",
                (incident_id, json.dumps(data), status, severity, utc_now_iso()),
            )

    def list_incidents(self, status: str | None = None) -> list[dict[str, Any]]:
        query, params = "SELECT data FROM incidents", ()
        if status:
            query += " WHERE status = ?"
            params = (status,)  # type: ignore[assignment]
        return [json.loads(r["data"]) for r in self.conn.execute(query, params)]

    def log_security_event(self, kind: str, source: str, detail: str) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO security_events (kind, source, detail, at) VALUES (?,?,?,?)",
                (kind, source, detail, utc_now_iso()),
            )

    def security_events(self, limit: int = 50) -> list[dict[str, Any]]:
        rows = self.conn.execute(
            "SELECT kind, source, detail, at FROM security_events ORDER BY id DESC"
            " LIMIT ?", (limit,))
        return [dict(r) for r in rows]

    # -- verification / evidence / artifacts ------------------------------------
    def record_verification(
        self, task_id: str, level: str, result: str, detail: dict[str, Any]
    ) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO verifications (task_id, level, result, detail, at)"
                " VALUES (?,?,?,?,?)",
                (task_id, level, result, json.dumps(detail), utc_now_iso()),
            )

    def record_evidence(self, task_id: str, bundle: dict[str, Any]) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO evidence (task_id, bundle, at) VALUES (?,?,?)",
                (task_id, json.dumps(bundle), utc_now_iso()),
            )

    def record_artifact(self, manifest: dict[str, Any]) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO artifacts (artifact_id, task_id, path, domain,"
                " classification, sha256, created, description)"
                " VALUES (:artifact_id, :task_id, :path, :domain, :classification,"
                " :sha256, :created, :description)",
                {"description": "", **manifest},
            )

    # -- idempotency (spec section 23) ------------------------------------------
    def check_idempotent(self, key: str) -> dict[str, Any] | None:
        row = self.conn.execute(
            "SELECT * FROM idempotency WHERE idempotency_key = ?", (key,)).fetchone()
        return dict(row) if row else None

    def record_idempotent(
        self, key: str, action_type: str, target: str, result: str
    ) -> None:
        now = utc_now_iso()
        with self.conn:
            self.conn.execute(
                "INSERT INTO idempotency (idempotency_key, action_type, target,"
                " first_attempt, last_attempt, result) VALUES (?,?,?,?,?,?)"
                " ON CONFLICT(idempotency_key) DO UPDATE SET"
                " last_attempt = excluded.last_attempt, result = excluded.result",
                (key, action_type, target, now, now, result),
            )

    # -- sessions ----------------------------------------------------------------
    def record_session_log(self, date: str, topic: str, path: str) -> None:
        with self.conn:
            self.conn.execute(
                "INSERT INTO session_logs (date, topic, path) VALUES (?,?,?)",
                (date, topic, path),
            )

    def session_counts(self) -> tuple[int, int]:
        row = self.conn.execute(
            "SELECT SUM(CASE WHEN compacted = 0 THEN 1 ELSE 0 END) AS raw,"
            " SUM(CASE WHEN compacted = 1 THEN 1 ELSE 0 END) AS compacted"
            " FROM session_logs").fetchone()
        return int(row["raw"] or 0), int(row["compacted"] or 0)

    def mark_session_compacted(self, path: str) -> None:
        with self.conn:
            self.conn.execute(
                "UPDATE session_logs SET compacted = 1 WHERE path = ?", (path,))
