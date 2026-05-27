---
name: raci-and-governance-matrix-generation
description: Generate and validate a RACI matrix and governance responsibility document from a validated PNS. Use this skill when the user needs a standalone RACI chart, a governance matrix, or a responsibility assignment document for a process; when they ask to produce a RACI table, document who is responsible for what, or generate a governance framework for a process. Derives directly from PNS roles_and_raci and activity_sequence sections. Produces raci.md and governance-matrix.md.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/raci-and-governance-matrix-generation
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: core
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-governance
  standards_refs:
    - "PMI PMBOK v7 §2.2 (Stakeholder Performance Domain)"
    - "BABOK v3 §3.2 (Stakeholder Analysis)"
    - "ISO 9001:2015 §5.3 (Organizational roles, responsibilities and authorities)"
  produces: "raci.md, governance-matrix.md"
  consumes: "pns.yaml"
  depends_on: ["process-narrative-authoring"]
  tags: RACI, governance-matrix, responsibility-assignment, roles, accountability, PMI, ISO9001
  triggers:
    - generate RACI matrix
    - RACI table
    - responsibility matrix
    - governance matrix
    - who is responsible
    - accountability matrix
    - roles and responsibilities
---

## Purpose

Generate a standalone RACI matrix and governance responsibility document from a validated PNS. The RACI table makes role assignments explicit and auditable — supporting both operational clarity and ISO 9001 §5.3 accountability requirements.

---

## When to use this skill

- PNS quality score ≥ 75 and user needs a standalone RACI document
- User needs to communicate role assignments to a wider stakeholder audience
- Preparing governance documentation for audit or onboarding
- Supplementing the SOP with a responsibility reference table

## When NOT to use this skill

- PNS does not exist or `roles_and_raci` is empty — complete `process-narrative-authoring` first
- RACI is only needed embedded in the SOP — use `sop-and-work-instruction-generation` instead

---

## RACI Matrix Generation

`scripts/generate-raci.mjs` builds the matrix from `pns.roles_and_raci` and `pns.activity_sequence`:

- Iterates activities in sequence order
- Joins RACI entries by `activity_id`
- Returns `{ roles[], matrix[{ activity_id, description, R[], A, C[], I[] }] }`
- Activities with no RACI entry appear with empty assignments (and a warning)

### Output format

```markdown
## RACI Matrix — Purchase Order Approval

| Activity | Requester | Finance Manager | Procurement | Director |
|---|---|---|---|---|
| Submit PO Request | **R** | I | — | — |
| Review PO | C | **R** | C | — |
| Approve PO | I | — | — | **R/A** |
```

---

## Governance Matrix

The governance matrix extends the RACI with:
- **Escalation path** — who a role escalates to when a decision is beyond their authority
- **Delegation rule** — conditions under which a role can delegate their responsibility
- **Absence cover** — backup role when primary is unavailable
- **Authority limit** — any financial or operational ceiling on the role's authority

Derived from `pns.business_rules[]` and `pns.exception_paths[]`.

---

## Validation Rules

Every RACI matrix must satisfy:
- Each activity has exactly one **A** (Accountable)
- Each activity has at least one **R** (Responsible)
- No role appears as both R and A unless they are the process owner
- All role IDs match entries in `roles_and_raci.roles[]`

---

## Handoff Instruction

Pass `raci.md` and `governance-matrix.md` to `publication-and-handoff-packaging` for bundle assembly.

---

## References

Load on demand:
- `references/raci-design-rules.md` — RACI cell definitions, validation rules, governance matrix extensions, and escalation path conventions

## Scripts

- `scripts/generate-raci.mjs` — builds RACI matrix and governance matrix from PNS

## Assets

- `assets/fixtures/raci-example.yaml` — canonical RACI fixture for purchase-approval process
