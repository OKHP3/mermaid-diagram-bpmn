---
name: okhp3-sipoc-generation
description: Generate a SIPOC table from a validated PNS. Use this skill when the user needs a high-level process summary showing Suppliers, Inputs, Process steps, Outputs, and Customers; when they ask to produce a SIPOC, create a process summary table, or generate a one-page process overview. Derives directly from PNS process_box and activity_sequence. Produces a sipoc.md Markdown table suitable for presentations, kickoff documents, and governance packs.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/sipoc-generation
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: core
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-documentation
  standards_refs:
    - "Six Sigma DMAIC — Define phase"
    - "BPM CBOK v4 §4.1 (Process Context)"
    - "BABOK v3 §10.46 (Value Stream Mapping)"
  produces: "sipoc.md"
  consumes: "pns.yaml"
  depends_on: ["process-narrative-authoring"]
  tags: SIPOC, process-summary, suppliers, inputs, outputs, customers, Six-Sigma, BPM-CBOK
  triggers:
    - generate SIPOC
    - SIPOC table
    - process summary table
    - suppliers and customers
    - one-page process overview
    - process context
    - define phase
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

- PNS does not exist or `process_box` is empty — complete `process-narrative-authoring` first
- User needs the full process detail — provide the PNS or SOP instead

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

Pass `sipoc.md` to `publication-and-handoff-packaging` for bundle assembly.

The SIPOC is also a useful attachment for `elicitation-and-interview-facilitation` — share it with stakeholders as a conversation starter before the workshop.

---

## References

Load on demand:
- `references/sipoc-design-rules.md` — derivation rules, column definitions, formatting conventions, and Six Sigma alignment

## Scripts

- `scripts/generate-sipoc.mjs` — derives SIPOC table from PNS process_box and activity_sequence

## Assets

- `assets/fixtures/sipoc-example.yaml` — canonical SIPOC derivation metadata for purchase-approval process
