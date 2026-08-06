# Extraction Depth Profiles

Use this reference to select the velocity, coverage, and granularity of a thread
extraction. These dimensions vary inversely: greater extraction depth normally
requires more processing time. Accuracy, evidence discipline, privacy, and
provenance remain constant at every tier.

## Trigger sets and canonical profiles

Any word in a row selects that row's canonical mode.

| Tier | Canonical mode | Coverage alias | Action alias | Velocity | Granularity | Objective |
|---|---|---|---|---|---|---|
| 1 | `rapid` | `essential` | `scan` | Highest | Lowest | Create a compact continuity brief containing the minimum durable context needed to resume safely. |
| 2 | `balanced` | `substantial` | `distill` | Moderate | Moderate | Preserve most high-value context with selective detail and documented compression. |
| 3 | `comprehensive` | `exhaustive` | `catalog` | Lowest | Highest | Perform a fine-grained semantic migration with an individual disposition for every supplied turn and element. |

`balanced` is the default. It matches the usual purpose of thread extraction:
move most valuable context while accepting deliberate, documented loss.

## Optional precision controls

Keep the three profiles stable. Refine a run with these optional controls rather
than inventing more tiers:

- `focus`: topics or outcomes that deserve extra attention;
- `must_preserve`: decisions, prompts, code, quotes, files, or other material
  that may not be compressed away; and
- `safe_to_exclude`: material the user explicitly permits omitting.

These controls change prioritization inside the selected profile. They never
override privacy, provenance, evidence classification, or the requirement to
assess the complete supplied payload.

## Non-negotiable invariants

All profiles must:

1. inspect the complete supplied payload before deciding what to retain;
2. run the privacy and retention gate;
3. distinguish human, assistant, system, tool, and unknown roles using evidence;
4. catalog rich elements and missing sidecars;
5. separate stated material from inference and verification status;
6. record provenance, completeness, omissions, and uncertainty; and
7. derive the title and filename only after extraction; and
8. produce a standalone, cross-platform artifact that does not require access
   to the original thread, account, project, canvas, artifact, or connector.

## Portability invariant

This workflow evacuates value from an ephemeral conversation into durable
context. It must not preserve operational reliance on the source platform.
Source URLs, thread titles, message identifiers, and platform names are optional
provenance aids, not runtime dependencies. Move the usable meaning, instructions,
decisions, and supplied asset content into the destination artifact. When an
important sidecar is missing, state exactly what is unavailable and what future
work is blocked, rather than telling the reader simply to reopen the old thread.

Run a source-independence test before completion: could a capable reader who has
no account access understand the objective, continue the work, locate retained
assets, and identify unresolved gaps? If not, the evacuation is incomplete for
the selected depth.

A faster profile may compress assessment records, but it may not skip assessment.
Use grouped turn or element ranges when individual rows would defeat the selected
speed. Each assessed item or group receives one disposition: `retain`,
`compress`, `omit-with-reason`, `flag-missing`, or `exclude-chrome`.

## Selection and switching

- Accept `extraction_depth` using any trigger in the three sets:
  `rapid|balanced|comprehensive`, `essential|substantial|exhaustive`, or
  `scan|distill|catalog`.
- Normalize aliases to `rapid`, `balanced`, or `comprehensive` in metadata and
  record the original trigger in the body when useful.
- If the user does not specify a profile, select `balanced` and state that
  default before producing the artifact.
- If urgency, available context, privacy risk, or requested fidelity conflicts
  with the chosen profile, explain the conflict and use the safer interpretation.
- The user may change profiles during processing. Record the final profile and a
  short change note. Reassess material already compressed if moving to a deeper
  profile.
- Do not silently downgrade because the source is long. Process it in batches or
  ask for continuation while retaining the selected depth.

## Output expectations

Word ranges below are default usability targets for an ordinary source, not hard
caps. Safety, evidence, and a user-supplied output budget take precedence. If an
output materially exceeds its target, state why the extra detail is necessary.

### Rapid

Prefer a compact continuity brief. The turn and element ledgers may use ranges.
Include an explicit `Not carried forward` list so speed does not look like
accidental omission. Target roughly 600 to 1,200 words for an ordinary thread.
Use a one-paragraph synopsis, grouped ledgers, compact coverage accounting, and
cross-references instead of repeated caveats. Prioritize current state, resume
point, blockers, critical assets, and next actions.

### Balanced

Use selective detail. Preserve high-value turns and elements individually, group
routine or repetitive material, and include rationale for meaningful exclusions.
This is the recommended balance of continuity, reuse value, and processing cost.
For an ordinary thread, 1,200 to 3,000 words is usually enough. Exceed that range
only when the retained reasoning or assets earn the additional length.

### Comprehensive

Use fine-grained ledgers and a full disposition audit. Preserve unique versions,
rejected alternatives with consequential rationale, and dependency relationships.
Comprehensive means comprehensive semantic extraction, not automatic retention of
unsafe data or a verbatim transcript. Use the length required for auditable
semantic coverage, and split very large sources into labeled batches rather than
producing an unstructured wall of text.

## Stop conditions

Stop only when the selected profile has been applied, every supplied item or
group has a disposition, the title chain is traceable, the actionable handoff is
usable, and the rehydration test is recorded. A long source is a batching signal,
not permission to silently lower the profile. A privacy or authority conflict is
a reason to pause the write and report the boundary.
