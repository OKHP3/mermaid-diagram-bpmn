# SIPOC Design Rules

## Column Definitions

| Column | Definition | Source in PNS |
|---|---|---|
| **S — Suppliers** | Roles, departments, or systems that provide inputs to the process | Unique `source` values from `process_box.inputs[]` |
| **I — Inputs** | What the process receives from suppliers to begin work | `process_box.inputs[].name` (deduplicated) |
| **P — Process** | The high-level process steps (not detailed procedure) | `activity_sequence.activities[].description` |
| **O — Outputs** | What the process delivers to customers upon completion | `process_box.outputs[].name` (deduplicated) |
| **C — Customers** | Roles, departments, or systems that consume the process outputs | Unique `consumer` values from `process_box.outputs[]` |

## Six Sigma DMAIC Alignment

The SIPOC is a Define-phase tool. Its primary purpose is to scope the process clearly before measurement and analysis begin. It answers:

- Where does the process begin and end? (scope)
- Who provides what to start the process? (S and I columns)
- What does the process produce? (O column)
- Who receives the output? (C column)

## Formatting Rules

1. **Process steps** — show the top 5–9 core activities only; omit sub-steps and decision notes
2. **Suppliers and Customers** — one per row; deduplicate; do not list the same entity twice
3. **Long lists** — for processes with many inputs, group related inputs under a common category label
4. **Empty cells** — leave blank; do not write "N/A" or "—"
5. **Row alignment** — the P (Process) column typically has more rows than S/I/O/C columns; align to top

## Quality Checks Before Generation

- `process_box.inputs[]` has at least 1 entry with non-empty `name` and `source`
- `process_box.outputs[]` has at least 1 entry with non-empty `name` and `consumer`
- `activity_sequence.activities[]` has at least 3 entries

If any check fails, return an error and request the user to complete the PNS before generating SIPOC.

## Common Uses

- **Executive summary** — one-page process overview for leadership
- **Project kickoff** — shared context document for all project participants
- **Scope boundary** — explicit statement of what is in and out of scope
- **Handoff context** — sent to next-skill consumers alongside the PNS
- **Audit evidence** — demonstrates process inputs and outputs are documented per ISO 9001 §4.4
