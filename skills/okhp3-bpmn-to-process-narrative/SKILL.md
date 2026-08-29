---
name: okhp3-bpmn-to-process-narrative
description: "Reconstruct a traceable draft Process Narrative Specification from a textual bpmn-beta diagram. Use when a Mermaid BPMN source file exists and its narrative was lost or never authored, or when recovering activity sequence, decisions, and lane-derived ownership from diagram text. Preserve source IDs and mark unsupported fields such as KPIs, controls, rule rationale, and true RACI accountability as unrecoverable instead of inventing them. Do not use for rendered PNG/SVG or hand-drawn diagrams; route those to a vision-capable workflow. Route diagram-derived output to okhp3-bpmn-recoverability-audit before elicitation or publication."
license: "MIT"
compatibility: "Reading a bpmn-beta.mmd file and reconstructing the PNS sections by hand needs no special runtime. scripts/reverse-bpmn-beta.mjs needs a JavaScript runtime that executes ES modules (Node.js); no minimum version is pinned in this repository. If it cannot run, parse the diagram by hand against references/reversal-mapping.md and say so in your output rather than presenting an unrun reversal's results as machine-verified."
metadata:
  bp_skill_version: "0.3.0"
  status: "recommended-extension"
  version: "0.1.0"
  author: "OverKill Hill P³"
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: "process-diagramming"
  standards_refs: "BPMN 2.0.2 Descriptive Conformance Sub-Class (OMG formal/2013-12-09); Mermaid 11.x External Diagram API; BPM CBOK v4 §6 (Process Modeling); BABOK v3 §7.2 (business analysis scope)"
  produces: "pns.yaml, pns.md"
  consumes: "bpmn-beta.mmd"
  tags: "bpmn, mermaid, bpmn-beta, reverse-modeling, process-narrative, pns, provenance, reconstruction, diagram-to-narrative"
  triggers: "reverse this BPMN diagram into a PNS; reconstruct the process narrative from this diagram; convert bpmn-beta back to pns.yaml; what process does this diagram encode; recover activities from this bpmn-beta file; diagram-derived PNS; turn this .mmd into a process document"
  homepage: "https://github.com/OKHP3/mermaid-diagram-bpmn/tree/main/skills/okhp3-bpmn-to-process-narrative"
  repository: "https://github.com/OKHP3/mermaid-diagram-bpmn"
---

# okhp3-bpmn-to-process-narrative

**BP-SKILL: Business Process Agent Skill Suite** · part of [mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn) · OverKill Hill P³

---

## Purpose

Reconstruct a Process Narrative Specification from an existing Mermaid-native `bpmn-beta` diagram. This is the exact structural mirror of `okhp3-visual-process-modeling` (which goes `pns.yaml -> bpmn-beta.mmd`), run in the opposite direction: `bpmn-beta.mmd -> pns.yaml`.

A `bpmn-beta` diagram encodes real structure — tasks, gateways, lanes, flows — but it does not encode why a business rule exists, what a KPI target is, who is truly accountable versus merely performing a task, or what controls govern the process. This skill recovers everything the diagram genuinely supports and marks everything it does not as explicit, never invented.

---

## When to use this skill

- A `bpmn-beta.mmd` diagram exists and its originating PNS is missing, lost, or was never authored
- The user wants to inspect, document, or recover the process narrative encoded in an existing diagram file
- Preparing a first-draft PNS skeleton to hand to a human SME for elicitation, rather than starting from a blank page

## When NOT to use this skill

- **The input is a rendered image (PNG/SVG), a screenshot, or a hand-drawn diagram — not this skill.** This skill parses the project's own `bpmn-beta` DSL TEXT/grammar only (the `.mmd` source file: pools, lanes, tasks, gateways, events, sequence/message flows). It does not do vision, image, or OCR parsing of a rendered diagram from outside this project. That is out of scope here and would need a distinct, vision-capable host — a possible future skill, not this one.
- A validated PNS already exists for this process: there is nothing to reconstruct — use the existing `pns.yaml` directly
- The user wants a fresh diagram generated from a narrative (the forward direction): use `okhp3-visual-process-modeling` instead
- The user wants full elicitation-quality governance content (real RACI, KPI targets, control rationale): a diagram cannot provide this — route to `okhp3-elicitation-interviews` after this skill's first-draft output, not instead of it

---

## bpmn-beta → PNS Mapping

| bpmn-beta element | PNS field | Recoverable? |
|---|---|---|
| `start <id> "<label>"` | `process_box.trigger` | Yes |
| `end <id> "<label>"` | `process_box.outputs[].name` | Partial — `consumer` is not encoded |
| `task <id> "<label>"` / `task:<type>` | `activity_sequence.activities[]` | Partial — `id`/`description`/`actor_role_id` yes; `inputs`/`outputs`/pre/postconditions no |
| `xor` / `or` gateway | `decision_points[]` | Partial — outcome labels yes; `criteria` (the actual rule) no |
| `and` gateway (parallel) | **not emitted as a decision point** | A concurrency construct, not a business decision — see `references/reversal-mapping.md` |
| `lane <id> "<name>"` | `roles_and_raci.roles[]`, `activities[].actor_role_id` | Yes — the one RACI fact a diagram genuinely encodes is who performs a task |
| `event:error` | `exception_paths[].description` | Partial — description only |
| `# pns:<id>` trace comment | recovered PNS ID for that node | Yes, when present (the convention `okhp3-visual-process-modeling` writes when generating a diagram) |

Full field-by-field table, including flows and message flows, in `references/reversal-mapping.md`.

---

## Provenance tagging, not schema-breaking

This skill does **not** invent a new required PNS section or a new lifecycle status value — doing so would break the seven existing skills that already consume `pns.yaml` untouched (`okhp3-sop-work-instructions`, `okhp3-raci-governance-matrix`, `okhp3-sipoc-generation`, `okhp3-decision-model-authoring`, `okhp3-process-measures-controls`, `okhp3-publication-handoff-packaging`, and `okhp3-process-narrative-authoring` itself), which is the entire architectural point of reusing those skills for free instead of building seven parallel diagram-native versions of them.

Instead, this skill adds one **optional** field:

```yaml
narrative_provenance: "diagram-derived"
```

The implicit default for any PNS produced the normal way (intake → elicitation → `okhp3-process-narrative-authoring`) is `"elicitation-derived"` — that value is never written explicitly by the normal pipeline today, it is simply what the absence of this field has always meant. This skill is the first to write the field at all.

**This field addition is documented here, not silently patched into `docs/pns-schema.md`.** That file is shared infrastructure used by every skill in the suite; a single reversal skill editing it unilaterally would be its own kind of scope violation. `references/reversal-mapping.md` carries a maintainer note recommending that a future documented schema-note formally add `narrative_provenance` to the canonical schema reference — flagged once here, actioned by whoever owns that document next.

---

## Execution contract (hard rules for what this skill may and may not fill in)

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision. When a `# pns:<id>` trace comment is present on a diagram node, use that recovered ID; only fall back to the diagram's own element ID when no trace comment exists.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them. Concretely: **every PNS section you cannot derive from the diagram (KPIs and their formula/data_source, controls-and-compliance detail, business-rule rationale, and a true multi-role RACI) must still be present in the output, marked `unrecoverable_from_diagram: true` or left explicitly null with an inline note — never silently omitted, and never fabricated to fill the gap.**
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

If `scripts/reverse-bpmn-beta.mjs` cannot run, walk the diagram by hand against `references/reversal-mapping.md` and state in the output that automated reversal was not run.

---

## Known limitations (expected, not bugs)

- **The V8 gate in `okhp3-process-validation-scoring` will fail for a diagram-derived PNS, by design.** That gate is `error` severity and requires a `pir.yaml` with `completeness_score >= 70` and `ready_for_narrative: true` (see `okhp3-process-validation-scoring/SKILL.md`). A diagram-derived PNS has no upstream `pir.yaml` — there was no intake stage — so V8 fails by construction, not because the reconstruction is defective. **Do not route a diagram-derived PNS through the standard `okhp3-process-validation-scoring` gate.** Instead hand it to the sibling `okhp3-bpmn-recoverability-audit` skill for a completeness assessment appropriate to a diagram-sourced artifact.
- The normal narrative-authoring V1 and V3 checks will also fail against a fresh diagram-derived output when they require elicitation-backed concepts or confirmed accountability. This is disclosed here rather than worked around by inventing plausible-sounding narrative content.
- A diagram with no pool/lane structure (a flat process) yields a single placeholder role (`role-unassigned-lane`) for every activity — this is reported as a warning, not silently absorbed.
- Multiple start events in one diagram are only partially handled: the first is used as `process_box.trigger`; the rest are recorded as an `open_questions` entry for a human to resolve.

---

## Handoff instruction

Pass the reconstructed `pns.yaml` to a human reviewer or to `okhp3-elicitation-interviews` to close the `open_questions` this skill raises — never straight to `okhp3-process-validation-scoring` (see Known limitations). Once genuinely elicited and validated (score ≥ 70/75 per the normal pipeline), the resulting `pns.yaml` can flow through the rest of the suite exactly as any other PNS would, including back through `okhp3-visual-process-modeling` for a clean, `# pns:`-traced regeneration of the diagram.

---

## References

Load on demand:
- `references/reversal-mapping.md`: complete bpmn-beta-element → PNS-field mapping table (inverse of `okhp3-visual-process-modeling`'s forward table), including the grammar-divergence note and the recommended (not-built-here) follow-up for richer round-tripping

## Scripts

- `scripts/reverse-bpmn-beta.mjs`: parses a `.mmd` file per the DSL grammar the suite's real parser and real fixtures use; exports `parseBpmnBeta`, `reverseBpmnBeta`, `toYaml`, and `toMarkdown`. CLI usage: `node scripts/reverse-bpmn-beta.mjs <file.mmd> [--out-yaml pns.yaml] [--out-md PNS.md]`

## Assets

- `assets/fixtures/reversed-pns-example.yaml`: a real worked example — the actual output of reversing `app/examples/08-purchase-order-approval.mmd` in this repository, not a hand-constructed approximation

## Evaluation and release status

The package includes normal, loss-boundary, and malformed-source cases in
`evals/evals.json`. `tests/validate-skill.test.mjs` checks frontmatter shape,
file presence, exported reversal behavior, and the diagram-derived fixture.
Evidence status is `live` for structural/test correctness and `not-run` for a
with-skill/without-skill uplift benchmark or protected release holdout.

Version 0.1.0 is the initial release. This is a new skill, not a revision of an existing one, so it starts at 0.1.0 per this repository's versioning convention rather than any patch/minor/major bump.

---

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3/mermaid-diagram-bpmn](https://github.com/OKHP3/mermaid-diagram-bpmn)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
