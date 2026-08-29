# okhp3-bpmn-recoverability-audit

SKILL.md-compatible agent skill for auditing a diagram-derived `pns.yaml` — one that lacks a companion `pir.yaml` elicitation record — and producing an explicit, disclosed fidelity/gap report.

Part of the **BP-SKILL v0.3 Business Process Agent Skill Suite** — a recommended extension downstream of `okhp3-bpmn-to-process-narrative`, outside the 15-skill core pipeline until release evidence supports promotion.

## What this skill does

Reads a `pns.yaml` reconstructed from a `bpmn-beta.mmd` diagram (rather than elicited from stakeholders) and separates its sections into what a diagram's own grammar can and cannot structurally encode. Produces:

- **`fidelity-report.yaml`** — `source_pns` provenance, `recoverable_from_diagram[]`, `unrecoverable_from_diagram[]`, a `completeness_verdict` (`full` | `partial-diagram-derived` | `insufficient`), and a `recommended_next_action`

This is **not** a duplicate of `okhp3-process-validation-scoring`. That skill runs the full V1–V9 publication-readiness suite, including the hard V8 gate (`pir.yaml completeness_score >= 70`) that a diagram-only reconstruction was never meant to satisfy. This skill gives that reconstruction an honest, separate assessment instead, and never sets `ready_for_publication: true`.

## Scripts

```bash
node scripts/audit-diagram-fidelity.mjs
```

Named export: `auditDiagramFidelity({ pns, pir })` → `{ valid, errors, warnings, report }`

## Tests

```bash
node --test tests/*.test.mjs
```

## License

MIT
