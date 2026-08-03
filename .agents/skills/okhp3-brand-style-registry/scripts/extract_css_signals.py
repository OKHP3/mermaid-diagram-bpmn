#!/usr/bin/env python3
"""Extract deterministic style signals from a CSS file for profile capture.

This helper does not infer semantics or create a final brand profile. It emits
auditable observations for an agent to map into the profile schema.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path
from typing import Iterable


COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)
CUSTOM_PROPERTY_RE = re.compile(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]+)")
FONT_FAMILY_RE = re.compile(r"font-family\s*:\s*([^;{}]+)", re.IGNORECASE)
COLOR_RE = re.compile(
    r"(?:#[0-9a-fA-F]{3,8}\b|(?:rgb|hsl)a?\([^)]*\)|\b(?:transparent|currentColor)\b)",
    re.IGNORECASE,
)
RADIUS_RE = re.compile(r"border-radius\s*:\s*([^;{}]+)", re.IGNORECASE)
TRANSITION_RE = re.compile(r"transition(?:-[\w-]+)?\s*:\s*([^;{}]+)", re.IGNORECASE)
SPACING_RE = re.compile(
    r"(?:padding|margin|gap|inset|top|right|bottom|left|width|max-width|min-width|line-height)\s*:\s*([^;{}]+)",
    re.IGNORECASE,
)


def unique(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        clean = " ".join(value.strip().split())
        if clean and clean not in seen:
            seen.add(clean)
            result.append(clean)
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract CSS variables, colors, fonts, geometry, and motion signals as JSON."
    )
    parser.add_argument("--input", required=True, help="Path to the CSS file to inspect.")
    parser.add_argument("--source", help="Public or repository source locator to preserve in output.")
    parser.add_argument("--sampled-on", default=date.today().isoformat(), help="ISO sampling date.")
    parser.add_argument("--output", default="-", help="Output JSON path, or - for stdout.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    path = Path(args.input)
    if not path.is_file():
        raise SystemExit(f"Input CSS file not found: {path}")

    raw = path.read_text(encoding="utf-8-sig", errors="replace")
    css = COMMENT_RE.sub("", raw)
    custom_properties = [
        {"name": name, "value": " ".join(value.strip().split())}
        for name, value in CUSTOM_PROPERTY_RE.findall(css)
    ]
    payload = {
        "schema_version": "1.0",
        "source": {
            "path": str(path),
            "locator": args.source or str(path),
            "sampled_on": args.sampled_on,
            "bytes": len(raw.encode("utf-8")),
        },
        "signals": {
            "custom_properties": custom_properties,
            "colors": unique(COLOR_RE.findall(css)),
            "font_families": unique(FONT_FAMILY_RE.findall(css)),
            "radii": unique(RADIUS_RE.findall(css)),
            "transitions": unique(TRANSITION_RE.findall(css)),
            "spacing_and_dimensions": unique(SPACING_RE.findall(css)),
        },
        "notes": [
            "Signals are observations, not semantic profile decisions.",
            "Map custom properties to foundation or semantic roles only when their source context supports that claim.",
        ],
    }
    rendered = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    if args.output == "-":
        print(rendered, end="")
    else:
        Path(args.output).write_text(rendered, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
