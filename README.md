# BPMN for Mermaid — bpmn-beta + BP-SKILL Agent Suite

**Text-first. Standards-aware. Git-native.**

This repository contains three related assets:

1. **bpmn-beta** — a text-first DSL for BPMN process diagrams, designed as a Mermaid diagram-type contribution. No XML. No bpmn-js runtime dependency. Write process models as a Markdown code fence.

2. **A React playground app** — live parser, SVG renderer, DSL reference, architecture notes, roadmap, Agent Skills browser, and individual skill detail pages. Deployed at [okhp3.github.io/mermaid-diagram-bpmn](https://okhp3.github.io/mermaid-diagram-bpmn/).

3. **BP-SKILL v0.3** — a 15-skill Business Process Agent Skill Suite packaged in the Agent Skills open standard. `bpmn-beta` is the visual output layer of a broader business process documentation methodology.

---

## Current status

**Prototype shipped. v0.1 hardening and plugin path are in progress.**

| Area | Status |
|---|---|
| Core BPMN primitives | Working |
| Hand-written line parser | Working |
| Direct SVG renderer, no `bpmn-js` runtime dependency | Working |
| Pool and lane containment | Experimental |
| Message flows | Experimental |
| Mermaid External Diagram adapter | Implemented as source adapter; npm packaging and end-to-end host validation pending |
| Langium grammar | Roadmap |
| Full Mermaid `getStyles` / theme-variable integration | Roadmap |
| Upstream Mermaid core PR | Future, after v1.0 stabilizes |

`bpmn-beta` is not yet a production Mermaid plugin, not a full BPMN 2.0 implementation, not an executable BPMN engine, and not a BPMN XML round-trip tool.

---

## What bpmn-beta looks like

```text
bpmn-beta
accTitle: Purchase Order Approval

pool company "Company" {
  lane requester "Requester" {
    start     s1  "Need Identified"
    task:user t1  "Submit Purchase Request"
  }

  lane manager "Manager" {
    task:user t2  "Review Request"
    xor       g1  "Approved?"
    end       e2  "Rejected"
  }

  lane procurement "Procurement" {
    task:service t3  "Create Purchase Order"
    end          e1  "PO Issued"
  }

  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 --> t3: "yes"
  g1 --> e2: "no"
  t3 --> e1
}
```

Paste this into the [live playground](https://okhp3.github.io/mermaid-diagram-bpmn/playground) to see the SVG output. If a deep link is unavailable in a static host, use the [root app](https://okhp3.github.io/mermaid-diagram-bpmn/) and open Playground from the app navigation.

---

## Project surfaces

| Surface | Purpose |
|---|---|
| [Public project page](https://overkillhill.com/projects/bpmn-for-mermaid/) | OverKill Hill P³ project home and public positioning |
| [Live playground](https://okhp3.github.io/mermaid-diagram-bpmn/playground) | In-browser `bpmn-beta` parser and SVG renderer |
| [Root app](https://okhp3.github.io/mermaid-diagram-bpmn/) | GitHub Pages application shell |
| [Agent Skills Browser](https://okhp3.github.io/mermaid-diagram-bpmn/skills) | Browse, explore, and download the BP-SKILL suite |
| [DSL Reference](https://okhp3.github.io/mermaid-diagram-bpmn/dsl) | Element vocabulary and syntax rules |
| [Architecture](https://okhp3.github.io/mermaid-diagram-bpmn/architecture) | Parser design, renderer decisions, plugin path |
| [Roadmap](https://okhp3.github.io/mermaid-diagram-bpmn/roadmap) | What ships next |
| [Replit dev surface](https://replit.com/t/overkill-hill/repls/BPMN-for-Mermaid) | Active development workspace |
| [Notion book spine](https://www.notion.so/overkillhill/BPMN-for-Mermaid-bpmn-beta-Diagram-Type-Proposal-357812e0ced481c88b20d2eb493dc775) | PRD, DSL spec, decisions, and project tracker |
| [Strategy doc](docs/strategy.md) | Positioning, thesis, upstream engagement plan |
| [Version checklist](docs/version-checklist.md) | Completion criteria for each release |

---

## Standards and compatibility references

| Resource | Link |
|---|---|
| BPMN standard home | https://www.bpmn.org/ |
| OMG BPMN 2.0.2 specification | https://www.omg.org/spec/BPMN/2.0.2/PDF |
| Specification PDF in this repo | [artifacts/mermaid-diagram-bpmn/standards/OMG-BPMN-2.0.2-formal-specification.pdf](./artifacts/mermaid-diagram-bpmn/standards/OMG-BPMN-2.0.2-formal-specification.pdf) |
| BPMN compliance reference | [artifacts/mermaid-diagram-bpmn/standards/BPMN-SPEC-REFERENCE.md](./artifacts/mermaid-diagram-bpmn/standards/BPMN-SPEC-REFERENCE.md) |
| Mermaid compatibility notes | [artifacts/mermaid-diagram-bpmn/docs/mermaid-compatibility.md](./artifacts/mermaid-diagram-bpmn/docs/mermaid-compatibility.md) |
| DSL specification | [artifacts/mermaid-diagram-bpmn/docs/dsl-spec.md](./artifacts/mermaid-diagram-bpmn/docs/dsl-spec.md) |

---

## Repository structure

```text
mermaid-diagram-bpmn/
  artifacts/mermaid-diagram-bpmn/
    src/                       React/Vite application source
      data/skills-registry.ts  Canonical skill data
      pages/AgentSkills.tsx    Skills browser page
      pages/SkillDetail.tsx    Individual skill detail page
      lib/                     Parser, layout, renderer, plugin adapter
    public/
      skills/                  Generated SKILL.md files
      context/                 Generated variable layer templates
    scripts/
      generate-skill-files.mjs Pre-build asset generator
    docs/                      App and plugin documentation
    standards/                 BPMN reference material
  skills/                      BP-SKILL agent skill packages
  context/                     Variable layer configuration templates
  docs/                        Extended repository documentation
  evals/                       BP-SKILL quality evaluation suite
```

---

## BP-SKILL Agent Skill Suite

Skills are the AI analogue of SOPs: executable, version-controlled, portable instruction sets that auto-activate on semantic match.

BP-SKILL packages the business process documentation lifecycle as 15 SKILL.md files conforming to the Agent Skills open standard. The central handoff artifact is `PNS.md`, a Process Narrative Specification that every skill either reads or enriches.

### The pipeline

```text
LAYER 1 — DISCOVERY
  01 process-intake-and-scope
  02 stakeholder-and-role-mapping
  03 elicitation-and-interview-facilitation

LAYER 2 — NARRATIVE
  04 as-is-process-capture
  05 process-narrative-authoring
  07 process-gap-and-exception-analysis
  08 future-state-and-change-strategy
  10 process-validation-and-quality-scoring

LAYER 3 — VISUAL AND DECISION MODELING
  06 visual-process-modeling
  09 decision-model-authoring

LAYER 4 — OPERATIONAL
  11 process-measures-and-controls-definition
  12 sop-and-work-instruction-generation

LAYER 5 — GOVERNANCE
  13 raci-and-governance-matrix-generation
  14 sipoc-generation

LAYER 6 — PUBLICATION
  15 publication-and-handoff-packaging
```

See [docs/agent-skills-install.md](./docs/agent-skills-install.md) for platform-specific install instructions and full suite download.

---

## What bpmn-beta is, and is not

**It is:**

- A readable DSL for a BPMN 2.0 descriptive process-modeling subset
- Text-first and Git-native
- Designed to work inside a Markdown code fence
- AI-generatable and intended to reduce syntax repair loops
- A Mermaid diagram-type contribution proposal

**It is not:**

- Executable BPMN
- BPMN XML import or export
- Full BPMN 2.0 conformance
- A process engine or token simulator
- A production Mermaid plugin yet

---

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter @workspace/mermaid-diagram-bpmn run dev

# Build for production
pnpm build

# Run tests
pnpm --filter @workspace/mermaid-diagram-bpmn run test

# Typecheck all packages
pnpm run typecheck

# Generate SKILL.md files from the registry
pnpm --filter @workspace/mermaid-diagram-bpmn run skill:generate
```

---

## Contributing

This project welcomes contributions in three areas:

**bpmn-beta DSL** — syntax proposals, shape corrections, pool/lane improvements, and plugin compatibility work. Open an issue first for syntax changes because syntax stability is the gating concern for upstream Mermaid submission.

**BP-SKILL agent skills** — new skills, skill improvements, additional variable file schemas, and eval fixtures. Read [docs/bp-skill-contributing.md](./docs/bp-skill-contributing.md) before submitting.

**React playground app** — UI improvements, new pages, accessibility improvements, and example coverage. Match the existing component patterns and styling tokens.

All contributions must pass `pnpm --filter @workspace/mermaid-diagram-bpmn run test`, `pnpm run typecheck`, and `pnpm build` before review.

## License

MIT — see [LICENSE](./LICENSE).
