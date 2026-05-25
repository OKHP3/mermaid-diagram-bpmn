# okhp3-process-discovery

SKILL.md-compatible agent skill for BABOK v3-aligned business process discovery.

Part of the **OverKill Hill P³ Business Process Agent Skill Suite** — the first layer of a three-skill pipeline:

```
okhp3-process-discovery  →  okhp3-process-narrative  →  okhp3-bpmn-for-mermaid
      (PIR + register)            (PNS + SIPOC + RACI)        (bpmn-beta diagram)
```

## What this skill does

Guides an agent through structured process elicitation using BABOK v3 techniques. Produces:

- **Process Intake Record (PIR)** — structured YAML capturing trigger, actors, inputs, outputs, steps, exceptions, business rules, systems, and controls
- **Stakeholder Register** — derived from PIR actors with role/interest/influence classification

## Install

Copy `skills/okhp3-process-discovery/` into your project or agent workspace.
Configure your agent to discover skills from the local path per [agentskills.io](https://agentskills.io).

## Trigger examples

- "I need to document our purchase approval process."
- "Help me scope out this support triage workflow."
- "Let's capture the quote-to-order process from scratch."

## Scripts

All scripts are pure ESM, no external dependencies:

```bash
node scripts/validate-pir.mjs <pir.yaml>
node scripts/score-intake-completeness.mjs <pir.yaml>
node scripts/generate-stakeholder-register.mjs <pir.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
