# bpmn-beta → PNS Reversal Mapping

The inverse of the "PNS → bpmn-beta Mapping" table in
`../../okhp3-visual-process-modeling/SKILL.md`. Read that table first if you
have not already — this document assumes it.

---

## A note on which bpmn-beta grammar this skill parses

`../../okhp3-visual-process-modeling/references/bpmn-beta-syntax.md` documents
a shorthand bracket notation (`(( label ))`, `[ label ]`, `{ label? }`, `-->`,
`~~>`, etc.). That is **not** the grammar the suite's own parser
(`../../okhp3-visual-process-modeling/scripts/validate-bpmn-beta.mjs`) actually
enforces, and it is **not** the grammar any real `.mmd` fixture in this
repository uses — not `app/examples/*.mmd`, not
`evals/bpmn-traceability/*.bpmn-beta.mmd`. Every real file instead uses a
keyword + ID + quoted-label grammar:

```
bpmn-beta
accTitle: Purchase Order Approval
pool po_process "Purchase Order Process" {
  lane requester "Requester" {
    start s1 "PO Request Submitted"
    task:user t1 "Submit PO Request"
  }
  ...
  s1 --> t1
  g1 --> t3: "yes"
}
```

`scripts/reverse-bpmn-beta.mjs` in this package parses **that** grammar —
the one the real parser and real fixtures use — not the shorthand doc. This
is a known, pre-existing inconsistency in this repository between
`bpmn-beta-syntax.md` and `validate-bpmn-beta.mjs` / the actual `.mmd`
corpus; it is not something this skill introduces or should silently paper
over. If `bpmn-beta-syntax.md` is ever corrected to match the parser, or the
parser is changed to accept the shorthand form, this parser and this note
both need to be revisited.

---

## Element mapping table

| bpmn-beta element | PNS field | Recoverable? |
|---|---|---|
| `start <id> "<label>"` | `process_box.trigger` | Yes (first start event; extras logged to `open_questions`) |
| `end <id> "<label>"` | `process_box.outputs[].name` | Yes (name only — `consumer` is not encoded, marked `unrecoverable_from_diagram`) |
| `event:error <id> "<label>"` | `exception_paths[].description` | Partial (description only — `trigger`, `handling`, `escalation_path` are not encoded) |
| `event:message` / `event:timer` | — | Not mapped to a PNS field in this version; recorded in `source_diagram.element_count` only. A future version could map `event:timer` to an SLA hint in `kpis` if the label encodes a duration, but that would be inference beyond what this skill does today. |
| `task <id> "<label>"` / `task:<type> <id> "<label>"` | `activity_sequence.activities[]` (`id`, `description`, `actor_role_id`) | Yes for id/description/actor_role_id. `inputs`, `outputs`, `preconditions`, `postconditions` are not encoded — marked `unrecoverable_from_diagram`. The `:<type>` suffix (`user`, `service`, ...) is carried into `activities[].systems` as an explicit, labelled hint — never promoted to a resolved `systems_and_integrations` entry, because a task-type keyword is not a system name. |
| `xor <id> "<label>"` (exclusive gateway) | `decision_points[]` | Partial — `id`, `description`, `outcomes[].label`/`next_activity` are recoverable from labelled outgoing flows; `criteria` (the actual business rule behind the branch) is not encoded and is marked `unrecoverable_from_diagram`. |
| `or <id> "<label>"` (inclusive gateway) | `decision_points[]` | Same as `xor` — treated identically for reversal purposes since both encode labelled branching. |
| `and <id> "<label>"` (parallel gateway) | **Not emitted as a `decision_points[]` entry** | An AND split/join is a concurrency construct, not a business decision — it has no "outcome" in the PNS sense (all branches execute, none is chosen). Emitting it as a `decision_points[]` entry with fabricated outcome labels would misrepresent parallel execution as a business rule. The script instead logs a warning naming each parallel gateway found. |
| `pool <id> "<name>"` | `roles_and_raci.roles[]` (fallback level) | Used only when a task has no lane (flat-pool diagram) |
| `lane <id> "<name>"` | `roles_and_raci.roles[]` (`role_id`, `role_name`) | Yes — lane name is the direct source of a role |
| lane a task sits in | `activity_sequence.activities[].actor_role_id`, `roles_and_raci.raci_matrix[].responsible` | Yes — this is the one part of RACI a diagram genuinely encodes: who performs the task |
| (derived, not encoded) | `roles_and_raci.raci_matrix[].accountable` | **Inferred placeholder only**, set equal to the lane-derived role and flagged `accountable_confidence: "inferred_from_lane_placeholder"`. A diagram does not distinguish "does the work" from "is accountable for the outcome" — do not treat this as a confirmed governance decision. |
| `a --> b` | sequencing (used to order `activity_sequence.activities[]` and locate the nearest upstream task for a gateway's `activity_id`) | Structural only — not itself a PNS field |
| `a --> b: "label"` | `decision_points[].outcomes[]` when `a` is a gateway | See gateway rows above |
| `a ==> b` (default flow) | sequencing, same treatment as `-->` | — |
| `a ~~> b` (message flow, top-level only) | Not mapped to a PNS field in this version | Cross-pool message flows hint at `roles_and_raci`/handoff structure the canonical PNS schema calls "handoff and transition points" in `docs/pns-schema.md`'s prose model, but the schema shape this skill's fixtures and sibling skills actually consume (see below) has no dedicated handoff section — recording message flows would require inventing a section, which this skill's design explicitly avoids. Left as a documented gap, not silently dropped: a future version could add an optional, clearly-marked `handoffs` block once a schema note authorizes it. |
| `# pns:<id>` trace comment preceding a node | that node's PNS `id` (instead of a fresh diagram ID) | Yes — this is exactly the round-trip convention `okhp3-visual-process-modeling` writes when it *generates* a diagram from a PNS. When present, the original PNS ID is recovered; when absent (a diagram authored by hand, not generated from a PNS), the diagram's own element ID is used instead. |

## Sections with nothing to map (present, empty, explicitly flagged)

These `pns.yaml` sections are always emitted, always structurally valid
(empty array, or an object with `null` fields), and always paired with an
explicit `..._unrecoverable_from_diagram` marker — never silently omitted,
never filled with invented content:

- `business_rules` — a diagram shows *that* a gateway branches, never *why*.
- `kpis` — cycle time targets, formulas, and data sources are never encoded.
- `systems_and_integrations` — a `task:service` keyword is a hint, not a
  resolved system name; this skill does not promote hints to fabricated
  system records.
- `controls_and_compliance` — approval authority and compliance references
  are governance facts, not diagram facts.
- `babok_core_concepts` — change/need/solution/stakeholders/value/context are
  narrative judgments a diagram cannot carry.

`open_questions` is populated (not left empty) with one entry per gap above,
plus one entry per ambiguity actually found in the parsed diagram (e.g.
multiple start events). This is the intended use of that section per
`docs/pns-schema.md` Section 12 / the narrative-authoring skill's own
guidance to "record gaps: do not invent content."

## Which pns.yaml shape this skill targets

This repository has at least three descriptions of "the PNS schema" that
diverge from each other in field names and section count:

1. `docs/pns-schema.md` — a 10-state lifecycle, prose-section (H2 headings
   like "Process Identification", "Business Context") Markdown model.
2. `../../okhp3-process-narrative-authoring/references/pns-schema.md` — a
   shorter, 9-state-lifecycle variant.
3. The field names actually documented in
   `../../okhp3-process-narrative-authoring/SKILL.md` ("PNS Structure — 13
   Required Sections": `process_box`, `activity_sequence`, `roles_and_raci`,
   `business_rules`, `decision_points`, `exception_paths`, `kpis`,
   `systems_and_integrations`, `controls_and_compliance`, `open_questions`,
   `babok_core_concepts`, `revision_history`, `validation`) and used verbatim
   in its own `assets/fixtures/pns-example.yaml`, and in the field names every
   consuming skill's own fixtures already reference (`decision-model-authoring`,
   `raci-governance-matrix`, `process-measures-controls`, etc.).

This skill's reversal targets **(3)** — the shape the real fixtures and real
downstream skills already parse — because the task this skill exists for is
"produce something the other seven skills can consume today," not "produce
something that matches an aspirational prose document nothing else reads."
This divergence between (1)/(2) and (3) predates this skill and is not
something it attempts to fix; a future schema-reconciliation pass is a
project-level follow-up, not something to resolve unilaterally inside one
reversal skill.

## Recommended follow-up, not built here

`process_box` is the one PNS section this skill populates only partially
(`trigger`, `outputs[].name`) even though a diagram carries more implicit
process-boundary information than it currently expresses in text form — for
example, cross-pool message flows and pool names imply a scope statement.
Rather than inferring that scope statement (which would blur the line
between "encoded" and "guessed"), a cleaner fix is upstream: a future version
of `okhp3-visual-process-modeling` (the forward skill) could emit extra
non-visual PNS fields as Mermaid `%%{ ... }%%` init-block directives or `%%`
comments when it *generates* a diagram from a PNS — e.g. `process_box.risks`,
`kpis`, or `controls_and_compliance` entries encoded as machine-readable
comments the renderer ignores but a reversal parser could recover verbatim.
That would let a diagram round-trip far more completely than structural
inference alone ever can.

**This is out of scope for this skill.** It requires a change to
`okhp3-visual-process-modeling` (skill 06), not this skill (16), and is
recorded here only as a documented recommendation for whoever picks up that
work next.
