# Change Strategy Framework

## Change Type Taxonomy

| Change type | Description | Example |
|---|---|---|
| `add` | A new step, role, or control is introduced | Add a manager approval step |
| `remove` | An existing step, role, or control is eliminated | Remove a redundant sign-off |
| `modify` | An existing step, role, or control is changed | Change approval threshold from $1k to $5k |
| `automate` | A manual step is replaced by a system action | Auto-route PO under $1k to auto-approve |
| `transfer` | Responsibility moves from one role to another | Finance manager approval → Director for >$10k |

## Effort and Risk Classification

| Value | Effort description | Risk description |
|---|---|---|
| `low` | Can be implemented without system changes or retraining | Minimal stakeholder impact, reversible |
| `medium` | Requires some system configuration or limited retraining | Moderate impact; rollback requires effort |
| `high` | Requires system development, policy change, or significant retraining | High impact; difficult to reverse |

## ADKAR Alignment

Each change item should be assessed against the ADKAR model:

| Element | Question |
|---|---|
| **Awareness** | Do stakeholders know why this change is happening? |
| **Desire** | Do stakeholders want to support the change? |
| **Knowledge** | Do stakeholders know how to make the change? |
| **Ability** | Do stakeholders have the skills and time? |
| **Reinforcement** | What will sustain the change after go-live? |

Document the weakest ADKAR element per change item as the primary change risk.

## Kotter 8-Step Alignment

For high-effort changes, structure the change strategy document using Kotter's 8 steps:

1. Create urgency — cite the gap severity and business impact
2. Build a guiding coalition — identify sponsors and change champions
3. Form a strategic vision — describe the future state in one paragraph
4. Enlist a volunteer army — identify who will pilot the changes
5. Enable action by removing barriers — identify and remove blockers
6. Generate short-term wins — identify quick wins that demonstrate progress
7. Sustain acceleration — plan for ongoing improvement
8. Institute change — embed the change in role descriptions and process controls

## Scope Firewall

Before authoring the future state:
- All proprietary constraints must be provided by the user — do not infer from industry knowledge
- All assumptions must be flagged with `confidence: assumed`
- All external system names must be provided by the user — do not assume specific vendor products
- Never include employer-identifying information without explicit user authorisation

## Dependency Rules

Change items are sequenced by dependency:
- `remove` changes must not depend on items not yet `add`ed
- `automate` changes depend on the underlying `modify` changes to roles being complete
- `transfer` changes depend on the receiving role being defined in the future-state roster
