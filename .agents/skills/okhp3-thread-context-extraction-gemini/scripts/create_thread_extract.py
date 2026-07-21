#!/usr/bin/env python3
"""Validate and assemble a reviewed thread-context extract as Markdown."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import tempfile
import unicodedata
from pathlib import Path

ALLOWED_CAPTURE_MODES = {"full-paste", "turn-by-turn", "export-excerpt", "unknown"}
ALLOWED_COMPLETENESS = {"complete", "partial", "unknown"}
EXTRACTION_DEPTH_ALIASES = {
    "rapid": "rapid",
    "essential": "rapid",
    "scan": "rapid",
    "balanced": "balanced",
    "substantial": "balanced",
    "distill": "balanced",
    "comprehensive": "comprehensive",
    "exhaustive": "comprehensive",
    "catalog": "comprehensive",
}
ALLOWED_RETENTION = {"public-safe", "private-only", "redacted", "needs-review"}
ALLOWED_SOURCE_INDEPENDENCE = {"pass", "blocked"}
FILLER_WORDS = {"a", "an", "and", "for", "from", "of", "the", "to", "with"}
REQUIRED_HEADINGS = (
    "## Introduction",
    "## Extraction profile",
    "## Coverage accounting",
    "## Source synopsis",
    "## Turn ledger",
    "## Content element ledger",
    "## Normalization exceptions",
    "## Value inventory",
    "## Decisions and rationale",
    "## Actionable handoff",
    "## Reusable methods and assets",
    "## Open questions and limits",
    "## Rehydration test",
    "## Provenance and retention",
)


class UserInputError(ValueError):
    """A recoverable error in the supplied command arguments or body draft."""


def validate_scalar(value: str, field: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise UserInputError(f"{field} must not be empty")
    if any(character in cleaned for character in ("\r", "\n", "\x00")):
        raise UserInputError(f"{field} must be a single-line value")
    return cleaned


def quoted(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def slugify(value: str) -> str:
    ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    words = re.findall(r"[A-Za-z0-9]+", ascii_value.lower())
    useful = [word for word in words if word not in FILLER_WORDS] or words
    slug = "-".join(useful).strip("-")[:72].strip("-")
    if not slug:
        raise UserInputError("primary-topic does not contain filename-safe characters")
    return slug


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Run from the destination repository root. Resolve this script relative to "
            "the installed SKILL.md. Use --dry-run first when the destination may collide."
        ),
    )
    parser.add_argument("--repo-root", default=".", help="Destination repository root; defaults to current directory")
    parser.add_argument("--output-dir", required=True, help="Safe repository-relative destination directory")
    parser.add_argument("--primary-topic", required=True, help="Six to twelve word topic distilled from the introduction")
    parser.add_argument("--title", default="", help="Artifact title; defaults to the primary topic")
    parser.add_argument("--platform", required=True, help="Source platform or unknown")
    parser.add_argument("--capture-mode", required=True, choices=sorted(ALLOWED_CAPTURE_MODES))
    parser.add_argument("--completeness", required=True, choices=sorted(ALLOWED_COMPLETENESS))
    parser.add_argument("--extraction-depth", default="balanced", choices=sorted(EXTRACTION_DEPTH_ALIASES))
    parser.add_argument("--requested-depth", default="not supplied", help="Original depth trigger before alias normalization")
    parser.add_argument("--retention-decision", default="needs-review", choices=sorted(ALLOWED_RETENTION))
    parser.add_argument("--source-independence", required=True, choices=sorted(ALLOWED_SOURCE_INDEPENDENCE))
    parser.add_argument("--source-title", default="not supplied")
    parser.add_argument("--source-date", default="unknown")
    parser.add_argument("--source-time-context", default="unknown")
    parser.add_argument("--source-locator", default="not supplied")
    parser.add_argument("--body-file", required=True, help="Reviewed Markdown body based on the bundled template")
    parser.add_argument("--allow-existing", action="store_true", help="Replace an existing file after deliberate comparison")
    parser.add_argument("--allow-placeholders", action="store_true", help="Permit template comments in a deliberately incomplete draft")
    parser.add_argument("--dry-run", action="store_true", help="Validate and report the destination without writing")
    parser.add_argument("--json", action="store_true", help="Write a JSON result to stdout")
    return parser.parse_args()


def resolve_destination(repo_root_arg: str, output_dir_arg: str, primary_topic: str) -> tuple[Path, Path]:
    repo_root = Path(repo_root_arg).expanduser().resolve()
    if not repo_root.is_dir():
        raise UserInputError(f"repo-root is not a directory: {repo_root}")

    output_dir = Path(output_dir_arg)
    if output_dir.is_absolute() or ".." in output_dir.parts:
        raise UserInputError("output-dir must be a safe repository-relative path")

    resolved_output = (repo_root / output_dir).resolve()
    try:
        resolved_output.relative_to(repo_root)
    except ValueError as error:
        raise UserInputError("output-dir resolves outside repo-root") from error
    return repo_root, resolved_output / f"{slugify(primary_topic)}.md"


def read_and_validate_body(body_file: str, allow_placeholders: bool) -> str:
    body_path = Path(body_file).expanduser().resolve()
    if not body_path.is_file():
        raise UserInputError(f"body-file does not exist: {body_path}")
    try:
        body = body_path.read_text(encoding="utf-8").strip()
    except UnicodeDecodeError as error:
        raise UserInputError(f"body-file must be UTF-8: {body_path}") from error

    missing = [heading for heading in REQUIRED_HEADINGS if heading not in body]
    if missing:
        raise UserInputError("body-file is missing required headings: " + ", ".join(missing))
    if not body.startswith("## Introduction"):
        raise UserInputError("body-file must begin with '## Introduction'")
    if "<!--" in body and not allow_placeholders:
        raise UserInputError(
            "body-file still contains template comments; complete them or use "
            "--allow-placeholders for an intentionally incomplete draft"
        )
    return body


def assemble_frontmatter(args: argparse.Namespace, title: str, primary_topic: str) -> str:
    values = {
        "title": title,
        "primary_topic": primary_topic,
        "source_platform": validate_scalar(args.platform, "platform"),
        "capture_mode": args.capture_mode,
        "completeness": args.completeness,
        "extraction_depth": EXTRACTION_DEPTH_ALIASES[args.extraction_depth],
        "requested_extraction_depth": validate_scalar(args.requested_depth, "requested-depth"),
        "source_title": validate_scalar(args.source_title, "source-title"),
        "source_date": validate_scalar(args.source_date, "source-date"),
        "source_time_context": validate_scalar(args.source_time_context, "source-time-context"),
        "source_locator": validate_scalar(args.source_locator, "source-locator"),
        "retention_decision": args.retention_decision,
        "source_independence": args.source_independence,
    }
    generated_at = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    lines = ["---"]
    lines.extend(f"{key}: {quoted(value)}" for key, value in values.items())
    lines.extend(
        [
            f"generated_at: {quoted(generated_at)}",
            'schema_version: "2.0"',
            "artifact_type: thread-context-extract",
            "---",
        ]
    )
    return "\n".join(lines)


def atomic_write(destination: Path, content: str) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temp_name = tempfile.mkstemp(
        prefix=f".{destination.stem}-", suffix=".tmp", dir=destination.parent
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        Path(temp_name).replace(destination)
    except Exception:
        Path(temp_name).unlink(missing_ok=True)
        raise


def emit_result(args: argparse.Namespace, destination: Path, depth: str, wrote: bool) -> None:
    result = {
        "status": "written" if wrote else "validated",
        "path": destination.as_posix(),
        "extraction_depth": depth,
        "source_independence": args.source_independence,
        "retention_decision": args.retention_decision,
    }
    if args.json:
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    else:
        action = "would write" if not wrote else "wrote"
        print(f"{action}: {destination.as_posix()}")


def main() -> int:
    args = parse_args()
    primary_topic = validate_scalar(args.primary_topic, "primary-topic")
    title = validate_scalar(args.title or primary_topic, "title")
    body = read_and_validate_body(args.body_file, args.allow_placeholders)
    _, destination = resolve_destination(args.repo_root, args.output_dir, primary_topic)

    if destination.exists() and not args.allow_existing:
        raise UserInputError(f"refusing to overwrite existing artifact: {destination}")

    frontmatter = assemble_frontmatter(args, title, primary_topic)
    content = f"{frontmatter}\n\n# {title}\n\n{body}\n"
    if args.dry_run:
        emit_result(args, destination, EXTRACTION_DEPTH_ALIASES[args.extraction_depth], wrote=False)
        return 0

    atomic_write(destination, content)
    emit_result(args, destination, EXTRACTION_DEPTH_ALIASES[args.extraction_depth], wrote=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except UserInputError as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(2)
    except OSError as error:
        print(f"filesystem error: {error}", file=sys.stderr)
        raise SystemExit(3)
