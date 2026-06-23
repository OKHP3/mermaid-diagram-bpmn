# Output Format Selection

TOC for Phase 1 authoring.

## Default: .mmd file
- [ ] Standalone source file, named per core's naming-conventions.md pattern

## Fenced block (embed)
- [ ] Triggers: user says "embed", "add to docs", "in the README", or the target file is already `.md`
- [ ] Fenced ` ```mermaid ` block inserted at the appropriate location in the target file

## Both
- [ ] When source-of-truth `.mmd` + embedded preview are both wanted (e.g., `.mmd` for editing/re-rendering, `.md` with embed for GitHub preview) — matches the dual-output pattern seen in one reviewed community skill (figures/<name>.mmd + figures/<name>.md with identical content)

## Format vs. MCP publish
- [ ] These are orthogonal — a diagram can be both a local `.mmd` file AND published via MCP. Output format selection happens regardless of publish path.
