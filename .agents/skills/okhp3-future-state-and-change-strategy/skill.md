---
name: future-state-and-change-strategy
description: Design a target-state process and a structured change strategy from a gap analysis. Use this skill when the user wants to redesign a process after gaps have been identified; when they ask "what should the process look like", "how do we fix this", "design the to-be process", or "build a change plan". Produces a future-state process artifact and a change strategy document. This is a recommended extension skill — use after process-gap-and-exception-analysis has produced a gap analysis. Scope firewall applies: never include employer-proprietary constraints without explicit user authorisation.
license: MIT
homepage: https://github.com/overkillhill/mermaid-diagram-bpmn/tree/main/skills/future-state-and-change-strategy
repository: https://github.com/overkillhill/mermaid-diagram-bpmn
metadata:
  bp_skill_version: "0.3.0"
  status: recommended-extension
  version: "0.1.0"
  author: OverKill Hill P³
  project: "BP-SKILL: Business Process Agent Skill Suite"
  category: process-improvement
  standards_refs:
    - "BPM CBOK v4 §7 (Process Transformation)"
    - "BABOK v3 §7.5 (Recommend Actions to Increase Solution Value)"
    - "Kotter 8-Step Change Model"
    - "ADKAR Change Management Model"
  produces: "future-state.yaml, change-strategy.md"
  consumes: "gap-analysis.yaml"
  depends_on: ["process-gap-and-exception-analysis"]
  tags: future-state, to-be-process, change-strategy, process-redesign, transformation, ADKAR, Kotter, BPM-CBOK
  triggers:
    - design the future state
    - to-be process
    - change plan
    - redesign the process
    - improvement strategy
    - fix the gaps
    - target state
    - change management
---

## Purpose

Design the target-state (to-be) process and a structured change strategy based on gap analysis findings. The future-state artifact documents the intended process design; the change strategy documents how to get there.

---

## When to use this skill

- `gap-analysis.yaml` exists with at least one `critical` or `major` gap
- User wants to redesign a process based on identified gaps
- User needs a change management plan to accompany process redesign
- Preparing the target-state PNS input for `process-narrative-authoring`

## When NOT to use this skill

- No gap analysis exists — run `process-gap-and-exception-analysis` first
- User wants to document only the current state — use `as-is-process-capture`
- Scope firewall: do not include confidential employer constraints, proprietary system names, or commercially sensitive process details without explicit user instruction

---

## Scope Firewall

This skill operates on process abstractions. Before authoring the future state:
- Confirm all described gaps are based on user-provided information
- Do not infer proprietary business rules from industry knowledge without flagging them as assumptions
- Flag all assumed constraints with `confidence: assumed` in the future-state YAML
- Do not include employer-identifying details in any generated artifact

---

## Future-State Design Workflow

### Step 1 — Prioritise gaps

Rank gaps from `gap-analysis.yaml` by severity: `critical → major → minor → observation`.

Focus the future-state design on resolving all critical and major gaps.

### Step 2 — Design to-be steps

For each resolved gap, define the replacement or new step:
- State the intended action in a single imperative statement
- Assign a named role (not a person)
- Define entry and exit criteria
- Specify any system or tool involved

### Step 3 — Validate completeness

Check the future-state design covers:
- All structural gaps (missing steps, unowned activities)
- All exception gaps (undefined handling, missing escalation)
- All compliance gaps (absent controls, missing segregation)

### Step 4 — Define change approach

For each major change, define:
- `change_type` — add | remove | modify | automate | transfer
- `effort` — low | medium | high
- `risk` — low | medium | high
- `dependencies[]` — other changes that must happen first
- `owner_role` — who is responsible for implementing this change

### Step 5 — Draft change strategy

Structure the change strategy document with:
1. **Change summary** — what is changing and why
2. **Stakeholder impact** — who is affected, how significantly
3. **Transition plan** — sequence and timeline for changes
4. **Risk register** — what could go wrong during transition
5. **Communication plan** — how and when to inform each stakeholder group
6. **Success criteria** — how to know the change has landed

---

## Output Schema

`future-state.yaml` contains:
- `process_id` — matches PIR `process_id`
- `future_state_version` — "0.1-draft" initially
- `design_date`, `designed_by_role`
- `resolved_gaps[]` — each gap from `gap-analysis.yaml` with its resolution
- `to_be_steps[]` — `id`, `description`, `actor_role_id`, `systems[]`, `confidence`
- `open_assumptions[]` — assumed constraints flagged for user confirmation
- `change_items[]` — each with `change_type`, `effort`, `risk`, `dependencies[]`, `owner_role`

---

## Handoff Instruction

Pass `future-state.yaml` to `process-intake-and-scope` or `process-narrative-authoring` to create the target-state PNS. The future-state steps map directly to `activity_sequence.activities[]` in the new PNS.

---

## References

Load on demand:
- `references/change-strategy-framework.md` — change type taxonomy, effort/risk classification, ADKAR and Kotter alignment, and scope firewall rules

## Scripts

- `scripts/generate-future-state.mjs` — scaffolds future-state YAML from gap-analysis input

## Assets

- `assets/fixtures/future-state-example.yaml` — canonical future-state design for purchase-approval process
