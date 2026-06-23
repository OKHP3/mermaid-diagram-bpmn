# visual-process-modeling

SKILL.md-compatible agent skill for generating, validating, and explaining Mermaid-native `bpmn-beta` diagrams.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 06 in the 15-skill pipeline.

## What this skill does

Converts a PNS into a `bpmn-beta` diagram with pools, lanes, gateways, and message flows. Validates, normalises, and repairs existing diagrams. Triggers `decision-model-authoring` when ≥3 gateways are present. Produces:

- **`bpmn-beta.mmd`** — Mermaid-native BPMN diagram ready for the BPMN for Mermaid playground
- **`process-model.svg`** — rendered SVG (optional)

## Scripts

```bash
node scripts/validate-bpmn-beta.mjs <diagram.mmd>
node scripts/normalize-bpmn-beta.mjs <diagram.mmd>
node scripts/repair-bpmn-beta.mjs <diagram.mmd>
node scripts/lint-process-model.mjs <diagram.mmd>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
