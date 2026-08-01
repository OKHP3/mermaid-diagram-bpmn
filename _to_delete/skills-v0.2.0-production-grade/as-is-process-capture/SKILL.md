---
name: as-is-process-capture
description: "Capture and normalise a current-state process description into a structured as-is process YAML with stable step identifiers. Use this skill when the user has a process that is already running and needs to document its current state before gap analysis or redesign; when they provide step lists, SOPs, or process notes that need to be structured; when they say \\\"document what we do today\\\", \\\"capture the current process\\\", or \\\"baseline the process before we change it\\\". Do not use this skill to design a target state or propose changes — that is future-state-and-change-strategy; this skill records only what happens today. Produces a structured as-is process artifact with normalised step IDs."
license: "MIT"
compatibility: "Interviewing and drafting need no special runtime. scripts/assign-step-ids.mjs needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, assign act-NNN/gw-NNN/evt-NNN identifiers by hand following references/as-is-capture-rules.md and say so in your output rather than presenting the result as machine-validated."
metadata:
  bp_skill_version: "0.3.0"
  status: "core"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-analysis"
  standards_refs: "BPM CBOK v4 §4.2 (As-Is Process Modelling); BABOK v3 §10.14 (Document Analysis); ISO 9001:2015 §4.4 (Quality Management System and its processes)"
  produces: "as-is-process.yaml"
  consumes: "pir.yaml"
  depends_on: "process-intake-and-scope"
  tags: "as-is-capture, current-state, baseline, process-documentation, step-normalisation, BPM-CBOK"
  triggers: "document the current process; baseline the process; capture what we do today; as-is process; current state; document existing steps; process baseline"
  homepage: "https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/as-is-process-capture"
  repository: "https://github.com/overkillhill/mermaid-diagram-bpmn"
---

# as-is-process-capture

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Capture and normalise the current-state (as-is) process into a structured YAML artifact. The as-is record uses stable `act-NNN` step identifiers that persist across revisions, making gap analysis and change tracking tractable.

---

## When to use this skill

- User describes how a process runs today and wants it documented before redesign
- You need a baseline artifact before running `process-gap-and-exception-analysis`
- PIR exists but steps lack stable IDs: normalise them with `scripts/assign-step-ids.mjs`
- User imports existing process notes, SOPs, or procedure documents for structuring

## When NOT to use this skill

- No PIR exists: run `process-intake-and-scope` first to establish scope and boundaries
- User wants to design a future state only: skip to `future-state-and-change-strategy`
- Do not include aspirational or proposed changes in the as-is record

---

## Capture Workflow

### Step 1: Import and triage

Identify the source: natural language description, bullet list, existing SOP document, or flowchart image. Determine if a PIR already exists. If not, run `process-intake-and-scope` first.

### Step 2: Extract and sequence steps

Parse all process steps in the order they occur. Each step must have:
- A single imperative action statement (IEEE 29148)
- An identified actor or role
- Entry criteria (what triggers this step)
- Exit criteria (what signals completion)

### Step 3: Assign stable IDs

Run `scripts/assign-step-ids.mjs` to assign `act-001`, `act-002`, … identifiers. IDs are:
- Sequential within each process
- Prefixed `act-` for activities, `gw-` for gateways, `evt-` for events
- Stable: once assigned, they do not change even if steps are reordered

### Step 4: Identify current-state gaps

Flag steps that are:
- Undocumented ("we just know to do it")
- Person-dependent ("only Alice knows this part")
- Inconsistently executed ("sometimes we skip this")
- Missing a named actor

Tag these with `capture_quality: low | medium | high`.

### Step 5: Record as-is metadata

Document:
- `captured_date`: when this baseline was recorded
- `capture_method`: interview | document-review | observation | workshop
- `process_version`: current version of the process if known (default `"1.0-baseline"`)
- `baseline_status`: `draft | reviewed | approved`

---

## Output Schema

The `as-is-process.yaml` contains:
- `process_id`: matches PIR `process_id`
- `baseline_status`: draft | reviewed | approved
- `captured_date`, `capture_method`, `process_version`
- `steps[]`: each with `id`, `description`, `actor_role_id`, `entry_criteria`, `exit_criteria`, `capture_quality`, `systems[]`, `notes`
- `identified_gaps[]`: steps or sections with low capture quality or person-dependency
- `open_questions[]`: unresolved items from the capture session

---

## Handoff Instruction

Pass `as-is-process.yaml` to `process-gap-and-exception-analysis` to identify deviations, exception paths, and improvement opportunities.

Also pass `pir.yaml` to `process-narrative-authoring` when the as-is record is reviewed and approved.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/assign-step-ids.mjs` cannot run, assign IDs by hand using the sequencing and prefix rules in `references/as-is-capture-rules.md`, and state in the output that automated ID assignment was not run.

## References

Load on demand:
- `references/as-is-capture-rules.md`: step ID conventions, capture quality taxonomy, and baseline metadata rules

## Scripts

- `scripts/assign-step-ids.mjs`: normalises a step list into stable act-NNN / gw-NNN / evt-NNN identifiers

## Assets

- `assets/fixtures/as-is-process-example.yaml`: canonical as-is capture for purchase-approval baseline

## Evaluation and release status

No `evals/evals.json` exists for this skill yet, and no root-level `evals/` category (`bpmn-traceability`, `control-coverage`, `discovery-quality`, `narrative-completeness`, `role-consistency`) covers as-is capture output directly. The only current check is the maintainer-facing `tests/validate-skill.test.mjs` against `assets/fixtures/as-is-process-example.yaml`. Evidence status: `not-run` for task quality and skill uplift; treat any quality claim about this skill's output as unverified until a live evaluation exists.

Version 0.2.0 (this pass) added the `compatibility` declaration, the script fallback instruction, and a discovery-time boundary against `future-state-and-change-strategy`. Classified as a minor bump per the versioning table (revised method: a documented fallback behavior did not exist before), not a patch. No regression suite exists to run before this bump, so that limitation is disclosed here rather than implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn). MIT License.
