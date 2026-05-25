# okhp3-process-narrative

SKILL.md-compatible agent skill for authoring Process Narrative Specifications (PNS).

Part of the **OverKill Hill P³ Business Process Agent Skill Suite** — the middle layer:

```
okhp3-process-discovery  →  okhp3-process-narrative  →  okhp3-bpmn-for-mermaid
   (PIR + register)          (PNS + SIPOC + RACI)         (bpmn-beta diagram)
```

## What this skill does

Takes a Process Intake Record (PIR) and stakeholder register from `okhp3-process-discovery`
and produces a fully structured Process Narrative Specification (PNS) — anchoring:

- ISO 9001 §4.4.1 process-box semantics
- BABOK v3 Core Concept Model
- RACI matrix per activity
- SIPOC table (Suppliers / Inputs / Process / Outputs / Customers)
- Business rules, decision points, exception paths, KPIs, controls

The PNS is the authoritative visual modeling input for `okhp3-bpmn-for-mermaid`.

## Install

Copy `skills/okhp3-process-narrative/` into your project or agent workspace.

## Scripts

```bash
node scripts/validate-pns.mjs <pns.yaml>
node scripts/score-pns-quality.mjs <pns.yaml>
node scripts/generate-sipoc.mjs <pns.yaml>
node scripts/generate-raci.mjs <pns.yaml>
node scripts/extract-business-rules.mjs <pns.yaml>
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
