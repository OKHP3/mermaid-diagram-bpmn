"""
Tests for write_family_md in gen-skills-readme.py.

Covers:
  - display_name present in existing FAMILY.md is preserved on regeneration.
  - display_name absent from existing FAMILY.md produces no spurious line.
"""

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

# ── Load the script as a module (it has no package structure) ────────────────

SCRIPT = Path(__file__).parents[1] / "scripts" / "gen-skills-readme.py"

spec = importlib.util.spec_from_file_location("gen_skills_readme", SCRIPT)
mod  = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

write_family_md   = mod.write_family_md
parse_frontmatter = mod.parse_frontmatter

FAMILY_SUMMARY_START = mod.FAMILY_SUMMARY_START
FAMILY_SUMMARY_END   = mod.FAMILY_SUMMARY_END


# ── Helpers ──────────────────────────────────────────────────────────────────

def _make_existing_family_md(family_dir: Path, display_name: str | None = None) -> Path:
    """
    Write a minimal FAMILY.md with or without a display_name frontmatter field,
    including the required FAMILY_SUMMARY markers so preservation logic fires.
    """
    dn_line = f"display_name: {display_name}\n" if display_name else ""
    content = (
        f"---\n"
        f"family: {family_dir.name}\n"
        f"{dn_line}"
        f"skill_count: 1\n"
        f"generated_by: okhp3-skill-cataloger v1.7.0\n"
        f"generated_at: 2026-01-01T00:00:00Z\n"
        f"---\n"
        f"\n"
        f"# {family_dir.name}\n"
        f"\n"
        f"{FAMILY_SUMMARY_START}\n"
        f"A test family summary.\n"
        f"{FAMILY_SUMMARY_END}\n"
        f"\n"
        f"## Skills (1)\n"
        f"\n"
        f"<!-- FAMILY_INVENTORY_START -->\n"
        f"*1 skill*\n"
        f"<!-- FAMILY_INVENTORY_END -->\n"
    )
    path = family_dir / "FAMILY.md"
    path.write_text(content, encoding="utf-8")
    return path


def _minimal_skills() -> list[dict]:
    """Return a minimal skills list accepted by write_family_md."""
    return [{
        "name":         "okhp3-example",
        "dir_name":     "okhp3-example",
        "description":  "An example skill.",
        "version":      "1.0.0",
        "category":     "test-family",
        "origin":       "—",
        "path":         "test-family/okhp3-example/SKILL.md",
        "name_mismatch": False,
    }]


# ── Tests ────────────────────────────────────────────────────────────────────

class TestWriteFamilyMdDisplayName(unittest.TestCase):

    def test_display_name_preserved_on_regeneration(self):
        """
        When an existing FAMILY.md has display_name in its frontmatter,
        write_family_md must carry it into the regenerated output unchanged.
        """
        with tempfile.TemporaryDirectory() as tmp:
            family_dir = Path(tmp) / "test-family"
            family_dir.mkdir()

            _make_existing_family_md(family_dir, display_name="Test Family")

            write_family_md(
                family_dir,
                _minimal_skills(),
                quiet=True,
                dry_run=False,
                absorb_readme=False,
            )

            fm = parse_frontmatter(family_dir / "FAMILY.md")
            self.assertIn(
                "display_name", fm,
                "display_name must be present in the regenerated FAMILY.md frontmatter",
            )
            self.assertEqual(
                fm["display_name"],
                "Test Family",
                "display_name value must be preserved exactly as written",
            )

    def test_display_name_absent_produces_no_spurious_line(self):
        """
        When an existing FAMILY.md has no display_name field,
        write_family_md must not emit a display_name line in the output.
        """
        with tempfile.TemporaryDirectory() as tmp:
            family_dir = Path(tmp) / "test-family"
            family_dir.mkdir()

            _make_existing_family_md(family_dir, display_name=None)

            write_family_md(
                family_dir,
                _minimal_skills(),
                quiet=True,
                dry_run=False,
                absorb_readme=False,
            )

            fm = parse_frontmatter(family_dir / "FAMILY.md")
            self.assertNotIn(
                "display_name", fm,
                "display_name must NOT appear in output when it was not in the original",
            )

            raw = (family_dir / "FAMILY.md").read_text(encoding="utf-8")
            self.assertNotIn(
                "display_name:",
                raw,
                "The literal string 'display_name:' must not appear in output when absent",
            )

    def test_display_name_preserved_on_first_creation(self):
        """
        When FAMILY.md does not yet exist (first run), no display_name should
        be emitted — there is no pre-existing value to carry forward.
        """
        with tempfile.TemporaryDirectory() as tmp:
            family_dir = Path(tmp) / "test-family"
            family_dir.mkdir()

            # No existing FAMILY.md — first creation scenario
            write_family_md(
                family_dir,
                _minimal_skills(),
                quiet=True,
                dry_run=False,
                absorb_readme=False,
            )

            fm = parse_frontmatter(family_dir / "FAMILY.md")
            self.assertNotIn(
                "display_name", fm,
                "display_name must not appear on first creation when no prior value exists",
            )


if __name__ == "__main__":
    unittest.main()
