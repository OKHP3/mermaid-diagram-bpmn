---
name: okhp3-mermaid-bpmn
description: BPMN-informed business process modeling in Mermaid. Use whenever the user wants to diagram a business process, workflow, approval chain, decision/gateway logic, swim lanes, cross-department handoffs, onboarding flows, procurement flows, or anything describable as "who does what, in what order, with what decision points." This is the differentiator no community Mermaid skill covers — BPMN vocabulary (gateways, events, tasks, swim lanes, subprocesses) does not exist in mgranberry, WH-2099, softaworks, or Agents365's skills. Always load okhp3-mermaid-core first for audience/type/theming, then this skill for BPMN vocabulary and patterns.
---

# OKHP3 Mermaid BPMN

BPMN 2.0-informed semantics, expressed in Mermaid syntax. Loaded after `okhp3-mermaid-core` has handled audience declaration and type selection.

## Swim Lanes

Encoded via `subgraph` per lane (department/role), with `direction` set per lane to control internal flow. See `references/swimlane-layouts.md` for horizontal vs. vertical lane patterns and crossing-reduction specific to multi-lane diagrams.

## Gateways

Four types, each with a distinct visual encoding (node shape/style, not just a label):

- **Exclusive (XOR)** — one path taken, mutually exclusive conditions
- **Parallel (AND)** — all paths taken simultaneously
- **Inclusive (OR)** — one or more paths taken based on conditions
- **Event-based** — path determined by which event occurs first

Full encoding patterns, including how to label branch conditions for Analyst-tier diagrams, in `references/gateway-patterns.md`.

## Events

Start, intermediate, end, timer, message, error, signal, terminate. Each gets distinct node styling (not just different labels) so the diagram is isomorphic to BPMN semantics even when read by someone who knows BPMN notation. Catalog in `references/bpmn-elements.md`.

## Tasks

User task, service task, script task, send/receive task. Distinct shapes per type — this is what makes a diagram "argue" rather than "display" (per the core design philosophy). Catalog in `references/bpmn-elements.md`.

## Subprocesses

Collapsed (single node, expandable) vs. expanded (inline detail) vs. call activity (reference to a separate diagram). When a subprocess becomes its own diagram, register the cross-reference in `DIAGRAMS.md` (per core's naming-conventions.md) and note it on both diagrams. Patterns in `references/subprocess-patterns.md`.

## Annotations & Associations

Text annotations and dashed association lines for adding context without implying flow. Catalog in `references/bpmn-elements.md`.

## Process instance vs. process definition

Be explicit about which is being diagrammed. A process *definition* shows all possible paths; a process *instance* shows one actual run through it. Mixing these in one diagram is a common source of Gate 2 (semantic) failures.

## Worked examples

`references/process-examples/` contains validated `.mmd` examples (approval-flow, onboarding, procurement) once authored. Currently empty — Phase 1 deliverable.
