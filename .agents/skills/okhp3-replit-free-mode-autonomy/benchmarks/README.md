# Native telemetry benchmark runner

The response-only delegated runner cannot prove that the Replit host activated a
skill or presented and accepted an approval. This benchmark therefore accepts a
host event export as the native evidence lane.

## Export contract

The export is either:

1. A JSON envelope matching `native-telemetry.schema.json`, or
2. JSONL with one event per line. JSONL uses the same event shape and receives
   default envelope metadata from the CLI.

Each event must contain a host-generated `event_id`, ISO-8601 `timestamp`,
`run_id`, a frozen trigger `query_id` (for example `trigger-01`) for
`skill_activation` events, `event_type`,
`source: "host-event-export"`, `evidence_tier: "native"`, and a typed `data`
object. Supported event types are:

| Event type | Required data | What it measures |
|---|---|---|
| `skill_activation` | `activated: boolean` | Native skill activation decision |
| `quota_state` | `state` | `available`, `blocked`, `reset_observed`, or `unknown` |
| `routine_created` | `routine_id` | Host routine creation |
| `approval_card_presented` | `approval_id`, `action` | Approval-card presentation |
| `approval_accepted` | `approval_id`, `actor: "user"` | Human approval acceptance |
| `always_allow_selected` | `approval_id`, `actor: "user"` | User-selected Always allow |

The runner rejects response-derived sources, non-native evidence tiers,
agent-attributed approval actions, malformed events, duplicate IDs, and
conflicting activation decisions. It never treats a missing event as `false`.

## Run

```bash
python3 replit/okhp3-replit-free-mode-autonomy/benchmarks/run-native-telemetry.py \
  --events /path/to/replit-agent-events.json
```

The command validates the export, computes the native trigger confusion matrix
when all 12 frozen queries have explicit activation events, and writes the
native telemetry section of `evals/results.md` and the native fields in
`benchmarks/benchmark.json`. With a partial export, counts and coverage are
reported but precision and recall remain `null`.

Use `--validate-only` for a dry run that does not modify benchmark artifacts.

This is an ingestion runner, not a simulator. A host client or exported event
stream is still required for native results.