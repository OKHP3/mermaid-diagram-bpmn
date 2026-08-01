#!/usr/bin/env python3
"""Audit top-level Git checkouts below a mirror root without altering worktrees."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def run(repo: Path, *args: str, check: bool = False) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args], text=True, capture_output=True
    )
    if check and result.returncode:
        raise RuntimeError(result.stderr.strip() or "git command failed")
    return result.stdout.strip()


def lines(value: str) -> list[str]:
    return [line for line in value.splitlines() if line]


def ref_exists(repo: Path, ref: str) -> bool:
    return subprocess.run(
        ["git", "-C", str(repo), "show-ref", "--verify", "--quiet", ref]
    ).returncode == 0


def is_ancestor(repo: Path, older: str, newer: str) -> bool | None:
    result = subprocess.run(
        ["git", "-C", str(repo), "merge-base", "--is-ancestor", older, newer],
        capture_output=True,
    )
    if result.returncode == 0:
        return True
    if result.returncode == 1:
        return False
    return None


def audit_repo(repo: Path, fetch: bool, include_unreachable: bool) -> dict:
    record: dict = {"path": str(repo), "name": repo.name}
    if fetch:
        result = subprocess.run(
            ["git", "-C", str(repo), "fetch", "origin", "--quiet"],
            text=True,
            capture_output=True,
        )
        record["fetch"] = "ok" if result.returncode == 0 else result.stderr.strip()

    record["origin"] = run(repo, "remote", "get-url", "origin") or None
    record["head"] = run(repo, "rev-parse", "--short", "HEAD")
    record["current_branch"] = run(repo, "symbolic-ref", "--short", "-q", "HEAD") or "DETACHED"
    record["working_tree"] = lines(run(repo, "status", "--porcelain=v1"))
    record["stashes"] = lines(run(repo, "stash", "list"))
    record["local_only_commits"] = lines(
        run(repo, "log", "--branches", "--tags", "HEAD", "--not", "--remotes", "--format=%H")
    )
    record["archive_refs"] = lines(
        run(repo, "for-each-ref", "--format=%(refname:short)", "refs/archive")
    )

    baseline = "origin/main"
    record["has_origin_main"] = ref_exists(repo, f"refs/remotes/{baseline}")
    if record["has_origin_main"]:
        ahead_behind = run(repo, "rev-list", "--left-right", "--count", f"HEAD...{baseline}")
        ahead, behind = (ahead_behind.split() + ["0", "0"])[:2]
        record["head_vs_origin_main"] = {
            "ahead": int(ahead),
            "behind": int(behind),
            "direct_changed_files": lines(run(repo, "diff", "--name-status", baseline)),
            "changed_from_shared_base": lines(
                run(repo, "diff", "--name-status", f"{baseline}...HEAD")
            ),
        }
    else:
        record["head_vs_origin_main"] = None

    local = lines(run(repo, "for-each-ref", "--format=%(refname:short)", "refs/heads"))
    remote = lines(run(repo, "for-each-ref", "--format=%(refname:short)", "refs/remotes/origin"))
    local_branch_records = []
    for name in local:
        local_branch_records.append(
            {
                "name": name,
                "tip": run(repo, "rev-parse", "--short", name),
                "vs_origin_main": {
                    "ahead": int((run(repo, "rev-list", "--left-right", "--count", f"{baseline}...{name}").split() + ["0", "0"])[1]),
                    "behind": int((run(repo, "rev-list", "--left-right", "--count", f"{baseline}...{name}").split() + ["0", "0"])[0]),
                    "changed_files": lines(run(repo, "diff", "--name-status", f"{baseline}...{name}")),
                }
                if record["has_origin_main"]
                else None,
            }
        )
    record["local_branches"] = local_branch_records
    branch_records = []
    for full_name in remote:
        if full_name == "origin":
            continue
        name = full_name.removeprefix("origin/")
        if name in ("main", "HEAD"):
            continue
        branch_record = {
            "name": name,
            "tip": run(repo, "rev-parse", "--short", full_name),
            "merged_into_origin_main": is_ancestor(repo, full_name, baseline)
            if record["has_origin_main"]
            else None,
        }
        if record["has_origin_main"]:
            ahead_behind = run(
                repo, "rev-list", "--left-right", "--count", f"{baseline}...{full_name}"
            ).split()
            branch_record["vs_origin_main"] = {
                "ahead": int((ahead_behind + ["0", "0"])[1]),
                "behind": int((ahead_behind + ["0", "0"])[0]),
                "changed_files": lines(run(repo, "diff", "--name-status", f"{baseline}...{full_name}")),
            }
        else:
            branch_record["vs_origin_main"] = None
        branch_records.append(branch_record)
    record["non_main_remote_branches"] = branch_records

    if include_unreachable:
        record["unreachable_commits"] = [
            line.rsplit(" ", 1)[-1]
            for line in lines(run(repo, "fsck", "--full", "--no-reflogs", "--unreachable"))
            if line.startswith("unreachable commit ")
        ]
    return record


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mirror_root", type=Path)
    parser.add_argument("--fetch", action="store_true", help="refresh origin refs without pruning")
    parser.add_argument("--include-unreachable", action="store_true")
    parser.add_argument("--output", type=Path, help="write JSON report to this file")
    args = parser.parse_args()

    root = args.mirror_root.resolve()
    if not root.is_dir():
        parser.error(f"not a directory: {root}")
    repos = [root] if (root / ".git").exists() else sorted(
        path for path in root.iterdir() if (path / ".git").exists()
    )
    report = {
        "mirror_root": str(root),
        "repository_count": len(repos),
        "repositories": [audit_repo(repo, args.fetch, args.include_unreachable) for repo in repos],
    }
    payload = json.dumps(report, indent=2, sort_keys=True)
    if args.output:
        args.output.write_text(payload + "\n", encoding="utf-8")
    else:
        print(payload)
    return 0


if __name__ == "__main__":
    sys.exit(main())
