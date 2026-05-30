# PNS Schema Reference

## PNS Lifecycle — 9 States

The Process Narrative Specification passes through 9 states:

| State | Description | Trigger |
|---|---|---|
| `draft` | Initial authoring in progress | PNS created from PIR |
| `review-ready` | All 13 sections present, V1–V7 errors resolved | `validate-pns.mjs` passes |
| `under-review` | Distributed to stakeholders for review | Reviewer assigned |
| `revisions-requested` | Reviewers have returned comments | Comments recorded in `open_questions[]` |
| `revised` | Author has addressed review comments | All `open_questions[]` resolved |
| `approved` | All required approvers have signed off | APPROVALS.yaml updated |
| `published` | Bundle assembled and distributed | `build-publication-bundle.mjs` succeeds |
| `superseded` | A newer version has been published | `revision_history[]` updated |
| `retired` | Process is no longer in use | `status: retired` set |

Valid transitions: `draft → review-ready → under-review → revisions-requested → revised → under-review → approved → published → superseded | retired`

## Required YAML Frontmatter

```yaml
pns_version: "0.1"
process_id: ""
process_name: ""
process_owner: ""          # role, not person
department: ""
status: draft              # one of the 9 lifecycle states above
created_date: ""           # ISO 8601
last_modified_date: ""     # ISO 8601
pir_ref: ""                # process_id from the source PIR
apqc_pcf_mapping: ""       # APQC PCF category code (e.g. "4.1.1")
```

## 13 Required Body Sections

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

Publication threshold: **≥75** → `ready_for_publication: true`
BPMN modeling threshold: **≥75** → `ready_for_bpmn_modeling: true`
