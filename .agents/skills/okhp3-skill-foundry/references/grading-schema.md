# Grading and Benchmark Evidence Schema

**Authority:** These records preserve what was evaluated, how it was evaluated,
and what the result can honestly support.

## Evaluation status

Every record declares one status:

| Status | Meaning | Permitted claim |
|---|---|---|
| `live` | Comparable executor or user runs actually occurred. | Evidence for the exact evaluated version and configuration. |
| `analytical` | Static, fixture, or manual analysis without an executor. | Design or review finding only. |
| `historical` | A completed result for an older version or superseded setup. | Historical context, not current validation. |
| `not-run` | The test design exists but execution was unavailable or unauthorized. | No outcome claim. |

Never use a `historical`, `analytical`, or `not-run` record to declare the
current version production-ready.

An analytical structural-integrity release may claim only that its declared
evidence relationships and verification records passed the documented checks.
It cannot inherit, imply, or replace live task-quality, uplift, discovery, or
production-readiness evidence.

## `grading.json`

Store one file per run:

```json
{
  "schema_version": "2.0",
  "evaluation_status": "live",
  "evaluated_skill_version": "1.2.0",
  "expectations": [
    {
      "text": "Exact expectation text frozen before the run",
      "passed": true,
      "evidence": "Verbatim quote or exact artifact location"
    }
  ],
  "summary": { "passed": 3, "failed": 1, "total": 4, "pass_rate": 0.75 },
  "execution_metrics": { "tokens": null, "tool_calls": null, "errors": 0 },
  "provenance": {
    "runner": "client-specific runner",
    "model": "record when known",
    "configuration": "with_skill",
    "fixtures": "versioned fixture identifier"
  },
  "user_notes_summary": {
    "uncertainties": [],
    "needs_review": [],
    "workarounds": []
  }
}
```

For binary expectations, `passed` is required and strict. For a rubric, retain
the criterion, evidence, and final decision in a parallel review record. Do not
use vague evidence such as "seems correct."

## `benchmark.json`

Store a versioned aggregate next to the skill:

```json
{
  "schema_version": "2.0",
  "metadata": {
    "skill_name": "okhp3-example",
    "evaluated_skill_version": "1.2.0",
    "evaluation_status": "live",
    "timestamp": "2026-07-27T00:00:00Z",
    "runner": "client-specific runner",
    "model": "record when known",
    "runs_per_configuration": 3,
    "fixtures": "evals-1.2.0",
    "known_limitations": []
  },
  "runs": [],
  "run_summary": {
    "with_skill": { "pass_rate": { "mean": 0.92, "stddev": 0.08, "min": 0.83, "max": 1.0 } },
    "without_skill": { "pass_rate": { "mean": 0.31, "stddev": 0.12, "min": 0.17, "max": 0.5 } },
    "delta": { "pass_rate": "+0.61" }
  },
  "acceptance_criteria": {
    "task_quality": ">= 0.90",
    "skill_uplift": ">= +0.50",
    "rationale": "Risk-appropriate criteria set before execution"
  },
  "notes": []
}
```

Keep `runs` complete enough to trace every aggregate to a graded response. The
run summary can include latency, cost, errors, and tool use where available,
but null is more honest than invented telemetry.

## Interpretation rules

- Freeze prompts, fixtures, expectations, and acceptance criteria before the
  release run.
- Report sample count and variation when repeated runs are used.
- Compare task quality and skill uplift separately.
- A release holdout must not be repeatedly used to tune the skill.
- Mark the evidence historical immediately when the evaluated skill version,
  model, runner, fixtures, or material behavior no longer matches the candidate.
- Preserve older evidence. Add a new record or a status note rather than
  rewriting history.

## Equilibrium review record

When the conditional multi-review protocol is used, add a review record to the
learning ledger or release evidence:

```json
{
  "review_protocol": "equilibrium-v1",
  "independence": {
    "reviewer_contexts_separated": true,
    "shared_model_or_source_limits": ["Reviewers used the same model family"]
  },
  "initial_reviews": [
    { "role": "evidence reviewer", "claim": "approve", "evidence_ids": ["SRC-01"] }
  ],
  "concordance": "material-agreement",
  "disruptor": {
    "triggered": true,
    "falsification_hypotheses": ["A stale benchmark is being treated as current evidence"],
    "test_results": ["Rejected: benchmark metadata marks it historical"]
  },
  "negotiator": { "triggered": false, "decision": null },
  "release_decision": "approved-with-limits"
}
```

If the initial reviewers materially disagree, set `concordance` to
`material-disagreement`, do not run a ceremonial disruptor, and use the
negotiator record to state the decisive evidence, requested experiment, or
unresolved issue. A release decision must name its limitations.
