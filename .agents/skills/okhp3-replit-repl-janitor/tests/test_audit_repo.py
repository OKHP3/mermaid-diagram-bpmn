from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "audit-repo.py"
SPEC = importlib.util.spec_from_file_location("audit_repo", SCRIPT)
assert SPEC and SPEC.loader
audit_repo = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(audit_repo)


class AuditRepoTests(unittest.TestCase):
    def test_pre_delete_tip_change_holds_and_emits_no_deletion_commands(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            self._git(root, "switch", "-q", "-c", "feature/cleanup")
            (root / "reviewed.txt").write_text("reviewed\n", encoding="utf-8")
            self._git(root, "add", "reviewed.txt")
            self._git(root, "commit", "-qm", "reviewed work")
            reviewed_head = self._git(root, "rev-parse", "HEAD").strip()

            (root / "moved.txt").write_text("changed\n", encoding="utf-8")
            self._git(root, "add", "moved.txt")
            self._git(root, "commit", "-qm", "moved branch tip")

            check = audit_repo.prepare_branch_deletion(
                root,
                "feature/cleanup",
                reviewed_head,
            )
            self.assertEqual(check["bucket"], "review")
            self.assertEqual(check["reviewed_head"], reviewed_head)
            self.assertEqual(
                check["current_head"],
                self._git(root, "rev-parse", "HEAD").strip(),
            )
            self.assertEqual(check["deletion_commands"], [])

    def test_pre_delete_matching_tip_keeps_remote_first_sequence(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._init_repo(root)
            self._git(root, "switch", "-q", "-c", "feature/cleanup")
            (root / "reviewed.txt").write_text("reviewed\n", encoding="utf-8")
            self._git(root, "add", "reviewed.txt")
            self._git(root, "commit", "-qm", "reviewed work")
            reviewed_head = self._git(root, "rev-parse", "HEAD").strip()

            check = audit_repo.prepare_branch_deletion(
                root,
                "feature/cleanup",
                reviewed_head,
                remote="upstream",
            )
            self.assertEqual(check["bucket"], "delete")
            self.assertEqual(check["reviewed_head"], reviewed_head)
            self.assertEqual(check["current_head"], reviewed_head)
            self.assertEqual(check["deletion_commands"], [
                ["git", "push", "upstream", "--delete", "feature/cleanup"],
                ["git", "branch", "-d", "feature/cleanup"],
            ])

    def test_cli_rejects_missing_deletion_approval_details(self) -> None:
        invalid_invocations = [
            (["--reviewed-head", "reviewed-sha"], "--check-delete requires --branch"),
            (["--branch", "feature/cleanup"], "--check-delete requires --reviewed-head"),
        ]
        for arguments, expected_error in invalid_invocations:
            with self.subTest(arguments=arguments), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                self._init_repo(root)

                result = subprocess.run(
                    [
                        sys.executable,
                        str(SCRIPT),
                        "--root",
                        str(root),
                        "--check-delete",
                        *arguments,
                    ],
                    check=False,
                    capture_output=True,
                    text=True,
                )

                self.assertNotEqual(result.returncode, 0)
                error_report = json.loads(result.stdout)
                self.assertEqual(error_report["error"], expected_error)
                self.assertNotIn("deletion_commands", error_report)
                self.assertNotIn('"bucket": "delete"', result.stdout)

    def test_naming_exceptions_and_violations(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in [
                "SiteTokens.css", "useDebounce.ts", "ChatPane.tsx",
                "My Document.md", "README.md", "robots.txt", "my_file.json",
                "photo.PNG",
            ]:
                (root / name).write_text("x", encoding="utf-8")
            violations = {
                item["path"]: item["reason"]
                for item in audit_repo.audit_naming(root)
            }
            self.assertEqual(violations["SiteTokens.css"], "mixed/camel/Pascal case")
            self.assertEqual(violations["My Document.md"], "contains spaces")
            self.assertEqual(violations["my_file.json"], "uses underscores instead of hyphens")
            self.assertEqual(violations["photo.PNG"], "uppercase extension")
            self.assertNotIn("useDebounce.ts", violations)
            self.assertNotIn("ChatPane.tsx", violations)
            self.assertNotIn("README.md", violations)
            self.assertNotIn("robots.txt", violations)

    def test_nested_detritus_is_reported(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(["git", "init", "-q", str(root)], check=True)
            nested = root / "docs" / "attached_assets"
            nested.mkdir(parents=True)
            (nested / "note.txt").write_text("x", encoding="utf-8")
            folders = audit_repo.audit_detritus(root)
            self.assertEqual(folders[0]["folder"], "docs/attached_assets")

    def test_missing_base_fails_visibly(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            subprocess.run(["git", "init", "-q", str(root)], check=True)
            with self.assertRaises(audit_repo.AuditError):
                audit_repo.ensure_base(root, "origin/main")

    @staticmethod
    def _git(root: Path, *args: str) -> str:
        result = subprocess.run(
            ["git", *args],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout

    def _init_repo(self, root: Path) -> None:
        self._git(root, "init", "-q", "-b", "main")
        self._git(root, "config", "user.email", "test@example.com")
        self._git(root, "config", "user.name", "Audit Test")
        (root / "README.md").write_text("fixture\n", encoding="utf-8")
        self._git(root, "add", "README.md")
        self._git(root, "commit", "-qm", "initial")


if __name__ == "__main__":
    unittest.main()