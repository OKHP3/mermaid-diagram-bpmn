# decision-model-authoring

SKILL.md-compatible agent skill for authoring and validating DMN-aligned decision models.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 09 (recommended extension).

## What this skill does

Authors structured decision tables from PNS decision points using OMG DMN hit policies. Triggered automatically when `visual-process-modeling` detects ≥3 gateways. Produces:

- **`decision-model.yaml`** — machine-readable decision model with traceability to PNS
- **DMN table** — human-readable rule table in Markdown

## Scripts

```bash
node scripts/validate-decision-model.mjs <decision-model.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
