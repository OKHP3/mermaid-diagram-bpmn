# process-narrative-authoring

SKILL.md-compatible agent skill for authoring and validating Process Narrative Specifications (PNS).

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 05 in the 15-skill pipeline.

## What this skill does

Authors a structured 13-section PNS from a PIR, anchoring ISO 9001 §4.4.1 process-box semantics, BABOK Core Concept Model, RACI, decision points, KPIs, and controls. Produces:

- **PNS YAML** — the authoritative handoff for all downstream skills
- **PNS quality score** — 0–100 score with `ready_for_publication` gate

## Scripts

```bash
node scripts/validate-pns.mjs <pns.yaml>
node scripts/score-pns-quality.mjs <pns.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
