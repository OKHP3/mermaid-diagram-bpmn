# Stakeholder Identification Rules

Rules for classifying actors from a PIR into a Stakeholder Register.

---

## Actor Type Definitions

| Type | Definition | Example |
|---|---|---|
| `initiator` | The role that triggers the process. There must be at least one. | "Requester" who submits a purchase request |
| `performer` | A role that executes one or more steps. The primary worker in the process. | "Accounts Payable Clerk" who processes the PO |
| `approver` | A role with formal decision authority over a step or the process outcome. | "Finance Manager" who approves the spend |
| `reviewer` | A role that reviews output but does not have final approval authority. | "Team Lead" who spot-checks submissions |
| `notified` | A role that receives information about the process outcome but takes no action. | "Requester" notified of rejection |
| `system` | An automated system or tool that performs steps without human intervention. | "ERP" that generates the PO number |

**Note:** A single role can have multiple types across different steps. For example, a Manager may be `approver` at step 4 and `notified` at step 7. Record the primary type in the `actors` array. Multiple types can be noted in `interest`.

---

## Interest Classification

Interest describes what the stakeholder cares about in the process outcome:

| Interest category | Description |
|---|---|
| `outcome quality` | Cares about the accuracy and completeness of the process output |
| `speed` | Cares about how fast the process completes |
| `compliance` | Cares about the process following rules, policies, or regulations |
| `cost control` | Cares about keeping process costs within budget |
| `visibility` | Cares about being informed of status and decisions |
| `risk reduction` | Cares about minimizing errors, fraud, or policy violations |

Record the most dominant interest as a short phrase in the `interest` field.

---

## Influence Classification

Influence describes how much power a stakeholder has to change the process:

| Level | Definition |
|---|---|
| `high` | Can change the process design, override steps, or veto outcomes |
| `medium` | Shapes specific steps or criteria; cannot unilaterally change the whole process |
| `low` | Has no authority over process design; follows the process as specified |

---

## Stakeholder Register Derivation Rules

`generate-stakeholder-register.mjs` applies these rules to derive the register from a PIR:

1. Every entry in `pir.actors` becomes a stakeholder register entry
2. `role_id` maps to `stakeholder_id`
3. `role_name` maps to `name`
4. `type` maps to `primary_role`
5. `interest` maps to `interest` (default to `"outcome quality"` if absent)
6. `influence` maps to `influence` (default to `"medium"` if absent)
7. `department` maps to `department` (default to `"Unspecified"` if absent)
8. Add derived field `engagement_strategy` based on role type:
   - `approver` → `"Consult — involve in decision gates"`
   - `initiator` + `performer` → `"Collaborate — include in process design sessions"`
   - `reviewer` → `"Consult — include in review cycles"`
   - `notified` → `"Inform — keep updated on outcomes"`
   - `system` → `"Monitor — track integration points and error conditions"`

---

## Minimum Register Requirements

A stakeholder register derived from a valid PIR must include:

- At least one `initiator`
- At least one `approver` or `performer`
- Every actor from `pir.actors` represented
- No actors invented that were not in the source PIR

---

## Register Output Schema

```yaml
stakeholder_register_version: "0.1"
process_id: ""
generated_from_pir: ""
generated_date: ""

stakeholders:
  - stakeholder_id: ""
    name: ""
    department: ""
    primary_role: ""        # initiator | performer | approver | reviewer | notified | system
    interest: ""
    influence: ""           # high | medium | low
    engagement_strategy: "" # derived from primary_role
    notes: ""
```
