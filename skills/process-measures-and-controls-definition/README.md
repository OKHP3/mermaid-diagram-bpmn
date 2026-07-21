# process-measures-and-controls-definition

SKILL.md-compatible agent skill for defining process KPIs and COSO-aligned governance controls.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 11 (recommended extension).

## What this skill does

Derives a KPI register and controls register from PNS `kpis[]` and `controls_and_compliance[]`. Ensures all KPIs have `formula` and `data_source` (V5 compliance). Produces:

- **Measures register** — KPI register with targets, frequencies, and data sources
- **Controls register** — COSO-typed controls with evidence requirements

## Scripts

```bash
node scripts/generate-measures-register.mjs <pns.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
