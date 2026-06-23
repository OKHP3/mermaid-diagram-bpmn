# KPI Design Rules and Control Type Reference

## KPI Design Rules

### Required fields (V5 compliant)

Every KPI must have:
- `formula` — how the metric is calculated (non-empty string)
- `data_source` — where the data comes from (non-empty string)

### Formula construction

A formula is a plain-English calculation statement, not a spreadsheet formula.

**Good examples:**
- `"Total elapsed time from PO submission timestamp to approval timestamp, averaged across all POs in the period"`
- `"Count of POs returned with errors / total POs submitted × 100"`
- `"Sum of PO value auto-approved / total PO value submitted × 100"`

**Bad examples:**
- `"TBD"` — not a formula (use `target: TBD` for unknown targets, but formula must be defined)
- `"Time taken"` — too vague; specifies no calculation
- `"=AVERAGE(B2:B100)"` — spreadsheet syntax; translate to plain English

### Data source requirements

Specify the system or record that provides the raw data, not the person who collects it.

**Good examples:**
- `"ERP purchase order module — timestamp fields on submission and approval events"`
- `"Finance team's monthly exception log — row count of rejected POs"`

**Bad examples:**
- `"Finance team"` — this is a person/role, not a data source
- `"Manual tracking"` — imprecise; specify what is tracked and where

### Target setting

If the target is not yet known, use `target: "TBD"` and create an open question to resolve it.

Do not invent targets — record as `TBD` with a note on who should define the target and by when.

---

## COSO Control Type Definitions

### Preventive controls

Stop a defect or error from occurring in the first place.

Examples: dual-approval requirement, system validation on input fields, mandatory training before access granted.

### Detective controls

Identify a defect or error after it has occurred.

Examples: monthly reconciliation, exception reporting, audit trail review, automated alert on threshold breach.

### Corrective controls

Fix a defect or error once detected.

Examples: rework procedure, correction notice, re-approval workflow, escalation to a higher authority.

### Directive controls

Guide behaviour through policy, procedure, or instruction.

Examples: written SOP, training programme, policy statement, code of conduct.

## Control Evidence Requirements

Every control must specify `evidence_required` — what demonstrates the control operated:

| Control type | Evidence examples |
|---|---|
| Preventive | System log showing validation triggered; approval record |
| Detective | Exception report with timestamps; reconciliation sign-off |
| Corrective | Correction record; re-approval sign-off; incident ticket closed |
| Directive | Training completion record; policy acknowledgement signature |
