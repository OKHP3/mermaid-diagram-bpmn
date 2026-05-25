# process-gap-and-exception-analysis

SKILL.md-compatible agent skill for identifying structural, execution, exception, and compliance gaps.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 07 in the 15-skill pipeline.

## What this skill does

Detects four types of process gaps (structural, execution, exception, compliance) from an as-is process record. Produces:

- **Gap analysis report** — YAML of typed, severity-classified gaps with root cause and recommended actions
- **Exception catalog** — structured exception inventory with handling procedures

## Scripts

```bash
node scripts/analyze-gaps.mjs <as-is-process.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
