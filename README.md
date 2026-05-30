# BPMN for Mermaid — bpmn-beta + BP-SKILL Agent Suite

**Text-first. Standards-aware. Git-native.**

Three things live in this repository:

1. **bpmn-beta** — a text-first DSL for BPMN process diagrams, designed as a Mermaid diagram-type contribution. No XML. No bpmn-js. Write process models as a Markdown code fence.

2. **A seven-page React playground app** — live parser, SVG renderer, DSL reference, architecture notes, roadmap, Agent Skills browser, and individual skill detail pages. Deployed at [okhp3.github.io/mermaid-diagram-bpmn](https://okhp3.github.io/mermaid-diagram-bpmn/).

3. **BP-SKILL v0.3** — a 15-skill Business Process Agent Skill Suite packaged in the [Agent Skills open standard](https://agentskills.io) (agentskills.io). bpmn-beta is the visual output layer of a complete business process documentation methodology.

---

## What bpmn-beta looks like

```
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

Paste this into the [live playground](https://okhp3.github.io/mermaid-diagram-bpmn/playground) to see the SVG output.

---

## Project surfaces

| Surface | Purpose |
|---|---|
| [Live Playground](https://okhp3.github.io/mermaid-diagram-bpmn/playground) | In-browser bpmn-beta parser and SVG renderer |
| [Agent Skills Browser](https://okhp3.github.io/mermaid-diagram-bpmn/skills) | Browse, explore, and download the BP-SKILL suite |
| [DSL Reference](https://okhp3.github.io/mermaid-diagram-bpmn/dsl) | Full element vocabulary and syntax rules |
| [Architecture](https://okhp3.github.io/mermaid-diagram-bpmn/architecture) | Parser design, renderer decisions, plugin path |
| [Roadmap](https://okhp3.github.io/mermaid-diagram-bpmn/roadmap) | What ships next |
| [Project page](https://overkillhill.com/projects/bpmn-for-mermaid/) | OverKill Hill P3 project home |
| [Strategy doc](docs/strategy.md) | Positioning, thesis, upstream engagement plan |
| [Version checklist](docs/version-checklist.md) | Completion criteria for each release |

---

## Repository structure

```
mermaid-diagram-bpmn/
  artifacts/mermaid-diagram-bpmn/
    src/                       React/Vite application source
      data/skills-registry.ts  Canonical skill data (15 skills, 9 var files, PNS schema)
      pages/AgentSkills.tsx    Skills browser page
      pages/SkillDetail.tsx    Individual skill detail page
    public/
      skills/                  Generated SKILL.md files (one per skill)
      context/                 Generated variable layer templates
    scripts/
      generate-skill-files.mjs Pre-build asset generator
  skills/                      BP-SKILL agent skill packages (source of truth)
    process-intake-and-scope/
    stakeholder-and-role-mapping/
    elicitation-and-interview-facilitation/
    as-is-process-capture/
    process-narrative-authoring/
    visual-process-modeling/
    process-gap-and-exception-analysis/
    future-state-and-change-strategy/
    decision-model-authoring/
    process-validation-and-quality-scoring/
    process-measures-and-controls-definition/
    sop-and-work-instruction-generation/
    raci-and-governance-matrix-generation/
    sipoc-generation/
    publication-and-handoff-packaging/
  context/                     Variable layer configuration templates (source of truth)
  docs/                        Extended documentation
  evals/                       BP-SKILL quality evaluation suite
```

---

## BP-SKILL Agent Skill Suite

Skills are the AI analogue of SOPs — executable, version-controlled, portable instruction sets that auto-activate on semantic match.

BP-SKILL packages the full business process documentation lifecycle as 15 SKILL.md files conforming to the [Agent Skills open standard](https://agentskills.io).

**Compatible with:** Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, Cursor, VS Code, and any other Agent Skills-compatible platform.

### The pipeline

```
LAYER 1 — DISCOVERY
  01 process-intake-and-scope                   [core]
  02 stakeholder-and-role-mapping               [core]
  03 elicitation-and-interview-facilitation     [core]

LAYER 2 — NARRATIVE
  04 as-is-process-capture                      [core]
  05 process-narrative-authoring                [core]
  07 process-gap-and-exception-analysis         [core]
  08 future-state-and-change-strategy           [extension]
  10 process-validation-and-quality-scoring     [core]

LAYER 3 — VISUAL AND DECISION MODELING
  06 visual-process-modeling                    [core]
  09 decision-model-authoring                   [extension]

LAYER 4 — OPERATIONAL
  11 process-measures-and-controls-definition   [extension]
  12 sop-and-work-instruction-generation        [core]

LAYER 5 — GOVERNANCE
  13 raci-and-governance-matrix-generation      [core]
  14 sipoc-generation                           [core]

LAYER 6 — PUBLICATION
  15 publication-and-handoff-packaging          [core]
```

The central handoff artifact is `PNS.md` — a Process Narrative Specification that every skill either reads or enriches, creating a validated pipeline rather than a collection of disconnected prompts.

### Standards alignment

| Standard | What it governs in BP-SKILL |
|---|---|
| BABOK v3 (IIBA) | Elicitation, requirements analysis, solution evaluation |
| BPM CBOK v4.0 (ABPMP) | Process lifecycle phases, knowledge areas |
| APQC PCF v7.4 | Process taxonomy and classification |
| BPMN 2.0.2 (OMG) | Visual process notation |
| DMN 1.4 (OMG) | Decision model notation |
| ISO 9001:2015 | Documented information requirements |
| IEEE/ISO/IEC 29148:2018 | Requirements information quality |

### Quick install

Install a single skill:

```bash
mkdir -p skills/process-narrative-authoring
curl -o skills/process-narrative-authoring/SKILL.md \
  https://okhp3.github.io/mermaid-diagram-bpmn/skills/process-narrative-authoring/SKILL.md
```

Browse and download individual skills at:
[okhp3.github.io/mermaid-diagram-bpmn/skills](https://okhp3.github.io/mermaid-diagram-bpmn/skills)

See [docs/agent-skills-install.md](./docs/agent-skills-install.md) for platform-specific install instructions and full suite download.

### Variable layer

The 9 context files in `context/` tailor the suite to your organisation:

| File | Purpose |
|---|---|
| `organization-profile.md` | Company, industry, maturity, regulatory environment |
| `sector-context.md` | Industry vocabulary, standards, APQC mapping |
| `regional-context.md` | Jurisdiction, language, compliance frameworks |
| `role-dictionary.md` | Named roles with stable IDs and RACI defaults |
| `process-taxonomy.md` | APQC PCF hierarchy with dual v7.4/v8.0 IDs |
| `notation-preferences.md` | Diagram notation, renderer targets, palette |
| `compliance-controls-registry.md` | Control IDs, frameworks, approval gates |
| `integration-registry.md` | Named systems with stable IDs |
| `business-glossary-and-rulebook.md` | Controlled vocabulary and business rules |

Download all 9 templates at:
[okhp3.github.io/mermaid-diagram-bpmn/skills](https://okhp3.github.io/mermaid-diagram-bpmn/skills)

---

## bpmn-beta prototype — current status

| Feature | Status |
|---|---|
| Core BPMN primitives (start/end events, tasks, gateways, sequence flows) | Working |
| Hand-written line-by-line parser | Working |
| Direct SVG renderer — no bpmn-js dependency | Working |
| Pool and lane containment | Experimental |
| Message flows | Experimental |
| Langium grammar | Roadmap |
| Mermaid External Diagram API packaging | Roadmap |
| getStyles / theme-variable integration | Roadmap |
| Upstream Mermaid core PR | Future — after v1.0 stabilises |

---

## What bpmn-beta is — and is not

**It is:**

- A readable DSL for the BPMN 2.0 Descriptive Conformance subset
- Text-first, Git-native, works inside a Markdown code fence
- AI-generatable — designed to be writable by LLMs without syntax repair
- A Mermaid diagram-type contribution proposal (not a commercial product)

**It is not:**

- Executable BPMN — no process engine, no token simulation
- BPMN XML import or export
- Full BPMN 2.0 conformance — choreography, boundary events, transactions, and data objects are out of scope for v1
- A production Mermaid plugin yet — upstream contribution comes after the DSL stabilises and the Langium parser is built

---

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (runs the React playground app)
pnpm --filter @workspace/mermaid-diagram-bpmn run dev

# Build for production
pnpm build

# Run all tests
pnpm --filter @workspace/mermaid-diagram-bpmn run test

# Typecheck all packages
pnpm run typecheck

# Generate all SKILL.md files from the registry into public/
pnpm --filter @workspace/mermaid-diagram-bpmn run skill:generate
```

---

## Contributing

This project welcomes contributions in three areas:

**bpmn-beta DSL** — syntax proposals, shape corrections, pool/lane improvements. Open an issue first to discuss syntax changes before submitting a PR, since syntax stability is the gating concern for upstream Mermaid submission.

**BP-SKILL agent skills** — new skills, skill improvements, additional variable file schemas, eval fixtures. Read [docs/bp-skill-contributing.md](./docs/bp-skill-contributing.md) before submitting.

**React playground app** — UI improvements, new pages, accessibility. Match the existing component patterns and styling tokens exactly.

All contributions must pass `pnpm --filter @workspace/mermaid-diagram-bpmn run test`, `pnpm run typecheck`, and `pnpm build` before review.

---

## License

Code: MIT
Documentation (docs/, SKILL.md files): CC-BY-4.0

---

## Built by

OverKill Hill P3 — [overkillhill.com](https://overkillhill.com)

BP-SKILL is proposed as a domain extension to the Agent Skills open standard. It is not affiliated with IIBA, ABPMP, APQC, OMG, or ISO. Standards are referenced by name and section number only.

> BPMN for Mermaid is a personal OverKill Hill P3 project by Jamie Hill. It is not affiliated with the mermaid-js maintainers, Mermaid Chart, Mermaid.ai, or any standards body. It implements a documented descriptive subset of BPMN 2.0 — it does not claim full BPMN 2.0 compliance.
