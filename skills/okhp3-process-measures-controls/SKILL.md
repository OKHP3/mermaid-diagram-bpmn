---
name: okhp3-process-measures-controls
description: "Define process performance measures, KPIs, and compliance controls for a validated PNS. Use this skill when the user needs to add measurability and governance to a documented process; when they ask to define KPIs, set performance targets, add compliance controls, or map the process to a control framework. This is a recommended extension skill — use after okhp3-process-narrative-authoring when governance and measurement rigour beyond the PNS's own kpis section is required. Produces a measures register and a controls register."
license: "MIT"
compatibility: "Drafting KPIs and controls needs no special runtime. scripts/generate-measures-register.mjs needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, scaffold both registers by hand from the PNS kpis and controls_and_compliance sections using references/kpi-design-rules.md and say so in your output rather than presenting the result as machine-generated."
metadata:
  bp_skill_version: "0.3.0"
  status: "recommended-extension"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-governance"
  standards_refs: "ISO 9001:2015 §9.1 (Monitoring, measurement, analysis and evaluation); COSO Internal Control Integrated Framework 2013; BABOK v3 §7.4 (Assess Solution Limitations); BPM CBOK v4 §8 (Process Performance Management)"
  produces: "measures-register.yaml, controls-register.yaml"
  consumes: "pns.yaml"
  depends_on: "okhp3-process-narrative-authoring"
  tags: "KPIs, measures, controls, governance, ISO9001, COSO, performance-management, compliance, process-controls"
  triggers: "define KPIs; add performance measures; compliance controls; governance framework; measures register; controls register; performance targets; ISO 9001 controls"
  homepage: "https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/okhp3-process-measures-controls"
  repository: "https://github.com/overkillhill/mermaid-diagram-bpmn"
---

# okhp3-process-measures-controls

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn) · OverKill Hill P³

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

- PNS does not exist or is below quality threshold: complete `okhp3-process-narrative-authoring` first
- User only needs basic KPIs: use the KPI authoring in `okhp3-process-narrative-authoring` directly
- Do not invent performance targets without user confirmation: record as `target: TBD` with an open question

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
- `kpi_id`: stable identifier (kpi-001, kpi-002, …)
- `name`: human-readable label
- `category`: from taxonomy above
- `formula`: calculation description (mandatory)
- `data_source`: system or record that provides the data (mandatory)
- `target`: numeric target or `"TBD"`
- `frequency`: measurement frequency (daily | weekly | monthly | quarterly)
- `owner_role_id`: from PNS `roles_and_raci.roles[]`
- `activities_measured[]`: list of `act-NNN` IDs this KPI covers

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
- `control_id`: stable identifier (ctrl-001, ctrl-002, …)
- `type`: from COSO taxonomy above
- `description`: what the control does
- `standard_ref`: the policy, regulation, or framework reference
- `activities_covered[]`: list of `act-NNN` IDs this control applies to
- `frequency`: when the control is applied
- `evidence_required`: what evidence demonstrates the control operated
- `owner_role_id`: from PNS `roles_and_raci.roles[]`

---

## Handoff Instruction

Merge `measures-register.yaml` KPI entries back into `pns.yaml` `kpis[]` section. Merge `controls-register.yaml` entries into `pns.yaml` `controls_and_compliance[]`. Re-run `okhp3-process-validation-scoring` to verify score improves.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/generate-measures-register.mjs` cannot run, scaffold both registers by hand using `references/kpi-design-rules.md`, and state in the output that automated generation was not run.

## References

Load on demand:
- `references/kpi-design-rules.md`: KPI category taxonomy, formula construction rules, data source requirements, and COSO control type definitions

## Scripts

- `scripts/generate-measures-register.mjs`: scaffolds measures and controls registers from PNS kpis and controls sections

## Assets

- `assets/fixtures/measures-register-example.yaml`: canonical measures and controls for purchase-approval process

## Evaluation and release status

No `evals/evals.json` exists for this skill yet. Its output feeds back into the PNS, so it is indirectly touched by `evals/control-coverage/` once that category's stale `validator_module` path is fixed (see `okhp3-process-narrative-authoring`'s Evaluation section), but nothing evaluates `measures-register.yaml` or `controls-register.yaml` directly. The only current check is the maintainer-facing `tests/validate-skill.test.mjs` against `assets/fixtures/measures-register-example.yaml`. Evidence status: `not-run` for task quality and skill uplift.

Version 0.2.0 (this pass) added the `compatibility` declaration, the script fallback instruction, and a sharper discovery-time boundary against the PNS's own inline `kpis[]` authoring. Classified minor per the versioning table, not patch. No regression suite exists to run before this bump; that limitation is disclosed, not implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn). MIT License.
