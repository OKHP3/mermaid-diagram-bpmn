#!/usr/bin/env python3
"""Ingest a host event export and write native benchmark evidence.

This runner deliberately accepts host events only. It never classifies a
response, treats a missing event as a negative, or infers an approval from a
message. A host-integrated client can export either the JSON envelope described
by native-telemetry.schema.json or one JSON event per line.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path
from typing import Any


EVENT_TYPES = {
    "skill_activation",
    "quota_state",
    "routine_created",
    "approval_card_presented",
    "approval_accepted",
    "always_allow_selected",
}
CONFIGURATIONS = {"with_skill", "without_skill", "native"}
EVIDENCE_TIER = "native"
SOURCE = "host-event-export"
RESULTS_START = "<!-- native-telemetry:start -->"
RESULTS_END = "<!-- native-telemetry:end -->"


class TelemetryError(ValueError):
    """Raised when an event export cannot support trustworthy measurements."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Write native Free Mode benchmark evidence from host telemetry."
    )
    parser.add_argument("--events", type=Path, required=True, help="JSON envelope or JSONL export")
    parser.add_argument(
        "--trigger-fixture",
        type=Path,
        default=(Path(__file__).parent.parent / "evals" / "trigger-evals.json").resolve(),
    )
    parser.add_argument(
        "--benchmark",
        type=Path,
        default=Path(__file__).with_name("benchmark.json"),
    )
    parser.add_argument(
        "--results",
        type=Path,
        default=(Path(__file__).parent.parent / "evals" / "results.md").resolve(),
    )
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Validate and summarize without writing benchmark artifacts.",
    )
    return parser.parse_args()


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise TelemetryError(f"Could not read JSON from {path}: {exc}") from exc


def read_event_export(path: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError as exc:
        raise TelemetryError(f"Could not read event export {path}: {exc}") from exc

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        events: list[Any] = []
        for line_number, line in enumerate(raw.splitlines(), start=1):
            if not line.strip():
                continue
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError as exc:
                raise TelemetryError(
                    f"Invalid JSONL at {path}:{line_number}: {exc}"
                ) from exc
        return {"schema_version": "1.0", "source": SOURCE, "host": "unknown"}, events

    if isinstance(parsed, dict):
        if "events" in parsed:
            envelope = dict(parsed)
            events = envelope.pop("events")
            if not isinstance(events, list):
                raise TelemetryError("The export's events property must be an array.")
            return envelope, events
        # A one-line JSONL export is also valid JSON. Treat a JSON object
        # without an envelope's events property as its one event so the
        # documented JSONL format works for a single host event.
        return {"schema_version": "1.0", "source": SOURCE, "host": "unknown"}, [parsed]
    if isinstance(parsed, list):
        return {"schema_version": "1.0", "source": SOURCE, "host": "unknown"}, parsed
    raise TelemetryError("The export must be an envelope object, an event array, or JSONL.")


def require_string(event: dict[str, Any], key: str, location: str) -> str:
    value = event.get(key)
    if not isinstance(value, str) or not value:
        raise TelemetryError(f"{location} requires a non-empty string {key!r}.")
    return value


def validate_timestamp(value: str, location: str) -> None:
    try:
        dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise TelemetryError(f"{location} timestamp must be ISO-8601: {value!r}.") from exc


def validate_event(raw: Any, index: int) -> dict[str, Any]:
    location = f"event[{index}]"
    if not isinstance(raw, dict):
        raise TelemetryError(f"{location} must be an object.")

    event = dict(raw)
    for key in ("event_id", "timestamp", "run_id", "query_id", "event_type", "source", "evidence_tier"):
        require_string(event, key, location)
    validate_timestamp(event["timestamp"], location)
    if event["event_type"] not in EVENT_TYPES:
        raise TelemetryError(f"{location} has unsupported event_type {event['event_type']!r}.")
    if event["source"] != SOURCE:
        raise TelemetryError(f"{location} source must be {SOURCE!r}; response text is not telemetry.")
    if event["evidence_tier"] != EVIDENCE_TIER:
        raise TelemetryError(f"{location} evidence_tier must be {EVIDENCE_TIER!r}.")
    if "configuration" in event and event["configuration"] not in CONFIGURATIONS:
        raise TelemetryError(f"{location} has unsupported configuration.")
    if not isinstance(event.get("data"), dict):
        raise TelemetryError(f"{location} requires an object-valued data property.")
    if "response" in event or "response_text" in event["data"]:
        raise TelemetryError(
            f"{location} must not contain response text; native measurements require host events."
        )

    data = event["data"]
    event_type = event["event_type"]
    if event_type == "skill_activation":
        if not isinstance(data.get("activated"), bool):
            raise TelemetryError(f"{location} skill_activation data requires boolean activated.")
    elif event_type == "quota_state":
        if data.get("state") not in {"available", "blocked", "reset_observed", "unknown"}:
            raise TelemetryError(
                f"{location} quota_state data state must be available, blocked, "
                "reset_observed, or unknown."
            )
    elif event_type == "routine_created":
        require_string(data, "routine_id", location)
    elif event_type == "approval_card_presented":
        require_string(data, "approval_id", location)
        require_string(data, "action", location)
    elif event_type in {"approval_accepted", "always_allow_selected"}:
        require_string(data, "approval_id", location)
        if data.get("actor") != "user":
            raise TelemetryError(
                f"{location} {event_type} must record actor='user'; "
                "an agent cannot stand in for the user."
            )
    return event


def validate_export(metadata: dict[str, Any], raw_events: list[Any]) -> list[dict[str, Any]]:
    if metadata.get("schema_version") != "1.0":
        raise TelemetryError("Event export schema_version must be '1.0'.")
    if metadata.get("source") != SOURCE:
        raise TelemetryError(f"Event export source must be {SOURCE!r}.")
    if not isinstance(metadata.get("host"), str) or not metadata["host"]:
        raise TelemetryError("Event export host must be a non-empty string.")
    events = [validate_event(event, index) for index, event in enumerate(raw_events)]
    event_ids = [event["event_id"] for event in events]
    if len(event_ids) != len(set(event_ids)):
        raise TelemetryError("Event IDs must be unique within one export.")
    return events


def fixture_queries(path: Path) -> list[dict[str, Any]]:
    fixture = read_json(path)
    queries = fixture.get("queries") if isinstance(fixture, dict) else None
    if not isinstance(queries, list) or not queries:
        raise TelemetryError("Trigger fixture must contain a non-empty queries array.")
    normalized = []
    for index, query in enumerate(queries, start=1):
        if not isinstance(query, dict) or not isinstance(query.get("should_trigger"), bool):
            raise TelemetryError(f"Trigger query {index} must contain boolean should_trigger.")
        query_id = query.get("id", f"trigger-{index:02d}")
        if not isinstance(query_id, str) or not query_id:
            raise TelemetryError(f"Trigger query {index} must contain a non-empty id.")
        normalized.append({"id": query_id, "should_trigger": query["should_trigger"]})
    if len({query["id"] for query in normalized}) != len(normalized):
        raise TelemetryError("Trigger fixture query ids must be unique.")
    return normalized


def activation_results(
    queries: list[dict[str, Any]], events: list[dict[str, Any]]
) -> dict[str, Any]:
    query_map = {query["id"]: query for query in queries}
    activation_events = [event for event in events if event["event_type"] == "skill_activation"]
    unknown = sorted({event["query_id"] for event in activation_events if event["query_id"] not in query_map})
    if unknown:
        raise TelemetryError(f"Activation events reference unknown trigger ids: {', '.join(unknown)}.")

    observed: dict[str, bool] = {}
    for event in activation_events:
        query_id = event["query_id"]
        activated = event["data"]["activated"]
        if query_id in observed:
            raise TelemetryError(
                f"Multiple activation events for {query_id}; export one frozen-query decision per run."
            )
        observed[query_id] = activated

    executed = len(observed)
    total = len(queries)
    counts = {"true_positives": 0, "false_positives": 0, "false_negatives": 0, "true_negatives": 0}
    for query in queries:
        query_id = query["id"]
        if query_id not in observed:
            continue
        expected = query["should_trigger"]
        actual = observed[query_id]
        if expected and actual:
            counts["true_positives"] += 1
        elif not expected and actual:
            counts["false_positives"] += 1
        elif expected and not actual:
            counts["false_negatives"] += 1
        else:
            counts["true_negatives"] += 1

    complete = executed == total
    precision = None
    recall = None
    if complete:
        precision_denominator = counts["true_positives"] + counts["false_positives"]
        recall_denominator = counts["true_positives"] + counts["false_negatives"]
        precision = (
            round(counts["true_positives"] / precision_denominator, 3)
            if precision_denominator
            else None
        )
        recall = (
            round(counts["true_positives"] / recall_denominator, 3)
            if recall_denominator
            else None
        )

    reported_counts = {
        key: (value if executed else None) for key, value in counts.items()
    }
    return {
        "status": "measured" if complete else ("partial" if executed else "not-run"),
        "queries_total": total,
        "queries_executed": executed,
        **reported_counts,
        "precision": precision,
        "recall": recall,
        "evidence_tier": EVIDENCE_TIER if executed else "not measured",
        "activation_observed": bool(executed),
        "coverage": round(executed / total, 3),
    }


def telemetry_summary(events: list[dict[str, Any]]) -> dict[str, Any]:
    by_type: dict[str, int] = {event_type: 0 for event_type in sorted(EVENT_TYPES)}
    for event in events:
        by_type[event["event_type"]] += 1

    def records(event_type: str) -> list[dict[str, Any]]:
        return [
            {
                "event_id": event["event_id"],
                "timestamp": event["timestamp"],
                "run_id": event["run_id"],
                "query_id": event["query_id"],
                **({"eval_name": event["eval_name"]} if "eval_name" in event else {}),
                "data": event["data"],
            }
            for event in events
            if event["event_type"] == event_type
        ]

    return {
        "source": SOURCE,
        "evidence_tier": EVIDENCE_TIER if events else "not measured",
        "events_total": len(events),
        "events_by_type": by_type,
        "records": {event_type: records(event_type) for event_type in sorted(EVENT_TYPES)},
    }


def trigger_observations(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "event_id": event["event_id"],
            "timestamp": event["timestamp"],
            "run_id": event["run_id"],
            "query_id": event["query_id"],
            "activated": event["data"]["activated"],
            "evidence_tier": EVIDENCE_TIER,
        }
        for event in events
        if event["event_type"] == "skill_activation"
    ]


def host_fixture_checks(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for event in events:
        eval_name = event.get("eval_name")
        if not eval_name:
            continue
        configuration = event.get("configuration", "native")
        grouped.setdefault((eval_name, configuration), []).append(event)

    checks = []
    for (eval_name, configuration), group in sorted(grouped.items()):
        event_types = {event["event_type"] for event in group}
        checks.append(
            {
                "eval_name": eval_name,
                "configuration": configuration,
                "runner": "native-telemetry-export",
                "runner_mode": "host-event-export",
                "evidence_tier": EVIDENCE_TIER,
                "host_activation_observed": "skill_activation" in event_types,
                "quota_wall_observed": any(
                    event["event_type"] == "quota_state"
                    and event["data"].get("state") == "blocked"
                    for event in group
                ),
                "reset_observed": any(
                    event["event_type"] == "quota_state"
                    and event["data"].get("state") == "reset_observed"
                    for event in group
                ),
                "routine_created": "routine_created" in event_types,
                "approval_card_presented": "approval_card_presented" in event_types,
                "approval_accepted": "approval_accepted" in event_types,
                "always_allow_selected": "always_allow_selected" in event_types,
                "event_ids": [event["event_id"] for event in group],
            }
        )
    return checks


def update_results(path: Path, summary: dict[str, Any], metadata: dict[str, Any]) -> None:
    existing = path.read_text(encoding="utf-8") if path.exists() else "# Evaluation results\n"
    def display(value: Any) -> str:
        return "`null`" if value is None else str(value)

    block = "\n".join(
        [
            RESULTS_START,
            "## Native telemetry export",
            "",
            f"- Runner: `native-telemetry-export` (`{SOURCE}`)",
            f"- Host: `{metadata['host']}`",
            f"- Export schema: `v{metadata['schema_version']}`",
            f"- Evidence tier: `{summary['telemetry']['evidence_tier']}`",
            f"- Events ingested: **{summary['telemetry']['events_total']}**",
            "",
            "The runner records host events directly. It does not infer skill activation, quota state, routine creation, approval presentation, approval acceptance, or “Always allow” selection from response text.",
            "",
            "### Native trigger measurement",
            "",
            "| Metric | Value |",
            "|---|---:|",
            f"| Status | `{summary['trigger']['status']}` |",
            f"| Queries executed | {summary['trigger']['queries_executed']}/{summary['trigger']['queries_total']} |",
            f"| Coverage | {summary['trigger']['coverage']} |",
            f"| True positives | {display(summary['trigger']['true_positives'])} |",
            f"| False positives | {display(summary['trigger']['false_positives'])} |",
            f"| False negatives | {display(summary['trigger']['false_negatives'])} |",
            f"| True negatives | {display(summary['trigger']['true_negatives'])} |",
            f"| Native precision | {display(summary['trigger']['precision'])} |",
            f"| Native recall | {display(summary['trigger']['recall'])} |",
            "",
            "A partial export keeps precision and recall `null` until every frozen query has an explicit activation event; missing telemetry is not treated as a negative.",
            "",
            "### Host event counts",
            "",
            "| Event | Count |",
            "|---|---:|",
        ]
        + [
            f"| `{event_type}` | {count} |"
            for event_type, count in sorted(summary["telemetry"]["events_by_type"].items())
        ]
        + [
            "",
            "### Evidence boundary",
            "",
            "Only events with `source: host-event-export` and `evidence_tier: native` are included. Response comparisons remain separate `live` evidence; analytical trigger classifications are not promoted to native measurements.",
            RESULTS_END,
        ]
    )
    if RESULTS_START in existing and RESULTS_END in existing:
        before = existing.split(RESULTS_START, 1)[0].rstrip()
        after = existing.split(RESULTS_END, 1)[1].lstrip()
        content = f"{before}\n\n{block}\n"
        if after:
            content += f"\n{after}"
    else:
        content = existing.rstrip() + "\n\n" + block + "\n"
    path.write_text(content, encoding="utf-8")


def update_benchmark(
    path: Path,
    summary: dict[str, Any],
    metadata: dict[str, Any],
    trigger_fixture: Path,
) -> None:
    benchmark = read_json(path)
    if "host_fixture_checks" in benchmark and "response_fixture_checks" not in benchmark:
        benchmark["response_fixture_checks"] = benchmark["host_fixture_checks"]
    benchmark_metadata = benchmark.setdefault("metadata", {})
    try:
        fixture_reference = str(trigger_fixture.relative_to(Path.cwd()))
    except ValueError:
        fixture_reference = str(trigger_fixture)
    benchmark_metadata.update(
        {
            "runner": "native-telemetry-export",
            "runner_mode": "host-event-export",
            "evidence_tier": "native for host events; live for response comparisons; analytical for prior trigger classification",
            "host_integration_status": (
                "measured from host event export"
                if summary["trigger"]["status"] == "measured"
                else "runner available; awaiting complete host event export"
            ),
            "native_trigger_run": {
                "status": summary["trigger"]["status"],
                "queries_total": summary["trigger"]["queries_total"],
                "queries_executed": summary["trigger"]["queries_executed"],
                "coverage": summary["trigger"]["coverage"],
                "evidence_tier": summary["trigger"]["evidence_tier"],
                "reason": (
                    "Native activation events were imported from a host event export."
                    if summary["trigger"]["queries_executed"]
                    else "No native activation events were supplied in the host event export."
                ),
            },
            "telemetry_export": {
                "source": SOURCE,
                "schema_version": metadata["schema_version"],
                "host": metadata["host"],
                "events_total": summary["telemetry"]["events_total"],
                "events_by_type": summary["telemetry"]["events_by_type"],
            },
            "telemetry_runner_available": True,
        }
    )
    benchmark["trigger_check"] = {
        **benchmark.get("trigger_check", {}),
        "evaluation_status": (
            "native" if summary["trigger"]["status"] == "measured" else summary["trigger"]["status"]
        ),
        "fixture": fixture_reference,
        "native_queries_total": summary["trigger"]["queries_total"],
        "native_queries_executed": summary["trigger"]["queries_executed"],
        "native_coverage": summary["trigger"]["coverage"],
        "native_true_positives": summary["trigger"]["true_positives"],
        "native_false_positives": summary["trigger"]["false_positives"],
        "native_false_negatives": summary["trigger"]["false_negatives"],
        "native_true_negatives": summary["trigger"]["true_negatives"],
        "native_precision": summary["trigger"]["precision"],
        "native_recall": summary["trigger"]["recall"],
        "native_activation_observed": summary["trigger"]["activation_observed"],
        "evidence_tier": summary["trigger"]["evidence_tier"],
        "notes": [
            "Native metrics are computed only from explicit skill_activation host events.",
            "Missing activation events are unmeasured, not false.",
        ],
    }
    benchmark["host_fixture_checks"] = host_fixture_checks(summary["events"])
    benchmark["native_trigger_observations"] = trigger_observations(summary["events"])
    note = (
        "A telemetry-capable host-event export runner is available; native results are populated only when explicit events are supplied."
    )
    if note not in benchmark.setdefault("notes", []):
        benchmark["notes"].append(note)
    path.write_text(json.dumps(benchmark, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    args = parse_args()
    try:
        metadata, raw_events = read_event_export(args.events)
        events = validate_export(metadata, raw_events)
        queries = fixture_queries(args.trigger_fixture)
        trigger = activation_results(queries, events)
        telemetry = telemetry_summary(events)
        summary = {"trigger": trigger, "telemetry": telemetry, "events": events}
        if not args.validate_only:
            update_results(args.results, summary, metadata)
            update_benchmark(args.benchmark, summary, metadata, args.trigger_fixture)
        print(
            json.dumps(
                {
                    "status": trigger["status"],
                    "queries_executed": trigger["queries_executed"],
                    "queries_total": trigger["queries_total"],
                    "native_precision": trigger["precision"],
                    "native_recall": trigger["recall"],
                    "events_total": telemetry["events_total"],
                    "written": not args.validate_only,
                },
                indent=2,
            )
        )
        return 0
    except TelemetryError as exc:
        print(f"native telemetry error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())