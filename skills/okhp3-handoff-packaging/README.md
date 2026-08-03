# publication-and-handoff-packaging

SKILL.md-compatible agent skill for assembling validated process artifacts into a publication-ready bundle.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 15 (final stage) in the 15-skill pipeline.

## What this skill does

Assembles all validated process artifacts into a structured bundle with a MANIFEST.yaml (SHA256 hashes, quality metadata) and an APPROVALS.yaml stub for ISO 9001 §7.5.3 document control. Blocks publication if any required artifact is missing or the validation band is below B. Produces:

- **`MANIFEST.yaml`** — artifact inventory with SHA256 hashes and quality metadata
- **`APPROVALS.yaml`** — document control approval stub

## Scripts

```bash
node scripts/build-publication-bundle.mjs --dir <process-artifacts/proc-id>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
