---
name: okhp3-sipoc-generation
description: "Generate a SIPOC table from a validated PNS. Use this skill when the user needs a high-level process summary showing Suppliers, Inputs, Process steps, Outputs, and Customers; when they ask to produce a SIPOC, create a process summary table, or generate a one-page process overview. This is a process-level input/output summary, not a stakeholder engagement register — for who is involved and how to engage them, use okhp3-stakeholder-and-role-mapping instead. Derives directly from PNS process_box and activity_sequence. Produces a sipoc.md Markdown table suitable for presentations, kickoff documents, and governance packs."
license: "MIT"
compatibility: "Reviewing and presenting the table needs no special runtime. scripts/generate-sipoc.mjs needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, build the table by hand from PNS process_box and activity_sequence using references/sipoc-design-rules.md and say so in your output rather than presenting the result as machine-derived."
metadata:
  bp_skill_version: "0.3.0"
  status: "core"
  version: "0.2.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-documentation"
  standards_refs: "Six Sigma DMAIC — Define phase; BPM CBOK v4 §4.1 (Process Context); BABOK v3 §10.46 (Value Stream Mapping)"
  produces: "sipoc.md"
  consumes: "pns.yaml"
  depends_on: "okhp3-process-narrative-authoring"
  tags: "SIPOC, process-summary, suppliers, inputs, outputs, customers, Six-Sigma, BPM-CBOK"
  triggers: "generate SIPOC; SIPOC table; process summary table; suppliers and customers; one-page process overview; process context; define phase"
  homepage: "https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/okhp3-sipoc-generation"
  repository: "https://github.com/overkillhill/mermaid-diagram-bpmn"
---

# okhp3-sipoc-generation

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Derive a SIPOC table from a validated PNS and render it as a Markdown document. The SIPOC provides a concise, one-page view of the process for executive summaries, project kickoffs, and governance packs.

---

## When to use this skill

- PNS quality score ≥ 75 and user needs a high-level process summary
- User needs a single-page overview for a presentation or kickoff document
- Starting a Six Sigma or BPM initiative that requires a process context document
- Supplementing a governance pack with a process summary

## When NOT to use this skill

- PNS does not exist or `process_box` is empty: complete `okhp3-process-narrative-authoring` first
- User needs the full process detail: provide the PNS or SOP instead
- User wants a stakeholder engagement register rather than a process-level summary: use `okhp3-stakeholder-and-role-mapping`

---

## SIPOC Derivation Rules

`scripts/generate-sipoc.mjs` derives the SIPOC table from the PNS:

| Column | Source |
|---|---|
| **Suppliers** | Unique `source` values from `process_box.inputs[]` |
| **Inputs** | `process_box.inputs[].name` (deduplicated) |
| **Process** | `activity_sequence.activities[].description` (in sequence order) |
| **Outputs** | `process_box.outputs[].name` (deduplicated) |
| **Customers** | Unique `consumer` values from `process_box.outputs[]` |

---

## Output Format

```markdown
## SIPOC — Purchase Order Approval

| Suppliers | Inputs | Process Steps | Outputs | Customers |
|---|---|---|---|---|
| Requester | Purchase request form | 1. Submit PO Request | Approved PO | Vendor |
| Finance policy | Vendor quote | 2. Review PO | Rejection notice | Requester |
| Vendor | Budget data | 3. Approve or Reject PO | | Finance records |
| | | 4. Issue to Vendor | | |
```

### Formatting rules

- Suppliers and Customers: deduplicated, one per row
- Process column: numbered in sequence order, each step a single imperative statement
- Long step lists: truncate to the top 7–9 core activities for readability; note total step count below table
- Empty cells: leave blank (do not write "N/A")

---

## SIPOC Quality Checks

Before generating, verify:
- `process_box.inputs[]` has at least 1 entry with `name` and `source`
- `process_box.outputs[]` has at least 1 entry with `name` and `consumer`
- `activity_sequence.activities[]` has at least 3 entries

---

## Handoff Instruction

Pass `sipoc.md` to `okhp3-publication-handoff-packaging` for bundle assembly.

The SIPOC is also a useful attachment for `okhp3-elicitation-interviews`: share it with stakeholders as a conversation starter before the workshop.

---

## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/generate-sipoc.mjs` cannot run, build the table by hand using `references/sipoc-design-rules.md`, and state in the output that automated derivation was not run.

## References

Load on demand:
- `references/sipoc-design-rules.md`: derivation rules, column definitions, formatting conventions, and Six Sigma alignment

## Scripts

- `scripts/generate-sipoc.mjs`: derives SIPOC table from PNS process_box and activity_sequence

## Assets

- `assets/fixtures/sipoc-example.yaml`: canonical SIPOC derivation metadata for purchase-approval process

## Evaluation and release status

No `evals/evals.json` exists for this skill yet, and none of the five root-level `evals/` categories cover SIPOC output directly. The only current check is the maintainer-facing `tests/validate-skill.test.mjs` against `assets/fixtures/sipoc-example.yaml`. Evidence status: `not-run` for task quality and skill uplift.

Version 0.2.0 (this pass) added the `compatibility` declaration, the script fallback instruction, and a discovery-time boundary against `okhp3-stakeholder-and-role-mapping` — both skills can answer "who's involved," but this one summarizes the process, not the engagement plan. Classified minor per the versioning table, not patch. No regression suite exists to run before this bump; that limitation is disclosed, not implied away.

---

## About

Part of the **BP-SKILL: Business Process Agent Skill Suite**, published in [overkillhill/mermaid-diagram-bpmn](https://github.com/overkillhill/mermaid-diagram-bpmn). MIT License.
