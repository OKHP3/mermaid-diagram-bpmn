# okhp3-bpmn-to-process-narrative

SKILL.md-compatible agent skill for reconstructing a Process Narrative Specification (`pns.yaml` / `PNS.md`) from an existing Mermaid-native `bpmn-beta` diagram.

Part of the **BP-SKILL v0.3 Business Process Agent Skill Suite** — a recommended extension paired with `okhp3-bpmn-recoverability-audit`, and the structural mirror of `okhp3-visual-process-modeling` run in reverse.

## What this skill does

Parses an existing `bpmn-beta.mmd` diagram's own DSL text — pools, lanes, tasks, gateways, events, sequence flows, and message flows — and reconstructs the PNS sections that a diagram can actually support: activity sequence, decision points with labelled outcomes, process trigger and outputs, and lane-derived role ownership. Every PNS section the diagram cannot support (KPIs, controls, business-rule rationale, true RACI accountability) is emitted explicitly marked `unrecoverable_from_diagram: true` — never fabricated. Produces:

- **`pns.yaml`** — machine-readable PNS, tagged `narrative_provenance: "diagram-derived"`
- **`PNS.md`** — human-readable rendering of the same sections

This skill does **not** do vision/image/OCR parsing of a rendered PNG/SVG or a hand-drawn diagram. It reads `bpmn-beta` DSL text only. See `SKILL.md` for the full scope boundary.

## Scripts

```bash
node scripts/reverse-bpmn-beta.mjs <diagram.mmd> [--out-yaml pns.yaml] [--out-md PNS.md]
```

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
