# sop-and-work-instruction-generation

SKILL.md-compatible agent skill for generating ISO 9001-compliant SOPs and role-scoped work instructions.

Part of the **BP-SKILL v0.2 Business Process Agent Skill Suite** — skill 12 in the 15-skill pipeline.

## What this skill does

Generates a structured SOP and optional per-role work instructions from a validated PNS. Follows ISO 9001 §7.5 documented information requirements. Produces:

- **`sop.md`** — full Standard Operating Procedure in Markdown
- **`work-instructions.md`** — role-scoped procedure excerpts (optional)

## Scripts

```bash
node scripts/generate-sop.mjs <pns.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
