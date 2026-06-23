# elicitation-and-interview-facilitation

SKILL.md-compatible agent skill for planning and facilitating structured process elicitation sessions.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 03 in the 15-skill pipeline.

## What this skill does

Plans targeted elicitation question plans from PIR gaps using BABOK v3 interview and workshop techniques. Produces:

- **Question plan** — YAML of gap-targeted, section-mapped questions with probes and expected outputs

## Scripts

```bash
node scripts/generate-question-plan.mjs <pir.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
