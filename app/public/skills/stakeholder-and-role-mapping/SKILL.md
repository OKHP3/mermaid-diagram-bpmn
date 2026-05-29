---
name: stakeholder-and-role-mapping
description: Derive and validate a structured stakeholder register from a completed Process Intake Record. Use this skill when you have a PIR from process-intake-and-scope and need to identify all affected parties, classify their roles, assess influence and interest, and define engagement strategies. Use when the user asks who is involved in a process, needs a RACI-ready role list, wants to understand stakeholder impact, or needs an engagement plan before narrative authoring begins.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/stakeholder-and-role-mapping
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: core
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-analysis
  standards_refs:
    - "BABOK v3 §3.2 (Stakeholder Analysis)"
    - "BABOK v3 §10.41 (Stakeholder List, Map, or Personas)"
    - "PMI PMBOK v7 §2.2 (Stakeholder Performance Domain)"
    - "BPM CBOK v4 §4 (Process Modelling)"
  produces: "stakeholder-register.yaml"
  consumes: "pir.yaml"
  depends_on: ["process-intake-and-scope"]
  tags: stakeholder-analysis, role-mapping, stakeholder-register, BABOK, engagement-strategy, RACI, business-analysis
  triggers:
    - who is involved in this process
    - stakeholder register
    - map the roles
    - identify stakeholders
    - engagement strategy
    - who needs to be consulted
    - RACI roles
---

## Purpose

Derive a structured stakeholder register from a validated PIR. The register maps every actor to a stakeholder record with role classification, interest, influence, and engagement strategy — providing the role foundation for RACI matrices, governance documents, and process narrative authoring.

---

## When to use this skill

- PIR has `ready_for_narrative: true` and you need a stakeholder register before writing the PNS
- User asks who should be consulted, informed, or responsible for a process
- You need engagement strategies for each role before drafting governance content

## When NOT to use this skill

- PIR has not been validated (score < 70) — return to `process-intake-and-scope`
- User only needs a quick list of names without structured classification — ask if a full register is needed
- Do not invent stakeholders not present in the PIR actors array

---

## Derivation Rules

`scripts/generate-stakeholder-register.mjs` derives the register from `pir.actors[]`:

| Actor type | Engagement strategy |
|---|---|
| `initiator` | Collaborate |
| `performer` | Collaborate |
| `approver` | Consult |
| `reviewer` | Consult |
| `notified` | Inform |
| `system` | Monitor |

Each register entry contains:
- `stakeholder_id` — from `actors[].role_id`
- `name` — from `actors[].role_name`
- `department` — from `actors[].department` (defaults to `"Unspecified"`)
- `primary_role` — from `actors[].type`
- `interest` — from `actors[].interest` (defaults to `"outcome quality"`)
- `influence` — from `actors[].influence` (defaults to `"medium"`)
- `engagement_strategy` — derived per table above

---

## Influence–Interest Grid

After derivation, plot each stakeholder on the 2×2 grid:

| | Low Interest | High Interest |
|---|---|---|
| **High Influence** | Keep Satisfied | Manage Closely |
| **Low Influence** | Monitor | Keep Informed |

Document the quadrant in `stakeholder_register.grid_position` for each entry.

---

## Validation

Every register must pass:
- At least one `Collaborate` entry (initiator or performer present)
- At least one `Consult` or `Manage Closely` entry
- No stakeholder with empty `stakeholder_id`
- `influence` values are one of: `high | medium | low`

---

## Handoff Instruction

Pass `pir.yaml` and the generated `stakeholder-register.yaml` together to `process-narrative-authoring`. The narrative skill maps `stakeholder_id` values to RACI role assignments.

---

## References

Load on demand:
- `references/stakeholder-identification-rules.md` — actor type definitions, engagement strategies, and grid placement rules

## Scripts

- `scripts/generate-stakeholder-register.mjs` — derives register from PIR actors array

## Assets

- `assets/fixtures/stakeholder-register-example.yaml` — canonical register derived from purchase-approval PIR
