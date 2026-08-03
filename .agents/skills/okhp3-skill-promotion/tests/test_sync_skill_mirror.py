import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "sync_skill_mirror.py"


class SyncSkillMirrorTests(unittest.TestCase):
    def run_script(self, *args):
        return subprocess.run(
            [sys.executable, str(SCRIPT), *args],
            text=True,
            capture_output=True,
            check=False,
        )

    def make_source(self, root):
        source = root / "source" / "okhp3-example"
        (source / "references").mkdir(parents=True)
        (source / "SKILL.md").write_text("---\nname: okhp3-example\n---\n", encoding="utf-8")
        (source / "references" / "note.md").write_text("public-safe\n", encoding="utf-8")
        return source

    def test_sync_then_check_is_exact(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = self.make_source(root)
            destination = root / "skills" / "okhp3-example"
            synced = self.run_script("--source", str(source), "--destination", str(destination), "--sync")
            self.assertEqual(synced.returncode, 0, synced.stdout + synced.stderr)
            checked = self.run_script("--source", str(source), "--destination", str(destination), "--check")
            self.assertEqual(checked.returncode, 0, checked.stdout + checked.stderr)
            report = json.loads(checked.stdout)
            self.assertTrue(report["comparison"]["exact"])

    def test_changed_destination_requires_overwrite(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = self.make_source(root)
            destination = root / "skills" / "okhp3-example"
            self.assertEqual(self.run_script("--source", str(source), "--destination", str(destination), "--sync").returncode, 0)
            (destination / "SKILL.md").write_text("divergent\n", encoding="utf-8")
            refused = self.run_script("--source", str(source), "--destination", str(destination), "--sync")
            self.assertEqual(refused.returncode, 2)
            approved = self.run_script("--source", str(source), "--destination", str(destination), "--sync", "--overwrite")
            self.assertEqual(approved.returncode, 0, approved.stdout + approved.stderr)

    def test_destination_only_file_is_preserved_and_blocks_sync(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = self.make_source(root)
            destination = root / "skills" / "okhp3-example"
            self.assertEqual(self.run_script("--source", str(source), "--destination", str(destination), "--sync").returncode, 0)
            extra = destination / "unreviewed.txt"
            extra.write_text("keep me\n", encoding="utf-8")
            refused = self.run_script("--source", str(source), "--destination", str(destination), "--sync", "--overwrite")
            self.assertEqual(refused.returncode, 2)
            self.assertTrue(extra.exists())

    def test_package_name_must_match_destination(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = self.make_source(root)
            destination = root / "skills" / "different-name"
            refused = self.run_script("--source", str(source), "--destination", str(destination), "--sync")
            self.assertEqual(refused.returncode, 2)

    def test_nonportable_package_name_is_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "source" / "Bad_Name"
            source.mkdir(parents=True)
            (source / "SKILL.md").write_text("---\nname: Bad_Name\n---\n", encoding="utf-8")
            destination = root / "skills" / "Bad_Name"
            refused = self.run_script("--source", str(source), "--destination", str(destination), "--sync")
            self.assertEqual(refused.returncode, 2)


if __name__ == "__main__":
    unittest.main()
