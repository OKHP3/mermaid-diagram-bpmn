---
name: okhp3-process-narrative
description: Author and validate a Process Narrative Specification (PNS) from a PIR and stakeholder register. Use this skill when you have a completed Process Intake Record (PIR) from okhp3-process-discovery and need to produce a structured narrative document that anchors ISO 9001 §4.4.1 process-box semantics, BABOK Core Concept Model, RACI matrix, SIPOC table, business rules, decision points, KPIs, and controls. The PNS is the authoritative input for okhp3-bpmn-for-mermaid.
license: MIT
metadata:
  bp_skill_version: "0.2.0"
  status: core
  version: 0.1.0
  author: OverKill Hill P³
  category: process-documentation
  standards_refs:
    - "ISO 9001:2015 §4.4.1 (Quality Management System and its processes)"
    - "BABOK v3 §7 (Solution Evaluation)"
    - "BABOK v3 Core Concept Model"
    - "BPM CBOK v4 §5 (Process Analysis)"
  tags: process-narrative, pns, iso9001, babok, raci, sipoc, business-rules, kpis, process-modeling
  consumes: "pir.yaml, stakeholder-register.yaml"
  produces: "pns.yaml, pns.md, sipoc.md, raci.md"
  depends_on: ["okhp3-process-discovery"]
---

## Purpose

Transform a validated PIR (from `okhp3-process-discovery`) into a Process Narrative Specification (PNS) — the structured prose document that anchors process semantics for human review and downstream diagram generation.

The PNS is the single authoritative source of truth between process discovery and visual modeling. It documents what the process does, who does it, how it is governed, how it is measured, and what can go wrong.

## When to use this skill

- You have a PIR with `completeness_score ≥ 70` and `ready_for_narrative: true`
- The user needs a formal process document (ISO 9001 §4.4.1, BABOK §7)
- You need to produce SIPOC, RACI, or business rules as standalone artifacts
- You are preparing input for `okhp3-bpmn-for-mermaid`

## When NOT to use this skill

- PIR has not been validated by `okhp3-process-discovery` — complete intake first
- The user only needs a quick diagram without governance structure — go directly to `okhp3-bpmn-for-mermaid`
- The process is exploratory and roles/rules are completely unknown — return to discovery

---

## Input: PIR + Stakeholder Register

Before authoring a PNS, verify the inputs:

| Input | Source | Required fields |
|---|---|---|
| `pir.yaml` | okhp3-process-discovery | process_id, trigger, actors, steps, business_rules, systems |
| `stakeholder-register.yaml` | okhp3-process-discovery | stakeholder_id, name, primary_role, engagement_strategy |

Map PIR `actors[]` → PNS `roles_and_raci.roles[]`.
Map PIR `steps[]` → PNS `activity_sequence.activities[]` (one activity per step).
Map PIR `business_rules[]` → PNS `sections.business_rules[]`.
Map PIR `systems[]` → PNS `sections.systems_and_integrations[]`.

---

## PNS Structure — 12 Required Sections

### 1. process_box (ISO 9001 §4.4.1)

Documents the process as a system with: `trigger` (initiating event), `inputs[]` (each with `name` and `source`), `outputs[]` (each with `name` and `consumer`), `criteria` (completion/acceptance), `resources`, `responsibilities`, `risks`.

### 2. activity_sequence

Ordered activities. Each item: `id`, `description` (single imperative statement per IEEE 29148), `actor_role_id`, `inputs[]`, `outputs[]`, `systems[]`, `preconditions`, `postconditions`.

Minimum 3 activities required for full quality score.

### 3. roles_and_raci

**roles[]:** `{ role_id, role_name }` — all roles involved.

**raci_matrix[]:** One entry per activity — `activity_id`, `responsible[]` (≥1), `accountable` (exactly 1), `consulted[]`, `informed[]`.

### 4. business_rules

`{ id, description, source, applies_to, rationale }`. `source` is mandatory (V2). `applies_to` references an `activity_id` or `"all"`.

### 5. decision_points

`{ id, description, activity_id, criteria, outcomes[] }`. Each entry must have ≥2 outcomes (V6). Each outcome: `{ label, next_activity }`.

### 6. exception_paths

`{ id, description, trigger, handling, owner_role_id, escalation_path }`. `handling` is mandatory and non-empty (V6).

### 7. kpis

`{ id, name, formula, data_source, target, frequency }`. Both `formula` and `data_source` are mandatory (V5).

### 8. systems_and_integrations

`{ system_name, role, integration_type, activities_supported[] }`.

### 9. controls_and_compliance

`{ id, type, description, standard_ref, activities_covered[], waiver }`. Empty section triggers V7 warning.

### 10. open_questions

`{ id, question, owner_role_id, target_resolution_date }`. Record gaps here — do not invent content.

### 11. revision_history

`{ version, date, author_role, summary }`. Required for document change traceability.

### 12. validation (computed)

`{ pns_quality_score, ready_for_publication, ready_for_bpmn_modeling }`. Populated by `score-pns-quality.mjs`. Do not author manually.

---

## BABOK Core Concept Model Anchoring

Every PNS must populate `babok_core_concepts` with at least 4 of 6 fields (≥20 chars each):

| Field | Prompt |
|---|---|
| `change` | What state transforms when this process completes? |
| `need` | What problem or opportunity does this process address? |
| `solution` | What capability or work product satisfies the need? |
| `stakeholders` | Who is impacted, involved, or interested? |
| `value` | What measurable value does this process deliver? |
| `context` | What environment or constraints does the process operate within? |

---

## V1–V7 Validation Rules

| Rule | Severity | Description |
|---|---|---|
| V1 | error | All required top-level fields present; status valid; ≥4 babok_core_concepts populated; all 12 sections keys present |
| V2 | error | Every activity has non-empty description + actor_role_id; every business rule has non-empty source |
| V3 | error | Every RACI entry has exactly one non-empty Accountable and at least one Responsible; every activity has a RACI entry |
| V4 | warning | Activity descriptions that contain semicolons, exceed 200 chars, or start with subordinate conjunctions |
| V5 | error | Every KPI must have non-empty formula and data_source |
| V6 | error | Every decision_point must have ≥2 outcomes; every exception_path must have non-empty handling |
| V7 | warning | controls_and_compliance is empty; activities not covered by any control |

Run: `node scripts/validate-pns.mjs <pns.yaml>`

Returns: `{ valid, errors[], warnings[], rules_fired[] }`

---

## Quality Score and Publication Gate

Weighted 0–100 score. Publication threshold: **≥75**.

| Section | Max pts | Passes when |
|---|---|---|
| process_box | 15 | trigger + inputs with source + outputs with consumer + criteria + responsibilities + risks |
| activity_sequence | 15 | ≥3 activities (10 pts); all have description + actor (5 pts) |
| roles_and_raci | 10 | ≥2 roles + matrix non-empty + all entries have accountable |
| business_rules | 10 | ≥1 rule with source |
| decision_points | 10 | ≥1 decision with ≥2 outcomes |
| exception_paths | 10 | ≥1 exception with handling |
| kpis | 10 | ≥1 KPI with formula + data_source |
| systems_and_integrations | 5 | ≥1 system |
| controls_and_compliance | 5 | ≥1 control |
| babok_core_concepts | 5 | 6→5 pts, 5→4 pts, 4→3 pts, <4→0 pts |
| apqc_pcf_mapping | 5 | field non-empty |
| **Total** | **100** | |

Run: `node scripts/score-pns-quality.mjs <pns.yaml>`

---

## SIPOC Generation

`generate-sipoc.mjs` derives the SIPOC table from the PNS:

- **Suppliers** — unique `source` values from `process_box.inputs[]`
- **Inputs** — `process_box.inputs[].name` (deduplicated)
- **Process** — `activity_sequence.activities[].description` (in order)
- **Outputs** — `process_box.outputs[].name` (deduplicated)
- **Customers** — unique `consumer` values from `process_box.outputs[]`

Run: `node scripts/generate-sipoc.mjs <pns.yaml>`

---

## RACI Matrix Generation

`generate-raci.mjs` builds the matrix from `roles_and_raci` + `activity_sequence`:

- Iterates activities in sequence order
- Joins RACI entries by `activity_id`
- Returns `{ roles[], matrix[{ activity_id, description, R[], A, C[], I[] }] }`
- Activities with no RACI entry appear with empty assignments (and a warning)

Run: `node scripts/generate-raci.mjs <pns.yaml>`

---

## Authoring Workflow

Execute in order:

1. **Load PIR** — read `pir.yaml` and `stakeholder-register.yaml` from `okhp3-process-discovery` output
2. **Map inputs** — convert PIR actors → roles, steps → activities, rules → business_rules
3. **Draft process_box** — fill trigger, inputs, outputs, criteria, resources, responsibilities, risks from PIR
4. **Expand activities** — enrich each step with preconditions, postconditions, and system assignments
5. **Build RACI** — assign R/A/C/I for each activity from PIR actor types and engagement strategies
6. **Document rules + decisions** — expand PIR business_rules with source citations; derive decision points from steps with branching outcomes
7. **Define KPIs** — at least one KPI with formula and data_source per core process objective
8. **Add controls** — map each applicable compliance standard to the activities it covers
9. **Anchor CCM** — populate all 6 babok_core_concepts fields with substantive statements
10. **Record open questions** — do not invent content; log gaps as `open_questions[]`
11. **Validate** — run `validate-pns.mjs`; fix all errors before continuing
12. **Score** — run `score-pns-quality.mjs`; ensure score ≥75 before handoff

---

## Handoff

When validation passes and score ≥ 75, pass `pns.yaml` to `okhp3-bpmn-for-mermaid`.

The BPMN skill uses:
- `activity_sequence.activities[]` → task nodes
- `decision_points[]` → gateway nodes + outgoing flows
- `roles_and_raci.roles[]` → lane labels
- `exception_paths[]` → error event paths

---

## References

Load on demand:
- `references/pns-schema.md` — complete field-level documentation for all 12 sections
- `references/iso9001-process-box-rules.md` — ISO 9001 §4.4.1 mapping table and input/output quality rules
- `references/babok-core-concept-model.md` — CCM field prompts and anchoring rules
- `references/validation-rules.md` — V1–V7 severity, description, and remediation guide
- `references/scope-firewall.md` — hard prohibitions for all skill output

## Scripts

- `scripts/validate-pns.mjs` — V1–V7 validation
- `scripts/score-pns-quality.mjs` — weighted quality score
- `scripts/generate-sipoc.mjs` — SIPOC table derivation
- `scripts/generate-raci.mjs` — RACI matrix construction
- `scripts/extract-business-rules.mjs` — rule collection and deduplication
- `scripts/parse-yaml-minimal.mjs` — shared YAML parser (used by all CLI entrypoints)
