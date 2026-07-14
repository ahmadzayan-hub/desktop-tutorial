"""YAML subset parser and settings tests."""

from pathlib import Path

import pytest

from agentic_os.exceptions import ConfigError
from agentic_os.settings import load_settings
from agentic_os.utils.yaml_io import dumps, loads


def test_parses_nested_maps_and_lists() -> None:
    doc = loads(
        "a: 1\n"
        "b:\n"
        "  c: hello  # comment\n"
        "  d:\n"
        "    - x\n"
        "    - 2\n"
        "e: true\n"
        "f: null\n"
        'g: "quoted: value"\n'
    )
    assert doc == {"a": 1, "b": {"c": "hello", "d": ["x", 2]}, "e": True,
                   "f": None, "g": "quoted: value"}


def test_parses_list_of_mappings() -> None:
    doc = loads("items:\n  - name: one\n    size: 1\n  - name: two\n    size: 2\n")
    assert doc["items"] == [{"name": "one", "size": 1}, {"name": "two", "size": 2}]


def test_roundtrip() -> None:
    original = {"x": {"y": [1, 2], "z": "text"}, "flag": False}
    assert loads(dumps(original)) == original


def test_rejects_tabs() -> None:
    with pytest.raises(ConfigError):
        loads("a:\n\tb: 1\n")


def test_settings_secure_defaults(os_root: Path) -> None:
    settings = load_settings(os_root)
    assert settings.default_environment == "sandbox"
    assert settings.production_actions_enabled is False
    assert settings.external_actions_enabled is False
    assert settings.per_session_cost_ceiling is None  # TODO in config -> unset
    assert settings.heavy_call_limit_per_session == 3


def test_all_config_files_parse(os_root: Path) -> None:
    for path in (os_root / "config").glob("*.yaml"):
        loads(path.read_text())
