#!/usr/bin/env python3
"""Read-only-by-default audit for one Replit Git checkout.

Reports local branch facts, naming violations, and nested detritus folders as
JSON. The script never deletes, renames, prunes, merges, or force-pushes.
Network fetch is opt-in with --fetch and still never prunes.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Iterable


ROOT_GOVERNANCE_FILES = {
    "README.md", "LICENSE", "CHANGELOG.md", "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md", "SECURITY.md", "AGENTS.md", "CLAUDE.md",
    "SKILL.md", "ROADMAP.md", "NOTICE",
}
TOOL_REQUIRED_PATTERNS = re.compile(
    r"^(package(-lock)?\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|"
    r"tsconfig.*\.json|vite\.config\.\w+|\.gitignore|\.replit|"
    r"\.replitignore|\.npmrc|\.prettierrc.*|Makefile|CNAME|Dockerfile|"
    r"\.env.*|Pipfile.*|requirements.*\.txt|go\.(mod|sum)|Gemfile.*|"
    r"Cargo\.(toml|lock))$"
)
WEB_STANDARD_FILES = {
    "humans.txt", "robots.txt", "llms.txt", "404.html", "_headers",
    "favicon.ico", "favicon.svg", "site.webmanifest", "sitemap.xml",
    "manifest.json",
}
DETRITUS_FOLDER_NAMES = {
    "attached_assets", "attached-assets", "_unused", "unused",
    "_drafts", "_scratch", "_old", "tmp", "temp",
}
IGNORED_DIRS = {
    ".git", "node_modules", ".cache", ".local", ".config", ".pythonlibs",
    ".upm", "dist", "build", ".next", ".vite", "__pycache__",
}
KEBAB_OK = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
REPLIT_BRANCH_PATTERNS = re.compile(r"^(subrepl-|replit-agent$|agent/)")


class AuditError(RuntimeError):
    """A Git or repository precondition failed."""


def run(args: list[str], cwd: Path) -> str:
    result = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if result.returncode:
        command = " ".join(args)
        detail = result.stderr.strip() or result.stdout.strip() or "no output"
        raise AuditError(f"`{command}` failed ({result.returncode}): {detail}")
    return result.stdout.strip()


def ensure_repository(root: Path) -> None:
    if not root.is_dir():
        raise AuditError(f"repository root does not exist: {root}")
    inside = run(["git", "rev-parse", "--is-inside-work-tree"], root)
    if inside != "true":
        raise AuditError(f"not inside a Git work tree: {root}")


def ensure_base(root: Path, base: str) -> None:
    run(["git", "rev-parse", "--verify", f"{base}^{{commit}}"], root)


def audit_branches(root: Path, base: str) -> tuple[list[dict[str, object]], str]:
    current = run(["git", "branch", "--show-current"], root)
    branches = run(
        ["git", "for-each-ref", "--format=%(refname:short)", "refs/heads/"],
        root,
    ).splitlines()
    merged = set(
        run(
            ["git", "branch", "--merged", base, "--format=%(refname:short)"],
            root,
        ).splitlines()
    )
    ledger: list[dict[str, object]] = []
    for branch in branches:
        if not branch:
            continue
        last = run(
            ["git", "log", "-1", "--format=%ci%x00%an%x00%s", branch],
            root,
        )
        date, author, subject = (last.split("\0", 2) + ["", "", ""])[:3]
        ledger.append({
            "branch": branch,
            "is_current": bool(current) and branch == current,
            "merged_into_base": branch in merged,
            "last_commit_date": date,
            "last_commit_author": author,
            "last_commit_subject": subject,
            "replit_generated_pattern": bool(REPLIT_BRANCH_PATTERNS.match(branch)),
        })
    return ledger, current


def is_exception(path: Path, root: Path) -> bool:
    name = path.name
    if name in WEB_STANDARD_FILES or TOOL_REQUIRED_PATTERNS.match(name):
        return True
    if path.parent == root and name in ROOT_GOVERNANCE_FILES:
        return True
    if name.startswith("."):
        return True
    if path.suffix.lower() in {".tsx", ".jsx"}:
        return True
    if path.suffix.lower() == ".ts" and re.match(r"^use[A-Z]", path.stem):
        return True
    return False


def iter_visible(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        relative = path.relative_to(root)
        if any(part in IGNORED_DIRS for part in relative.parts):
            continue
        yield path


def naming_reason(path: Path, root: Path) -> str | None:
    if is_exception(path, root):
        return None
    name = path.name
    stem = path.stem
    if " " in name:
        return "contains spaces"
    if path.suffix and path.suffix != path.suffix.lower():
        return "uppercase extension"
    if "_" in stem:
        return "uses underscores instead of hyphens"
    if re.search(r"[A-Z]", stem) and not stem.isupper():
        return "mixed/camel/Pascal case"
    if stem.isupper():
        return None  # avoid treating established all-caps docs as clear violations
    if not KEBAB_OK.fullmatch(stem):
        return "not kebab-case"
    return None


def audit_naming(root: Path) -> list[dict[str, str]]:
    violations: list[dict[str, str]] = []
    for path in iter_visible(root):
        if path.is_dir():
            continue
        reason = naming_reason(path, root)
        if reason:
            violations.append({
                "path": path.relative_to(root).as_posix(),
                "reason": reason,
            })
    return sorted(violations, key=lambda item: item["path"])


def audit_detritus(root: Path) -> list[dict[str, object]]:
    found: list[dict[str, object]] = []
    for path in iter_visible(root):
        if not path.is_dir() or path.name not in DETRITUS_FOLDER_NAMES:
            continue
        relative = path.relative_to(root).as_posix()
        tracked = run(["git", "ls-files", "--", relative], root)
        found.append({
            "folder": relative,
            "tracked_file_count": len(tracked.splitlines()) if tracked else 0,
        })
    return sorted(found, key=lambda item: str(item["folder"]))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".")
    parser.add_argument("--base", default="origin/main")
    parser.add_argument(
        "--fetch",
        action="store_true",
        help="run `git fetch --all` before auditing; never prunes",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()
    try:
        ensure_repository(root)
        if args.fetch:
            run(["git", "fetch", "--all"], root)
        ensure_base(root, args.base)
        branches, current = audit_branches(root, args.base)
        report = {
            "root": str(root),
            "base": args.base,
            "fetch_performed": args.fetch,
            "current_branch": current or None,
            "detached_head": not bool(current),
            "branches": branches,
            "naming_violations": audit_naming(root),
            "detritus_folders": audit_detritus(root),
        }
        print(json.dumps(report, indent=2))
        return 0
    except (AuditError, OSError) as exc:
        print(json.dumps({"error": str(exc), "root": str(root)}))
        return 1


if __name__ == "__main__":
    sys.exit(main())