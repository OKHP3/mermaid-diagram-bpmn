from __future__ import annotations

import importlib.util
import json
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Any


SCRIPT = Path(__file__).with_name("run-native-telemetry.py")
SPEC = importlib.util.spec_from_file_location("run_native_telemetry", SCRIPT)
assert SPEC and SPEC.loader
native_telemetry = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(native_telemetry)


QUERIES = [
    {"id": "trigger-01", "should_trigger": True},
    {"id": "trigger-02", "should_trigger": False},
]
BENCHMARK_FIXTURE = SCRIPT.with_name("benchmark.json")
RESULTS_FIXTURE = SCRIPT.parent.parent / "evals" / "results.md"


def event(
    event_id: str,
    query_id: str = "trigger-01",
    event_type: str = "skill_activation",
    data: dict[str, Any] | None = None,
    **overrides: Any,
) -> dict[str, Any]:
    result: dict[str, Any] = {
        "event_id": event_id,
        "timestamp": "2026-09-04T12:00:00Z",
        "run_id": "test-run",
        "query_id": query_id,
        "event_type": event_type,
        "source": native_telemetry.SOURCE,
        "evidence_tier": native_telemetry.EVIDENCE_TIER,
        "data": data if data is not None else {"activated": True},
    }
    result.update(overrides)
    return result


class NativeTelemetryImportTests(unittest.TestCase):
    def write_export(self, content: str) -> Path:
        temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(temporary_directory.cleanup)
        path = Path(temporary_directory.name) / "events.jsonl"
        path.write_text(content, encoding="utf-8")
        return path

    def test_one_event_jsonl_is_imported_as_one_host_event(self) -> None:
        single_event = event("event-1")
        path = self.write_export(json.dumps(single_event) + "\n")

        metadata, raw_events = native_telemetry.read_event_export(path)
        imported = native_telemetry.validate_export(metadata, raw_events)

        self.assertEqual(metadata, {"schema_version": "1.0", "source": native_telemetry.SOURCE, "host": "unknown"})
        self.assertEqual(imported, [single_event])

    def test_json_envelope_preserves_metadata_and_events(self) -> None:
        first_event = event("event-1")
        second_event = event(
            "event-2",
            event_type="quota_state",
            data={"state": "blocked"},
        )
        envelope = {
            "schema_version": "1.0",
            "source": native_telemetry.SOURCE,
            "host": "test-host",
            "exported_at": "2026-09-04T12:01:00Z",
            "events": [first_event, second_event],
        }
        path = self.write_export(json.dumps(envelope))

        metadata, raw_events = native_telemetry.read_event_export(path)
        imported = native_telemetry.validate_export(metadata, raw_events)

        self.assertEqual(metadata, {key: value for key, value in envelope.items() if key != "events"})
        self.assertEqual(imported, [first_event, second_event])

    def test_multi_event_jsonl_imports_each_line(self) -> None:
        first_event = event("event-1")
        second_event = event(
            "event-2",
            query_id="trigger-02",
            event_type="quota_state",
            data={"state": "available"},
        )
        path = self.write_export("\n".join(json.dumps(item) for item in [first_event, second_event]))

        metadata, raw_events = native_telemetry.read_event_export(path)
        imported = native_telemetry.validate_export(metadata, raw_events)
        summary = native_telemetry.telemetry_summary(imported)

        self.assertEqual(len(imported), 2)
        self.assertEqual(summary["events_total"], 2)
        self.assertEqual(summary["events_by_type"]["skill_activation"], 1)
        self.assertEqual(summary["events_by_type"]["quota_state"], 1)

    def test_partial_activation_keeps_precision_and_recall_null(self) -> None:
        results = native_telemetry.activation_results(
            QUERIES,
            [event("event-1", query_id="trigger-01")],
        )

        self.assertEqual(results["status"], "partial")
        self.assertEqual(results["queries_total"], 2)
        self.assertEqual(results["queries_executed"], 1)
        self.assertEqual(results["true_positives"], 1)
        self.assertIsNone(results["precision"])
        self.assertIsNone(results["recall"])

    def test_duplicate_activation_for_one_query_is_rejected(self) -> None:
        with self.assertRaisesRegex(
            native_telemetry.TelemetryError,
            "Multiple activation events for trigger-01",
        ):
            native_telemetry.activation_results(
                QUERIES,
                [event("event-1"), event("event-2")],
            )

    def test_response_derived_event_is_rejected(self) -> None:
        response_event = event(
            "event-1",
            data={"activated": True, "response_text": "The skill activated."},
        )

        with self.assertRaisesRegex(
            native_telemetry.TelemetryError,
            "must not contain response text",
        ):
            native_telemetry.validate_export(
                {"schema_version": "1.0", "source": native_telemetry.SOURCE, "host": "test-host"},
                [response_event],
            )

    def test_duplicate_event_ids_are_rejected(self) -> None:
        duplicate_id_events = [event("event-1"), event("event-1", query_id="trigger-02")]

        with self.assertRaisesRegex(native_telemetry.TelemetryError, "Event IDs must be unique"):
            native_telemetry.validate_export(
                {"schema_version": "1.0", "source": native_telemetry.SOURCE, "host": "test-host"},
                duplicate_id_events,
            )

    def test_malformed_jsonl_is_rejected(self) -> None:
        path = self.write_export('{"event_id": "event-1"}\nnot-json\n')

        with self.assertRaisesRegex(native_telemetry.TelemetryError, "Invalid JSONL"):
            native_telemetry.read_event_export(path)


class NativeTelemetryWritebackTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)
        self.directory = Path(self.temporary_directory.name)
        self.events_path = self.directory / "events.json"
        self.trigger_fixture_path = self.directory / "trigger-evals.json"
        self.benchmark_path = self.directory / "benchmark.json"
        self.results_path = self.directory / "results.md"
        self.trigger_fixture_path.write_text(
            json.dumps({"queries": QUERIES}),
            encoding="utf-8",
        )
        self.benchmark_path.write_text(
            json.dumps({"metadata": {}, "trigger_check": {}, "notes": []}),
            encoding="utf-8",
        )
        self.results_path.write_text("# Temporary evaluation results\n", encoding="utf-8")

    def run_cli(self, events: list[dict[str, Any]]) -> dict[str, Any]:
        self.events_path.write_text(
            json.dumps(
                {
                    "schema_version": "1.0",
                    "source": native_telemetry.SOURCE,
                    "host": "test-host",
                    "events": events,
                }
            ),
            encoding="utf-8",
        )
        completed = subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--events",
                str(self.events_path),
                "--trigger-fixture",
                str(self.trigger_fixture_path),
                "--benchmark",
                str(self.benchmark_path),
                "--results",
                str(self.results_path),
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)
        return json.loads(completed.stdout)

    def read_written_metrics(self) -> dict[str, Any]:
        benchmark = json.loads(self.benchmark_path.read_text(encoding="utf-8"))
        results = self.results_path.read_text(encoding="utf-8")
        native_block = results.split(native_telemetry.RESULTS_START, 1)[1].split(
            native_telemetry.RESULTS_END, 1
        )[0]

        def markdown_value(label: str) -> str:
            match = re.search(rf"^\| {re.escape(label)} \| (.+) \|$", native_block, re.MULTILINE)
            self.assertIsNotNone(match, f"Missing Markdown metric: {label}")
            assert match
            return match.group(1)

        def parse_value(value: str) -> Any:
            value = value.strip().strip("`")
            return None if value == "null" else value

        def parse_number(value: str) -> Any:
            parsed = parse_value(value)
            return None if parsed is None else float(parsed)

        return {
            "benchmark": benchmark["trigger_check"],
            "status": parse_value(markdown_value("Status")),
            "coverage": parse_number(markdown_value("Coverage")),
            "queries_executed": markdown_value("Queries executed"),
            "true_positives": parse_number(markdown_value("True positives")),
            "false_positives": parse_number(markdown_value("False positives")),
            "false_negatives": parse_number(markdown_value("False negatives")),
            "true_negatives": parse_number(markdown_value("True negatives")),
            "precision": parse_number(markdown_value("Native precision")),
            "recall": parse_number(markdown_value("Native recall")),
        }

    def assert_writeback_matches(
        self,
        expected: dict[str, Any],
        events: list[dict[str, Any]],
    ) -> None:
        cli_summary = self.run_cli(events)
        metrics = self.read_written_metrics()
        benchmark = metrics["benchmark"]
        self.assertEqual(cli_summary["status"], expected["status"])
        self.assertEqual(cli_summary["queries_executed"], expected["queries_executed"])
        self.assertEqual(cli_summary["queries_total"], expected["queries_total"])
        self.assertEqual(cli_summary["native_precision"], expected["precision"])
        self.assertEqual(cli_summary["native_recall"], expected["recall"])
        self.assertEqual(metrics["status"], expected["status"])
        self.assertEqual(metrics["queries_executed"], f"{expected['queries_executed']}/2")
        self.assertEqual(metrics["coverage"], expected["coverage"])
        for metric in (
            "true_positives",
            "false_positives",
            "false_negatives",
            "true_negatives",
            "precision",
            "recall",
        ):
            self.assertEqual(metrics[metric], expected[metric])
            self.assertEqual(benchmark[f"native_{metric}"], expected[metric])
        self.assertEqual(benchmark["evaluation_status"], expected["benchmark_status"])
        self.assertEqual(benchmark["native_queries_executed"], expected["queries_executed"])
        self.assertEqual(benchmark["native_coverage"], expected["coverage"])
        self.assertEqual(
            json.loads(self.benchmark_path.read_text(encoding="utf-8"))["metadata"][
                "native_trigger_run"
            ],
            {
                "status": expected["status"],
                "queries_total": expected["queries_total"],
                "queries_executed": expected["queries_executed"],
                "coverage": expected["coverage"],
                "evidence_tier": "native",
                "reason": "Native activation events were imported from a host event export.",
            }
            if expected["queries_executed"]
            else {},
        )

    def test_complete_cli_writeback_matches_between_benchmark_and_results(self) -> None:
        self.assert_writeback_matches(
            {
                "status": "measured",
                "benchmark_status": "native",
                "queries_total": 2,
                "queries_executed": 2,
                "coverage": 1.0,
                "true_positives": 1.0,
                "false_positives": 0.0,
                "false_negatives": 0.0,
                "true_negatives": 1.0,
                "precision": 1.0,
                "recall": 1.0,
            },
            [
                event("event-1", query_id="trigger-01", data={"activated": True}),
                event("event-2", query_id="trigger-02", data={"activated": False}),
            ],
        )

    def test_partial_cli_writeback_matches_between_benchmark_and_results(self) -> None:
        self.assert_writeback_matches(
            {
                "status": "partial",
                "benchmark_status": "partial",
                "queries_total": 2,
                "queries_executed": 1,
                "coverage": 0.5,
                "true_positives": 1.0,
                "false_positives": 0.0,
                "false_negatives": 0.0,
                "true_negatives": 0.0,
                "precision": None,
                "recall": None,
            },
            [event("event-1", query_id="trigger-01", data={"activated": True})],
        )

    def test_cli_writeback_does_not_modify_repository_artifacts(self) -> None:
        benchmark_before = BENCHMARK_FIXTURE.read_bytes()
        results_before = RESULTS_FIXTURE.read_bytes()

        self.run_cli([event("event-1", query_id="trigger-01", data={"activated": True})])

        self.assertEqual(BENCHMARK_FIXTURE.read_bytes(), benchmark_before)
        self.assertEqual(RESULTS_FIXTURE.read_bytes(), results_before)


if __name__ == "__main__":
    unittest.main()