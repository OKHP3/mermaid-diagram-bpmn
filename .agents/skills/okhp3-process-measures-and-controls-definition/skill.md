---
name: process-measures-and-controls-definition
description: Define process performance measures, KPIs, and compliance controls for a validated PNS. Use this skill when the user needs to add measurability and governance to a documented process; when they ask to define KPIs, set performance targets, add compliance controls, or map the process to a control framework. This is a recommended extension skill — use after process-narrative-authoring when governance and measurement rigour is required. Produces a measures register and a controls register.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/process-measures-and-controls-definition
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: recommended-extension
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-governance
  standards_refs:
    - "ISO 9001:2015 §9.1 (Monitoring, measurement, analysis and evaluation)"
    - "COSO Internal Control Integrated Framework 2013"
    - "BABOK v3 §7.4 (Assess Solution Limitations)"
    - "BPM CBOK v4 §8 (Process Performance Management)"
  produces: "measures-register.yaml, controls-register.yaml"
  consumes: "pns.yaml"
  depends_on: ["process-narrative-authoring"]
  tags: KPIs, measures, controls, governance, ISO9001, COSO, performance-management, compliance, process-controls
  triggers:
    - define KPIs
    - add performance measures
    - compliance controls
    - governance framework
    - measures register
    - controls register
    - performance targets
    - ISO 9001 controls
---

## Purpose

Define measurable process KPIs and structured compliance controls, enriching the PNS with the governance layer required for ISO 9001 §9.1 monitoring and COSO-aligned internal controls.

---

## When to use this skill

- PNS quality score ≥ 75 and user needs additional governance structure
- User needs to map process activities to a control framework
- Preparing process documentation for audit or certification
- PNS `kpis[]` or `controls_and_compliance[]` sections are sparse and need enrichment

## When NOT to use this skill

- PNS does not exist or is below quality threshold — complete `process-narrative-authoring` first
- User only needs basic KPIs — use the KPI authoring in `process-narrative-authoring` directly
- Do not invent performance targets without user confirmation — record as `target: TBD` with an open question

---

## Measures Register Design

### KPI categories

| Category | Examples |
|---|---|
| Cycle time | Average time from trigger to completion |
| Quality | Error rate, rework rate, exception rate |
| Volume | Transactions per period |
| Compliance | % of steps completed with required controls |
| Cost | Cost per transaction |
| Customer | Satisfaction score, response time |

### KPI schema

Each KPI in `measures-register.yaml`:
- `kpi_id` — stable identifier (kpi-001, kpi-002, …)
- `name` — human-readable label
- `category` — from taxonomy above
- `formula` — calculation description (mandatory)
- `data_source` — system or record that provides the data (mandatory)
- `target` — numeric target or `"TBD"`
- `frequency` — measurement frequency (daily | weekly | monthly | quarterly)
- `owner_role_id` — from PNS `roles_and_raci.roles[]`
- `activities_measured[]` — list of `act-NNN` IDs this KPI covers

---

## Controls Register Design

### Control types (COSO-aligned)

| Type | Description |
|---|---|
| `preventive` | Stops an error from occurring |
| `detective` | Identifies an error after it occurs |
| `corrective` | Fixes an error once detected |
| `directive` | Guides behaviour through policy or procedure |

### Control schema

Each control in `controls-register.yaml`:
- `control_id` — stable identifier (ctrl-001, ctrl-002, …)
- `type` — from COSO taxonomy above
- `description` — what the control does
- `standard_ref` — the policy, regulation, or framework reference
- `activities_covered[]` — list of `act-NNN` IDs this control applies to
- `frequency` — when the control is applied
- `evidence_required` — what evidence demonstrates the control operated
- `owner_role_id` — from PNS `roles_and_raci.roles[]`

---

## Handoff Instruction

Merge `measures-register.yaml` KPI entries back into `pns.yaml` `kpis[]` section. Merge `controls-register.yaml` entries into `pns.yaml` `controls_and_compliance[]`. Re-run `process-validation-and-quality-scoring` to verify score improves.

---

## References

Load on demand:
- `references/kpi-design-rules.md` — KPI category taxonomy, formula construction rules, data source requirements, and COSO control type definitions

## Scripts

- `scripts/generate-measures-register.mjs` — scaffolds measures and controls registers from PNS kpis and controls sections

## Assets

- `assets/fixtures/measures-register-example.yaml` — canonical measures and controls for purchase-approval process
