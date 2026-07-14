"""Secret-scanning tests (spec sections 19, 36).

Test inputs are FAKE and assembled by concatenation so that this file itself
never contains a string matching a secret pattern at rest (the tree-wide
scan below covers the tests directory too).
"""

from pathlib import Path

from agentic_os.security.secrets import REDACTION, redact, scan_path, scan_text

FAKE_VALUE = "abcdefghij" + "1234567890XYZ"
FAKE_ASSIGNMENT = 'api_' + f'key = "{FAKE_VALUE}"'
FAKE_AWS = "key: AKIA" + "ABCDEFGHIJKLMNOP"
FAKE_PEM = "-----BEGIN RSA " + "PRIVATE KEY-----"
FAKE_PASSWORD = 'pass' + 'word: "supersecretvalue123456"'


def test_detects_generic_assignment() -> None:
    findings = scan_text(FAKE_ASSIGNMENT)
    assert findings and findings[0].pattern_name == "generic-assignment"


def test_detects_aws_style_key() -> None:
    assert scan_text(FAKE_AWS)


def test_detects_private_key_block() -> None:
    assert scan_text(FAKE_PEM)


def test_redaction_replaces_value() -> None:
    redacted = redact('to' + f'ken = "{FAKE_VALUE}"')
    assert REDACTION in redacted
    assert FAKE_VALUE not in redacted


def test_findings_are_pre_redacted() -> None:
    findings = scan_text(FAKE_PASSWORD)
    assert findings
    assert all("supersecretvalue" not in f.redacted_line for f in findings)


def test_clean_text_passes() -> None:
    assert scan_text("just a normal line\nkey = os.environ['API_KEY']") == []


def test_scan_path_skips_vendor_dirs(tmp_path: Path) -> None:
    (tmp_path / "node_modules").mkdir()
    (tmp_path / "node_modules" / "x.js").write_text(f'key="{FAKE_VALUE}"')
    (tmp_path / "app.py").write_text("print('hello')\n")
    assert scan_path(tmp_path) == []


def test_scan_path_finds_planted_secret(tmp_path: Path) -> None:
    (tmp_path / "config.py").write_text(FAKE_ASSIGNMENT + "\n")
    findings = scan_path(tmp_path)
    assert len(findings) == 1 and findings[0].line_number == 1


def test_tracked_tree_has_no_secrets() -> None:
    """The shipped agentic-os tree — including tests — must scan clean."""
    root = Path(__file__).resolve().parents[2]
    findings = scan_path(root)
    assert findings == [], [f"{f.path}:{f.line_number}" for f in findings]
