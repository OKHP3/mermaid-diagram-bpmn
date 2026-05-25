# raci-and-governance-matrix-generation

SKILL.md-compatible agent skill for generating RACI matrices and governance responsibility documents.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 13 in the 15-skill pipeline.

## What this skill does

Derives a validated RACI matrix and governance matrix (with escalation paths, authority limits, and absence cover) from a PNS. Produces:

- **`raci.md`** — RACI matrix table in Markdown
- **`governance-matrix.md`** — extended governance responsibility document

## Scripts

```bash
node scripts/generate-raci.mjs <pns.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
