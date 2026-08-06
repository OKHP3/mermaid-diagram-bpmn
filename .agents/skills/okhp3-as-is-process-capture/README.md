# as-is-process-capture

SKILL.md-compatible agent skill for capturing and normalising current-state process descriptions.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 04 in the 15-skill pipeline.

## What this skill does

Captures current-state process steps and normalises them into stable `act-NNN` / `gw-NNN` / `evt-NNN` identifiers ready for gap analysis. Produces:

- **As-is process artifact** — structured YAML with normalised step IDs, capture quality flags, and identified gaps

## Scripts

```bash
node scripts/assign-step-ids.mjs <steps.json>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
