"""``agentic-os`` CLI (spec section 34).

Every command supports ``--json`` for structured output, exits non-zero on
failure, performs no hidden external actions, and appends to the audit log.

Run as ``python -m agentic_os.cli <command>`` or via the ``agentic-os``
entry point once the package is installed.
"""

from __future__ import annotations

import argparse
import dataclasses
import json
import sys
from pathlib import Path
from typing import Any

from agentic_os.evals.regression import compare_latest
from agentic_os.evals.runner import run_golden_tasks
from agentic_os.exceptions import AgenticOSError
from agentic_os.memory import compaction, markdown_export
from agentic_os.memory.locks import review_orphans
from agentic_os.memory.sqlite_store import SqliteStore
from agentic_os.migration import rollback as rb
from agentic_os.migration.executor import execute as migrate_execute
from agentic_os.migration.planner import build_map, to_markdown_table
from agentic_os.migration.scanner import scan
from agentic_os.models.task import VALID_DOMAINS
from agentic_os.orchestration.dispatcher import dispatch
from agentic_os.orchestration.planner import new_task
from agentic_os.reporting import audit
from agentic_os.reporting.status import build_status
from agentic_os.security.secrets import scan_path
from agentic_os.tools.health import record_test
from agentic_os.tools.registry import load_registry
from agentic_os.utils.paths import db_path, find_os_root, project_root
from agentic_os.verification.contract_checks import check_skill_contract
from agentic_os.verification.deterministic import check_markdown_header
from agentic_os.verification.verifier import verify as run_verify


def _emit(payload: Any, as_json: bool, text: str | None = None) -> None:
    if as_json:
        print(json.dumps(payload, indent=2, ensure_ascii=False, default=str))
    else:
        print(text if text is not None else payload)


def _store(root: Path) -> SqliteStore:
    return SqliteStore(db_path(root))


# --- command handlers -------------------------------------------------------

def cmd_init(args: argparse.Namespace, root: Path) -> int:
    store = _store(root)
    try:
        markdown_export.export_all(store, root / "memory")
        _emit({"initialized": True, "db": str(db_path(root))}, args.json,
              f"Initialized state store at {db_path(root)} and exports.")
    finally:
        store.close()
    return 0


def cmd_scan(args: argparse.Namespace, root: Path) -> int:
    skip = {"agentic-os"} if args.exclude_os else set()
    inventory = scan(project_root(root), skip_extra=skip)
    summary = {
        "root": inventory.root,
        "files": len(inventory.files),
        "symlinks": len(inventory.symlinks),
        "large_binaries": sum(1 for f in inventory.files if f.is_large_binary),
        "generated": sum(1 for f in inventory.files if f.is_generated),
        "duplicate_names": len(inventory.duplicates_by_name),
    }
    _emit(summary, args.json,
          "\n".join(f"{k}: {v}" for k, v in summary.items()))
    return 0


def cmd_migration_plan(args: argparse.Namespace, root: Path) -> int:
    inventory = scan(project_root(root), skip_extra={"agentic-os"})
    mig_map = build_map(inventory)
    if args.json:
        _emit({"rows": [dataclasses.asdict(r) for r in mig_map.rows],
               "ask_me": len(mig_map.ask_me_rows),
               "changing": len(mig_map.changing_rows)}, True)
    else:
        print(to_markdown_table(mig_map, limit=args.limit))
        print(f"\nask-me rows: {len(mig_map.ask_me_rows)}; "
              f"changing rows: {len(mig_map.changing_rows)}")
    return 0


def cmd_migrate(args: argparse.Namespace, root: Path) -> int:
    inventory = scan(project_root(root), skip_extra={"agentic-os"})
    mig_map = build_map(inventory)
    result = migrate_execute(
        mig_map, project_root(root), approved=args.approved, dry_run=not args.execute
    )
    if result.rollback_entries:
        rb.save_rollback_map(result.rollback_entries, root / "memory" / "rollback-map.json")
    _emit({"dry_run": result.dry_run, "executed": result.executed,
           "skipped_ask_me": result.skipped}, args.json,
          f"{'DRY RUN — ' if result.dry_run else ''}{len(result.executed)} action(s), "
          f"{len(result.skipped)} ask-me file(s) skipped.")
    return 0


def cmd_rollback(args: argparse.Namespace, root: Path) -> int:
    map_path = root / "memory" / "rollback-map.json"
    if not map_path.is_file():
        _emit({"error": "no rollback map recorded"}, args.json,
              "No rollback map recorded — nothing was migrated.")
        return 1
    actions = rb.rollback(rb.load_rollback_map(map_path), project_root(root))
    _emit({"restored": actions}, args.json, "\n".join(actions) or "nothing to roll back")
    return 0


def cmd_task(args: argparse.Namespace, root: Path) -> int:
    store = _store(root)
    try:
        if args.task_cmd == "create":
            task = new_task(args.title, args.domain, store.task_ids())
            store.create_task(task)
            _emit(dataclasses.asdict(task), args.json, f"created {task.task_id}")
        elif args.task_cmd == "list":
            tasks = store.list_tasks(args.status)
            _emit([dataclasses.asdict(t) for t in tasks], args.json,
                  "\n".join(f"{t.task_id} [{t.status}] ({t.domain}) {t.title}"
                            for t in tasks) or "no tasks")
        elif args.task_cmd == "show":
            task = store.get_task(args.task_id)
            events = store.task_events(args.task_id)
            _emit({"task": dataclasses.asdict(task), "events": events}, args.json,
                  "\n".join(f"{k}: {v}" for k, v in dataclasses.asdict(task).items()))
        elif args.task_cmd == "update":
            task = store.update_task_status(args.task_id, args.status)
            _emit(dataclasses.asdict(task), args.json,
                  f"{task.task_id} -> {task.status}")
    finally:
        store.close()
    return 0


def cmd_route(args: argparse.Namespace, root: Path) -> int:
    store = _store(root)
    try:
        store.get_task(args.task_id)  # clean error before touching routing_events
        decision = dispatch(store, args.task_id, args.task_type)
        _emit(dataclasses.asdict(decision), args.json,
              f"{decision.task_id} -> {decision.role} ({decision.reason})")
    finally:
        store.close()
    return 0


def cmd_verify(args: argparse.Namespace, root: Path) -> int:
    store = _store(root)
    try:
        task = store.get_task(args.task_id)
        paths = [Path(p) for p in (args.paths or [])]
        result = run_verify(
            args.task_id, args.level or task.verification_level,
            artifact_paths=paths, task_domain=task.domain,
        )
        store.record_verification(
            task.task_id, result.level, result.result,
            {"checks": result.checks_performed, "findings": result.findings},
        )
        _emit(dataclasses.asdict(result), args.json,
              f"{result.result} ({result.level}): "
              + ("; ".join(result.findings) or "no findings"))
        return 0 if result.result in ("PASS", "PASS-WITH-LIMITATIONS") else 1
    finally:
        store.close()


def cmd_status(args: argparse.Namespace, root: Path) -> int:
    store = _store(root)
    try:
        text = build_status(store, root)
        _emit({"status": text.splitlines()}, args.json, text)
    finally:
        store.close()
    return 0


def cmd_tool(args: argparse.Namespace, root: Path) -> int:
    registry = load_registry(root / "tools" / "tools-config.json")
    store = _store(root)
    try:
        if args.tool_cmd == "list":
            rows = [{"tool_id": t.tool_id, "health": t.health_status,
                     "external": t.external_side_effect} for t in registry.values()]
            _emit(rows, args.json,
                  "\n".join(f"{r['tool_id']} [{r['health']}]"
                            f"{' external' if r['external'] else ''}" for r in rows)
                  or "no tools registered")
        elif args.tool_cmd == "health":
            tool = registry.get(args.tool_id)
            if tool is None:
                _emit({"error": "unregistered tool"}, args.json,
                      f"tool {args.tool_id!r} is not registered")
                return 1
            store.upsert_tool(args.tool_id, dataclasses.asdict(tool), tool.health_status)
            status = record_test(store, args.tool_id, healthy=not args.fail,
                                 note=args.note or "manual health check")
            _emit({"tool_id": args.tool_id, "status": status}, args.json,
                  f"{args.tool_id}: {status}")
    finally:
        store.close()
    return 0


def cmd_risk_list(args: argparse.Namespace, root: Path) -> int:
    store = _store(root)
    try:
        risks = store.list_risks()
        _emit(risks, args.json,
              "\n".join(f"{r.get('risk_id')}: {r.get('description', '')[:70]}"
                        for r in risks) or "no risks recorded")
    finally:
        store.close()
    return 0


def cmd_incident_list(args: argparse.Namespace, root: Path) -> int:
    store = _store(root)
    try:
        incidents = store.list_incidents()
        _emit(incidents, args.json,
              "\n".join(f"{i.get('incident_id')} [{i.get('severity')}] "
                        f"{i.get('description', '')[:60]}" for i in incidents)
              or "no incidents recorded")
    finally:
        store.close()
    return 0


def cmd_eval_run(args: argparse.Namespace, root: Path) -> int:
    report = run_golden_tasks(root / "evals" / "golden-tasks",
                              root / "evals" / "regression-results")
    delta = compare_latest(root / "evals" / "regression-results")
    payload = {"total": report.total, "passed": report.passed,
               "pass_rate": round(report.pass_rate, 3), "results": report.results,
               "regressions": delta.newly_failing if delta else []}
    _emit(payload, args.json,
          f"{report.passed}/{report.total} golden tasks passed"
          + (f"; REGRESSIONS: {delta.newly_failing}" if delta and delta.regressed else ""))
    return 0 if report.passed == report.total else 1


def cmd_export_markdown(args: argparse.Namespace, root: Path) -> int:
    store = _store(root)
    try:
        written = markdown_export.export_all(store, root / "memory")
        _emit({"written": [str(p) for p in written]}, args.json,
              "\n".join(str(p) for p in written))
    finally:
        store.close()
    return 0


def cmd_compact_memory(args: argparse.Namespace, root: Path) -> int:
    store = _store(root)
    try:
        result = compaction.compact_sessions(
            store, root / "memory" / "sessions",
            root / "memory" / "archive-summaries.md",
        )
        _emit({"compacted": result.compacted, "kept": result.kept}, args.json,
              f"compacted {len(result.compacted)} log(s), kept {result.kept}")
    finally:
        store.close()
    return 0


def cmd_doctor(args: argparse.Namespace, root: Path) -> int:
    """Consistency checks: headers, skill contracts, secrets, locks, DB."""
    problems: list[str] = []
    md_skip = ("_compacted", "_archive", "node_modules", ".pytest_cache",
               ".ruff_cache", ".venv")
    for md in sorted(root.rglob("*.md")):
        if any(part in md_skip for part in md.parts):
            continue
        problems.extend(check_markdown_header(md))
    for skill_md in sorted((root / "skills").rglob("SKILL.md")):
        problems.extend(check_skill_contract(skill_md))
    secret_findings = scan_path(root)
    problems.extend(
        f"candidate secret ({f.pattern_name}) in {f.path}:{f.line_number}"
        for f in secret_findings
    )
    store = _store(root)
    try:
        orphans = review_orphans(store)
        problems.extend(f"orphan lock: {o['lock_id']}" for o in orphans)
    finally:
        store.close()
    _emit({"problems": problems, "healthy": not problems}, args.json,
          ("all checks passed" if not problems else "\n".join(problems)))
    return 0 if not problems else 1


# --- parser ------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="agentic-os",
        description="Agentic OS: governed task orchestration for this workspace.",
    )
    parser.add_argument("--json", action="store_true", help="structured JSON output")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init", help="initialize the state store and exports")
    scan_p = sub.add_parser("scan", help="read-only project inventory")
    scan_p.add_argument("--include-os", dest="exclude_os", action="store_false",
                        help="include the agentic-os tree in the scan")
    plan_p = sub.add_parser("migration-plan", help="build and print the migration map")
    plan_p.add_argument("--limit", type=int, default=None, help="max rows to print")
    mig_p = sub.add_parser("migrate", help="apply the migration map in batches")
    mig_p.add_argument("--dry-run", action="store_true", default=True,
                       help="preview only (default)")
    mig_p.add_argument("--execute", action="store_true",
                       help="really move files (requires --approved)")
    mig_p.add_argument("--approved", action="store_true",
                       help="assert Checkpoint A approval was given")
    sub.add_parser("rollback", help="undo the last executed migration")

    task_p = sub.add_parser("task", help="task lifecycle")
    task_sub = task_p.add_subparsers(dest="task_cmd", required=True)
    create_p = task_sub.add_parser("create", help="create a task")
    create_p.add_argument("title")
    create_p.add_argument("--domain", required=True, choices=VALID_DOMAINS)
    list_p = task_sub.add_parser("list", help="list tasks")
    list_p.add_argument("--status", default=None)
    show_p = task_sub.add_parser("show", help="show one task with its events")
    show_p.add_argument("task_id")
    update_p = task_sub.add_parser("update", help="orchestrator state transition")
    update_p.add_argument("task_id")
    update_p.add_argument("--status", required=True)

    route_p = sub.add_parser("route", help="route a task to the cheapest capable role")
    route_p.add_argument("task_id")
    route_p.add_argument("--task-type", required=True)

    verify_p = sub.add_parser("verify", help="run the verifier on a task")
    verify_p.add_argument("task_id")
    verify_p.add_argument("--level", default=None)
    verify_p.add_argument("--paths", nargs="*", default=None)

    sub.add_parser("status", help="status snapshot (<25 lines)")

    tool_p = sub.add_parser("tool", help="tool governance")
    tool_sub = tool_p.add_subparsers(dest="tool_cmd", required=True)
    tool_sub.add_parser("list", help="list registered tools")
    health_p = tool_sub.add_parser("health", help="record a health test")
    health_p.add_argument("tool_id")
    health_p.add_argument("--fail", action="store_true", help="record a failure")
    health_p.add_argument("--note", default="")

    risk_p = sub.add_parser("risk", help="risk register")
    risk_p.add_subparsers(dest="risk_cmd", required=True).add_parser("list")
    inc_p = sub.add_parser("incident", help="incident log")
    inc_p.add_subparsers(dest="incident_cmd", required=True).add_parser("list")
    eval_p = sub.add_parser("eval", help="evaluation system")
    eval_p.add_subparsers(dest="eval_cmd", required=True).add_parser("run")
    sub.add_parser("export-markdown", help="regenerate markdown exports from SQLite")
    sub.add_parser("compact-memory", help="compact old session logs (deletes nothing)")
    sub.add_parser("doctor", help="consistency and security self-check")
    return parser


_HANDLERS = {
    "init": cmd_init, "scan": cmd_scan, "migration-plan": cmd_migration_plan,
    "migrate": cmd_migrate, "rollback": cmd_rollback, "task": cmd_task,
    "route": cmd_route, "verify": cmd_verify, "status": cmd_status,
    "tool": cmd_tool, "risk": cmd_risk_list, "incident": cmd_incident_list,
    "eval": cmd_eval_run, "export-markdown": cmd_export_markdown,
    "compact-memory": cmd_compact_memory, "doctor": cmd_doctor,
}


def main(argv: list[str] | None = None) -> int:
    """CLI entry point; returns the process exit code."""
    args = build_parser().parse_args(argv)
    try:
        root = find_os_root()
    except AgenticOSError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    audit.record(root, f"cli:{args.command}",
                 {"argv": [a for a in (argv or sys.argv[1:])]})
    try:
        return _HANDLERS[args.command](args, root)
    except AgenticOSError as exc:
        message = f"error: {exc}"
        if args.json:
            print(json.dumps({"error": str(exc)}))
        else:
            print(message, file=sys.stderr)
        audit.record(root, f"cli:{args.command}:error", {"error": str(exc)})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
