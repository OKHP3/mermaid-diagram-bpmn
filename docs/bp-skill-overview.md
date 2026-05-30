# BP-SKILL — Business Process Agent Skill Suite

A practitioner introduction to BP-SKILL v0.3 for business analysts and process architects.

---

## What Agent Skills are

Agent Skills are the AI analogue of standard operating procedures. They are SKILL.md files — version-controlled, plaintext instruction sets that an AI agent reads at the start of a session to understand what it should do, when to do it, and what artifacts to produce. The key difference from a prompt template is activation: a skill declares its own trigger conditions, so the agent activates it automatically when the conversation matches — rather than requiring the practitioner to paste in the right prompt at the right moment. The [Agent Skills open standard](https://agentskills.io) (agentskills.io) defines the SKILL.md file format, the frontmatter schema, and the trigger mechanism. BP-SKILL is a domain extension of that standard for business process work.

---

## What BP-SKILL does

BP-SKILL packages the full business process documentation lifecycle as 15 SKILL.md files. The architecture has three layers:

**Skills** — 15 executable instruction sets, one per stage of the process documentation lifecycle. Each skill declares what it consumes, what it produces, and which BABOK/BPM CBOK/APQC standards it satisfies. Skills are portable across any Agent Skills-compatible platform: Claude Code, OpenAI Codex CLI, GitHub Copilot, Gemini CLI, Cursor, VS Code extensions.

**PNS.md** — the central handoff artifact. Process Narrative Specification. Every skill in the pipeline either reads PNS.md, enriches it with new sections, or validates it against a 10-state lifecycle and 9 traceability rules. PNS.md is what turns 15 independent skills into a pipeline.

**Variable Layer** — 9 context files that sit in your repository's `context/` directory. They encode organisation-specific vocabulary, role names, process taxonomy, and compliance requirements so that every skill produces output calibrated to your organisation, not generic boilerplate.

---

## Why bpmn-beta is the visual output layer, not the whole product

Practitioners who encounter this repository through the [live playground](https://okhp3.github.io/mermaid-diagram-bpmn/playground) often assume bpmn-beta is the product. It is one output of one skill. Skill 06 (`visual-process-modeling`) reads a completed PNS.md and produces a bpmn-beta diagram — a text-first BPMN representation in a Mermaid-compatible code fence. The diagram is the deliverable that gets embedded in Confluence, pasted into a GitHub PR, or dropped into a README. Everything upstream of that diagram — discovery, stakeholder mapping, narrative authoring, gap analysis, gap remediation, validation — is handled by the other 14 skills.

---

## The 15 skills

### Layer 1 — Discovery

**01 process-intake-and-scope** [core] — Structured process intake: scope boundary, business objectives, regulatory context, initial stakeholder set. Produces a Process Intake Record (PIR).

**02 stakeholder-and-role-mapping** [core] — Stakeholder identification and RACI pre-assignment. Maps roles to APQC PCF activities. Produces a Stakeholder Register.

**03 elicitation-and-interview-facilitation** [core] — Interview guide generation and facilitation support. Produces structured elicitation notes conforming to BABOK v3 elicitation technique requirements.

### Layer 2 — Narrative

**04 as-is-process-capture** [core] — Converts elicitation notes into a structured as-is process description with numbered activity sequence, decision points, and exception paths.

**05 process-narrative-authoring** [core] — Authors or refines the full PNS.md, populating all 13 required sections from elicitation inputs.

**07 process-gap-and-exception-analysis** [core] — Identifies gaps between as-is and target-state, exception paths not documented in the narrative, and missing handoff points.

**08 future-state-and-change-strategy** [extension] — Documents the target state process and the change approach required to reach it.

**10 process-validation-and-quality-scoring** [core] — Runs the 9 traceability checks (V1-V9) against PNS.md and produces a quality score (0-100) with a defect list.

### Layer 3 — Visual and Decision Modeling

**06 visual-process-modeling** [core] — Converts PNS.md activity sequence into a bpmn-beta diagram. The visual output layer.

**09 decision-model-authoring** [extension] — Documents decision points as DMN 1.4 decision tables with input/output columns and rule rows.

### Layer 4 — Operational

**11 process-measures-and-controls-definition** [extension] — Defines KPIs, SLAs, and internal controls for each process activity.

**12 sop-and-work-instruction-generation** [core] — Generates SOPs and role-level work instructions from the validated PNS.md.

### Layer 5 — Governance

**13 raci-and-governance-matrix-generation** [core] — Produces a full RACI matrix from the activity sequence and stakeholder register.

**14 sipoc-generation** [core] — Generates a SIPOC table (Supplier, Input, Process, Output, Customer) aligned to APQC PCF classification.

### Layer 6 — Publication

**15 publication-and-handoff-packaging** [core] — Packages all outputs for stakeholder review: PNS.md, BPMN diagram, SIPOC, RACI, SOPs, and a publication checklist.

---

## PNS.md as the central handoff artifact

PNS.md is not just a document. It is a typed artifact with a YAML frontmatter schema, a 10-state lifecycle (`draft` through `archived`), 13 required sections, 7 optional sections, and 9 traceability validation rules. Every skill in the pipeline declares whether it reads PNS.md, enriches it, or validates it. This declaration is in the SKILL.md frontmatter (`metadata.consumes` and `metadata.produces`).

The quality scoring skill (10) runs V1-V9 checks against PNS.md and produces a score: 90-100 means publish-ready, 75-89 means minor defects, 50-74 means rework required, below 50 means fundamental gaps. A PNS.md that scores below 75 does not proceed to skills 12-15.

See [docs/pns-schema.md](./pns-schema.md) for the full schema reference.

---

## How the variable layer tailors the suite

Without the variable layer, BP-SKILL produces generic output: role names like "Process Owner" and "Subject Matter Expert", APQC process IDs for cross-industry benchmarking, and notation preferences set to bpmn-beta defaults.

With the variable layer populated, every skill personalises its output. `role-dictionary.md` replaces generic role names with your organisation's actual titles. `process-taxonomy.md` maps your internal process names to APQC PCF codes. `compliance-controls-registry.md` links process activities to your GRC control inventory. `business-glossary-and-rulebook.md` enforces your organisation's controlled vocabulary throughout every output document.

The minimum viable configuration is `organization-profile.md` (company name, industry, regulatory environment) and `role-dictionary.md` (role names and RACI defaults). The remaining 7 files add depth but are optional until the skills that specifically consume them are used.

---

## Where to go next

- **Install the skills:** [docs/agent-skills-install.md](./agent-skills-install.md) — platform-specific install commands for all 6 compatible platforms
- **Understand PNS.md:** [docs/pns-schema.md](./pns-schema.md) — full schema, lifecycle, validation rules, and a worked example
- **Configure the variable layer:** [docs/variable-layer-guide.md](./variable-layer-guide.md) — recommended completion order and field-level reference for all 9 files
- **Browse the skills:** [okhp3.github.io/mermaid-diagram-bpmn/skills](https://okhp3.github.io/mermaid-diagram-bpmn/skills) — interactive browser with downloads
- **Agent Skills standard:** [agentskills.io](https://agentskills.io) — the open standard that BP-SKILL extends
