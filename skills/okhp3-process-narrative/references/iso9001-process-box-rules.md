# ISO 9001 §4.4.1 Process Box Rules

ISO 9001:2015 §4.4.1 requires that an organization determine its processes and apply a "turtle diagram"
(or process box) approach. This reference documents how the `sections.process_box` field maps to
that clause.

---

## §4.4.1 Requirement → PNS Field Mapping

| ISO 9001 §4.4.1 Sub-requirement | PNS `process_box` Field | Notes |
|---|---|---|
| (a) Inputs and outputs required | `inputs` / `outputs` | Each with name and source/consumer |
| (b) Sequence and interaction of processes | `sections.activity_sequence` | The ordered activity list fulfills this |
| (c) Criteria and methods | `criteria` | Completion criteria + success metrics |
| (d) Resources needed | `resources` | Systems, tools, people, infrastructure |
| (e) Responsibilities and authorities | `responsibilities` | Owner role + performer roles |
| (f) Risks and opportunities | `risks` | Per ISO 31000 — threats and mitigations |
| (g) Evaluate and improvement opportunities | `sections.kpis` + `sections.open_questions` | KPIs drive measurement; open questions flag gaps |
| (h) Improvement actions | `sections.revision_history` | Tracks what changed and why |

---

## Trigger (extends §4.4.1)

The `trigger` field (not explicitly in ISO 9001 text but required by BABOK §7.1 event analysis)
documents what initiates the process. Without a clear trigger, the process has no defined start state.

**Well-formed trigger examples:**
- "Customer submits service request via portal"
- "End-of-month payroll cycle date is reached"
- "New hire completes onboarding form in HR system"

**Poorly formed triggers (avoid):**
- "Process is needed" — too vague, not an event
- "Manager decides to run the process" — not observable or auditable
- "When things go wrong" — not specific

---

## Input / Output Quality Rules

**Inputs must have a named source.** Without a source, the input is not traceable.
- Good: `{ name: "Purchase request form", source: "Employee submitting via Procurement Portal" }`
- Bad: `{ name: "Form", source: "" }`

**Outputs must have a named consumer.** Without a consumer, the output has no purpose.
- Good: `{ name: "Approved purchase order", consumer: "Vendor onboarding team" }`
- Bad: `{ name: "Purchase order", consumer: "" }`

---

## Process Box vs. Activity Sequence

The process box (`sections.process_box`) documents the process **as a system** — what enters, what exits, and what governs it.

The activity sequence (`sections.activity_sequence`) documents **how** the process is performed — the ordered steps.

Both are required. Neither replaces the other.

---

## Common Gaps (from quality scoring)

| Gap | Score Impact | Fix |
|---|---|---|
| Empty `trigger` | −3 pts from process_box section | Document the observable initiating event |
| Inputs have empty `source` | −2 pts | Trace each input to its provider |
| Outputs have empty `consumer` | −2 pts | Identify who uses each output |
| Empty `risks` | −3 pts | Document at least one process risk |
| Empty `responsibilities` | −3 pts | Name the process owner role |
| `criteria` vague (< 20 chars) | warning | Add measurable completion criteria |

---

## ISO 9001 §4.4.2 — Documented Information

When `status` is `approved` or `published`, the PNS constitutes "documented information maintained" per §4.4.2.
The `version`, `effective_date`, `review_cycle`, and `retention_period` fields support this requirement.

These fields are not validated as errors but their absence lowers the quality score.
