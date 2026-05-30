# As-Is Process Capture Rules

## Step ID Conventions

All steps in an as-is process receive stable identifiers assigned by `scripts/assign-step-ids.mjs`.

| Prefix | Element type | Example |
|---|---|---|
| `act-` | Activity (task) | `act-001`, `act-002` |
| `gw-` | Gateway (decision) | `gw-001`, `gw-002` |
| `evt-` | Event (start/end/intermediate) | `evt-001`, `evt-002` |

**Rules:**
- IDs are zero-padded to 3 digits within each prefix
- IDs are assigned in sequence order as steps appear in the source
- Once assigned, IDs do not change even if steps are reordered or removed
- Removed steps leave gaps in the sequence (do not renumber)

## Capture Quality Taxonomy

| Value | Meaning | Action required |
|---|---|---|
| `high` | Step is well understood, consistently executed, and documented | None |
| `medium` | Step is generally understood but has inconsistencies or informal variations | Note the variations |
| `low` | Step is poorly understood, person-dependent, or never formally documented | Flag as gap for gap-analysis |

## Baseline Metadata Rules

| Field | Requirement |
|---|---|
| `captured_date` | ISO 8601 date of the capture session |
| `capture_method` | One of: `interview \| document-review \| observation \| workshop` |
| `process_version` | Current version if known; default `"1.0-baseline"` |
| `baseline_status` | `draft` until reviewed; `reviewed` after SME confirmation; `approved` after sign-off |

## Key-Person Dependency Detection

Flag a step as key-person dependent when:
- A single named individual is the only performer of a step across all instances
- The step description mentions a person's name rather than a role
- Notes contain phrases like "only [Name] knows how to" or "ask [Name] for this"

Record in `identified_gaps[]` with `gap_type: execution` and `severity: major`.

## Inclusion Rules

Include in the as-is record:
- All steps currently performed, even informal or undocumented ones
- All decision points that affect routing, even if informal
- All system interactions, even manual workarounds (e.g. "copy-paste from email to spreadsheet")
- All waiting or pause points

Do not include:
- Proposed future steps or improvements
- Steps from related but distinct processes
- Steps the user "thinks should happen" but cannot confirm currently do
