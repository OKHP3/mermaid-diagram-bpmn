---
name: process-intake-and-scope
description: "Conduct structured process intake and scope definition using BABOK v3 elicitation techniques. Use this skill when the user wants to document a business process from scratch; when they describe a workflow, procedure, or set of steps and need it structured; when they ask to scope a process, define process boundaries, or capture business rules; when they say \\\"help me document this process\\\", \\\"let's scope out this workflow\\\", or \\\"what are the inputs and outputs\\\"; when you need a Process Intake Record (PIR) as input for downstream narrative, modeling, or SOP skills. This is the first-pass discovery skill; once a PIR exists, use elicitation-and-interview-facilitation to fill remaining gaps rather than restarting intake."
license: "MIT"
compatibility: "The intake conversation itself needs no special runtime. scripts/generate-pir.mjs, scripts/validate-pir.mjs, and scripts/score-intake-completeness.mjs need a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If they cannot run, draft and score the PIR by hand against references/pir-schema.md and say so in your output rather than presenting the result as machine-validated."
metadata:
  bp_skill_version: "0.3.0"
  status: "core"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-analysis"
  standards_refs: "BABOK v3 §4 (Elicitation and Collaboration); BABOK v3 §10.14 (Document Analysis); BABOK v3 §10.25 (Interviews); BPM CBOK v4 §4 (Process Modelling); ISO 9001:2015 §4.4 (Quality Management System and its processes)"
  consumes: "request-brief.md, organization-profile.md, process-taxonomy.md (optional)"
  produces: "pir.yaml, scope-statement.md"
  depends_on: ""
  tags: "process-intake, scope-definition, elicitation, BABOK, PIR, business-analysis, intake, process-boundary"
  triggers: "document this process; help me scope this workflow; capture the process steps; process intake; define process boundaries; what are the inputs and outputs; map this business process; process discovery; elicit requirements"
  homepage: "https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/process-intake-and-scope"
  repository: "https://github.com/overkillhill/mermaid-diagram-bpmn"
---

# process-intake-and-scope

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

This skill guides structured process intake and scope definition using BABOK v3-aligned elicitation techniques. It produces:

1. **Process Intake Record (PIR)**: structured YAML with trigger, actors, inputs, outputs, steps, exceptions, business rules, systems, and controls
2. **Scope Statement**: concise prose defining process boundaries, exclusions, and success criteria

The PIR is the foundational input consumed by every downstream skill in the BP-SKILL suite.

---

## When to use this skill

- User wants to document a process they describe in natural language, bullet points, or prose
- User says "help me scope this," "let's map this process," or "define the boundaries"
- You need a structured PIR before calling `stakeholder-and-role-mapping` or `process-narrative-authoring`
- User wants to capture business rules, exception paths, or system touchpoints for a workflow

## When NOT to use this skill

- A validated PIR with `ready_for_narrative: true` already exists: proceed to `process-narrative-authoring`
- A PIR exists but has gaps to fill through targeted follow-up: use `elicitation-and-interview-facilitation` instead of restarting intake
- User wants a diagram without prior discovery: use `visual-process-modeling` with their description
- Do not invent process details the user has not provided: record gaps as `open_questions`

---

## Intake Workflow

Execute the following stages in order. Conduct a natural conversation: do not present these as a checklist. Load `references/pir-schema.md` for full field reference.

### Stage 0: Orientation

Ask: *"Before we start, can you give me one sentence: what does this process produce or accomplish?"*

Record as `process_name`. If vague, probe: *"Who benefits when this process runs correctly? What do they get?"*

### Stage 1: Trigger

Ask: *"What causes this process to start: a person doing something, a scheduled date, an incoming message, or a system event?"*

Classify `trigger.event_type`:
- Person acts → `manual`
- Date/frequency → `scheduled`
- Message/request/email → `message`
- System condition → `system`

### Stage 2: Actors

Ask: *"Who is involved: who does work, makes decisions, or needs to know the outcome?"*

Classify each actor: `initiator | performer | approver | reviewer | notified | system`.

**Minimum:** at least one `initiator` and one `performer` or `approver`.

### Stage 3: Inputs and Outputs

Ask: *"What does this process need to begin?"* and *"What does it produce when complete?"*

Capture `name`, `source`/`consumer`, and `format` for each.

### Stage 4: Scope Boundaries

Ask: *"What is explicitly outside the scope of this process? Where does it hand off?"*

Record out-of-scope items in `scope_statement.exclusions`.

### Stage 5: Steps (Happy Path)

Ask: *"Walk me through what happens, step by step."*

After the happy path, probe for: notification steps, logging steps, waiting/pause steps.

### Stage 6: Business Rules and Decision Points

For each decision: *"Who makes this? What are the outcomes? Is there a policy or rule that governs it?"*

Classify rule `source`: `policy | regulation | contract | practice`.

### Stage 7: Exception Paths

Ask: *"What can go wrong? What happens when it does?"*

### Stage 8: Systems and Controls

Ask: *"Which systems or tools are used?"* and *"Are there any checkpoints, approvals, or audits built in?"*

### Stage 9: Open Questions

Record all unresolved gaps as `open_questions`: do not assume answers.

---

## PIR Completeness Scoring

`scripts/score-intake-completeness.mjs` returns a 0–100 weighted score.

| Section | Points |
|---|---|
| `process_name` | 5 |
| `elicitation_method` | 5 |
| `trigger` (both fields) | 10 |
| `actors` (≥2, initiator + performer/approver) | 15 |
| `inputs` (≥1 valid entry) | 10 |
| `outputs` (≥1 valid entry) | 10 |
| `steps` (≥3 valid entries) | 15 |
| `exceptions` (≥1 valid entry) | 10 |
| `business_rules` (≥1 valid entry) | 10 |
| `systems` (≥1 valid entry) | 5 |
| `controls` (≥1 valid entry) | 5 |
| **Total** | **100** |

**Handoff threshold:** score ≥ 70 → `ready_for_narrative: true`

---

## Output Format

1. Produce `pir.yaml` using `assets/fixtures/intake-purchase-approval.yaml` as the schema reference
2. Run `scripts/score-intake-completeness.mjs` to compute `completeness_score` and `ready_for_narrative`
3. Produce `scope-statement.md` summarising process name, trigger, boundary, exclusions, and success criteria

---

## Handoff Instruction

When `ready_for_narrative: true`:
- Pass `pir.yaml` to `stakeholder-and-role-mapping` to derive the stakeholder register
- Then pass `pir.yaml` + `stakeholder-register.yaml` to `process-narrative-authoring`

When `ready_for_narrative: false`, report missing sections and ask targeted follow-up questions, or hand off to `elicitation-and-interview-facilitation` for a structured question plan.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/generate-pir.mjs`, `scripts/validate-pir.mjs`, or `scripts/score-intake-completeness.mjs` cannot run, draft and hand-score the PIR against `references/pir-schema.md`'s field table and scoring weights, and state in the output that automated generation, validation, or scoring was not run.

## References

Load on demand:
- `references/pir-schema.md`: complete field reference for PIR YAML

## Scripts

- `scripts/generate-pir.mjs`: scaffolds a blank PIR YAML from a brief process description
- `scripts/validate-pir.mjs`: schema completeness and type validation
- `scripts/score-intake-completeness.mjs`: 0–100 weighted completeness score

## Assets

- `assets/fixtures/intake-purchase-approval.yaml`: canonical PIR fixture (purchase approval)

## Evaluation and release status

This is the one skill in the suite with a working, verified root-level eval category: `evals/discovery-quality/` (weight 20, V8 gate) exercises `validatePir()` against three fixtures (`good-intake-purchase-approval.yaml`: pass; `poor-intake-missing-trigger.yaml`: fail; `poor-intake-missing-scope.yaml`: fail) — **except its `manifest.json` currently points `validator_module` at `skills/okhp3-process-discovery/scripts/validate-pir.mjs`, a path that does not exist in this repository.** The real module is `skills/process-intake-and-scope/scripts/validate-pir.mjs`. Verified by static path inspection in this session, not by a live run; `node scripts/run-eval-suite.mjs` would currently fail to load this category with `Module not found`. Fixing the `validator_module` string in `evals/discovery-quality/manifest.json` is outside this task's scope (repo-root `evals/`, not `skills/*/SKILL.md`) but is the single highest-leverage follow-up for this skill's evidence base — flagged here rather than silently left implied as working.

No dedicated `evals/evals.json` exists in this skill's own package. Evidence status: `not-run` (live) / `analytical` (the path-break above, verified statically) for task quality and skill uplift.

Version 0.2.0 (this pass) added the `compatibility` declaration, per-script fallback instructions, and a discovery-time boundary clarifying this is the first-pass intake skill (not the gap-filling one — see `elicitation-and-interview-facilitation`). Classified minor per the versioning table, not patch. No live regression run backs this bump; that limitation is disclosed, not implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn). MIT License.
