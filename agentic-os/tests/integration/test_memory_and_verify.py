"""Integration: compaction, verifier levels, tool suspension, exports."""

from pathlib import Path

from agentic_os.memory.compaction import compact_sessions
from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.tools.health import record_test
from agentic_os.verification.verifier import verify


def test_compaction_keeps_latest_five_and_deletes_nothing(
    store: SqliteStore, os_root: Path
) -> None:
    sessions = os_root / "memory" / "sessions"
    for i in range(8):
        path = sessions / f"2026-07-{i + 1:02d}-topic.md"
        path.write_text(f"# Session {i}\ndid things\n")
        store.record_session_log(f"2026-07-{i + 1:02d}", "topic", f"sessions/{path.name}")
    summaries = os_root / "memory" / "archive-summaries.md"
    summaries.write_text("# Archive summaries\n")
    result = compact_sessions(store, sessions, summaries)
    assert len(result.compacted) == 3 and result.kept == 5
    # originals moved, not deleted
    assert len(list((sessions / "_compacted").glob("*.md"))) == 3
    assert "2026-07-01-topic.md" in summaries.read_text()


def test_verifier_flags_secret_in_deliverable() -> None:
    fake = 'api_' + 'key = "abcdefghij' + '1234567890XYZ"'
    result = verify(
        "TASK-20260713-001", "enhanced",
        artifact_text=f"report with {fake}",
        evidence_bundle={
            "verification_scope": "s", "source_manifest": [], "calculations": [],
            "assumptions": [], "inferences": [], "unverified_items": [],
            "verification_date": "2026-07-13",
        },
    )
    assert result.result == "FAIL"
    assert any("secret" in f for f in result.findings)


def test_verifier_pass_with_limitations_without_evidence() -> None:
    result = verify("TASK-20260713-001", "standard")
    assert result.result == "PASS-WITH-LIMITATIONS"


def test_human_mandatory_never_autopasses() -> None:
    result = verify("TASK-20260713-001", "human-mandatory")
    assert result.result == "NOT-INDEPENDENTLY-VERIFIABLE"
    assert result.human_review_required


def test_tool_suspension_after_three_failures(store: SqliteStore) -> None:
    store.upsert_tool("flaky", {"tool_id": "flaky"}, "untested")
    assert record_test(store, "flaky", healthy=False) == "unavailable"
    assert record_test(store, "flaky", healthy=False) == "unavailable"
    assert record_test(store, "flaky", healthy=False) == "suspended"
    incidents = store.list_incidents("open")
    assert any("flaky" in i["description"] for i in incidents)
    assert any(e["kind"] == "tool-suspension" for e in store.security_events())
