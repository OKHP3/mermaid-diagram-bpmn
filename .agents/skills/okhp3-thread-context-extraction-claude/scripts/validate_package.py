#!/usr/bin/env python3
"""Validate the local structure and operating contract of this skill package."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

REQUIRED_FILES = (
    "SKILL.md",
    "agents/openai.yaml",
    "assets/thread-extract-template.md",
    "evals/evals.json",
    "evals/benchmark.md",
    "evals/trigger-evals.json",
    "references/evidence-map.md",
    "references/extraction-contract.md",
    "references/extraction-depth-profiles.md",
    "references/platform-capture-patterns.md",
    "scripts/create_thread_extract.py",
    "scripts/validate_package.py",
)
NAME_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def frontmatter(text: str) -> str:
    match = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not match:
        raise ValueError("SKILL.md must begin with YAML frontmatter")
    return match.group(1)


def folded_value(block: str, key: str) -> str:
    match = re.search(rf"(?ms)^{re.escape(key)}:\s*>?\s*\n?(.*?)(?=^[a-z][a-z0-9_-]*:|\Z)", block)
    if not match:
        return ""
    return " ".join(line.strip() for line in match.group(1).splitlines()).strip()


def scalar_value(block: str, key: str) -> str:
    match = re.search(rf"(?m)^{re.escape(key)}:\s*(.+)$", block)
    return match.group(1).strip().strip('"') if match else ""


def run_validation(root: Path) -> list[str]:
    failures: list[str] = []
    for relative in REQUIRED_FILES:
        if not (root / relative).is_file():
            failures.append(f"missing required file: {relative}")

    skill_path = root / "SKILL.md"
    if not skill_path.is_file():
        return failures
    skill_text = skill_path.read_text(encoding="utf-8")
    try:
        metadata = frontmatter(skill_text)
    except ValueError as error:
        failures.append(str(error))
        return failures

    name = scalar_value(metadata, "name")
    description = folded_value(metadata, "description")
    compatibility = folded_value(metadata, "compatibility")
    if name != root.name:
        failures.append(f"frontmatter name must equal directory name: {root.name}")
    if len(name) > 64 or not NAME_PATTERN.fullmatch(name):
        failures.append("name must be 64 characters or fewer and use lowercase letters, digits, and hyphens")
    if not description or len(description) > 1024:
        failures.append(f"description must contain 1 to 1024 characters; found {len(description)}")
    if "Use when" not in description or "Do not use" not in description:
        failures.append("description must include positive 'Use when' and negative 'Do not use' activation boundaries")
    if compatibility and len(compatibility) > 500:
        failures.append("compatibility must not exceed 500 characters")
    if len(skill_text.splitlines()) > 500:
        failures.append("SKILL.md exceeds the 500-line progressive-disclosure limit")
    if "\u2014" in skill_text:
        failures.append("SKILL.md contains an em dash, which repository policy forbids")
    if re.search(r"(?m)^\s{4,}-\s", metadata):
        failures.append("frontmatter metadata must not contain nested YAML lists")

    eval_path = root / "evals/evals.json"
    if eval_path.is_file():
        try:
            evals = json.loads(eval_path.read_text(encoding="utf-8"))
            cases = evals.get("evals", [])
            if len(cases) != 3:
                failures.append(f"evals/evals.json must contain exactly 3 evals; found {len(cases)}")
            for case in cases:
                if not case.get("expected_output"):
                    failures.append(f"eval {case.get('id', '?')} must define expected_output")
                if not isinstance(case.get("files"), list):
                    failures.append(f"eval {case.get('id', '?')} files must be an array")
                if len(case.get("expectations", [])) != 4:
                    failures.append(f"eval {case.get('id', '?')} must contain exactly 4 expectations")
                for relative in case.get("files", []):
                    if not (root / relative).is_file():
                        failures.append(f"eval {case.get('id', '?')} references missing file: {relative}")
        except (json.JSONDecodeError, OSError) as error:
            failures.append(f"invalid evals/evals.json: {error}")

    trigger_path = root / "evals/trigger-evals.json"
    if trigger_path.is_file():
        try:
            trigger_evals = json.loads(trigger_path.read_text(encoding="utf-8"))
            positives = trigger_evals.get("should_trigger", [])
            negatives = trigger_evals.get("should_not_trigger", [])
            if len(positives) != 10 or len(negatives) != 10:
                failures.append(
                    "evals/trigger-evals.json must contain exactly 10 positive and 10 near-miss negative queries"
                )
            if len(set(positives + negatives)) != len(positives + negatives):
                failures.append("trigger eval queries must be unique")
        except (json.JSONDecodeError, OSError) as error:
            failures.append(f"invalid evals/trigger-evals.json: {error}")

    writer = root / "scripts/create_thread_extract.py"
    if writer.is_file():
        result = subprocess.run(
            [sys.executable, str(writer), "--help"],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            failures.append("create_thread_extract.py --help failed")
    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skill-root", default=str(Path(__file__).resolve().parents[1]))
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    root = Path(args.skill_root).resolve()
    failures = run_validation(root)
    result = {"skill": root.name, "valid": not failures, "failures": failures}
    if args.json:
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    elif failures:
        print(f"INVALID: {root}")
        for failure in failures:
            print(f"- {failure}")
    else:
        print(f"VALID: {root}")
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
