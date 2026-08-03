#!/usr/bin/env python3
"""Check or safely create a byte-for-byte Agent Skill package mirror.

The helper never deletes destination-only files. It refuses divergent
destinations unless --overwrite is supplied after an explicit review.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path
from typing import Dict, Optional


EXCLUDED_PARTS = {".git", "__pycache__"}
PORTABLE_NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_package(path: Path) -> None:
    if not path.is_dir():
        raise ValueError(f"package directory does not exist: {path}")
    if not (path / "SKILL.md").is_file():
        raise ValueError(f"package is missing SKILL.md: {path}")
    text = (path / "SKILL.md").read_text(encoding="utf-8")
    match = re.search(r"^name:\s*([^\s#]+)\s*$", text, re.MULTILINE)
    declared_name = match.group(1).strip("'\"") if match else ""
    if not match or declared_name != path.name:
        raise ValueError(f"SKILL.md name must match package directory: {path.name}")
    if len(declared_name) > 64 or not PORTABLE_NAME.fullmatch(declared_name):
        raise ValueError(f"SKILL.md name is not portable: {declared_name}")


def inventory(path: Path) -> Dict[str, str]:
    result: Dict[str, str] = {}
    for item in sorted(path.rglob("*")):
        relative = item.relative_to(path)
        if any(part in EXCLUDED_PARTS for part in relative.parts):
            continue
        if item.is_symlink():
            raise ValueError(f"symlinks are not supported in a portable mirror: {item}")
        if item.is_file():
            result[relative.as_posix()] = sha256_file(item)
    return result


def aggregate_hash(files: Dict[str, str]) -> str:
    digest = hashlib.sha256()
    for relative, file_hash in sorted(files.items()):
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(file_hash.encode("ascii"))
        digest.update(b"\n")
    return digest.hexdigest()


def comparison(source: Dict[str, str], destination: Dict[str, str]) -> Dict[str, object]:
    source_names = set(source)
    destination_names = set(destination)
    changed = sorted(name for name in source_names & destination_names if source[name] != destination[name])
    return {
        "missing": sorted(source_names - destination_names),
        "extra": sorted(destination_names - source_names),
        "changed": changed,
        "exact": not (source_names - destination_names or destination_names - source_names or changed),
    }


def write_report(path: Optional[Path], report: Dict[str, object]) -> None:
    encoded = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if path is None:
        print(encoded, end="")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(encoded, encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--destination", type=Path, required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--sync", action="store_true")
    parser.add_argument("--overwrite", action="store_true", help="allow reviewed changed files to be replaced")
    parser.add_argument("--report", type=Path, help="write the JSON report to this path")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source = args.source.resolve()
    destination = args.destination.resolve()
    try:
        validate_package(source)
        if source == destination or source in destination.parents or destination in source.parents:
            raise ValueError("source and destination must be separate package directories")
        if destination.name != source.name:
            raise ValueError("source and destination package names must match")
        if destination.exists() and not destination.is_dir():
            raise ValueError(f"destination is not a directory: {destination}")
        if args.report:
            report_path = args.report.resolve()
            if report_path == source or source in report_path.parents or report_path == destination or destination in report_path.parents:
                raise ValueError("report must be outside source and destination packages")
        source_files = inventory(source)
        destination_files = inventory(destination) if destination.exists() else {}
        result = comparison(source_files, destination_files)
        report: Dict[str, object] = {
            "source": str(source),
            "destination": str(destination),
            "source_inventory": source_files,
            "destination_inventory": destination_files,
            "source_aggregate_sha256": aggregate_hash(source_files),
            "destination_aggregate_sha256": aggregate_hash(destination_files) if destination.exists() else None,
            "comparison": result,
            "action": "check" if args.check else "sync",
        }

        if args.check:
            write_report(args.report, report)
            return 0 if result["exact"] else 1

        if result["extra"]:
            raise ValueError("destination contains extra files; inspect and remove them only through a separately authorized action")
        if result["changed"] and not args.overwrite:
            raise ValueError("destination has changed files; inspect the drift and use --overwrite only after explicit authorization")

        destination.mkdir(parents=True, exist_ok=True)
        for relative in sorted(source_files):
            target = destination / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            if not target.exists() or args.overwrite:
                shutil.copy2(source / relative, target)

        destination_files = inventory(destination)
        result = comparison(source_files, destination_files)
        report["destination_inventory"] = destination_files
        report["destination_aggregate_sha256"] = aggregate_hash(destination_files)
        report["comparison"] = result
        report["action"] = "sync"
        write_report(args.report, report)
        return 0 if result["exact"] else 1
    except (OSError, ValueError) as exc:
        error = {"source": str(source), "destination": str(destination), "error": str(exc)}
        write_report(args.report, error)
        return 2


if __name__ == "__main__":
    sys.exit(main())
