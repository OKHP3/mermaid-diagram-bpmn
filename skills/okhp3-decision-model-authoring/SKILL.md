---
name: okhp3-decision-model-authoring
description: "Author and validate decision models from PNS decision points using DMN-aligned rule tables. Use this skill when the PNS contains three or more gateway decision points that warrant a structured decision table; when the user asks to document business rules as decision logic, build a DMN table, or make decision criteria explicit. This is a recommended extension skill triggered automatically when okhp3-visual-process-modeling identifies three or more gateways. Do not use it for fewer than three decision points — document those inline in the PNS decision_points section instead. Produces a decision-model YAML and a human-readable DMN rule table."
license: "MIT"
compatibility: "Extracting decision points and drafting the table needs no special runtime. scripts/validate-decision-model.mjs needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, check hit-policy completeness and PNS traceability by hand against references/dmn-modeling-rules.md and say so in your output rather than presenting the result as machine-validated."
metadata:
  bp_skill_version: "0.3.0"
  status: "recommended-extension"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-documentation"
  standards_refs: "OMG DMN 1.4 (Decision Model and Notation); BABOK v3 §10.11 (Business Rules Analysis); BPM CBOK v4 §5.4 (Decision Modelling)"
  produces: "decision-model.yaml, dmn-table.md"
  consumes: "pns.yaml"
  depends_on: "okhp3-process-narrative-authoring"
  tags: "decision-model, DMN, business-rules, decision-table, gateways, rule-table, process-logic"
  triggers: "decision table; DMN model; business rules table; document decision logic; decision model; rule table; three or more gateways; make the decision criteria explicit"
  homepage: "https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/okhp3-decision-model-authoring"
  repository: "https://github.com/overkillhill/mermaid-diagram-bpmn"
---

# okhp3-decision-model-authoring

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Transform PNS decision_points into structured DMN-aligned decision models. Each decision point becomes a decision table with explicit input conditions, output values, and the business rule governing the routing logic.

---

## When to use this skill

- PNS has **≥3 decision_points**: this is the mandatory trigger condition
- User needs a decision table to communicate routing logic to implementers
- Business rules are complex enough that prose descriptions are insufficient
- Preparing a decision catalog as part of governance documentation

## When NOT to use this skill

- PNS has fewer than 3 decision_points: inline the logic in the PNS `decision_points[]` section
- Decision logic is trivially binary (yes/no) with no business rule: document in `business_rules[]` instead
- Do not model decisions before the PNS is validated (score ≥ 75)

---

## DMN Table Structure

Each decision table entry has:

| Field | Description |
|---|---|
| `decision_id` | Stable identifier matching `pns.decision_points[].id` |
| `decision_name` | Human-readable label |
| `activity_id` | The PNS activity where this decision occurs |
| `hit_policy` | `U` (Unique) \| `F` (First) \| `A` (Any) \| `C` (Collect) |
| `inputs[]` | Each input: `name`, `type` (string\|number\|boolean), `values[]` |
| `outputs[]` | Each output: `name`, `type`, `values[]` |
| `rules[]` | Each rule: `id`, `conditions{}`, `output{}`, `annotation` |

---

## Authoring Workflow

### Step 1: Extract decision points

Read `pns.decision_points[]` and group by the `activity_id` where they occur.

### Step 2: Identify inputs and outputs

For each decision:
- **Inputs**: the data values or conditions being evaluated (from `criteria`)
- **Outputs**: the possible routing outcomes (from `outcomes[].label`)

### Step 3: Select hit policy

| Situation | Hit policy |
|---|---|
| Exactly one rule fires per input combination | U (Unique) |
| Rules are ordered; first match wins | F (First) |
| Multiple rules can fire but give the same output | A (Any) |
| Multiple rules can fire and outputs are aggregated | C (Collect) |

### Step 4: Write rules

For each combination of input values, specify the output. Mark any unhandled combination as `FAIL`: do not silently default.

### Step 5: Validate traceability

Every `decision_id` must match a `pns.decision_points[].id`. Every output value must match a `pns.decision_points[].outcomes[].label`.

---

## DMN Table Markdown Format

```markdown
## Decision: Approve PO Request (gw-001)

Hit policy: **U** (Unique)

| Amount | Requester Level | → Outcome |
|---|---|---|
| ≤ 1000 | any | Auto-approve |
| > 1000 | manager | Manual review |
| > 1000 | staff | Escalate to Director |
| > 10000 | any | Board approval required |
```

---

## Handoff Instruction

Pass `decision-model.yaml` and `dmn-table.md` to `okhp3-publication-handoff-packaging` for bundle assembly.

Use `decision_id` values as gateway label annotations in the `bpmn-beta.mmd` diagram.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/validate-decision-model.mjs` cannot run, check hit-policy completeness and traceability by hand using `references/dmn-modeling-rules.md`, and state in the output that automated validation was not run.

## References

Load on demand:
- `references/dmn-modeling-rules.md`: hit policy selection rules, input/output type definitions, and traceability requirements

## Scripts

- `scripts/validate-decision-model.mjs`: validates decision model structure, hit policy completeness, and PNS traceability

## Assets

- `assets/fixtures/decision-model-example.yaml`: canonical decision model for purchase-approval gateway logic

## Evaluation and release status

No `evals/evals.json` exists for this skill yet, and none of the five root-level `evals/` categories cover decision-model output directly. The only current check is the maintainer-facing `tests/validate-skill.test.mjs` against `assets/fixtures/decision-model-example.yaml`. Evidence status: `not-run` for task quality and skill uplift.

Version 0.2.0 (this pass) added the `compatibility` declaration, the script fallback instruction, and a sharper discovery-time boundary against inlining decisions in the PNS. Classified minor per the versioning table, not patch. No regression suite exists to run before this bump; that limitation is disclosed, not implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn). MIT License.
