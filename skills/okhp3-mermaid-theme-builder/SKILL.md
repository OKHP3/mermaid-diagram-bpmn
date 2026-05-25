---
name: okhp3-mermaid-theme-builder
description: Apply reusable visual governance to Mermaid diagrams. Use this skill when the user wants to style, theme, normalize, validate, or export Mermaid code with palettes, themeVariables, classDefs, renderer-safe compatibility notes, Markdown bootstrap blocks, AI prompt scaffolds, or target-renderer output profiles. Also use when a user pastes Mermaid code and asks for consistent or on-brand output.
license: MIT
metadata:
  bp_skill_version: "0.2.0"
  status: supporting
  author: OverKill Hill P3
  project: Mermaid Theme Builder
  version: "0.3.0"
  homepage: https://okhp3.github.io/mermaid-theme-builder/
  repository: https://github.com/OKHP3/mermaid-theme-builder
  category: diagram-governance
  produces: "styled-mermaid.md"
---

## Purpose

This skill applies consistent visual theming to Mermaid diagram code. It identifies the diagram family, selects or constructs a named palette, generates a complete Mermaid `themeVariables` configuration block, wraps the input in styled output, and optionally produces a Markdown style bootstrap or LLM prompt scaffold.

The output is platform-ready Mermaid code with embedded theming — not a description of what theming would look like.

The companion visual tool (for humans) is at `https://okhp3.github.io/mermaid-theme-builder/`.

---

## When to Use

- User asks to style, color, or theme a Mermaid diagram
- User wants a `themeVariables` block for a Mermaid diagram
- User asks for a prompt scaffold that enforces a palette for future AI-generated diagrams
- User asks about Mermaid theming, CSS variables for Mermaid, or on-brand diagram output
- User pastes Mermaid code and asks for it to look consistent with a brand or color scheme
- User names a palette (Ocean Depth, Forest Sage, Slate Ember, Violet Mist, OKH P³, Glee-fully, AskJamie, Neutral Enterprise)

## When Not to Use

- User wants to generate or validate bpmn-beta DSL structure → use `okhp3-bpmn-for-mermaid` skill instead
- User wants to create diagram content from scratch (use appropriate diagram skill first, then apply theming)
- User asks about BPMN notation rules, pools, lanes, or gateway semantics

---

## Output Modes

| Mode | Description |
|---|---|
| `styled-mermaid` | Complete diagram with `%%{init}%%` block prepended — copy-paste ready |
| `theme-bootstrap` | Markdown-embeddable `%%{init}%%` block with usage note (Export B) |
| `prompt-scaffold` | LLM prompt prefix that enforces palette in future AI generations (Export C) |
| `theme-json` | Standalone `themeVariables` JSON for `mermaid.initialize()` (Export A) |
| `validation-report` | Hex format check, known variable names, renderer warnings |
| `before-after-report` | Original + styled diagram side-by-side with change summary |

Produce all output modes if the user does not specify one.

---

## Required Workflow

Execute in order. Do not skip steps.

### Step 1 — Extract Mermaid Code

If the user has provided Mermaid code, use it as-is. If they described a diagram, generate it first using standard Mermaid syntax, then proceed to theming. If no diagram is present and none is described, ask for one before continuing.

Strip any surrounding prose, code fences (`\`\`\`mermaid`, `\`\`\``), or existing `%%{init}%%` blocks from the input. Preserve the diagram body exactly.

### Step 2 — Detect Diagram Family

Read the first non-whitespace keyword to determine family:

| Keyword(s) | Family | Theme Behavior |
|---|---|---|
| `flowchart`, `graph` | Flowchart | Full themeVariables support |
| `sequenceDiagram` | Sequence | Limited — actors and labels; some properties ignored |
| `classDiagram` | Class | Full themeVariables support |
| `gantt` | Gantt | Background and label colors apply; node fills do not |
| `erDiagram` | ER | Full themeVariables support |
| `stateDiagram-v2`, `stateDiagram` | State | Full themeVariables support |
| `pie` | Pie | Background and font apply; segment colors use internal rotation |
| `journey` | Journey | Label and background colors apply |
| `bpmn-beta` | BPMN (OKHP3 prototype) | Full themeVariables support via Mermaid Theme Integration |
| `mindmap` | Mindmap | Limited — base colors only |
| `xychart-beta` | XY Chart | Full themeVariables support |

Flag Sequence, Gantt, Pie, Journey, and Mindmap as reduced-compatibility families. Include a renderer note after those outputs.

### Step 3 — Select or Build Palette

Load `assets/palettes.json` for the machine-readable palette registry.

Built-in palettes (8 total — 4 thematic, 4 brand):
- **Thematic:** Ocean Depth, Forest Sage, Slate Ember, Violet Mist
- **Brand:** OKH P³, Glee-fully, AskJamie, Neutral Enterprise

If the user names a palette, use its definition from `assets/palettes.json`.

If the user provides custom colors, construct a coherent palette:
1. Treat the user's primary color as `primaryColor` and `mainBkg`
2. Derive `primaryBorderColor` as 15% darker
3. Set `primaryTextColor` to `#ffffff` for dark primaries, `#1a1a1a` for light (verify ≥4.5:1 contrast)
4. Set `secondaryColor` to 30% lighter or hue-shifted variant
5. Set `tertiaryColor` to complementary or analogous hue 60–120° away
6. Set `background` to dark desaturated primary (dark themes) or near-white `#f8f8f8` (light)
7. Set `lineColor` to bright accent — often tertiary at +20% saturation
8. Set `clusterBkg` to background darkened 10%

State derivation assumptions in one compact paragraph before output.

### Step 4 — Generate themeVariables Block

Produce the complete 21-variable init block. Never truncate. All 21 variables must appear:

```
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '[value]',
    'primaryTextColor': '[value]',
    'primaryBorderColor': '[value]',
    'secondaryColor': '[value]',
    'secondaryTextColor': '[value]',
    'secondaryBorderColor': '[value]',
    'tertiaryColor': '[value]',
    'tertiaryTextColor': '[value]',
    'tertiaryBorderColor': '[value]',
    'background': '[value]',
    'mainBkg': '[value]',
    'nodeBorder': '[value]',
    'clusterBkg': '[value]',
    'clusterBorder': '[value]',
    'lineColor': '[value]',
    'edgeLabelBackground': '[value]',
    'fontFamily': '[value]',
    'fontSize': '[value]',
    'labelBackground': '[value]',
    'labelTextColor': '[value]',
    'titleColor': '[value]'
  }
}}%%
```

`theme: 'base'` is required. Without it, Mermaid's default theme overrides the variables.

### Step 5 — Produce Styled Output

Prepend the `%%{init}%%` block to the diagram. Output as a fenced Mermaid code block.

For reduced-compatibility families, add immediately after the block:
> Renderer note: [Family] diagrams have partial themeVariables support. [Specific limitation]. Verify output in your target renderer.

### Step 6 — Check Renderer Target

Load `references/mermaid-renderer-profiles.md` for the full compatibility matrix.

| Renderer | themeVariables | %%{init}%% | Notes |
|---|---|---|---|
| Mermaid Live Editor | Full | Yes | Reference renderer |
| Mermaid.ai | Full | Yes | Full init block support |
| GitHub Markdown | Partial | No | Strips %%{init}%%; forced theme |
| GitLab Markdown | Partial | No | Same as GitHub |
| Notion | None | No | Default theme only |
| Obsidian | Full | Yes | Best markdown renderer for theming |
| Confluence | Partial | Plugin-dependent | Check Mermaid plugin version |
| VS Code preview | Full | Yes | With Mermaid extension |
| Docusaurus | Full | Yes | Via mermaid.initialize() config |
| VitePress | Full | Yes | Via markdown.mermaidOptions config |

When the target renderer is GitHub, GitLab, Notion, or Confluence, add a renderer advisory after output.

### Step 7 — Produce Exports

Produce all three unless the user specifies one:

**Export A — Standalone themeVariables JSON** (`theme-json` mode)
Clean JSON for `mermaid.initialize()`. No `%%{init}%%` wrapper.

**Export B — Markdown Style Bootstrap** (`theme-bootstrap` mode)
```markdown
<!-- Mermaid Theme: [palette name] — OverKill Hill P³ -->
<!-- Apply this init block before each diagram or set globally in your Mermaid config -->
%%{init: { 'theme': 'base', 'themeVariables': { ... } }}%%
```
Include usage note: "Paste immediately before each Mermaid code fence. For site-wide application, pass the themeVariables object to `mermaid.initialize()`."

**Export C — LLM Prompt Scaffold** (`prompt-scaffold` mode)
```
When generating Mermaid diagrams for this conversation, always include the following theme initialization block at the top of every diagram:

%%{init: { 'theme': 'base', 'themeVariables': { [all 21 variables] } }}%%

Rules:
- Always use 'theme': 'base'. Never use 'default', 'dark', 'forest', or 'neutral'.
- Preserve all themeVariables exactly. Do not substitute, approximate, or omit any variable.
- Place the %%{init}%% block on the first line, before the diagram type keyword.
- For flowchart diagrams, add classDef definitions for nodes requiring semantic color differentiation.
- Do not add inline style declarations that override themeVariables unless explicitly requested.
```

---

## Output Rules

- Produce the full styled diagram code first, then requested exports
- Never truncate the themeVariables block
- Never invent unsupported Mermaid theme variables
- Warn when renderer support is uncertain — put renderer warnings **after** output, not before
- Do not editorialize about color choices unless the user asks for palette feedback
- Keep explanatory text minimal — the output is the product
- Do not claim identical rendering across all Mermaid hosts

---

## Theme Integration with bpmn-beta

When theming a `bpmn-beta` diagram, the `%%{init}%%` block must appear **before** the `bpmn-beta` keyword:

```
%%{init: { 'theme': 'base', 'themeVariables': { ... } }}%%
bpmn-beta
accTitle: [Title]
...
```

Most impactful variables for BPMN diagrams: `primaryColor` (task fill), `primaryTextColor`, `lineColor` (flow arrows), `background`, `mainBkg`, `nodeBorder`, `secondaryColor` (gateway fill).

---

## References

| File | When to load |
|---|---|
| `references/palette-contract.md` | Palette schema, semantic token logic, custom palette derivation rules |
| `references/diagram-family-rules.md` | How theming differs per diagram family; reduced-compat warnings |
| `references/mermaid-renderer-profiles.md` | Full 12-renderer compatibility matrix and advisory policy |
| `references/output-format-contract.md` | Exact format specs for all 6 output modes |
| `references/prompt-scaffold-patterns.md` | Prompt pack formats; LLM-session governance patterns |
| `references/scope-firewall.md` | Personal OKHP3 project scope; exclusion rules |
| `assets/palettes.json` | Machine-readable 8-palette registry with full 21-variable sets |
| `assets/renderer-profiles.json` | Machine-readable renderer compatibility matrix |
| `assets/theme-variable-map.json` | Validated themeVariables with family coverage and quirk notes |

## Scripts

| Script | When to use |
|---|---|
| `scripts/detect-diagram.mjs` | Programmatically detect diagram family from Mermaid source |
| `scripts/normalize-mermaid.mjs` | Strip code fences, surrounding prose, existing init blocks |
| `scripts/apply-theme.mjs` | Apply palette to Mermaid source; return styled code + report |
| `scripts/validate-theme.mjs` | Validate hex values, known variable names, renderer warnings |
| `scripts/generate-prompt-scaffold.mjs` | Emit LLM prompt scaffold for a given palette and renderer target |

Scripts run locally without network access and do not import React, Tailwind, browser DOM APIs, or UI state.
