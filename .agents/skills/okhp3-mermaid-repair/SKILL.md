---
name: okhp3-mermaid-repair
description: Syntax repair for broken Mermaid diagrams. Use when a .mmd file or fenced Mermaid block fails to parse — mmdc reports errors, Mermaid Live shows red, or the rendered output is visually malformed. Diagnoses the parse failure, applies the minimum fix, and re-runs Gate 1 (syntax validation). Does not restructure, restyle, relabel, or redesign. Does not change content. Load okhp3-mermaid-core first. For intentional content changes to a working diagram, use okhp3-mermaid-update instead.
---

# OKHP3 Mermaid Repair

Fixes broken Mermaid syntax using minimum intervention. The diagram after repair is semantically identical to the diagram before repair. Only syntax changes.

## 1. Receive the Broken Diagram

Take the full `.mmd` source as input. Also take the error message from mmdc or Mermaid Live if available — it contains the line number and failure mode, which is faster than manual diagnosis.

Do not attempt to improve, restructure, or normalize the diagram during a repair pass. The input is the reference. The repair output should be as close to the input as possible.

## 2. Diagnose the Failure

Common parse failure categories and their minimum fixes:

**Reserved keyword used as node ID or label.**
Most common: `end` used as a node ID. Fix: rename to `endNode`, `finish`, or any non-reserved token. Do not reassign other nodes to compensate.

**Unquoted label containing spaces or special characters.**
Fix: wrap the label in double quotes. Do not change the label text.

**Semicolons after statements.**
Fix: remove the semicolons. Do not change anything else on the affected lines.

**`classDef` or `class` assignment referencing an undefined class.**
Fix: either define the missing class or remove the undefined assignment. Do not change the class definitions that are already present.

**Mismatched `subgraph` / `end` pairs.**
Fix: add the missing `end` or remove the orphaned `end`. Do not restructure the swim lane logic.

**HTML in labels on a renderer that does not support it.**
Fix: convert to plain text equivalent. Do not change the semantic content of the label.

**`%%{init}%%` block malformed JSON.**
Fix: correct the JSON syntax. Do not alter the values inside the config block.

**Diagram type keyword on the wrong line.**
Fix: move the type declaration to line 1. Do not alter the diagram body.

If the failure mode does not match any of these patterns, describe the error and the affected line(s) before attempting a fix. Attempting a repair without understanding the failure mode often introduces new failures.

## 3. Apply the Minimum Fix

Change only what is broken. Everything else in the diagram — node IDs, labels, edges, classDef declarations, the `%%{init}%%` block, swim lane structure, class assignments — is preserved exactly.

If the minimum fix requires a judgment call (e.g., two possible interpretations of a malformed label), state both options and apply the one that preserves the most of the original intent. Note the judgment call in the output.

## 4. Re-run Gate 1

The repaired `.mmd` must parse without error via `okhp3-mermaid-publish`'s render pipeline. If unavailable, flag manual Mermaid Live validation explicitly.

Gate 1 is the only gate that applies to a pure syntax repair. Gate 2 (semantic) and Gate 3 (audience fit) do not apply because the content has not changed. If in doubt — if the repair changed anything beyond syntax — run all three gates.

## 5. Document the Repair

State clearly:
- What was broken (failure mode + affected line)
- What was changed (the minimum fix applied)
- What was not changed (confirmation that classDef, init config, labels, and structure are intact)

This is the complete output. Do not add style improvements, layout suggestions, or refactoring notes. That work belongs in `okhp3-mermaid-update`, initiated separately.

## What this skill does not do

- Does not change diagram content, labels, or structure
- Does not apply new styles or modify classDef declarations
- Does not redesign or improve the diagram
- Does not handle intentional content updates — route to `okhp3-mermaid-update`
- Does not produce new diagrams from scratch — route to `okhp3-mermaid-core`
