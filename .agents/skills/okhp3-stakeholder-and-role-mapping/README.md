# stakeholder-and-role-mapping

SKILL.md-compatible agent skill for deriving a structured stakeholder register from a PIR.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 02 in the 15-skill pipeline.

## What this skill does

Derives a Stakeholder Register from PIR actors with role/interest/influence classification and engagement strategies. Produces:

- **Stakeholder Register** — YAML with influence-interest grid placement and engagement strategy per role

## Scripts

```bash
node scripts/generate-stakeholder-register.mjs <pir.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
