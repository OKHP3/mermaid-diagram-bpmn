# BPMN for Mermaid — bpmn-beta + BP-SKILL Agent Suite

**Text-first. Standards-aware. Git-native.**

This repository contains three related assets:

1. **bpmn-beta** — a text-first DSL for BPMN process diagrams, designed as a Mermaid diagram-type contribution. No XML. No bpmn-js runtime dependency. Write process models as a Markdown code fence.

2. **A React playground app** — live parser, SVG renderer, DSL reference, architecture notes, roadmap, Agent Skills browser, and individual skill detail pages. Deployed at [okhp3.github.io/mermaid-diagram-bpmn](https://okhp3.github.io/mermaid-diagram-bpmn/).

3. **BP-SKILL v0.3** — a 15-skill Business Process Agent Skill Suite packaged in the Agent Skills open standard. The repository also carries three supplemental/meta packages used for process capture, handoff packaging, and skill promotion. `bpmn-beta` is the visual output layer of a broader business process documentation methodology.

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
| Mermaid External Diagram adapter | **`@okhp3/mermaid-diagram-bpmn@0.1.0`** — packaged, source-verified against `mermaid@11.4.1` |
| Langium grammar | Roadmap |
| Full Mermaid `getStyles` / theme-variable integration | Roadmap |
| Upstream Mermaid core PR | Future, after v1.0 stabilizes |

`bpmn-beta` is not yet a production Mermaid plugin, not a full BPMN 2.0 implementation, not an executable BPMN engine, and not a BPMN XML round-trip tool.

---

## Using the plugin

```bash
npm install @okhp3/mermaid-diagram-bpmn
npm install mermaid          # peer dependency
```

```typescript
import mermaid from 'mermaid';
import { bpmnPlugin } from '@okhp3/mermaid-diagram-bpmn';

mermaid.initialize({ startOnLoad: false });
await mermaid.registerExternalDiagrams([bpmnPlugin]);
await mermaid.run();
```

Or render explicitly:

```typescript
const { svg } = await mermaid.render('my-diagram', `
bpmn-beta
start  s1  "Begin"
task:user  t1  "Review"
end    e1  "Done"
s1 --> t1
t1 --> e1
`);
document.getElementById('output').innerHTML = svg;
```

See the [Plugin Setup page](https://okhp3.github.io/mermaid-diagram-bpmn/plugin) for the full guide including version compatibility, testing notes, and DSL reference links.

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

## OKHP³ Visual Language Stack

BPMN for Mermaid is the **process-structure and notation layer** of the OKHP³ Visual Language Stack. Related components:

- **ReFolDec** — recursive fold/unfold transformation theory; `bpmn-beta` is a concrete instance
- **Mermaid Theme Builder** — visual governance, renderer profiles, and palette contracts for diagram output
- **skillz / BP-SKILL** — executable agent workflows covering the full process lifecycle (this repo)
- **OverKill Hill** — public narrative and routing surface for the stack

See [docs/strategy.md](./docs/strategy.md#okhp³-visual-language-stack) for the full stack positioning, process lifecycle, and scope separations.

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
| [Technology inventory](docs/technology-inventory.md) | Current and latest stable technology versions |

---

## Standards and compatibility references

| Resource | Link |
|---|---|
| BPMN standard home | https://www.bpmn.org/ |
| OMG BPMN 2.0.2 specification | https://www.omg.org/spec/BPMN/2.0.2/PDF |
| Specification PDF in this repo | [app/standards/OMG-BPMN-2.0.2-formal-specification.pdf](./app/standards/OMG-BPMN-2.0.2-formal-specification.pdf) |
| BPMN compliance reference | [app/standards/BPMN-SPEC-REFERENCE.md](./app/standards/BPMN-SPEC-REFERENCE.md) |
| Mermaid compatibility notes | [app/docs/mermaid-compatibility.md](./app/docs/mermaid-compatibility.md) |
| DSL specification | [app/docs/dsl-spec.md](./app/docs/dsl-spec.md) |

---

## Repository structure

```text
mermaid-diagram-bpmn/
  app/                         React/Vite application package
    src/                       Application source
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
  01 okhp3-process-intake-and-scope
  02 okhp3-stakeholder-and-role-mapping
  03 okhp3-elicitation-interviews

LAYER 2 — NARRATIVE
  04 okhp3-as-is-process-capture
  05 okhp3-process-narrative-authoring
  07 okhp3-process-gap-exception-analysis
  08 okhp3-future-state-change-strategy
  10 okhp3-process-validation-scoring

LAYER 3 — VISUAL AND DECISION MODELING
  06 okhp3-visual-process-modeling
  09 okhp3-decision-model-authoring

LAYER 4 — OPERATIONAL
  11 okhp3-process-measures-controls
  12 okhp3-sop-work-instructions

LAYER 5 — GOVERNANCE
  13 okhp3-raci-governance-matrix
  14 okhp3-sipoc-generation

LAYER 6 — PUBLICATION
  15 okhp3-publication-handoff-packaging
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
