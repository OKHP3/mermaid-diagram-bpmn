---
name: okhp3-mermaid-update
description: Style-preserving update of an existing Mermaid diagram. Use when the user provides an existing .mmd file (or fenced Mermaid block) and a change request — new nodes, revised labels, added edges, restructured flow, or changed content — and the goal is to apply the minimum diff required without touching the diagram's style configuration, classDef declarations, or init block. Load okhp3-mermaid-core first for audience/type context. Do NOT use this skill for syntax repair (broken parse) — use okhp3-mermaid-repair for that.
---

# OKHP3 Mermaid Update

Applies targeted changes to an existing diagram while preserving everything the original author intentionally configured: style, theme, class definitions, and structural conventions.

## 1. Receive and Parse the Existing Diagram

Take the full `.mmd` source as input. Identify and preserve (do not touch) the following before making any changes:

- `%%{init}%%` configuration block (theme, themeVariables, renderer config)
- All `classDef` declarations
- All `class <nodeID> <className>` assignments
- Diagram type declaration (first line: `flowchart LR`, `graph TD`, `sequenceDiagram`, etc.)
- All existing node IDs — do not reassign or renumber existing nodes

If any of these are missing or malformed, stop and flag the issue before proceeding. Do not silently normalize a governance profile during an update pass.

## 2. Understand the Change Intent

Before touching the diagram, restate in plain language:

- What is being added, changed, or removed
- Which nodes/edges are affected
- Whether the change affects diagram type, direction, or swim lane structure

If the change intent is ambiguous, ask one clarifying question. Proceeding with a wrong interpretation on a style-sensitive diagram is worse than a one-question delay.

## 3. Apply the Minimum Diff

Make only the changes required to satisfy the stated intent.

- Add new nodes using the same ID convention as existing nodes (check `references/naming-conventions.md` in `okhp3-mermaid-core`)
- Assign `classDef` classes to new nodes consistent with the existing class assignment pattern
- Do not rename, restructure, or reorder unchanged nodes
- Do not reformat or reindent unchanged sections
- Do not alter the `%%{init}%%` block
- Do not alter existing `classDef` declarations unless the update explicitly targets them

The goal is a diff that is reviewable. A change that modifies 2 nodes should not produce a 30-line diff.

## 4. Re-run All Three Validation Gates

Per `okhp3-mermaid-core` — all gates apply to updates, not just to new diagrams.

**Gate 1 — Syntax.** The updated `.mmd` must parse without error via `okhp3-mermaid-publish`'s render pipeline. If unavailable, flag manual Mermaid Live validation explicitly.

**Gate 2 — Semantic.** The updated diagram correctly represents the post-change intent. Verify: are all new entities present, are all removed entities absent, are arrow directions correct, do gateway conditions still account for all stated paths?

**Gate 3 — Audience Fit.** The update has not changed the diagram's audience fit. Adding 6 new nodes to an Executive-tier diagram fails this gate regardless of syntactic correctness.

## 5. Deliver and Register

Output the complete updated `.mmd` source (not a diff). The user receives a ready-to-use file.

Update the `DIAGRAMS.md` registry entry for this diagram: increment the version (`v1` → `v2`), note the change summary. Per `okhp3-mermaid-core/references/naming-conventions.md`.

If the diagram was previously published via Mermaid Chart MCP, note that a re-publish is needed and hand off to `okhp3-mermaid-publish`.

## What this skill does not do

- Does not repair broken syntax — route to `okhp3-mermaid-repair`
- Does not change governance profiles or classDef definitions unless explicitly instructed
- Does not produce new diagrams from scratch — route to `okhp3-mermaid-core`
- Does not select diagram types — route to `okhp3-mermaid-core` if the update requires a type change
