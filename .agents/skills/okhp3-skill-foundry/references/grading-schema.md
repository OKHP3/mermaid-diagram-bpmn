# Grading and Benchmark JSON Schemas

**Authority:** This document defines the exact schemas for grading.json and benchmark.json.
All Foundry-produced artifacts must conform to these schemas.

---

## grading.json

Written per run directory: `<workspace>/eval-<N>/<config>/grading.json`

```json
{
  "expectations": [
    {
      "text": "Exact expectation text from evals.json",
      "passed": true,
      "evidence": "Verbatim quote from response, or precise description of absence"
    },
    {
      "text": "...",
      "passed": false,
      "evidence": "Response says '...' which is incorrect/absent. Expected '...'."
    }
  ],
  "summary": {
    "passed": 3,
    "failed": 1,
    "total": 4,
    "pass_rate": 0.75
  },
  "execution_metrics": {},
  "timing": {},
  "claims": [],
  "user_notes_summary": {
    "uncertainties": [],
    "needs_review": [
      "CRITICAL: without-skill gave wrong dates / wrong API / inverted rule -- consequence described"
    ],
    "workarounds": []
  }
}
```

### Field rules

| Field | Rule |
|-------|------|
| `expectations[].text` | Copy verbatim from evals.json. Do not paraphrase. |
| `expectations[].passed` | Boolean. Strict binary. No "partial" or "conditional". |
| `expectations[].evidence` | Required. Must be quoted text or explicit statement of absence. Never "response seems to address this." |
| `summary.pass_rate` | `passed / total`. Float to 2 decimal places. |
| `user_notes_summary.needs_review` | Highest-consequence failures only. Written for future audit. |

---

## benchmark.json

Written per skill: `<skill>/benchmarks/benchmark.json`

```json
{
  "metadata": {
    "skill_name": "okhp3-<name>",
    "skill_path": ".agents/skills/okhp3-<name>",
    "skill_version": "1.0.0",
    "executor_model": "delegation-subagent",
    "analyzer_model": "main-agent-grader",
    "timestamp": "2026-06-26T00:00:00Z",
    "evals_run": [1, 2, 3],
    "runs_per_configuration": 1,
    "note": "All 3 evals: LIVE delegation subagent runs. No analytical stubs."
  },

  "runs": [
    {
      "eval_id": 1,
      "eval_name": "descriptive-name",
      "configuration": "with_skill",
      "run_number": 1,
      "result": {
        "pass_rate": 1.0,
        "passed": 4,
        "failed": 0,
        "total": 4,
        "time_seconds": null,
        "tokens": null,
        "tool_calls": null,
        "errors": 0
      },
      "expectations": [
        { "text": "...", "passed": true, "evidence": "..." }
      ]
    },
    {
      "eval_id": 1,
      "eval_name": "descriptive-name",
      "configuration": "without_skill",
      "run_number": 1,
      "result": {
        "pass_rate": 0.25,
        "passed": 1,
        "failed": 3,
        "total": 4
      },
      "expectations": [
        { "text": "...", "passed": true, "evidence": "..." },
        { "text": "...", "passed": false, "evidence": "..." }
      ]
    }
  ],

  "run_summary": {
    "with_skill": {
      "pass_rate": { "mean": 0.92, "stddev": 0.14, "min": 0.75, "max": 1.0 },
      "time_seconds": { "mean": null, "stddev": null, "min": null, "max": null },
      "tokens": { "mean": null, "stddev": null, "min": null, "max": null }
    },
    "without_skill": {
      "pass_rate": { "mean": 0.25, "stddev": 0.22, "min": 0.0, "max": 0.5 },
      "time_seconds": { "mean": null, "stddev": null, "min": null, "max": null },
      "tokens": { "mean": null, "stddev": null, "min": null, "max": null }
    },
    "delta": {
      "pass_rate": "+0.67",
      "time_seconds": "N/A",
      "tokens": "N/A"
    }
  },

  "notes": [
    "All 3 evals: LIVE delegation subagent runs",
    "Eval N: <specific finding or consequence>",
    "workspace: .agents/skills/<name>-workspace/iteration-1/"
  ]
}
```

### Field rules

| Field | Rule |
|-------|------|
| `metadata.note` | Must state whether runs are LIVE or contain analytical stubs. Stubs must be labeled. |
| `runs` | with_skill run comes before without_skill run for the same eval_id. |
| `run_summary.delta.pass_rate` | Formatted as `"+0.67"` or `"-0.12"` string. Not a float. |
| `notes` | One note per finding. Write for future audit. Include workspace path. |

---

## Acceptance thresholds

| Signal | Threshold | Action if fails |
|--------|-----------|-----------------|
| `with_skill pass_rate mean` | >= 0.9 | Phase 7 fix loop |
| `delta pass_rate` | >= 0.5 | Phase 7 fix loop or redesign expectations |

A skill that meets both thresholds is production-ready. A skill that meets the with_skill threshold but not the delta is doing well internally but the expectations may be non-discriminating -- check the eval patterns.

---

## Analytical stubs

An analytical stub is a run that was not executed by a live subagent -- it was graded by inferring what a subagent would say based on the skill content, without actually running an executor.

**Stubs are prohibited in final benchmarks.** They can be used during early development to design expectations, but must be replaced with live runs before the benchmark is considered complete.

Mark stubs in the metadata note: `"Eval 2: ANALYTICAL STUB -- replace with live run"`.

The code review process will flag any benchmark.json that contains analytical stubs as incomplete.
