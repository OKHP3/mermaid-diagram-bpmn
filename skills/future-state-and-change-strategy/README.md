# future-state-and-change-strategy

SKILL.md-compatible agent skill for designing target-state processes and structured change strategies.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 08 (recommended extension).

## What this skill does

Designs a to-be process and change strategy from a gap analysis using ADKAR and Kotter frameworks. Scope firewall: never includes employer-proprietary constraints without explicit user authorisation. Produces:

- **Future-state artifact** — to-be step list with change items, effort/risk classification, and open assumptions
- **Change strategy document** — ADKAR-aligned change plan

## Scripts

```bash
node scripts/generate-future-state.mjs <gap-analysis.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
