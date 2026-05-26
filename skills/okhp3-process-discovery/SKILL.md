---
name: okhp3-process-discovery
description: Conduct structured process discovery using BABOK v3 elicitation techniques. Use this skill when the user wants to document a business process from scratch; when they describe a workflow, procedure, or set of steps and need it structured; when they ask for a process intake, scope a process, map stakeholders, or capture business rules; when they say "help me document this process" or "let's scope out this workflow"; when you need a Process Intake Record or stakeholder register as input for okhp3-process-narrative or okhp3-bpmn-for-mermaid.
license: MIT
metadata:
  bp_skill_version: "0.2.0"
  deprecated: true
  deprecated_reason: "Superseded by the full BP-SKILL v0.3 15-skill pipeline suite. Retained for reference."
  status: core
  version: 0.1.0
  author: OverKill Hill P³
  category: process-analysis
  standards_refs:
    - "BABOK v3 §4 (Elicitation and Collaboration)"
    - "BABOK v3 §10.14 (Document Analysis)"
    - "BABOK v3 §10.25 (Interviews)"
    - "BPM CBOK v4 §4 (Process Modelling)"
  produces: pir.yaml, stakeholder-register.yaml
  depends_on: []
  tags: process-discovery, elicitation, BABOK, PIR, stakeholder-register, business-analysis, intake, process-modeling
  triggers:
    - document this process
    - help me scope this workflow
    - capture the process steps
    - process intake
    - stakeholder register
    - map this business process
    - what are the steps in
    - who is involved in
    - process discovery
    - elicit requirements
---
> **Deprecated in BP-SKILL v0.3.** This skill is retained for reference only. It is superseded by the full 15-skill pipeline suite. See the [BP-SKILL suite](../README.md) for the current skill set.


## Purpose

This skill guides structured process discovery using BABOK v3-aligned elicitation techniques. It produces:

1. **Process Intake Record (PIR)** — structured YAML with trigger, actors, inputs, outputs, steps, exceptions, business rules, systems, and controls
2. **Stakeholder Register** — derived from PIR actors with role, interest, influence, and engagement strategy

These artifacts are the handoff inputs for `okhp3-process-narrative` (narrative + SIPOC + RACI) and ultimately `okhp3-bpmn-for-mermaid` (bpmn-beta diagram).

---

## When to use this skill

- User wants to document a process they describe in natural language, bullet points, or prose
- User says "help me scope this," "let's map this process," or "who is involved in X"
- You need a structured PIR before calling `okhp3-process-narrative`
- User wants to capture business rules, exception paths, or system touchpoints for a workflow

## When NOT to use this skill

- Process documentation already exists as a complete PIR — go directly to `okhp3-process-narrative`
- User wants a diagram without prior discovery — use `okhp3-bpmn-for-mermaid` directly with their description
- Do not invent process details the user has not provided — record gaps as open questions

---

## Interrogation Workflow

Execute the following stages in order. Do not present them as a checklist — conduct a natural conversation, branching based on answers. Load `references/intake-question-framework.md` for full conditional branching logic.

### Stage 0 — Orientation (always first)

Ask: *"Before we start, can you give me one sentence: what does this process produce or accomplish?"*

If the answer is vague, probe: *"Who benefits when this process runs correctly? What do they get?"*

Record the answer as `process_name`.

### Stage 1 — Trigger

Ask: *"What causes this process to start — a person doing something, a scheduled date, an incoming message, or a system event?"*

**Branching:**
- Answer names a person → `trigger.event_type: manual`; probe for the specific action
- Answer mentions a date or frequency → `trigger.event_type: scheduled`
- Answer mentions a message, request, or email → `trigger.event_type: message`
- Answer mentions a system condition → `trigger.event_type: system`
- Ambiguous → ask: *"What is the observable event that makes you say 'the process has started'?"*

### Stage 2 — Actors

Ask: *"Who is involved — who does work, makes decisions, or needs to know the outcome?"*

For each actor: classify type (`initiator`, `performer`, `approver`, `reviewer`, `notified`, or `system`), note their primary interest, estimate influence.

**Branching:**
- Roles span multiple departments → probe the handoff mechanics between departments
- A system is named as an actor → classify as `type: system`, add to `systems` array, ask if it runs automatically or is triggered by a person

**Minimum:** At least one `initiator` and one `performer` or `approver`.

### Stage 3 — Inputs and Outputs

Ask: *"What does this process need to begin?"* and *"What does it produce when complete?"*

For each: capture name, source/consumer, and format.

### Stage 4 — Steps (Happy Path)

Ask: *"Walk me through what happens, step by step."*

After capturing the happy path, probe for: notification steps, logging steps, waiting/pause steps.

### Stage 5 — Decision Points and Business Rules

For each decision point: *"Who makes this decision? What are the possible outcomes? Is there a rule that governs it?"*

Record governing rules in `business_rules` with `source` classification (policy/regulation/contract/practice).

### Stage 6 — Exception Paths

Ask: *"What can go wrong? What happens when it does?"*

If the user says "it never goes wrong," probe for historical exceptions.

### Stage 7 — Systems and Controls

Ask: *"Which systems or tools are used?"* and *"Are there any checkpoints, approvals, or audits built in?"*

### Stage 8 — Open Questions

Ask: *"Is there anything we haven't covered that you think is important?"*

Record all unresolved gaps as `open_questions` — do not assume answers.

---

## PIR Output Schema

Required fields: `pir_version`, `process_id`, `process_name`, `process_owner`, `department`, `elicitation_method`, `status`, `trigger.description`, `trigger.event_type`

Minimum content for handoff readiness (score ≥ 70):
- `actors` — at least 2, including one `initiator` and one `performer` or `approver`
- `inputs` — at least 1 with `id` and `name`
- `outputs` — at least 1 with `id` and `name`
- `steps` — at least 3 with `id`, `description`, and `actor_role_id`
- `exceptions` — at least 1 (recommended; required to score above threshold)
- `business_rules` — at least 1 (recommended)

Full schema: `references/pir-schema.md`
Template: `assets/pir-template.yaml`

---

## Stakeholder Register Schema

Derived automatically from `pir.actors` using `scripts/generate-stakeholder-register.mjs`.

Each entry contains:
- `stakeholder_id` — from `actors[].role_id`
- `name` — from `actors[].role_name`
- `department` — from `actors[].department` (defaults to `"Unspecified"`)
- `primary_role` — from `actors[].type`
- `interest` — from `actors[].interest` (defaults to `"outcome quality"`)
- `influence` — from `actors[].influence` (defaults to `"medium"`)
- `engagement_strategy` — derived: approver → Consult; initiator/performer → Collaborate; reviewer → Consult; notified → Inform; system → Monitor

Full derivation rules: `references/stakeholder-identification-rules.md`
Template: `assets/stakeholder-register-template.yaml`

---

## Completeness Scoring

`scripts/score-intake-completeness.mjs` returns a 0–100 weighted score:

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

When score < 70, report which sections are missing and ask targeted follow-up questions before attempting handoff.

---

## Output Format

After completing elicitation, produce:

1. A populated `pir.yaml` using `assets/pir-template.yaml` as the schema
2. Call `scripts/score-intake-completeness.mjs` (conceptually) to determine `completeness_score` and `ready_for_narrative`
3. Populate `validation.completeness_score` and `validation.ready_for_narrative` in the PIR

If `ready_for_narrative: true`:

> "PIR complete (score: [N]/100). Pass `pir.yaml` and the derived `stakeholder-register.yaml` to `okhp3-process-narrative` to generate the process narrative, SIPOC table, and RACI matrix."

If `ready_for_narrative: false`:

> "PIR score is [N]/100 — below the 70-point handoff threshold. The following sections need more information: [list]. Ask the user to address these gaps before passing to okhp3-process-narrative."

---

## Handoff Instruction

When `ready_for_narrative: true`, pass both outputs to the next skill:

```
okhp3-process-narrative:
  inputs:
    - pir.yaml
    - stakeholder-register.yaml
```

The narrative skill will produce a Process Narrative Summary, SIPOC table, and RACI matrix — which then feed into `okhp3-bpmn-for-mermaid`.

---

## Scope Boundaries

**In scope — always produce these:**
- PIR YAML populated from elicitation
- Stakeholder Register derived from PIR actors
- Open questions for all unresolved gaps
- Completeness score and handoff readiness verdict

**Out of scope — do not produce:**
- Process narratives or SIPOC tables (→ `okhp3-process-narrative`)
- BPMN diagrams (→ `okhp3-bpmn-for-mermaid`)
- React/UI components, database schemas, API designs
- Any employer-owned or proprietary process content (→ `references/scope-firewall.md`)

---

## References

Load on demand:
- `references/babok-elicitation-techniques.md` — BABOK v3 §4, §10.14, §10.25, §10.31, §10.50
- `references/intake-question-framework.md` — full conditional branching elicitation logic
- `references/stakeholder-identification-rules.md` — actor type definitions and engagement strategies
- `references/pir-schema.md` — complete field reference for PIR YAML
- `references/scope-firewall.md` — what must never appear in skill output

## Scripts

Load when deterministic processing is needed:
- `scripts/validate-pir.mjs` — schema completeness and type validation
- `scripts/score-intake-completeness.mjs` — 0–100 weighted completeness score
- `scripts/generate-stakeholder-register.mjs` — derives register from PIR actors array

## Fixtures

Canonical example PIRs for the three reference scenarios:
- `assets/fixtures/intake-purchase-approval.yaml`
- `assets/fixtures/intake-support-triage.yaml`
- `assets/fixtures/intake-quote-to-order.yaml`
