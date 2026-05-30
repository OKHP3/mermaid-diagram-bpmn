# Publication Checklist

## Pre-Publication Gate

Before running `build-publication-bundle.mjs`, confirm all gates are met:

| Gate | Check | Blocking? |
|---|---|---|
| Validation report exists | `validation-report.yaml` present | yes |
| Publication ready | `validation-report.ready_for_publication: true` | yes |
| Quality band | Band A (90–100) or Band B (75–89) | yes |
| No V1/V2/V3/V5/V6 errors | All error-severity rules pass | yes |
| PIR present | `pir.yaml` present | yes |
| PNS present | `pns.yaml` present | yes |
| BPMN diagram present | `bpmn-beta.mmd` present | yes |
| SOP present | `sop.md` present | yes |

## Required Artifacts

| Artifact | Source skill |
|---|---|
| `pir.yaml` | process-intake-and-scope |
| `pns.yaml` | process-narrative-authoring |
| `bpmn-beta.mmd` | visual-process-modeling |
| `sop.md` | sop-and-work-instruction-generation |
| `validation-report.yaml` | process-validation-and-quality-scoring |

## Recommended Artifacts

| Artifact | Source skill |
|---|---|
| `stakeholder-register.yaml` | stakeholder-and-role-mapping |
| `raci.md` | raci-and-governance-matrix-generation |
| `sipoc.md` | sipoc-generation |
| `work-instructions.md` | sop-and-work-instruction-generation |
| `pns.md` | process-narrative-authoring |

## Conditional Artifacts

| Artifact | Condition |
|---|---|
| `decision-model.yaml` + `dmn-table.md` | ≥3 gateway decision points in BPMN diagram |
| `gap-analysis.yaml` + `exception-catalog.yaml` | Process was redesigned from an as-is baseline |
| `measures-register.yaml` + `controls-register.yaml` | Governance extension was applied |

## ISO 9001 §7.5.3 Document Control Requirements

For a publication bundle to satisfy ISO 9001 §7.5.3 (Control of documented information):

1. **Identity** — document ID, version, and date on all artifacts
2. **Format** — YAML for machine-readable; Markdown for human-readable; both for all primary artifacts
3. **Review and approval** — APPROVALS.yaml with at least one Accountable role approval
4. **Availability** — stored in an accessible, retrievable location
5. **Protection** — access controls appropriate to the sensitivity of the content
6. **Distribution** — distribution list in APPROVALS.yaml `distribution[]`
7. **Retention** — schedule defined in document management policy

## MANIFEST.yaml Requirements

The MANIFEST must be the first file in the bundle directory. It must contain:
- SHA256 hash for every artifact
- Empty `missing_required[]` array (no required artifacts absent)
- `quality_band` and `composite_score` from validation report
- `bundle_date` in ISO 8601 format

## APPROVALS.yaml Requirements

Minimum content for a valid APPROVALS.yaml:
- At least one `approvals[]` entry for the process owner role
- All entries have `status: approved` before `effective_date` is set
- `review_date` must be set (recommend 12 months from `effective_date`)
- `distribution[]` must include at least the process owner and all Accountable roles from the RACI
