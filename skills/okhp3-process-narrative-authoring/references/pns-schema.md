# PNS Schema Reference

## PNS Lifecycle — 9 States

The Process Narrative Specification passes through 9 states:

| State | Description | Trigger |
|---|---|---|
| `draft-intake` | Intake is being drafted | Process intake |
| `scoped` | Boundary and stakeholders identified | Scope completion |
| `elicited` | Elicitation evidence recorded | Interview capture |
| `documented-as-is` | Current state captured | As-is capture |
| `modeled` | Narrative authored | Narrative authoring |
| `analyzed` | Gaps and exceptions analyzed | Gap analysis |
| `validated` | Blocking checks passed | Validation and scoring |
| `packaged` | Review bundle assembled | Publication packaging |
| `published` | Required human approvals recorded and bundle released | Owner-controlled publication |

Advance one state at a time using `scripts/check-pns-status-transition.mjs` in the repository.
A score or bundle does not grant approval. Optional `approval_state` records document review
separately (for example `draft`, `under-review`, or `approved`). It is not a lifecycle status.

## Required Top-Level YAML Metadata

```yaml
pns_version: "0.1"
process_id: ""
process_name: ""
process_owner: ""          # role, not person
department: ""
status: draft-intake       # one of the 9 lifecycle states above
approval_state: draft     # optional, separate owner review state
created_date: ""           # ISO 8601
last_modified_date: ""     # ISO 8601
pir_ref: ""                # process_id from the source PIR
apqc_pcf_mapping: ""       # APQC PCF category code (e.g. "4.1.1")
```

## 13 Required Body Sections

All section keys are top-level siblings of the metadata in `pns.yaml`. Do not wrap them
in `sections`. The Markdown companion is a human-readable rendering, not another schema.
The canonical blank template is `assets/pns-template.yaml`.

| Section key | ISO/BABOK reference | Required fields |
|---|---|---|
| `process_box` | ISO 9001 §4.4.1 | trigger, inputs[], outputs[], criteria, resources, responsibilities, risks |
| `activity_sequence` | IEEE 29148 | activities[] (≥3, each with id, description, actor_role_id) |
| `roles_and_raci` | PMI PMBOK | roles[], raci_matrix[] (each with accountable exactly once) |
| `business_rules` | BABOK §10.11 | id, description, source, applies_to (each entry) |
| `decision_points` | OMG DMN | id, description, activity_id, criteria, outcomes[] (≥2 per entry) |
| `exception_paths` | ISO 9001 §10.2 | id, description, trigger, handling (non-empty), owner_role_id |
| `kpis` | ISO 9001 §9.1 | id, name, formula (non-empty), data_source (non-empty), target, frequency |
| `systems_and_integrations` | BPM CBOK §4 | system_name, role, integration_type, activities_supported[] |
| `controls_and_compliance` | COSO | id, type, description, standard_ref, activities_covered[] |
| `open_questions` | BABOK §4 | id, question, owner_role_id, target_resolution_date |
| `babok_core_concepts` | BABOK v3 CCM | change, need, solution, stakeholders, value, context (≥4 populated, ≥20 chars each) |
| `revision_history` | ISO 9001 §7.5.3 | version, date, author_role, summary |
| `validation` | BP-SKILL computed | pns_quality_score, ready_for_publication, ready_for_bpmn_modeling |

## Traceability Requirements

Every `activity_sequence.activities[].id` (act-NNN) must appear in at least one `raci_matrix[].activity_id`.

Every `decision_points[].activity_id` must reference a valid `activity_sequence.activities[].id`.

Every `exception_paths[].owner_role_id` must reference a valid `roles_and_raci.roles[].role_id`.

Every `business_rules[].applies_to` must be `"all"` or reference a valid `activity_sequence.activities[].id`.

## Quality Score Weights

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

Publication threshold: **≥75**, no V1-V7 blocking errors, and no unresolved question with
`must_resolve_before_publish: true` (unless explicitly `resolved: true`). The full suite
also requires the V8 PIR gate. Human approval remains a separate publication requirement.
BPMN modeling threshold: **≥75** after blocking validation errors are resolved.
