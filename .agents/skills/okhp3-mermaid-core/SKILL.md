---
name: okhp3-mermaid-core
description: Foundation skill for ALL Mermaid diagram work. Load this first for any task involving Mermaid syntax, diagrams, flowcharts, process maps, architecture sketches, or visualizing relationships/workflows/structures. Handles audience declaration, diagram type selection across all 27 current Mermaid types (stable and beta), the OKHP3 design system, file naming and the diagram registry, and the three-gate validation framework. Routes to okhp3-mermaid-bpmn, okhp3-mermaid-architecture, or okhp3-mermaid-data for domain-specific vocabulary, and to okhp3-mermaid-publish for rendering/output.
---

# OKHP3 Mermaid Core

Foundation for the Mermaid family. Every Mermaid task starts here, even if it ends in a domain skill.

## 1. Audience Declaration (do this first)

Before generating anything, determine the audience. If not stated, ask one question: Executive, Analyst, or Technical? See `references/audience-profiles.md` for what each implies (node count, detail level, vocabulary).

A diagram produced for the wrong audience is a design failure independent of syntax correctness.

## 2. Type Selection

Consult `references/type-selection-matrix.md`. It catalogs all 27 current Mermaid diagram types (stable + beta, as of v11.15) with OKHP3 disposition: core-handled, routed to a domain skill, or explicitly excluded with rationale.

If the matrix routes to a domain skill (bpmn / architecture / data), load that skill's SKILL.md now for the type-specific syntax and patterns. Core handles selection and theming; domain skills handle vocabulary.

## 3. Design System

Apply OKHP3 theming per `references/design-system.md`. Every `classDef` sets `fill`, `stroke`, AND `color` — no exceptions, this is the single most common cause of dark/light-mode failures in community skills reviewed.

## 4. Naming & Registry

File naming and the `DIAGRAMS.md` registry pattern are defined in `references/naming-conventions.md`. Every diagram produced gets a registry entry. Orphaned files are a defect.

## 5. Validation — Three Gates (mandatory)

**Gate 1 — Syntax.** Render via `okhp3-mermaid-publish`'s render pipeline (mmdc). If unavailable, flag manual Mermaid Live validation explicitly.

**Gate 2 — Semantic.** Re-read the rendered output against the original request. Are all named entities present? Do arrow directions match the described causality (A causes B, not the reverse)? Do gateway/branch conditions account for everything stated? Syntax-valid output that misrepresents the process is a failure Gate 1 cannot catch.

**Gate 3 — Audience Fit.** Check against the declared profile from Step 1 (`references/audience-profiles.md`). An Executive diagram with 18 nodes and full attribute labels fails this gate even if Gates 1 and 2 pass.

All three gates pass before output is delivered.

## 6. Output & Publish

Hand off to `okhp3-mermaid-publish` for rendering and (if available) Mermaid Chart MCP publishing. Never delete a rendered artifact — the output is the deliverable, not a temporary file.

## Excluded types (do not use, with rationale)

Pie charts, XY charts, and Git graphs. See `references/type-selection-matrix.md` for the full disposition table and reasoning per type.
