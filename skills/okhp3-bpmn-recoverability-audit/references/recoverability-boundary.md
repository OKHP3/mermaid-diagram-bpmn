# Recoverability Boundary — pns.yaml sections vs. bpmn-beta grammar

The definitive table this skill is built on. For every section and field of
the `pns.yaml` schema (see `docs/pns-schema.md` and
`skills/okhp3-process-narrative-authoring/assets/fixtures/pns-example.yaml`),
this table states whether a **textually valid `bpmn-beta` diagram** can
structurally encode it — not whether a sufficiently clever parser or a human
reading the picture *might guess* it.

Three ratings are used:

- **yes** — the diagram's own grammar has a dedicated element for this field;
  a correct parser recovers it directly, with no inference step.
- **partial** — the diagram gives a genuine, structural signal, but the signal
  is weaker than the field it stands in for (e.g. a lane name is not the same
  claim as a validated `actor_role_id`, and lane co-occurrence is not the same
  claim as a full RACI entry). Treat a `partial` field as recoverable evidence,
  not as equivalent to the elicited original.
- **no** — the diagram has no grammar channel for this field at all. No parser
  improvement changes this; the field is a narrative, rationale, governance, or
  measurement fact that `bpmn-beta` was never designed to carry.

`scripts/audit-diagram-fidelity.mjs` encodes this same table as
`RECOVERABILITY_TABLE`; keep the two in sync when either changes.

---

## process_box

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `trigger` | partial | Start event node and its label show that a trigger exists and give its short name, but the business-context sentence — why this is the correct trigger, its preconditions — is not diagram-native. |
| `outputs[].name` / `.consumer` | partial | End event nodes give a terminal label; `.consumer` is only recoverable when an explicit message flow (`~~>`) names an external pool or lane as the target. Most diagrams don't carry this. |
| `inputs[]`, `criteria`, `resources`, `responsibilities`, `risks` | no | No `bpmn-beta` element carries input-artifact provenance, success-criteria prose, named resources, accountability prose, or risk narrative. These are elicitation-only fields. |

## activity_sequence

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `activities[].description` | yes | Task node label (`[Task Label]` / `task:user t1 "Label"`). |
| Activity order / sequence | yes | Sequence flow arrows (`-->`) directly encode execution order. |
| `activities[].actor_role_id` | partial | Lane assignment names an owning lane, but mapping that lane name onto a validated `actor_role_id` from `role-dictionary.md` is an inference, not a structural guarantee. |
| `activities[].inputs`, `.outputs`, `.systems`, `.preconditions`, `.postconditions` | no | Task node grammar carries only a label and a lane. Per-activity artifact flow, system touchpoints, and pre/postcondition prose have no dedicated grammar element. |

## roles_and_raci

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `roles[]` (role list) | partial | Pool and lane names give a candidate role list. Names may not match `role-dictionary.md` IDs, and lane presence doesn't confirm the role is current or correctly scoped. |
| `raci_matrix[]` (accountable / responsible / consulted / informed) | no | `bpmn-beta` has no grammar for the four RACI categories. Lane ownership at best implies "whoever performs tasks in this lane," which reads closer to Responsible than to a validated Accountable/Consulted/Informed split. Presenting lane ownership as a full RACI entry is a fabrication risk. |

## business_rules

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `description` | partial | A gateway condition label can carry a short rule statement, but only when the label itself states the rule rather than asking a bare question (e.g. `{Approved?}` gives no rule text at all). |
| `source`, `rationale` | no | Policy citation and rationale prose have no `bpmn-beta` grammar element. |

## decision_points

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `description` | yes | Gateway node label is the decision question. |
| `outcomes[]` | yes | Labeled branch flows leaving the gateway (`-- yes -->`, `-- no -->`) are the outcomes. |
| `criteria`, deciding authority | no | The precise decision criteria (thresholds, logical conditions) and the deciding role/authority are narrative fields with no gateway-label equivalent. |

## exception_paths

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| Existence of an exception path | partial | An error / intermediate-error event confirms that some exception handling exists and roughly where it attaches — weaker than a fully elicited exception register entry. |
| `handling`, `escalation_path` | no | The handling procedure and escalation chain are prose fields with no dedicated `bpmn-beta` grammar; an error event marks that something happens, not what. |

## systems_and_integrations

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `system_name`, `integration_type`, `activities_supported` | no | `bpmn-beta` has no system/tool node type. A system name occasionally appears inside a task label as an aside, but that is an unreliable textual inference, not a structural encoding, and must not be reported as recovered. |

## kpis

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `name`, `formula`, `data_source`, `target`, `frequency` | no | There is no measurement or metric concept anywhere in `bpmn-beta` grammar. |

## controls_and_compliance

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `type`, `description`, `standard_ref`, `activities_covered`, `waiver` | no | Controls and compliance mappings are governance narrative with no diagram-grammar channel. |

## open_questions

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `open_questions[]` | no | This is a meta-narrative field about elicitation gaps; a diagram cannot state what wasn't asked about it. |

## babok_core_concepts

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `change`, `need`, `solution`, `stakeholders`, `value`, `context` | no | These are BABOK rationale fields describing why the process exists and what it's for. A diagram encodes what happens, not why. |

## revision_history

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `revision_history[]` | no | Authorship and versioning metadata is document-management information, not process content a diagram can carry. |

## validation

| Field | Recoverable? | Diagram signal / why not |
|---|---|---|
| `pns_quality_score`, `ready_for_publication`, `ready_for_bpmn_modeling` | no | These are computed by `okhp3-process-validation-scoring` and `okhp3-process-narrative-authoring`, not derived from the diagram. A diagram-derived PNS must never self-assign these values. |

---

## Reading the split

Roughly 8 of the 13 `pns.yaml` sections carry at least one `partial`-or-better
field (structural process shape: activities, sequence, lanes, gateways,
outcomes, start/end/error events). All 13 sections carry at least one `no`
field. **No section is fully recoverable from diagram grammar alone** — every
diagram-derived PNS carries real, disclosed gaps, even in its best-covered
sections (`activity_sequence`, `decision_points`).

This is the reason `okhp3-bpmn-recoverability-audit` exists as a separate skill
from `okhp3-process-validation-scoring`: V1–V9 asks "does this PNS meet the
bar for publication," assuming elicitation happened. This table instead asks
"given that elicitation did *not* happen and a diagram is standing in for it,
which specific claims in this PNS have real diagram evidence behind them, and
which are silently unsupported?" Those are different questions with different
correct answers, and collapsing them produces either a falsely low score
against V8 (which was never satisfiable) or a falsely confident PNS.
