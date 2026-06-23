# Output Format Contract

Formal specification for the 5 output modes produced by this skill. Each format has exact syntax templates, field-level validation rules, and worked examples.

---

## Format A — Styled Mermaid Code

**Use when:** User wants clean, paste-ready themed code. Minimal overhead.

### Template

```
%%{init: {"theme": "base", "themeVariables": {VARS_JSON}}}%%
{DIAGRAM_CODE}
```

### Field-level validation rules

| Field | Rule |
|---|---|
| `%%{init:` | Must be on line 1 of output. No leading blank lines. |
| `"theme"` | Must be `"base"`. No other value. |
| `themeVariables` | Must be a JSON object. All string values double-quoted. |
| Hex values | Must match `/#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/`. |
| `fontSize` | Must end in `px`. Example: `"14px"`. |
| `fontFamily` | Must be a quoted CSS font stack string. |
| Trailing commas | Not allowed after the last key-value pair. |
| `{DIAGRAM_CODE}` | Must be the original code with any pre-existing `%%{init}%%` block stripped. |

### Worked example — Ocean Depth, flowchart

**Input:**
```
flowchart TD
    A[Start] --> B{Decision}
    B --> C[Yes]
    B --> D[No]
```

**Output:**
```
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "primaryTextColor": "#ffffff", "primaryBorderColor": "#0d3060", "lineColor": "#2563eb", "secondaryColor": "#0ea5e9", "tertiaryColor": "#e0f2fe", "background": "#f0f9ff", "mainBkg": "#dbeafe", "nodeBorder": "#1d4ed8", "clusterBkg": "#e0f2fe", "titleColor": "#1e3a5f", "edgeLabelBackground": "#f0f9ff", "fontFamily": "DM Sans, system-ui, sans-serif"}}}%%
flowchart TD
    A[Start] --> B{Decision}
    B --> C[Yes]
    B --> D[No]
```

### Worked example — OverKill Hill P³, existing init block (stripped)

**Input:**
```
%%{init: {"theme": "dark"}}%%
sequenceDiagram
    Alice->>Bob: Hello
    Bob->>Alice: Hi!
```

**Output:**
```
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#111827", "primaryTextColor": "#e5e7eb", "primaryBorderColor": "#c46a2c", "lineColor": "#c46a2c", "secondaryColor": "#181f26", "secondaryTextColor": "#e5e7eb", "secondaryBorderColor": "#c46a2c", "tertiaryColor": "#1c3a34", "tertiaryTextColor": "#e5e7eb", "tertiaryBorderColor": "#c46a2c", "textColor": "#e5e7eb", "background": "#111827", "mainBkg": "#111827", "nodeBorder": "#c46a2c", "clusterBkg": "#0d1117", "titleColor": "#c46a2c", "edgeLabelBackground": "#181f26", "fontFamily": "DM Sans, system-ui, sans-serif"}}}%%
sequenceDiagram
    Alice->>Bob: Hello
    Bob->>Alice: Hi!
```

---

## Format B — YAML Frontmatter

**Use when:** Target renderer prefers frontmatter (Mermaid v10.5+), or `initDirectiveSupport` is `none` or `partial` for the target renderer.

### Template

```yaml
---
config:
  theme: base
  themeVariables:
    {KEY}: "{VALUE}"
    ...
---
{DIAGRAM_CODE}
```

### Field-level validation rules

| Field | Rule |
|---|---|
| `---` delimiters | Required — three dashes, no trailing spaces |
| `config:` | Required key, no value on same line |
| `theme: base` | Required; indented 2 spaces under `config:` |
| `themeVariables:` | Required; indented 2 spaces under `config:`; no value on same line |
| Variable lines | Indented 4 spaces under `themeVariables:`; format: `{key}: "{value}"` |
| Hex values | Must match `/#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/` |
| `fontFamily` | Quoted value; may include commas (valid CSS font stack) |
| `{DIAGRAM_CODE}` | Follows immediately after closing `---` delimiter |

### Worked example — Forest Sage, class diagram

**Output:**
```yaml
---
config:
  theme: base
  themeVariables:
    primaryColor: "#1a5c38"
    primaryTextColor: "#ffffff"
    primaryBorderColor: "#0f3d25"
    lineColor: "#2d6a4f"
    secondaryColor: "#52b788"
    tertiaryColor: "#d8f3dc"
    background: "#f4faf6"
    mainBkg: "#d8f3dc"
    nodeBorder: "#1b4332"
    clusterBkg: "#d8f3dc"
    titleColor: "#1b4332"
    edgeLabelBackground: "#f4faf6"
    fontFamily: "DM Sans, system-ui, sans-serif"
---
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
```

### Worked example — Violet Mist, state diagram

**Output:**
```yaml
---
config:
  theme: base
  themeVariables:
    primaryColor: "#6d28d9"
    primaryTextColor: "#ffffff"
    primaryBorderColor: "#4c1d95"
    lineColor: "#7c3aed"
    secondaryColor: "#a78bfa"
    tertiaryColor: "#ede9fe"
    background: "#f5f3ff"
    mainBkg: "#ede9fe"
    nodeBorder: "#5b21b6"
    clusterBkg: "#ede9fe"
    titleColor: "#4c1d95"
    edgeLabelBackground: "#f5f3ff"
    fontFamily: "DM Sans, system-ui, sans-serif"
---
stateDiagram-v2
    [*] --> Active
    Active --> Inactive
    Inactive --> [*]
```

---

## Format C — Prompt Scaffold (LLM Pre-prompting)

**Use when:** User wants to pre-prompt an LLM to generate consistently styled Mermaid. Output is a Markdown document for use as a system prompt, user message prefix, or custom instructions block.

See `references/prompt-scaffold-patterns.md` for 8 parameterized templates.

### Template

```markdown
## Mermaid Diagram Style Rules

**Palette:** {PALETTE_NAME}
**Theme base:** base (always — do not use default, dark, forest, or neutral)

### Required %%{init}%% block

Prepend this exact block to every Mermaid diagram you generate:

\`\`\`
%%{init: {"theme": "base", "themeVariables": {THEME_VARIABLES_JSON}}}%%
\`\`\`

### Rules

1. Always use `theme: base` — never `default`, `dark`, `forest`, or `neutral`
2. All themeVariable values must be hex colors (#RRGGBB format)
3. fontFamily must be a quoted CSS font stack
4. fontSize must end in `px`
5. Strip any existing %%{init}%% block before prepending this one
```

### Field-level validation rules

| Field | Rule |
|---|---|
| `{PALETTE_NAME}` | Must match one of the 7 canonical palette display names |
| `{THEME_VARIABLES_JSON}` | Valid JSON object; double-quoted keys and values |
| Rule list | Must include the `theme: base` enforcement rule |
| Renderer section | Include only if the user specified a target renderer |

### Worked example — GitHub-safe scaffold (Ocean Depth)

```markdown
## Mermaid Diagram Style Rules

**Palette:** Ocean Depth
**Target renderer:** GitHub
**Theme base:** base (always)

### Required %%{init}%% block

Prepend this exact block to every Mermaid diagram you generate:

\`\`\`
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "primaryTextColor": "#ffffff", "primaryBorderColor": "#0d3060", "lineColor": "#2563eb", "secondaryColor": "#0ea5e9", "tertiaryColor": "#e0f2fe", "background": "#f0f9ff", "mainBkg": "#dbeafe", "nodeBorder": "#1d4ed8", "clusterBkg": "#e0f2fe", "titleColor": "#1e3a5f", "edgeLabelBackground": "#f0f9ff", "fontFamily": "system-ui, sans-serif"}}}%%
\`\`\`

### Renderer constraints (GitHub)

- CSS injection not supported
- Custom web fonts blocked by CSP — use `system-ui, sans-serif` instead of custom fonts
- Hand-Drawn look not available — use Classic look only
- Neo look availability depends on GitHub's pinned Mermaid version

### Rules

1. Always use `theme: base`
2. Use only hex color values in themeVariables
3. Font family: system fonts only (no web fonts — blocked by GitHub CSP)
4. Use Classic look only — no `"look"` key in the init block
```

### Worked example — Brand enforcement scaffold (AskJamie)

```markdown
## Mermaid Diagram Style Rules

**Palette:** AskJamie
**Theme base:** base (always)

### Brand identity

AskJamie diagrams use calm mid-century tones. Muted aqua (#2d6f7e) for borders and lines, warm beige (#fdfbf7) for node fills, light cream background (#f6f2ee). All text in dark charcoal (#2e2b29).

### Required %%{init}%% block

\`\`\`
%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#fdfbf7", "primaryTextColor": "#2e2b29", "primaryBorderColor": "#2d6f7e", "lineColor": "#2d6f7e", "secondaryColor": "#f6f2ee", "secondaryTextColor": "#2e2b29", "secondaryBorderColor": "#2d6f7e", "tertiaryColor": "#e1ecef", "tertiaryTextColor": "#2e2b29", "tertiaryBorderColor": "#2d6f7e", "textColor": "#2e2b29", "background": "#f6f2ee", "mainBkg": "#fdfbf7", "nodeBorder": "#2d6f7e", "clusterBkg": "#e8f4f7", "titleColor": "#2d6f7e", "edgeLabelBackground": "#f6f2ee", "fontFamily": "Open Sans, system-ui, sans-serif"}}}%%
\`\`\`

### Rules

1. Always use `theme: base`
2. Use only hex color values
3. Preferred diagram families: flowchart, sequence, state
4. Keep labels concise and plain-language — this palette is for user-guidance content
5. Avoid technical jargon in node labels
```

---

## Format D — Markdown Bootstrap

**Use when:** User wants a complete publishable document with the themed diagram, attribution, and usage notes.

### Template

```markdown
# Mermaid Diagram — {THEME_NAME} Theme

**Theme:** {PALETTE_DISPLAY_NAME}
**Theme ID:** `{PALETTE_ID}`
**Tool:** [Mermaid Theme Builder](https://okhp3.github.io/mermaid-theme-builder)

## Usage

Paste the code block below into any Mermaid-compatible renderer.

\`\`\`mermaid
{THEMED_CODE}
\`\`\`

## Attribution

Generated with Mermaid Theme Builder · Theme: **{THEME_NAME}**
```

---

## Format E — Extract + Re-theme

**Use when:** User provides an existing themed diagram and wants to switch palettes.

### Process

1. Locate and extract the `%%{init}%%` block or YAML frontmatter
2. Parse `themeVariables` from the block
3. Optionally match hex values against `assets/palettes.json` to identify the source palette
4. Apply the new palette's `themeVariables` (replacing the extracted block)
5. Return Format A output

### Validation rules

| Step | Rule |
|---|---|
| Extraction | If no init block or frontmatter found, proceed with applying new theme directly |
| Replacement | Strip the old init block entirely — never leave two init blocks in the output |
| Output | Init directive must be on line 1 of the output |
