# sipoc-generation

SKILL.md-compatible agent skill for generating SIPOC tables from a validated PNS.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 14 in the 15-skill pipeline.

## What this skill does

Derives a SIPOC (Suppliers, Inputs, Process, Outputs, Customers) table from PNS `process_box` and `activity_sequence`. Used in Six Sigma Define phase and as a one-page process overview for executive presentations. Produces:

- **`sipoc.md`** — SIPOC table in Markdown

## Scripts

```bash
node scripts/generate-sipoc.mjs <pns.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
