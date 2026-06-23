---
name: okhp3-mermaid-publish
description: Rendering, exporting, and publishing finished Mermaid diagrams. Use after a diagram has passed okhp3-mermaid-core's three validation gates and needs to become a viewable artifact — local PNG/SVG render, embedding in a .md file, or publishing via the Mermaid Chart MCP for a shareable link. NEVER deletes rendered output; the render IS the deliverable.
---

# OKHP3 Mermaid Publish

The output layer. Runs after core's Gate 1-3 validation.

## Local Render

Use `references/render-pipeline.sh <path.mmd> [output.png]`. The script:

- Checks for Node.js/npx and gives a clear, actionable error if missing — it does NOT fail silently or produce a confusing mmdc stack trace as the only signal
- Runs `npx --yes @mermaid-js/mermaid-cli` (downloads mmdc ephemerally on first use, ~30s)
- Never deletes the input `.mmd` or the output render. This directly addresses a defect found in mgranberry's community skill, which instructs deletion of "temporary" output after user approval — the rendered file is the deliverable, not scratch space

If the script reports mmdc syntax errors, return to `okhp3-mermaid-core` Gate 1 — do not attempt to patch syntax here, this skill only renders.

## MCP Publish (Mermaid Chart)

If the Mermaid Chart MCP connector is available, this is the preferred publish path for diagrams that need a shareable link (vs. a local file only). See `references/mcp-publish-workflow.md` for the check-then-publish sequence and how to capture the resulting share link back into `DIAGRAMS.md` (per core's naming-conventions.md registry pattern).

If the MCP is not connected, fall back to local render and note in the registry that the diagram is local-only.

## Output Format Selection

Three output shapes — `.mmd` file, fenced ` ```mermaid ` block in a `.md` file, or both (source + embed). See `references/output-formats.md` for the selection logic (default `.mmd`; fenced block when user says "embed"/"add to docs"/"README", or target is already a `.md` file).

## Privacy

Never route diagram source through third-party rendering APIs (e.g., Kroki) without explicit user consent. This is a known issue in at least one reviewed community skill — diagram content may be proprietary, and a silent cloud fallback is a data governance failure, not a convenience.
