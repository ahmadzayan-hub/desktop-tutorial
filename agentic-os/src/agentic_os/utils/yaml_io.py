"""Minimal YAML-subset reader/writer (zero third-party dependencies).

Supports the subset used by the Agentic OS config files: nested mappings via
2-space indentation, block lists of scalars or flat mappings, quoted/plain
scalars, ``#`` comments, and blank lines. It intentionally does NOT support
anchors, multi-line scalars, flow collections, or tags. Config files authored
by the OS stay inside this subset; anything else raises :class:`ConfigError`.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from agentic_os.exceptions import ConfigError

_BOOLS = {"true": True, "false": False, "yes": True, "no": False}


def _parse_scalar(raw: str) -> Any:
    text = raw.strip()
    if text in ("", "~", "null"):
        return None
    if (text.startswith('"') and text.endswith('"')) or (
        text.startswith("'") and text.endswith("'")
    ):
        return text[1:-1]
    if text.lower() in _BOOLS:
        return _BOOLS[text.lower()]
    try:
        return int(text)
    except ValueError:
        pass
    try:
        return float(text)
    except ValueError:
        pass
    return text


def _strip_comment(line: str) -> str:
    in_quote: str | None = None
    for i, ch in enumerate(line):
        if in_quote:
            if ch == in_quote:
                in_quote = None
        elif ch in "\"'":
            in_quote = ch
        elif ch == "#":
            return line[:i]
    return line


def loads(text: str) -> dict[str, Any]:
    """Parse a YAML-subset document into a dict."""
    lines: list[tuple[int, str]] = []
    for raw in text.splitlines():
        stripped = _strip_comment(raw).rstrip()
        if not stripped.strip():
            continue
        leading = stripped[: len(stripped) - len(stripped.lstrip())]
        if "\t" in leading:
            raise ConfigError("tabs are not allowed for YAML indentation")
        indent = len(leading)
        lines.append((indent, stripped.strip()))
    value, consumed = _parse_block(lines, 0, 0)
    if consumed != len(lines):
        raise ConfigError(f"could not parse YAML near: {lines[consumed][1]!r}")
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise ConfigError("top-level YAML value must be a mapping")
    return value


def _parse_block(lines: list[tuple[int, str]], pos: int, indent: int) -> tuple[Any, int]:
    if pos >= len(lines) or lines[pos][0] < indent:
        return None, pos
    if lines[pos][1].startswith("- "):
        return _parse_list(lines, pos, lines[pos][0])
    return _parse_map(lines, pos, lines[pos][0])


def _parse_list(lines: list[tuple[int, str]], pos: int, indent: int) -> tuple[list[Any], int]:
    items: list[Any] = []
    while pos < len(lines) and lines[pos][0] == indent and lines[pos][1].startswith("- "):
        body = lines[pos][1][2:].strip()
        if ":" in body and not body.startswith(("'", '"')):
            # inline "- key: value" list-of-mappings entry
            key, _, rest = body.partition(":")
            entry: dict[str, Any] = {key.strip(): _parse_scalar(rest)}
            pos += 1
            while pos < len(lines) and lines[pos][0] > indent and ":" in lines[pos][1]:
                k, _, v = lines[pos][1].partition(":")
                entry[k.strip()] = _parse_scalar(v)
                pos += 1
            items.append(entry)
        else:
            items.append(_parse_scalar(body))
            pos += 1
    return items, pos


def _parse_map(
    lines: list[tuple[int, str]], pos: int, indent: int
) -> tuple[dict[str, Any], int]:
    result: dict[str, Any] = {}
    while pos < len(lines) and lines[pos][0] == indent:
        line = lines[pos][1]
        if line.startswith("- "):
            break
        if ":" not in line:
            raise ConfigError(f"expected 'key: value' but got: {line!r}")
        key, _, rest = line.partition(":")
        key = key.strip()
        if rest.strip():
            result[key] = _parse_scalar(rest)
            pos += 1
        else:
            child, pos = _parse_block(lines, pos + 1, indent + 1)
            result[key] = child if child is not None else {}
    return result, pos


def load(path: Path) -> dict[str, Any]:
    """Read and parse a YAML-subset file."""
    try:
        return loads(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ConfigError(f"cannot read {path}: {exc}") from exc


def dumps(obj: Any, indent: int = 0) -> str:
    """Serialize dicts/lists/scalars back into the supported subset."""
    pad = "  " * indent
    if isinstance(obj, dict):
        out: list[str] = []
        for key, value in obj.items():
            if isinstance(value, (dict, list)) and value:
                out.append(f"{pad}{key}:")
                out.append(dumps(value, indent + 1))
            else:
                out.append(f"{pad}{key}: {_dump_scalar(value)}")
        return "\n".join(out)
    if isinstance(obj, list):
        out = []
        for item in obj:
            if isinstance(item, dict):
                first = True
                for key, value in item.items():
                    prefix = f"{pad}- " if first else f"{pad}  "
                    out.append(f"{prefix}{key}: {_dump_scalar(value)}")
                    first = False
            else:
                out.append(f"{pad}- {_dump_scalar(item)}")
        return "\n".join(out)
    return f"{pad}{_dump_scalar(obj)}"


def _dump_scalar(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    text = str(value)
    if text == "" or text != text.strip() or any(c in text for c in ":#{}[]"):
        return f'"{text}"'
    return text


def dump(obj: Any, path: Path) -> None:
    """Write a YAML-subset file with a trailing newline."""
    path.write_text(dumps(obj) + "\n", encoding="utf-8")
