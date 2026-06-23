# process-intake-and-scope

SKILL.md-compatible agent skill for structured business process intake and scope definition.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 01 in the 15-skill pipeline.

```
process-intake-and-scope  →  stakeholder-and-role-mapping  →  elicitation-and-interview-facilitation
      (PIR)                        (stakeholder register)              (question plan)
                                               ↓
                                    process-narrative-authoring  →  visual-process-modeling  →  …
```

## What this skill does

Guides an agent through structured process intake using BABOK v3 elicitation techniques. Produces:

- **Process Intake Record (PIR)** — structured YAML capturing trigger, actors, inputs, outputs, steps, exceptions, business rules, systems, and controls
- **PIR validation report** — completeness score with `ready_for_narrative` gate

## Scripts

```bash
node scripts/generate-pir.mjs [process-name]
node scripts/validate-pir.mjs <pir.yaml>
node scripts/score-intake-completeness.mjs <pir.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
