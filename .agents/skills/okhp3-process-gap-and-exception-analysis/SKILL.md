---
name: okhp3-process-gap-and-exception-analysis
description: Identify deviations, gaps, and exception paths between an as-is process capture and its intended design. Use this skill when the user wants to find where a process breaks down, where steps are missing or inconsistent, where exception handling is undefined, or where current execution differs from documented procedure. Use when they say "what's wrong with the current process", "find the gaps", "where does this break", or "analyze exceptions". Produces a gap analysis report and exception catalog.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/process-gap-and-exception-analysis
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: core
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-analysis
  standards_refs:
    - "BPM CBOK v4 §5.2 (Process Analysis Techniques)"
    - "BABOK v3 §10.11 (Business Rules Analysis)"
    - "ISO 9001:2015 §10.2 (Nonconformity and corrective action)"
    - "Six Sigma DMAIC — Analyse phase"
  produces: "gap-analysis.yaml, exception-catalog.yaml"
  consumes: "as-is-process.yaml"
  depends_on: ["as-is-process-capture"]
  tags: gap-analysis, exception-analysis, process-improvement, root-cause, nonconformity, BPM-CBOK, six-sigma
  triggers:
    - find the gaps in this process
    - what's wrong with the current process
    - exception analysis
    - where does this break
    - process gaps
    - analyze exceptions
    - root cause analysis
    - process improvement
---

## Purpose

Systematically identify gaps, deviations, and exception paths in a captured as-is process. The analysis distinguishes:

1. **Structural gaps** — missing steps, undefined roles, absent inputs or outputs
2. **Execution gaps** — steps performed inconsistently or only by specific individuals
3. **Exception gaps** — failure paths with no documented handling
4. **Compliance gaps** — steps missing required controls or policy references

---

## When to use this skill

- You have an `as-is-process.yaml` and want to identify improvement opportunities
- User asks where the current process fails, slows down, or creates risk
- Preparing the input for `future-state-and-change-strategy`
- User needs a root cause analysis of a known process failure

## When NOT to use this skill

- No as-is capture exists — run `as-is-process-capture` first
- User wants to design the future state immediately — note the gap analysis is needed first, then run `future-state-and-change-strategy`
- Do not propose solutions here — record gaps only; solutions belong in the future-state skill

---

## Gap Analysis Framework

`scripts/analyze-gaps.mjs` analyses the as-is process for the following gap types:

### Type 1 — Structural gaps

| Pattern | Gap description |
|---|---|
| Step with no `actor_role_id` | Unowned activity |
| No start event or end event | Missing process boundary |
| Input with no `source` | Untraced input |
| Output with no `consumer` | Undelivered output |
| `business_rules` empty | Undocumented constraints |

### Type 2 — Execution gaps

| Pattern | Gap description |
|---|---|
| `capture_quality: low` on step | Poorly understood activity |
| Step with `notes` containing "usually" or "sometimes" | Inconsistent execution |
| Single person as sole performer across >50% of steps | Key-person dependency |

### Type 3 — Exception gaps

| Pattern | Gap description |
|---|---|
| Decision point with no exception path | Unhandled failure branch |
| Exception in PIR with no `handling` | Undefined recovery procedure |
| Exception path with `owner_role_id` empty | Unowned error handling |

### Type 4 — Compliance gaps

| Pattern | Gap description |
|---|---|
| `controls` empty on process | No governance controls |
| Approval step with no `approver` role | Missing segregation of duties |
| High-risk exception with no escalation path | Escalation path undefined |

---

## Severity Classification

| Severity | Description |
|---|---|
| `critical` | Process cannot complete without this being resolved |
| `major` | Significant risk of nonconformity or failure |
| `minor` | Inconsistency or improvement opportunity |
| `observation` | Informational — no immediate action required |

---

## Exception Catalog

For each exception found, record:
- `exception_id` — stable identifier
- `description` — what goes wrong
- `trigger_condition` — what causes this exception
- `affected_steps[]` — which `act-NNN` IDs are affected
- `current_handling` — what the process does today (if anything)
- `severity` — critical | major | minor | observation
- `recommended_action` — brief description (not a full solution)

---

## Handoff Instruction

Pass `gap-analysis.yaml` and `exception-catalog.yaml` to `future-state-and-change-strategy` to prioritise gaps and design the target state.

Also use `exception-catalog.yaml` to enrich `exception_paths[]` in `process-narrative-authoring`.

---

## References

Load on demand:
- `references/gap-analysis-framework.md` — gap type taxonomy, severity classification, and root cause analysis templates

## Scripts

- `scripts/analyze-gaps.mjs` — detects structural, execution, exception, and compliance gaps from as-is-process.yaml

## Assets

- `assets/fixtures/gap-analysis-example.yaml` — canonical gap analysis for purchase-approval as-is process
