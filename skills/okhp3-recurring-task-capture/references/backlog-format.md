# BACKLOG.md entry format

Format this skill writes to `docs/BACKLOG.md` (step 2 of the process in
`SKILL.md`) when a recurring pattern has been observed but has not yet
stabilized enough to skeleton.

## Fields

Each entry is one Markdown list item, one line, in this order:

```
- YYYY-MM-DD | <task, one clause> | observed: N | family: <existing family name, or "new: <candidate name>", or "unassigned"> | status: captured
```

- **date** — the date this observation was logged (not the date the pattern
  first occurred).
- **task** — a short clause describing the repeated action, phrased the way
  a trigger phrase would be, not as a finished skill name.
- **observed** — a count, not an estimate. If the user says "this is the
  third time," write `3`; if only stated in passing with no count given,
  write `1` and note the uncertainty in a trailing parenthetical.
- **family** — the existing top-level family this would belong to if
  promoted, `new: <name>` if it looks like it needs one, or `unassigned` if
  that is not yet decidable from what's been observed.
- **status** — `captured` for a first log. Later entries against the same
  line-item update status in place (`captured` -> `watching` ->
  `skeleton-produced`) rather than duplicating the line.

## What NOT to do

- Do not invent an observation count. If the user's own words don't establish
  how many times this happened, say so in the entry rather than rounding up.
- Do not skip straight to a skeleton because a backlog entry feels like
  extra process. The assess-readiness gate in `SKILL.md` step 2 exists
  specifically to stop one-off work from being mistaken for a durable
  pattern — see `../SKILL.md` step 2 and the fabrication-risk case in
  `../evals/evals.json`.
- Do not merge two different tasks into one backlog line because they used
  similar tools. Same tools, different judgment calls, is still two
  candidate patterns.
