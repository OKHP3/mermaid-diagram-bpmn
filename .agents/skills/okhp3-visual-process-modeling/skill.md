---
name: visual-process-modeling
description: Generate, validate, normalise, and explain Mermaid-native bpmn-beta diagrams from a Process Narrative Specification. Use this skill when the user wants to convert a PNS or process notes into a visual diagram; when they ask for BPMN, a process flow, a swimlane diagram, or a workflow diagram; when they want to validate or repair existing bpmn-beta code; when they mention pools, lanes, gateways, tasks, events, or BPMN 2.0; when they want a Mermaid-native process model they can commit to a repo; when the PNS has three or more gateway decision points and a DMN decision table is warranted.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/visual-process-modeling
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: core
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-diagramming
  standards_refs:
    - "BPMN 2.0.2 Descriptive Conformance Sub-Class (OMG formal/2013-12-09)"
    - "Mermaid 11.x External Diagram API"
    - "BPM CBOK v4 §6 (Process Modeling)"
  produces: "bpmn-beta.mmd, process-model.svg"
  consumes: "pns.yaml"
  depends_on: ["process-narrative-authoring"]
  tags: bpmn, mermaid, bpmn-beta, visual-modeling, process-flow, swimlane, gateways, pools, lanes, workflow
  triggers:
    - create a BPMN diagram
    - draw a business process
    - convert process to mermaid
    - bpmn-beta
    - swimlane diagram
    - process flow with gateways
    - validate BPMN
    - pools and lanes
    - model this workflow
---

## Purpose

Generate a Mermaid-native `bpmn-beta` diagram from a validated PNS. The diagram uses the BPMN 2.0 Descriptive Conformance Sub-Class node set — tasks, gateways, events, message flows, pools, and lanes — expressed in the readable `bpmn-beta` DSL.

---

## When to use this skill

- PNS has `validation.ready_for_bpmn_modeling: true`
- User wants a visual process diagram in Mermaid syntax
- User wants to validate or normalise existing `bpmn-beta` code
- PNS contains ≥3 decision_points → also trigger `decision-model-authoring` for a DMN table

## When NOT to use this skill

- PNS has not been validated (score < 75) — complete `process-narrative-authoring` first
- User wants a non-BPMN diagram (flowchart, sequence diagram) — use standard Mermaid syntax
- Do not claim full BPMN 2.0 XML conformance — this is a descriptive subset for human-readable process modeling

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

When the PNS has **≥3 decision_points**, hand off to `decision-model-authoring` concurrently with diagram generation. The BPMN gateway labels must match the DMN rule IDs.

---

## Generation Workflow

1. **Load PNS** — read activity_sequence, decision_points, roles, exception_paths
2. **Map to bpmn-beta** — assign each activity to a lane based on `actor_role_id`
3. **Render gateways** — use `{condition?}` for exclusive gateways; `{+}` for parallel
4. **Connect flows** — use `-->` for sequence flows; `~~>` for message flows (top level only)
5. **Add events** — `(( start ))` and `([ end ])` for process boundaries; `((! error ))` for exception paths
6. **Validate** — run `scripts/validate-bpmn-beta.mjs`; fix all errors
7. **Normalise** — run `scripts/normalize-bpmn-beta.mjs` for consistent whitespace and ordering
8. **Lint** — run `scripts/lint-process-model.mjs` for naming conventions and pool structure

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

- `scripts/validate-bpmn-beta.mjs <file.mmd>` — schema and structural validation
- `scripts/repair-bpmn-beta.mjs <file.mmd>` — auto-fixes common structural errors
- `scripts/normalize-bpmn-beta.mjs <file.mmd>` — normalises whitespace, IDs, and ordering
- `scripts/lint-process-model.mjs <file.mmd>` — naming convention and pool structure lint

---

## Handoff Instruction

Pass `bpmn-beta.mmd` to `publication-and-handoff-packaging` for bundle assembly. If ≥3 gateways, also pass `pns.yaml` to `decision-model-authoring`.

---

## References

Load on demand:
- `references/bpmn-beta-syntax.md` — complete bpmn-beta DSL keyword reference, element types, and flow operator rules

## Scripts

- `scripts/validate-bpmn-beta.mjs` — structural and schema validation
- `scripts/normalize-bpmn-beta.mjs` — whitespace and ordering normalisation
- `scripts/repair-bpmn-beta.mjs` — auto-repair for common structural errors
- `scripts/lint-process-model.mjs` — naming and pool structure lint

## Assets

- `assets/fixtures/process-model-example.yaml` — metadata fixture for a purchase-approval bpmn-beta diagram
