---
name: okhp3-stakeholder-and-role-mapping
description: "Derive and validate a structured stakeholder register from a completed Process Intake Record. Use this skill when you have a PIR from okhp3-process-intake-and-scope and need to identify all affected parties, classify their roles, assess influence and interest, and define engagement strategies. Use when the user asks who is involved in a process, needs a RACI-ready role list, wants to understand stakeholder impact, or needs an engagement plan before narrative authoring begins. Produces a stakeholder engagement register, not a one-page process summary — for that, use okhp3-sipoc-generation instead."
license: "MIT"
compatibility: "Interpreting and presenting the register needs no special runtime. scripts/generate-stakeholder-register.mjs needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, derive the register by hand from pir.actors[] using references/stakeholder-identification-rules.md and say so in your output rather than presenting the result as machine-derived."
metadata:
  bp_skill_version: "0.3.0"
  status: "core"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-analysis"
  standards_refs: "BABOK v3 §3.2 (Stakeholder Analysis); BABOK v3 §10.41 (Stakeholder List, Map, or Personas); PMI PMBOK v7 §2.2 (Stakeholder Performance Domain); BPM CBOK v4 §4 (Process Modelling)"
  produces: "stakeholder-register.yaml"
  consumes: "pir.yaml"
  depends_on: "okhp3-process-intake-and-scope"
  tags: "stakeholder-analysis, role-mapping, stakeholder-register, BABOK, engagement-strategy, RACI, business-analysis"
  triggers: "who is involved in this process; stakeholder register; map the roles; identify stakeholders; engagement strategy; who needs to be consulted; RACI roles"
  homepage: "https://github.com/OKHP3/mermaid-diagram-bpmn/tree/main/skills/okhp3-stakeholder-and-role-mapping"
  repository: "https://github.com/OKHP3/mermaid-diagram-bpmn"
---

# okhp3-stakeholder-and-role-mapping

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Derive a structured stakeholder register from a validated PIR. The register maps every actor to a stakeholder record with role classification, interest, influence, and engagement strategy, providing the role foundation for RACI matrices, governance documents, and process narrative authoring.

---

## When to use this skill

- PIR has `ready_for_narrative: true` and you need a stakeholder register before writing the PNS
- User asks who should be consulted, informed, or responsible for a process
- You need engagement strategies for each role before drafting governance content

## When NOT to use this skill

- PIR has not been validated (score < 70): return to `okhp3-process-intake-and-scope`
- User only needs a quick list of names without structured classification: ask if a full register is needed
- User wants a one-page process summary rather than an engagement register: use `okhp3-sipoc-generation`
- Do not invent stakeholders not present in the PIR actors array

---

## Derivation Rules

`scripts/generate-stakeholder-register.mjs` derives the register from `pir.actors[]`:

| Actor type | Engagement strategy |
|---|---|
| `initiator` | Collaborate |
| `performer` | Collaborate |
| `approver` | Consult |
| `reviewer` | Consult |
| `notified` | Inform |
| `system` | Monitor |

Each register entry contains:
- `stakeholder_id`: from `actors[].role_id`
- `name`: from `actors[].role_name`
- `department`: from `actors[].department` (defaults to `"Unspecified"`)
- `primary_role`: from `actors[].type`
- `interest`: from `actors[].interest` (defaults to `"outcome quality"`)
- `influence`: from `actors[].influence` (defaults to `"medium"`)
- `engagement_strategy`: derived per table above

---

## Influence-Interest Grid

After derivation, plot each stakeholder on the 2×2 grid:

| | Low Interest | High Interest |
|---|---|---|
| **High Influence** | Keep Satisfied | Manage Closely |
| **Low Influence** | Monitor | Keep Informed |

Document the quadrant in `stakeholder_register.grid_position` for each entry.

---

## Validation

Every register must pass:
- At least one `Collaborate` entry (initiator or performer present)
- At least one `Consult` or `Manage Closely` entry
- No stakeholder with empty `stakeholder_id`
- `influence` values are one of: `high | medium | low`

---

## Handoff Instruction

Pass `pir.yaml` and the generated `stakeholder-register.yaml` together to `okhp3-process-narrative-authoring`. The narrative skill maps `stakeholder_id` values to RACI role assignments.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/generate-stakeholder-register.mjs` cannot run, derive the register by hand using `references/stakeholder-identification-rules.md`, and state in the output that automated derivation was not run.

## References

Load on demand:
- `references/stakeholder-identification-rules.md`: actor type definitions, engagement strategies, and grid placement rules

## Scripts

- `scripts/generate-stakeholder-register.mjs`: derives register from PIR actors array

## Assets

- `assets/fixtures/stakeholder-register-example.yaml`: canonical register derived from purchase-approval PIR

## Evaluation and release status

No `evals/evals.json` exists for this skill yet, and none of the five root-level `evals/` categories cover stakeholder-register output directly. The only current check is the maintainer-facing `tests/validate-skill.test.mjs` against `assets/fixtures/stakeholder-register-example.yaml`. Evidence status: `not-run` for task quality and skill uplift.

Version 0.2.0 (this pass) added the `compatibility` declaration, the script fallback instruction, and a discovery-time boundary against `okhp3-sipoc-generation` (reciprocal to that skill's own boundary against this one). Classified minor per the versioning table, not patch. No regression suite exists to run before this bump; that limitation is disclosed, not implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn). MIT License.
