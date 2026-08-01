---
name: okhp3-raci-governance-matrix
description: "Generate and validate a RACI matrix and governance responsibility document from a validated PNS. Use this skill when the user needs a standalone RACI chart, a governance matrix, or a responsibility assignment document for a process; when they ask to produce a RACI table, document who is responsible for what, or generate a governance framework for a process. Do not use it when the RACI table embedded in the SOP's Responsibilities section is sufficient — use okhp3-sop-work-instructions directly for that. Derives directly from PNS roles_and_raci and activity_sequence sections. Produces raci.md and governance-matrix.md."
license: "MIT"
compatibility: "Reviewing and presenting the matrix needs no special runtime. scripts/generate-raci.mjs needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, build the RACI and governance tables by hand from PNS roles_and_raci and business_rules using references/raci-design-rules.md and say so in your output rather than presenting the result as machine-derived."
metadata:
  bp_skill_version: "0.3.0"
  status: "core"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-governance"
  standards_refs: "PMI PMBOK v7 §2.2 (Stakeholder Performance Domain); BABOK v3 §3.2 (Stakeholder Analysis); ISO 9001:2015 §5.3 (Organizational roles, responsibilities and authorities)"
  produces: "raci.md, governance-matrix.md"
  consumes: "pns.yaml"
  depends_on: "okhp3-process-narrative-authoring"
  tags: "RACI, governance-matrix, responsibility-assignment, roles, accountability, PMI, ISO9001"
  triggers: "generate RACI matrix; RACI table; responsibility matrix; governance matrix; who is responsible; accountability matrix; roles and responsibilities"
  homepage: "https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/okhp3-raci-governance-matrix"
  repository: "https://github.com/overkillhill/mermaid-diagram-bpmn"
---

# okhp3-raci-governance-matrix

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Generate a standalone RACI matrix and governance responsibility document from a validated PNS. The RACI table makes role assignments explicit and auditable, supporting both operational clarity and ISO 9001 §5.3 accountability requirements.

---

## When to use this skill

- PNS quality score ≥ 75 and user needs a standalone RACI document
- User needs to communicate role assignments to a wider stakeholder audience
- Preparing governance documentation for audit or onboarding
- Supplementing the SOP with a responsibility reference table

## When NOT to use this skill

- PNS does not exist or `roles_and_raci` is empty: complete `okhp3-process-narrative-authoring` first
- RACI is only needed embedded in the SOP: use `okhp3-sop-work-instructions` instead

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
- **Escalation path**: who a role escalates to when a decision is beyond their authority
- **Delegation rule**: conditions under which a role can delegate their responsibility
- **Absence cover**: backup role when primary is unavailable
- **Authority limit**: any financial or operational ceiling on the role's authority

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

Pass `raci.md` and `governance-matrix.md` to `okhp3-publication-handoff-packaging` for bundle assembly.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/generate-raci.mjs` cannot run, build both tables by hand using `references/raci-design-rules.md`, and state in the output that automated generation was not run.

## References

Load on demand:
- `references/raci-design-rules.md`: RACI cell definitions, validation rules, governance matrix extensions, and escalation path conventions

## Scripts

- `scripts/generate-raci.mjs`: builds RACI matrix and governance matrix from PNS

## Assets

- `assets/fixtures/raci-example.yaml`: canonical RACI fixture for purchase-approval process

## Evaluation and release status

No `evals/evals.json` exists for this skill yet, and none of the five root-level `evals/` categories cover standalone RACI output directly (the closest, `role-consistency`, targets the PNS's own `validate-pns.mjs`, not this skill's `generate-raci.mjs` — see `okhp3-process-narrative-authoring` for that category's separate stale-path issue). The only current check is the maintainer-facing `tests/validate-skill.test.mjs` against `assets/fixtures/raci-example.yaml`. Evidence status: `not-run` for task quality and skill uplift.

Version 0.2.0 (this pass) added the `compatibility` declaration, the script fallback instruction, and a discovery-time boundary against the RACI table already embedded in `okhp3-sop-work-instructions` — the pair's trigger terms otherwise overlap ("who is responsible for this step"). Classified minor per the versioning table, not patch. No regression suite exists to run before this bump; that limitation is disclosed, not implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn). MIT License.
