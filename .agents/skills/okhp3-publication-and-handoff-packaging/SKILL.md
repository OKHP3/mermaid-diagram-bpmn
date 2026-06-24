---
name: okhp3-publication-and-handoff-packaging
description: Assemble all validated BP-SKILL process artifacts into a publication-ready bundle with a manifest, approvals record, and completeness check. Use this skill when the user is ready to publish or hand off a complete process documentation set; when they ask to package the process docs, create a handoff bundle, publish the process artifacts, or generate a release package. Requires a passing validation report (Band A or B) before bundling. Produces a MANIFEST.yaml, APPROVALS.yaml, and a ZIP-ready directory structure.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/publication-and-handoff-packaging
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: core
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-publication
  standards_refs:
    - "ISO 9001:2015 §7.5 (Documented information)"
    - "ISO 9001:2015 §7.5.3 (Control of documented information)"
    - "BPM CBOK v4 §9 (Process Documentation)"
  produces: "MANIFEST.yaml, APPROVALS.yaml, handoff-manifest.yaml"
  consumes: "pns.yaml, bpmn-beta.mmd, sop.md"
  depends_on: ["process-narrative-authoring", "visual-process-modeling", "sop-and-work-instruction-generation"]
  tags: publication, handoff, bundle, manifest, approvals, release, ISO9001, documented-information
  triggers:
    - package the process docs
    - publish the process
    - handoff bundle
    - release package
    - create the publication bundle
    - finalize process documentation
    - ready to publish
---

## Purpose

Assemble all validated process artifacts into a publication-ready bundle. The bundle includes a machine-readable manifest, an approvals record for ISO 9001 §7.5.3 document control, and a structured directory suitable for archiving, sharing, or committing to a repository.

---

## When to use this skill

- `validation-report.yaml` exists with `ready_for_publication: true` (Band A or B)
- User is ready to hand off the process documentation to stakeholders or a document management system
- User wants to create a release package for audit, certification, or onboarding

## When NOT to use this skill

- Validation report is missing or `ready_for_publication: false` — run `process-validation-and-quality-scoring` first
- Only a subset of artifacts is ready — wait until all required artifacts pass validation

---

## Required Bundle Contents

The following artifacts must be present and validated before bundling:

| Artifact | Source skill | Required |
|---|---|---|
| `pir.yaml` | process-intake-and-scope | **yes** |
| `pns.yaml` | process-narrative-authoring | **yes** |
| `bpmn-beta.mmd` | visual-process-modeling | **yes** |
| `sop.md` | sop-and-work-instruction-generation | **yes** |
| `validation-report.yaml` | process-validation-and-quality-scoring | **yes** |
| `stakeholder-register.yaml` | stakeholder-and-role-mapping | recommended |
| `raci.md` | raci-and-governance-matrix-generation | recommended |
| `sipoc.md` | sipoc-generation | recommended |
| `decision-model.yaml` | decision-model-authoring | if ≥3 gateways |
| `work-instructions.md` | sop-and-work-instruction-generation | recommended |
| `gap-analysis.yaml` | process-gap-and-exception-analysis | if redesign |
| `measures-register.yaml` | process-measures-and-controls-definition | if governance extended |

---

## Bundle Directory Structure

```
process-artifacts/<process-id>/
├── MANIFEST.yaml
├── APPROVALS.yaml
├── pir.yaml
├── pns.yaml
├── pns.md
├── bpmn-beta.mmd
├── sop.md
├── work-instructions.md          (optional)
├── stakeholder-register.yaml     (recommended)
├── raci.md                       (recommended)
├── sipoc.md                      (recommended)
├── validation-report.yaml
├── decision-model.yaml           (if ≥3 gateways)
├── gap-analysis.yaml             (if redesign)
└── measures-register.yaml        (if governance extended)
```

---

## MANIFEST.yaml Schema

- `manifest_version: "0.1"`
- `process_id` — from PIR
- `process_name` — from PNS
- `bundle_date` — ISO 8601 date
- `bundle_version` — `"v1.0"` for initial release
- `quality_band` — from validation report
- `composite_score` — from validation report
- `artifacts[]` — each with `filename`, `source_skill`, `status` (present|missing|optional), `sha256`
- `missing_required[]` — artifacts that are required but absent (must be empty for release)
- `missing_recommended[]` — artifacts that are recommended but absent

---

## APPROVALS.yaml Schema

For ISO 9001 §7.5.3 document control:
- `process_id`, `process_name`, `bundle_version`
- `approvals[]` — each with `role`, `approval_date`, `status` (pending|approved|rejected), `comments`
- `effective_date` — date the bundle becomes active
- `review_date` — scheduled review date
- `distribution[]` — list of roles who should receive this bundle

---

## Bundle Assembly Workflow

`scripts/build-publication-bundle.mjs` executes:

1. Read `validation-report.yaml` — abort if `ready_for_publication: false`
2. Inventory all artifacts in `process-artifacts/<process-id>/`
3. Check required artifacts are present
4. Compute SHA256 hashes for all present files
5. Generate `MANIFEST.yaml` with artifact inventory and quality metadata
6. Generate `APPROVALS.yaml` stub with `status: pending` for each required approver
7. Report `missing_required[]` — must be empty for release
8. Return `{ valid, errors, warnings, manifest_path, approvals_path }`

---

## Publication Gate

Release is blocked if:
- `validation-report.yaml` is missing or `ready_for_publication: false`
- Any `missing_required[]` artifact is present in MANIFEST
- APPROVALS has any entry with `status: rejected`

---

## Handoff Instruction

Once the bundle is assembled and all approvals collected, archive the `process-artifacts/<process-id>/` directory and distribute per `APPROVALS.yaml` `distribution[]`. Tag the version in your document management system.

---

## References

Load on demand:
- `references/publication-checklist.md` — required artifact list, bundle directory structure, MANIFEST schema, and ISO 9001 §7.5.3 document control requirements

## Scripts

- `scripts/build-publication-bundle.mjs` — assembles MANIFEST.yaml + APPROVALS.yaml stub and validates bundle completeness

## Assets

- `assets/fixtures/handoff-manifest-example.yaml` — canonical MANIFEST.yaml for a complete purchase-approval bundle
