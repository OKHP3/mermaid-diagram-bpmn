# process-validation-and-quality-scoring

SKILL.md-compatible agent skill for orchestrating the V1–V9 validation suite across all BP-SKILL artifacts.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 10 in the 15-skill pipeline.

## What this skill does

Runs 9 validation rules across PIR, PNS, and BPMN artifacts and produces a composite quality score with band classification (A–D). Produces:

- **Validation report** — per-artifact scores, rule-level findings, and `ready_for_publication` gate
- **Quality band** — A (90–100), B (75–89), C (50–74), D (0–49)

## Scripts

```bash
node scripts/run-validation-suite.mjs --pir <pir.yaml> --pns <pns.yaml> [--bpmn <bpmn.mmd>]
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
