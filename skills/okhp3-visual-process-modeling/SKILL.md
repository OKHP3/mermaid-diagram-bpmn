---
name: okhp3-visual-process-modeling
description: "Generate, validate, normalise, and explain Mermaid-native bpmn-beta diagrams from a Process Narrative Specification. Use this skill when the user wants to convert a PNS or process notes into a visual diagram; when they ask for BPMN, a process flow, a swimlane diagram, or a workflow diagram; when they want to validate or repair existing bpmn-beta code; when they mention pools, lanes, gateways, tasks, events, or BPMN 2.0; when they want a Mermaid-native process model they can commit to a repo; when the PNS has three or more gateway decision points and a DMN decision table is warranted. Do not use it for a non-BPMN diagram type (flowchart, sequence, ER) — use standard Mermaid syntax for those instead. Produces bpmn-beta.mmd and, optionally, a rendered process-model.svg."
license: "MIT"
compatibility: "Reading a PNS and drafting the diagram by hand needs no special runtime. scripts/validate-bpmn-beta.mjs, scripts/normalize-bpmn-beta.mjs, scripts/repair-bpmn-beta.mjs, and scripts/lint-process-model.mjs need a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If they cannot run, check the diagram by hand against references/bpmn-beta-syntax.md and say so in your output rather than presenting an unrun validator's checks as passed."
metadata:
  bp_skill_version: "0.3.0"
  status: "core"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-diagramming"
  standards_refs: "BPMN 2.0.2 Descriptive Conformance Sub-Class (OMG formal/2013-12-09); Mermaid 11.x External Diagram API; BPM CBOK v4 §6 (Process Modeling)"
  produces: "bpmn-beta.mmd, process-model.svg"
  consumes: "pns.yaml"
  depends_on: "okhp3-process-narrative-authoring"
  tags: "bpmn, mermaid, bpmn-beta, visual-modeling, process-flow, swimlane, gateways, pools, lanes, workflow"
  triggers: "create a BPMN diagram; draw a business process; convert process to mermaid; bpmn-beta; swimlane diagram; process flow with gateways; validate BPMN; pools and lanes; model this workflow"
  homepage: "https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/okhp3-visual-process-modeling"
  repository: "https://github.com/overkillhill/mermaid-diagram-bpmn"
---

# okhp3-visual-process-modeling

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Generate a Mermaid-native `bpmn-beta` diagram from a validated PNS. The diagram uses the BPMN 2.0 Descriptive Conformance Sub-Class node set (tasks, gateways, events, message flows, pools, and lanes) expressed in the readable `bpmn-beta` DSL.

---

## When to use this skill

- PNS has `validation.ready_for_bpmn_modeling: true`
- User wants a visual process diagram in Mermaid syntax
- User wants to validate or normalise existing `bpmn-beta` code
- PNS contains ≥3 decision_points → also trigger `okhp3-decision-model-authoring` for a DMN table

## When NOT to use this skill

- PNS has not been validated (score < 75): complete `okhp3-process-narrative-authoring` first
- User wants a non-BPMN diagram (flowchart, sequence diagram): use standard Mermaid syntax
- Do not claim full BPMN 2.0 XML conformance: this is a descriptive subset for human-readable process modeling

---

## PNS → bpmn-beta Mapping

| PNS field | bpmn-beta element |
|---|---|
| `activity_sequence.activities[]` | Task nodes (`[task label]`) |
| `decision_points[]` | Gateway nodes (`{condition?}`) |
| `exception_paths[]` | Error/intermediate event paths |
| `roles_and_raci.roles[]` | Lane labels |
| `process_box.trigger` | Start event (`(( ))`) |
| `process_box.outputs[]` consumer | End event or message flow |
| Multiple departments | Pool blocks |

---

## DMN Trigger Rule

When the PNS has **≥3 decision_points**, hand off to `okhp3-decision-model-authoring` concurrently with diagram generation. The BPMN gateway labels must match the DMN rule IDs.

---

## Generation Workflow

1. **Load PNS**: read activity_sequence, decision_points, roles, exception_paths
2. **Map to bpmn-beta**: assign each activity to a lane based on `actor_role_id`
3. **Render gateways**: use `{condition?}` for exclusive gateways; `{+}` for parallel
4. **Connect flows**: use `-->` for sequence flows; `~~>` for message flows (top level only)
5. **Add events**: `(( start ))` and `([ end ])` for process boundaries; `((! error ))` for exception paths
6. **Validate**: run `scripts/validate-bpmn-beta.mjs`; fix all errors
7. **Normalise**: run `scripts/normalize-bpmn-beta.mjs` for consistent whitespace and ordering
8. **Lint**: run `scripts/lint-process-model.mjs` for naming conventions and pool structure

---

## bpmn-beta DSL Quick Reference

```
bpmn-beta
  title Purchase Order Approval

pool Finance {
  lane Requester {
    (( start )) --> [Submit PO Request] --> {Approved?}
    {Approved?} -- yes --> [Release to Vendor] --> ([ end ])
    {Approved?} -- no --> [Return with Comments] --> ([ end ])
  }
  lane Finance Manager {
    [Review PO Request] --> {Approved?}
  }
}
```

Rules:
- `bpmn-beta` keyword opens the diagram
- `pool Name { }` groups lanes; omit for flat (single-lane) diagrams
- `lane Name { }` defines a swimlane
- Message flows `~~>` must be at top level, outside pool/lane blocks
- `}` closes the most recently opened pool or lane

---

## Validation and Repair

- `scripts/validate-bpmn-beta.mjs <file.mmd>`: schema and structural validation
- `scripts/repair-bpmn-beta.mjs <file.mmd>`: auto-fixes common structural errors
- `scripts/normalize-bpmn-beta.mjs <file.mmd>`: normalises whitespace, IDs, and ordering
- `scripts/lint-process-model.mjs <file.mmd>`: naming convention and pool structure lint

---

## Handoff Instruction

Pass `bpmn-beta.mmd` to `okhp3-publication-handoff-packaging` for bundle assembly. If ≥3 gateways, also pass `pns.yaml` to `okhp3-decision-model-authoring`.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If any of the four scripts cannot run, check the diagram by hand against `references/bpmn-beta-syntax.md`, and state in the output which of validation, normalisation, repair, or linting was not run.

## References

Load on demand:
- `references/bpmn-beta-syntax.md`: complete bpmn-beta DSL keyword reference, element types, and flow operator rules

## Scripts

- `scripts/validate-bpmn-beta.mjs`: structural and schema validation
- `scripts/normalize-bpmn-beta.mjs`: whitespace and ordering normalisation
- `scripts/repair-bpmn-beta.mjs`: auto-repair for common structural errors
- `scripts/lint-process-model.mjs`: naming and pool structure lint

## Assets

- `assets/fixtures/process-model-example.yaml`: metadata fixture for a purchase-approval bpmn-beta diagram

## Evaluation and release status

This skill's output format is the one root-level `evals/` category that is **not** broken: `evals/bpmn-traceability/` checks that every task/event node in a `bpmn-beta.mmd` diagram carries a `# pns:<activity-id>` trace comment on the preceding line, using an inline validator in `../../scripts/run-eval-suite.mjs` rather than an external module import (so it has no stale-path problem, unlike the four categories documented against `okhp3-process-intake-and-scope` and `okhp3-process-narrative-authoring`). It runs against two fixtures: `bpmn-all-steps-traced.bpmn-beta.mmd` (expected pass) and `bpmn-orphan-task.bpmn-beta.mmd` (expected fail). This was verified by static inspection of `../../scripts/run-eval-suite.mjs` in this session, not by an actual live run, so it is labeled `analytical`, not `live` — but it is real, working eval design, and the one bright spot in G-1 of the maturity assessment. Note that the `# pns:<activity-id>` trace-comment convention this eval enforces is not currently documented anywhere in this `SKILL.md` or in `references/bpmn-beta-syntax.md`; an agent following only this package would not know to add it. That gap is worth closing in a future pass once the eval is confirmed live.

No dedicated `evals/evals.json` exists in this skill's own package. Evidence status: `not-run` (live) / `analytical` (the working-eval finding above, verified statically) for task quality and skill uplift.

Version 0.2.0 (this pass) added the `compatibility` declaration, per-script fallback instructions, and a sharper discovery-time boundary against non-BPMN diagram requests. Classified minor per the versioning table, not patch. No live regression run backs this bump; that limitation is disclosed, not implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn). MIT License.
