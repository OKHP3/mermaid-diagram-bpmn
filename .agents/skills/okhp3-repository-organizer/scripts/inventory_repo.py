#!/usr/bin/env python3
"""Produce a read-only JSON inventory for a content-first Git repository."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path


SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", ".tox"}
TEXT_EXTENSIONS = {
    ".cjs", ".css", ".csv", ".html", ".ini", ".js", ".json", ".jsx", ".md",
    ".mjs", ".py", ".rst", ".sh", ".toml", ".ts", ".tsx", ".txt", ".xml",
    ".yaml", ".yml",
}
GOVERNANCE_NAMES = {
    "README.md", "AGENTS.md", "CLAUDE.md", "CHANGELOG.md", "LIFECYCLE.md",
    "MIGRATION.md", "LICENSE", "CONTRIBUTING.md", "SECURITY.md", "SUPPORT.md",
}
VERSION_RE = re.compile(r"(?:^|[-_ ])v?\d+(?:[._-]\d+)*(?:[a-z])?(?:$|[-_ ])", re.I)
PORTABLE_NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+)?$")
WINDOWS_FORBIDDEN = set('<>:"/\\|?*')
WEB_RESERVED = set("#%?&+;")
WINDOWS_RESERVED_BASENAMES = {
    "con", "prn", "aux", "nul",
    "com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9",
    "lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9",
    "com¹", "com²", "com³", "lpt¹", "lpt²", "lpt³",
}
NAME_EXCEPTIONS = GOVERNANCE_NAMES | {
    ".agents", ".claude", ".github", ".vscode", ".gitignore", ".gitattributes", ".gitkeep", ".kit",
    ".nojekyll", "FAMILY.md", "SKILL.md", "openai.yaml", "package.json",
    "package-lock.json", "requirements.txt", "requirements-dev.txt", "pyproject.toml",
    "Cargo.toml", "Cargo.lock", "Gemfile", "Gemfile.lock", "Makefile", "Dockerfile",
    "TECHNOLOGY.md", ".catalog-meta.json", "skillz.manifest.json", "inventory_repo.py",
}


def sha256(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_text_sample(path: Path, limit: int) -> dict[str, object] | None:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return None
    try:
        text = path.read_text(encoding="utf-8", errors="replace")[:limit]
    except OSError:
        return None
    headings = [line.strip() for line in text.splitlines() if line.lstrip().startswith("#")][:12]
    keywords = Counter(re.findall(r"\b[a-z][a-z0-9_-]{3,}\b", text.lower()))
    return {
        "headings": headings,
        "top_terms": [term for term, _ in keywords.most_common(15)],
        "sample_chars": len(text),
    }


def inspect_name(
    relative: str,
    component: str,
    signals: defaultdict[str, set[str]],
    violations: defaultdict[str, set[str]],
) -> None:
    """Record portability signals without changing the path."""
    if component in NAME_EXCEPTIONS:
        return
    def flag(signal: str) -> None:
        signals[signal].add(relative)

    if any(ord(char) < 32 or char in WINDOWS_FORBIDDEN for char in component):
        flag("windows_forbidden_or_control")
        violations["windows_forbidden_or_control"].add(relative)
    if component.startswith((" ", "\t")) or component.endswith((" ", ".")):
        flag("leading_or_trailing_space_or_period")
        violations["leading_or_trailing_space_or_period"].add(relative)
    basename = component.split(".", 1)[0].casefold()
    if basename in WINDOWS_RESERVED_BASENAMES:
        flag("windows_reserved_basename")
        violations["windows_reserved_basename"].add(relative)
    if any(char in WEB_RESERVED for char in component):
        flag("web_reserved_characters")
        violations["web_reserved_characters"].add(relative)
    if any(ord(char) > 127 for char in component):
        flag("non_ascii")
        violations["non_ascii"].add(relative)
    if any(char.isspace() for char in component):
        flag("spaces")
        violations["spaces"].add(relative)
    if component != component.lower():
        flag("uppercase")
        violations["uppercase"].add(relative)
    if not PORTABLE_NAME_RE.fullmatch(component):
        flag("portable_name_profile")
        violations["portable_name_profile"].add(relative)
    if len(component) > 64:
        flag("long_segment")
        violations["long_segment"].add(relative)
    normalized = unicodedata.normalize("NFC", component)
    if normalized != component:
        flag("unicode_normalization_variant")
        violations["unicode_normalization_variant"].add(relative)


def positive_int(value: str) -> int:
    parsed = int(value)
    if parsed <= 0:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return parsed


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, help="absolute or relative repository path")
    parser.add_argument("--hash", action="store_true", help="hash files for duplicate candidates")
    parser.add_argument("--max-files", type=positive_int, default=10000)
    parser.add_argument("--sample-bytes", type=positive_int, default=12000)
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        print(json.dumps({"error": f"not a directory: {root}"}), file=sys.stderr)
        return 2

    records: list[dict[str, object]] = []
    extension_counts: Counter[str] = Counter()
    directories: set[str] = set()
    size_groups: defaultdict[tuple[int, str], list[str]] = defaultdict(list)
    naming_paths: defaultdict[str, set[str]] = defaultdict(set)
    portability_violations: defaultdict[str, set[str]] = defaultdict(set)
    normalized_paths: defaultdict[str, list[str]] = defaultdict(list)
    governance: dict[str, bool] = {}

    for special in sorted(GOVERNANCE_NAMES):
        governance[special] = (root / special).exists()
    for special_dir in (".agents", ".kit", ".github"):
        governance[special_dir] = (root / special_dir).is_dir()

    truncated = False
    for path in sorted(root.rglob("*")):
        if any(part in SKIP_DIRS for part in path.relative_to(root).parts):
            continue
        if path.is_dir():
            relative = str(path.relative_to(root)).replace("\\", "/")
            directories.add(relative)
            for component in relative.split("/"):
                inspect_name(relative, component, naming_paths, portability_violations)
            normalized_paths[unicodedata.normalize("NFC", relative).casefold()].append(relative)
            continue
        if not path.is_file():
            continue
        if len(records) >= args.max_files:
            truncated = True
            break
        relative = str(path.relative_to(root)).replace("\\", "/")
        for component in relative.split("/"):
            inspect_name(relative, component, naming_paths, portability_violations)
        normalized_paths[unicodedata.normalize("NFC", relative).casefold()].append(relative)
        if len(relative) > 180:
            naming_paths["long_relative_path"].add(relative)
            portability_violations["long_relative_path"].add(relative)
        suffix = path.suffix.lower() or "[none]"
        try:
            size = path.stat().st_size
        except OSError:
            size = None
        extension_counts[suffix] += 1
        if VERSION_RE.search(path.name):
            naming_paths["version_tokens"].add(relative)
        text_sample = read_text_sample(path, args.sample_bytes)
        record: dict[str, object] = {"path": relative, "size_bytes": size, "extension": suffix}
        if text_sample:
            record["text_sample"] = text_sample
        if args.hash and size is not None:
            try:
                digest = sha256(path)
                record["sha256"] = digest
                size_groups[(size, digest)].append(relative)
            except OSError:
                record["hash_error"] = True
        records.append(record)

    duplicate_candidates = [paths for paths in size_groups.values() if len(paths) > 1]
    case_normalization_collisions = [paths for paths in normalized_paths.values() if len(paths) > 1]
    if case_normalization_collisions:
        naming_paths["case_or_normalization_collision"].update(
            path for paths in case_normalization_collisions for path in paths
        )
        portability_violations["case_or_normalization_collision"].update(
            path for paths in case_normalization_collisions for path in paths
        )
    naming_signals = {key: len(paths) for key, paths in sorted(naming_paths.items())}
    result = {
        "root": str(root),
        "is_git_repository": (root / ".git").exists(),
        "governance_at_root": governance,
        "summary": {
            "file_count": len(records),
            "directory_count": len(directories),
            "total_bytes": sum(item["size_bytes"] or 0 for item in records),
            "extensions": dict(extension_counts.most_common()),
            "naming_signals": naming_signals,
            "truncated": truncated,
        },
        "portability_violations": {
            key: sorted(paths) for key, paths in sorted(portability_violations.items())
        },
        "duplicate_candidates": duplicate_candidates,
        "files": records,
        "notes": [
            "Inventory excludes .git and common dependency/cache directories.",
            "Text headings and terms are samples for agent inspection, not a summary or classification.",
            "Duplicate candidates are exact size and SHA-256 matches only when --hash is used.",
        ],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
