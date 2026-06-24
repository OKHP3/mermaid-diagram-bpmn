---
name: okhp3-sop-and-work-instruction-generation
description: Generate Standard Operating Procedures (SOPs) and work instructions from a validated PNS. Use this skill when the user needs to produce a human-readable procedure document from a process narrative; when they ask to write an SOP, create work instructions, generate a procedure, or produce an ISO 9001-compliant process document. The generated SOP follows ISO 9001 §4.4.2 documented information requirements. Produces sop.md and optional work-instructions.md for each role.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/sop-and-work-instruction-generation
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: core
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-documentation
  standards_refs:
    - "ISO 9001:2015 §4.4.2 (Documented information)"
    - "ISO 9001:2015 §7.5 (Documented information)"
    - "BABOK v3 §10.45 (Use Cases and Scenarios)"
    - "BPM CBOK v4 §9 (Process Documentation)"
  produces: "sop.md, work-instructions.md"
  consumes: "pns.yaml"
  depends_on: ["process-narrative-authoring"]
  tags: SOP, work-instructions, documented-information, ISO9001, procedure, process-document, work-instruction
  triggers:
    - write an SOP
    - create work instructions
    - generate a procedure
    - SOP document
    - standard operating procedure
    - documented procedure
    - work instruction
    - ISO 9001 document
---

## Purpose

Generate a Standard Operating Procedure (SOP) and role-specific work instructions from a validated PNS. The SOP is the human-readable manifestation of the process — designed for practitioners who execute the process, not analysts who model it.

---

## When to use this skill

- PNS quality score ≥ 75 and `ready_for_publication: true`
- User needs a document that practitioners can follow step-by-step
- Organisation requires ISO 9001 §4.4.2 documented information
- User wants role-specific work instructions for each lane in the RACI

## When NOT to use this skill

- PNS does not exist or is below quality threshold — complete `process-narrative-authoring` first
- User only wants the BPMN diagram — use `visual-process-modeling` directly
- Do not generate SOPs from incomplete or unvalidated process descriptions

---

## SOP Structure (ISO 9001 §7.5)

### 1. Header

- Document ID, version, date, owner role
- Process name and scope
- Effective date and review date
- Approved by (role, not person name)

### 2. Purpose and Scope

One paragraph each:
- **Purpose** — what this SOP achieves and why it exists (from `pns.process_box.trigger` and `babok_core_concepts.need`)
- **Scope** — what is included and explicitly excluded (from `pns.process_box` inputs/outputs and `scope-statement.md`)

### 3. Definitions

Terms and acronyms used in the SOP. Include all role names, system names, and business rule terms.

### 4. Responsibilities

RACI summary table: one row per activity, columns R/A/C/I. Derived from `pns.roles_and_raci.raci_matrix[]`.

### 5. Procedure Steps

Sequential numbered steps derived from `pns.activity_sequence.activities[]`. Each step:
- **Step number** and **title** (from `activity.description`)
- **Actor** (from `activity.actor_role_id`)
- **Action** — one imperative statement per IEEE 29148
- **Input** — what the actor needs before starting
- **Output** — what the actor produces
- **System** — which system or tool is used
- **Decision note** (if activity has a matching `decision_points[]` entry)
- **Exception note** (if activity has a matching `exception_paths[]` entry)

### 6. Exception Handling

Table of exceptions: `exception_id`, trigger condition, handling procedure, escalation path, owner role. Derived from `pns.exception_paths[]`.

### 7. Business Rules

List of governing rules. Each: rule ID, description, source citation. Derived from `pns.business_rules[]`.

### 8. Related Documents

References to PIR, PNS, BPMN diagram, RACI matrix, SIPOC table.

### 9. Revision History

Table of document changes. From `pns.revision_history[]`.

---

## Work Instructions (Role-Specific)

When `work-instructions.md` is requested, generate one section per role:
- Header: role name, activities they own
- Numbered steps scoped to that role only
- Decision points where their judgement is required
- Exception paths they own

---

## Generation Workflow

`scripts/generate-sop.mjs` reads `pns.yaml` and:
1. Extracts header metadata from PNS frontmatter
2. Generates Purpose from `babok_core_concepts.need` + `process_box.trigger`
3. Generates Scope from `process_box.inputs[]` + `process_box.outputs[]`
4. Builds definitions from all `role_name`, `system_name`, and `business_rules[].description` terms
5. Renders RACI table from `raci_matrix[]`
6. Renders procedure steps from `activity_sequence[]` with decision and exception notes
7. Renders exception table from `exception_paths[]`
8. Renders business rules list from `business_rules[]`
9. Generates revision history from `revision_history[]`

---

## Handoff Instruction

Pass `sop.md` and `work-instructions.md` to `publication-and-handoff-packaging` for bundle assembly.

---

## References

Load on demand:
- `references/sop-structure-rules.md` — ISO 9001 §4.4.2 and §7.5 requirements, SOP heading conventions, and work instruction generation rules

## Scripts

- `scripts/generate-sop.mjs` — generates sop.md and work-instructions.md from PNS YAML

## Assets

- `assets/fixtures/sop-example.yaml` — canonical SOP metadata fixture for purchase-approval process
