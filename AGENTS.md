# AGENTS.md — BPMN for Mermaid

Guidance for AI agents, automated tools, and contributors working on this repository.

> For artifact-specific deep-dive rules (module pipeline, DSL grammar, parser safety), see
> [`artifacts/mermaid-diagram-bpmn/AGENTS.md`](./artifacts/mermaid-diagram-bpmn/AGENTS.md).

---

## Project identity

**BPMN for Mermaid** (`mermaid-diagram-bpmn`) is a personal [OverKill Hill P³](https://overkillhill.com) project by Jamie Hill. It is a contributor-facing prototype for a Mermaid-native `bpmn-beta` diagram type. It is not affiliated with Mermaid, Mermaid Chart, Mermaid.ai, the OMG BPMN standards body, or any third-party brand.

## Canonical disclaimer

Always include this disclaimer in README and major docs:

> BPMN for Mermaid is a personal OverKill Hill P³ project by Jamie Hill. It is not affiliated with the mermaid-js maintainers, Mermaid Chart, Mermaid.ai, or any standards body. It implements a documented descriptive subset of BPMN 2.0 — it does not claim full BPMN 2.0 compliance.

---

## Repository layout

This is a pnpm monorepo. The primary artifact is `mermaid-diagram-bpmn`. Other artifacts (`api-server`, `mockup-sandbox`) are scaffolding and are unused by the frontend.

```
/
├── artifacts/mermaid-diagram-bpmn/   ← PRIMARY: all source, docs, examples, standards
│   ├── src/lib/                      ← bpmn-detector, bpmn-parser, bpmn-layout, bpmn-renderer, bpmn-styles, bpmn-plugin
│   ├── docs/                         ← project documentation
│   ├── examples/                     ← canonical .mmd fixture files
│   └── standards/                    ← bpmn-beta-standard.md, parser-safety-checklist.md, OMG spec PDF
├── .github/
│   ├── copilot-instructions.md       ← Copilot-specific rules
│   ├── dependabot.yml
│   └── workflows/
│       ├── ci.yml                    ← typecheck + test on every push/PR
│       └── deploy.yml                ← GitHub Pages deploy on main
└── scripts/
    └── post-merge.sh                 ← runs after task-agent merges
```

---

## Dual-compliance requirement

This project has two co-equal hard requirements. **Neither takes priority. A failure on either side is a failed document.**

| Requirement | Standard | Failure condition |
|---|---|---|
| **Mermaid rendering** | Mermaid `registerExternalDiagrams()` API | Plugin throws, SVG does not render, or output breaks in any Mermaid-compatible host |
| **BPMN 2.0.2 notation** | OMG BPMN 2.0.2 formal specification — Descriptive Conformance Sub-Class (Section 2.1) | A rendered shape, marker, or flow deviates from the spec without a documented decision |

- Spec PDF (in repo): `artifacts/mermaid-diagram-bpmn/standards/OMG-BPMN-2.0.2-formal-specification.pdf`
- Compliance map: `artifacts/mermaid-diagram-bpmn/standards/BPMN-SPEC-REFERENCE.md`
- Standard home: https://www.bpmn.org/
- OMG spec: https://www.omg.org/spec/BPMN/2.0.2/PDF

---

## Architecture constraints

Never add to `artifacts/mermaid-diagram-bpmn/`:
- `bpmn-js` runtime dependency — SVG rendering is hand-written
- BPMN XML import or export (out of scope for v1)
- Backend server — all processing is client-side
- LLM inference or AI API calls
- User authentication or accounts

## Module pipeline (do not collapse stages)

```
detect → parse → layout → render → styles
bpmn-detector.ts → bpmn-parser.ts → bpmn-layout.ts → bpmn-renderer.tsx → bpmn-styles.ts
```

`BpmnDb` is the canonical data store. Parser populates it. Layout and renderer read from it.

---

## Monorepo rules

- All work on the bpmn frontend goes in `artifacts/mermaid-diagram-bpmn/`
- Do not add routes, DB schemas, or API logic to `artifacts/api-server/` for the bpmn frontend — it is client-side only
- Shared tooling (TypeScript, Vitest, ESLint) lives at workspace root
- `pnpm --filter @workspace/mermaid-diagram-bpmn run test` must pass before every commit
- `pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck` must pass before every commit

---

## Versioning governance

- `MERMAID_VERSION_TARGET` in `artifacts/mermaid-diagram-bpmn/src/lib/bpmn-plugin.ts` tracks Mermaid API compatibility
- Update this constant whenever the Mermaid target version changes
- Version format: `0.MINOR.PATCH` until first npm publish
