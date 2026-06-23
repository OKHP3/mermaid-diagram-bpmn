---
name: okhp3-mermaid-theme-builder
version: 0.5.0
description: Apply reusable color palettes and visual governance to Mermaid diagram code. Use this skill when the user wants to style, theme, color, or brand a Mermaid diagram; when they want a themeVariables block or %%{init}%% configuration; when they ask for a prompt scaffold that enforces consistent diagram styling for future AI-generated Mermaid; when they want renderer-safe output for GitHub, GitLab, Obsidian, Notion, Confluence, or the Mermaid CLI; when they want to make Mermaid output renderer-safe or renderer-compatible; when they mention Mermaid colors, palettes, CSS variables, diagram cleanup, or on-brand diagrams; or when they want to extract and re-theme existing styled Mermaid code.
author: OverKill Hill P³
license: MIT
homepage: https://okhp3.github.io/mermaid-theme-builder
repository: https://github.com/OKHP3/mermaid-theme-builder
category: diagram-governance
tags:
  - mermaid
  - diagram
  - theme
  - palette
  - themeVariables
  - prompt-scaffold
  - renderer-profiles
  - look-api
tools:
  - read_file
  - write_file
  - run_command
---

# okhp3-mermaid-theme-builder

Visual governance for Mermaid diagram code. Applies brand palettes, generates `%%{init}%%` directives, and produces renderer-aware output for GitHub, GitLab, Obsidian, Notion, Confluence, and the Mermaid CLI.

**Live tool:** https://okhp3.github.io/mermaid-theme-builder  
**Reference files:** `references/`  
**JSON assets:** `assets/`  
**Scripts:** `scripts/` (Node.js only, no external deps)

---

## When to use

- User provides Mermaid code and wants it styled, themed, or on-brand
- User asks for a `themeVariables` block or `%%{init}%%` configuration
- User wants a prompt scaffold for AI-generated Mermaid (pre-prompting)
- User specifies a target renderer (GitHub, GitLab, Notion, Obsidian, Confluence, Mermaid Live, CLI)
- User mentions Mermaid colors, palettes, CSS variables, or diagram cleanup
- User wants to extract the theme from an existing themed diagram and re-apply it
- User asks how to make a Mermaid diagram look consistent across renderers

## When NOT to use

- **General software development** unrelated to Mermaid theming or styling
- **Prose editing** — user is writing or editing text that describes a diagram without any styling, export, or theming need
- **BPMN modeling** — unless the user specifically wants Mermaid-themed output from a BPMN-like structure; for dedicated BPMN tooling use the `okhp3-bpmn-for-mermaid` skill instead
- **Image generation or raster export** — this skill produces text output only; rendering requires a browser or CLI environment
- **Generic color theory** — color advice with no Mermaid diagram output target
- **Non-Mermaid tools** — Draw.io, Lucidchart, PlantUML, D2, Excalidraw, and similar have no overlap with this skill
- **Chart data or data analysis** — user wants to work with the data behind a chart, not style it

---

## OKHP³ Visual Language Stack Context

This skill is the visual governance layer in the OKHP³ Visual Language Stack:

```
ReFolDec              Recursive decomposition and folding theory
    |
skillz                Agent-skill execution substrate (this skill runs here)
    |
BPMN for Mermaid      Process structure and workflow modeling layer
    |
okhp3-mermaid-theme-builder   <-- YOU ARE HERE
    |
Target renderers      GitHub, Notion, Obsidian, M365/Loop, Confluence, Mermaid Live, CLI
```

**Use this skill** when the task involves visual governance, palette application, renderer profiling, or diagram output contract enforcement.

**Hand off to `okhp3-bpmn-for-mermaid`** when the task involves process structure, workflow notation, or BPMN-like semantics before styling.

**Stack principle:** This skill does not interpret process logic or business semantics. It governs visual output. When both process structure and visual governance are needed, apply `okhp3-bpmn-for-mermaid` first, then this skill.

See `docs/okhp3-visual-language-stack.md` in the tool repository for the authoritative stack reference.

---

## Support Taxonomy

Before theming, classify the diagram family. Support level determines what outputs are safe to promise.

### Stable — Full theme support
`flowchart`, `graph` (flowchart alias), `sequenceDiagram`, `classDiagram`, `stateDiagram`, `stateDiagram-v2`, `erDiagram`

Full `themeVariables` coverage. `classDef` available in flowchart, classDiagram, stateDiagram. Safe to use across all renderers.

### Stable — Limited theme support
`gantt`, `pie`, `gitGraph`, `mindmap`, `timeline`, `journey`

Only canvas-level themeVariables apply (background, titleColor, textColor, fontFamily). Internal colors (task bars, slices, branches) are renderer-managed. Do not promise full color control.

### Beta / Experimental — Partial theme support
`sankey-beta`, `xychart-beta`, `block-beta`, `quadrantChart`, `kanban`, `packet`, `architectureBeta`, `requirementDiagram`, `zenuml`, `treemap-beta`, `radar-beta`

Variable coverage is partial or renderer-dependent. Always validate in the target renderer before publishing. Include a caveat in output.

### Renderer-dependent
`c4Context`, `c4Container`, `c4Component`, `c4Dynamic`, `c4Deployment`

C4 diagram theming depends on renderer support and plugin version (especially Confluence). Core themeVariables apply; complex layouts may differ.

### Experimental / Not universally supported
`venn` (beta), `ishikawa` (fishbone beta), `wardley` / `wardley-beta`, `eventModeling`, `eventmodeling`

These families may not render in all environments. Include explicit "may not render in all environments" caveats. Validate in Mermaid Live first.

### OKHP3 Semantic Templates
Flowchart, sequence, and other standard Mermaid families used with specific structural conventions established by the OverKill Hill P³ project (BPMN-lite subgraph emulation, root-cause fishbone patterns, Wardley-style flows). These are valid standard Mermaid syntax — no special treatment required beyond normal theming. Use the `full` or `partial` strategy of the underlying family.

---

## 7-Step Workflow

### Step 1 — Identify input

Determine what the user has provided:
- **Raw Mermaid code** → proceed to Step 2
- **Existing themed code** (has `%%{init}%%` or YAML frontmatter) → strip the existing block, then proceed
- **Code wrapped in Markdown fences** → strip the fences first using `normalize-mermaid.mjs`
- **Natural language request only** → ask for the Mermaid code, or generate a basic fixture from `assets/fixtures/`

### Step 2 — Detect diagram family

Run `detect-diagram.mjs` or apply the keyword table below. The family determines:
- Which `themeVariables` apply (see `references/mermaid-theme-variables.md`)
- Whether `classDef` / `linkStyle` / subgraph style patterns are available
- Style strategy: `full` | `partial` | `limited` | `experimental`

**Family keyword table (first match wins):**

| Keyword | Family | Style strategy |
|---|---|---|
| `flowchart`, `graph` | flowchart | full |
| `sequenceDiagram` | sequenceDiagram | partial |
| `classDiagram` | classDiagram | partial |
| `stateDiagram`, `stateDiagram-v2` | stateDiagram | partial |
| `erDiagram` | erDiagram | partial |
| `gantt` | gantt | limited |
| `pie` | pie | limited |
| `gitGraph` | gitGraph | limited |
| `mindmap` | mindmap | limited |
| `timeline` | timeline | limited |
| `journey` | journey | limited |
| `quadrantChart` | quadrantChart | partial |
| `requirementDiagram` | requirementDiagram | partial |
| `c4Context`, `c4Container`, `c4Component`, `c4Dynamic`, `c4Deployment` | c4Diagram | partial |
| `block-beta` | block | partial |
| `sankey-beta` | sankey | partial |
| `xychart-beta` | xychart | partial |
| `zenuml` | zenuml | partial |
| `architectureBeta` | architectureBeta | partial |
| `kanban` | kanban | partial |
| `packet` | packet | limited |
| `treemap` | treemap | experimental |
| `radar`, `radar-beta` | radar | experimental |
| `venn` | venn | experimental |
| `ishikawa` | ishikawa | experimental |
| `wardley`, `wardley-beta` | wardley | experimental |
| `eventModeling`, `eventmodeling` | eventModeling | experimental |

### Step 3 — Select palette

Load `assets/palettes.json` or choose from the table below. Match palette to use case:

| Palette ID | Name | Best for |
|---|---|---|
| `overkill-hill` | OverKill Hill P³ | Technical, architecture, AI tooling, executive decks |
| `askjamie` | AskJamie | Support flows, helpdesk, user guidance, friendly AI |
| `glee-fully` | Glee-fully | Personal productivity, family-friendly, consumer-facing |
| `ocean-depth` | Ocean Depth | Technical docs, clean professional diagrams |
| `forest-sage` | Forest Sage | Process flows, calm/approachable content |
| `slate-ember` | Slate Ember | Architecture, high-contrast dark mode |
| `violet-mist` | Violet Mist | Product, UX, creative flows |

### Step 4 — Select renderer profile

Check `assets/renderer-profiles.json` or `references/renderer-profiles.md` for the target renderer. Identify constraints before generating output:
- `supportsInitDirective: "none"` → warn and offer Format B (YAML frontmatter)
- `supportsThemeVariables: "partial"` → note that some variables will be ignored
- `supportsCustomFonts: "none"` → fall back to system font stack; drop custom font name
- `supportsCSSInjection: "none"` → omit any CSS injection suggestions

If the user has not specified a renderer, default to Format A (styled code) and note that output has been validated against Mermaid Live.

### Step 5 — Generate init block

Construct the `%%{init}%%` directive using this exact format:

```
%%{init: {"theme": "base", "themeVariables": {VARIABLES_JSON}}}%%
```

Rules:
- `"theme": "base"` is always required — do not use `"default"`, `"dark"`, `"forest"`, or `"neutral"`
- All string values must be double-quoted
- Do not add a trailing comma after the last variable
- Strip any existing `%%{init}%%` block or YAML frontmatter from the input code before prepending
- Hex values must match `/#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/` — no RGB, HSL, or named colors
- `fontSize` must end in `px` — example: `"14px"`, not `14` or `"14"`

**Example (Ocean Depth, flowchart — Classic look, no `look` key):**
```
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "primaryTextColor": "#ffffff", "primaryBorderColor": "#0d3060", "lineColor": "#2563eb", "secondaryColor": "#0ea5e9", "tertiaryColor": "#e0f2fe", "background": "#f0f9ff", "mainBkg": "#dbeafe", "nodeBorder": "#1d4ed8", "clusterBkg": "#e0f2fe", "titleColor": "#1e3a5f", "edgeLabelBackground": "#f0f9ff", "fontFamily": "DM Sans, system-ui, sans-serif"}}}%%
```

**Optional: look parameter (Mermaid v11.15.0+)**

The `look` parameter controls the visual rendering style. It is optional. When included, it must be placed **before** `themeVariables` in the init object.

Supported values:
- Omit the key entirely → Classic look (universal renderer support)
- `"look": "neo"` → Neo flat style (mermaid.live full, GitHub partial, GitLab partial, Obsidian partial, CLI full; NOT supported in Notion or Confluence)
- `"look": "handDrawn"` → Hand-drawn Rough.js style (mermaid.live full, CLI full, Obsidian partial; NOT supported in GitHub, GitLab, Notion, or Confluence)

Example with look parameter included (Neo, Ocean Depth, flowchart):
```
%%{init: {"look": "neo", "theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "primaryTextColor": "#ffffff", "primaryBorderColor": "#0d3060", "lineColor": "#2563eb", "secondaryColor": "#0ea5e9", "tertiaryColor": "#e0f2fe", "background": "#f0f9ff", "mainBkg": "#dbeafe", "nodeBorder": "#1d4ed8", "clusterBkg": "#e0f2fe", "titleColor": "#1e3a5f", "edgeLabelBackground": "#f0f9ff", "fontFamily": "DM Sans, system-ui, sans-serif"}}}%%
```

### Step 6 — Produce styled output

Select the appropriate output mode (see Output Modes section). Prepend the init directive. For `full` strategy families (flowchart), optionally append a classDef library block.

### Step 7 — Apply renderer caveats

Every renderer has known limitations. Never imply that a feature works unless the renderer profile explicitly records `"full"` support. When support is `"partial"`, always include a caveat. When support is `"none"`, omit the feature and explain why.

See `references/renderer-profiles.md` for the full matrix and per-renderer workarounds.

---

## Output Modes

### Format A — Styled Mermaid Code

Minimal format. Just the `%%{init}%%` directive prepended to the diagram. Use when the user wants clean, paste-ready code.

```
%%{init: {"theme": "base", "themeVariables": {...}}}%%
<original diagram code>
```

### Format B — YAML Frontmatter (Mermaid v10.5+)

Use when the target renderer prefers frontmatter over `%%{init}%%`, or when init directive support is `none` or `partial`.

```yaml
---
config:
  theme: base
  themeVariables:
    primaryColor: "#..."
    primaryTextColor: "#..."
    ...
---
<original diagram code>
```

### Format C — Prompt Scaffold (LLM Pre-prompting)

Full Markdown document for pasting into a system prompt or user message before asking an LLM to generate Mermaid. See `references/prompt-scaffold-patterns.md` for 8 parameterized templates.

Structure:
```markdown
## Mermaid Diagram Style Rules

**Palette:** {PALETTE_NAME}
**Theme base:** base (always)

### Required %%{init}%% block

Prepend this exact block to every Mermaid diagram you generate:

\`\`\`
%%{init: {"theme": "base", "themeVariables": {THEME_VARIABLES_JSON}}}%%
\`\`\`

### Diagram family rules
...
### Renderer constraints (if applicable)
...
```

### Format D — Markdown Bootstrap

Full Markdown document for publishing a themed diagram with attribution and usage notes. Includes the styled code in a fenced code block, renderer warning, and attribution.

### Format E — Extract + Re-theme

When given existing themed code:
1. Extract the current `%%{init}%%` or frontmatter block
2. Identify current palette (match hex values against `assets/palettes.json`)
3. Apply the new palette, replacing the old init block
4. Return Format A output

### Format F — Renderer Compatibility Notes

Use when the user asks "will this work in X?" or "is this safe for Y?" without requesting styled code. Return a concise compatibility summary for the named renderer and diagram family:

```markdown
**Renderer:** {RENDERER_NAME}
**Diagram family:** {FAMILY}
**Init directive:** {full | partial | none}
**themeVariables:** {full | partial | none}
**classDef:** {full | partial | none}
**Custom fonts:** {full | partial | none}
**Look support:** {Classic, Neo, Drawn | Classic, Neo partial | Classic only}
**Risk level:** {low | medium | high}

**Caveats:**
- {caveat 1}
- {caveat 2}

**Recommendation:** {Format A | Format B | test before publishing}
```

---

## Renderer Compatibility Summary

| Renderer | `%%{init}%%` | themeVars | classDef | CSS inject | Custom fonts | Look support | Risk |
|---|---|---|---|---|---|---|---|
| mermaid.live | Full | Full | Full | Full | Full | Classic, Neo, Drawn | Low |
| GitHub | Full | Full | Full | None | None | Classic, Neo partial | Low |
| GitLab | Full | Full | Full | None | None | Classic, Neo partial | Low |
| Notion | Partial | Partial | Full | None | None | Classic only | Medium |
| Obsidian | Full | Full | Full | Partial | Partial | Classic, Neo/Drawn partial | Low |
| Confluence | Partial | Partial | Partial | None | None | Classic only | High |
| CLI (mmdc) | Full | Full | Full | Full | Full | Classic, Neo, Drawn | Low |

Full compatibility matrix and renderer-specific workarounds: `references/renderer-profiles.md`

---

## Worked Examples

### Example 1 — Apply OverKill Hill P³ to a flowchart for GitHub

**Input:**
```
flowchart TD
    A[User Request] --> B{Validate}
    B -->|Valid| C[Process]
    B -->|Invalid| D[Reject]
```

**Target renderer:** GitHub  
**Palette:** overkill-hill  
**GitHub constraints:** CSS injection none, custom fonts blocked (use system font fallback)

**Output (Format A — font substituted for GitHub CSP):**
```
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#111827", "primaryTextColor": "#e5e7eb", "primaryBorderColor": "#c46a2c", "lineColor": "#c46a2c", "secondaryColor": "#181f26", "secondaryTextColor": "#e5e7eb", "secondaryBorderColor": "#c46a2c", "tertiaryColor": "#1c3a34", "tertiaryTextColor": "#e5e7eb", "tertiaryBorderColor": "#c46a2c", "textColor": "#e5e7eb", "background": "#111827", "mainBkg": "#111827", "nodeBorder": "#c46a2c", "clusterBkg": "#0d1117", "titleColor": "#c46a2c", "edgeLabelBackground": "#181f26", "fontFamily": "system-ui, sans-serif"}}}%%
flowchart TD
    A[User Request] --> B{Validate}
    B -->|Valid| C[Process]
    B -->|Invalid| D[Reject]
```

> **GitHub renderer note:** Custom web fonts are blocked by GitHub's CSP. `fontFamily` has been changed to `system-ui, sans-serif`. CSS injection is not supported. Hand-Drawn look is not available.

---

### Example 2 — Notion-safe prompt scaffold for a sequence diagram

**User request:** "Give me a prompt scaffold for Notion using AskJamie palette, sequence diagrams only."

**Renderer:** Notion  
**Notion constraints:** `%%{init}%%` partially parsed, only a subset of themeVariables applied, pinned to Mermaid 10.x, no Neo/Hand-Drawn look.

**Output (Format C):**
```markdown
## Mermaid Diagram Style Rules — Notion Target

**Palette:** AskJamie
**Target renderer:** Notion
**Theme base:** base (always)

### Required %%{init}%% block

Prepend this exact block to every Mermaid diagram you generate:

\`\`\`
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fdfbf7", "primaryTextColor": "#2e2b29", "primaryBorderColor": "#2d6f7e", "lineColor": "#2d6f7e", "secondaryColor": "#f6f2ee", "background": "#f6f2ee", "mainBkg": "#fdfbf7", "nodeBorder": "#2d6f7e", "titleColor": "#2d6f7e", "fontFamily": "system-ui, sans-serif"}}}%%
\`\`\`

### Notion renderer constraints

- Only a subset of themeVariables are applied — colors may differ from other renderers
- Notion is pinned to Mermaid 10.x — Neo and Hand-Drawn looks are unavailable
- Custom fonts are not supported — use system-ui fallback only
- Beta and experimental diagram families may fail to render

### Rules

1. Use only `sequenceDiagram` family
2. Always use `theme: base`
3. Use only the core 10 themeVariables above (no secondaryTextColor, tertiaryColor, etc.)
4. Use Classic look only — omit the `"look"` key
5. Validate output in a Notion page before publishing
```

---

### Example 3 — Extract and re-theme for Glee-fully

**Input (existing themed diagram):**
```
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#111827", "lineColor": "#c46a2c", "fontFamily": "DM Sans, system-ui, sans-serif"}}}%%
sequenceDiagram
    Alice->>Bob: Hello
    Bob->>Alice: Hi!
```

**Request:** Re-theme this with the Glee-fully palette.

**Process (Format E):**
1. Strip existing `%%{init}%%` block
2. Identify old palette: `primaryColor: #111827` + `lineColor: #c46a2c` matches `overkill-hill`
3. Apply `glee-fully` themeVariables from `assets/palettes.json`

**Output:**
```
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fffdfa", "primaryTextColor": "#2e2b29", "primaryBorderColor": "#d94f63", "lineColor": "#d94f63", "secondaryColor": "#f6f2ee", "secondaryTextColor": "#2e2b29", "secondaryBorderColor": "#d94f63", "tertiaryColor": "#e5d9ce", "tertiaryTextColor": "#2e2b29", "tertiaryBorderColor": "#d94f63", "textColor": "#2e2b29", "background": "#fff7f1", "mainBkg": "#fffdfa", "nodeBorder": "#d94f63", "clusterBkg": "#f9f3ef", "titleColor": "#d94f63", "edgeLabelBackground": "#fff7f1", "fontFamily": "Open Sans, system-ui, sans-serif"}}}%%
sequenceDiagram
    Alice->>Bob: Hello
    Bob->>Alice: Hi!
```

---

## Output Rules

1. **Never invent themeVariable names.** Only use names present in `assets/palettes.json` or documented at mermaid.js.org/config/theming.html.
2. **Never claim a renderer supports a feature it does not.** Always check `assets/renderer-profiles.json` first.
3. **`"theme": "base"` is always required.** No exceptions.
4. **Strip existing init blocks before prepending.** Never double-apply.
5. **Font family must be a valid CSS font stack string.** Always quoted.
6. **Hex values must match `/#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/`.** No RGB, HSL, or named colors in themeVariables.
7. **`fontSize` must end in `px`.** Example: `"14px"`, not `14` or `"14"`.
8. **No unrelated employer branding or corporate entity names** in any skill output. See `references/scope-firewall.md`.
9. **No hallucinated palette names.** Only the 7 palettes in `assets/palettes.json` are canonical.
10. **If a look parameter is requested, validate against the renderer's look support before including it.** If the target renderer does not support the requested look, warn the user and default to Classic (omit the key). Never silently include a look value that will be ignored or cause rendering failure.
11. **For experimental families**, always include a caveat that the output may not render in all environments.
12. **For beta diagram families in Notion or Confluence**, warn that rendering is not guaranteed and validate before publishing.

---

## Security and Privacy

- This skill operates entirely on user-provided Mermaid text. No external network calls are required or made by this skill or its scripts.
- Scripts in `scripts/` have zero external dependencies. They run with `node scripts/<name>.mjs` and no package installation.
- User diagrams may contain sensitive business information (system architecture, process flows, team structures). Treat all diagram content as confidential user-provided data. Do not log, cache, or reproduce diagram content beyond what is needed to produce the themed output.
- Do not transmit diagram content to any external service. All processing is local.

---

## References

- `references/palette-registry.md` — All 7 palettes with full variable tables
- `references/mermaid-theme-variables.md` — Variable reference by diagram family
- `references/renderer-profiles.md` — Full 7-renderer compatibility matrix
- `references/output-format-contract.md` — Formal spec for all 6 output formats (A–F)
- `references/prompt-scaffold-patterns.md` — 8 parameterized scaffold templates
- `references/scope-firewall.md` — What must never appear in skill output

## Scripts

Run with `node scripts/<name>.mjs` (no external dependencies required):

- `scripts/detect-diagram.mjs` — Detect diagram family from code
- `scripts/normalize-mermaid.mjs` — Strip Markdown fences and prose wrappers
- `scripts/apply-theme.mjs` — Apply a palette to diagram code
- `scripts/validate-theme.mjs` — Validate a themed diagram's init block
- `scripts/generate-prompt-scaffold.mjs` — Generate a prompt scaffold document

## Assets

- `assets/palettes.json` — 7 palettes with all themeVariable tokens (from source of truth)
- `assets/renderer-profiles.json` — 7 renderer profiles (from source of truth)
- `assets/theme-variable-map.json` — 21 core variables with semantic roles and format rules
- `assets/fixtures/*.mmd` — 5 clean diagram fixtures for testing

## Tests

Run with `node --test tests/*.test.mjs`:

- `tests/detect-diagram.test.mjs`
- `tests/apply-theme.test.mjs`
- `tests/validate-theme.test.mjs`
- `tests/skill-integrity.test.mjs` — Validates frontmatter, required fields, referenced files, and version alignment
