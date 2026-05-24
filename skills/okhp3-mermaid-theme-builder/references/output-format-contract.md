# Output Format Contract — okhp3-mermaid-theme-builder

Exact format specifications for all six output modes. Agents must follow these formats precisely to ensure copy-paste compatibility with Mermaid renderers.

---

## Mode 1: `styled-mermaid`

The primary output. A complete Mermaid code block with `%%{init}%%` block prepended.

**Format:**

````
```mermaid
%%{init: { 'theme': 'base', 'themeVariables': { 'primaryColor': '#hex', 'primaryTextColor': '#hex', 'primaryBorderColor': '#hex', 'secondaryColor': '#hex', 'secondaryTextColor': '#hex', 'secondaryBorderColor': '#hex', 'tertiaryColor': '#hex', 'tertiaryTextColor': '#hex', 'tertiaryBorderColor': '#hex', 'background': '#hex', 'mainBkg': '#hex', 'nodeBorder': '#hex', 'clusterBkg': '#hex', 'clusterBorder': '#hex', 'lineColor': '#hex', 'edgeLabelBackground': '#hex', 'fontFamily': 'Segoe UI, sans-serif', 'fontSize': '14px', 'labelBackground': '#hex', 'labelTextColor': '#hex', 'titleColor': '#hex' } }}%%
[original diagram body]
```
````

**Rules:**
- The `%%{init}%%` block must be a single line (no line breaks inside the JSON)
- All 21 themeVariables must be present — no omissions
- The diagram body follows immediately on the next line after `%%{init}%%`
- No blank line between `%%{init}%%` and the diagram keyword
- Use standard Mermaid code fence (` ```mermaid `)

**For reduced-compatibility families**, add after the closing fence:
```
> Renderer note: [Family] diagrams have partial themeVariables support. [Limitation]. Verify in your target renderer.
```

---

## Mode 2: `theme-bootstrap`

A Markdown-embeddable block for document-level theming.

**Format:**

```markdown
<!-- Mermaid Theme: [Display Name] — OverKill Hill P³ -->
<!-- Apply this init block before each diagram or set globally in your Mermaid config -->

%%{init: { 'theme': 'base', 'themeVariables': { [all 21 variables] } }}%%
```

**Followed by usage note:**
> Paste this block immediately before each Mermaid code fence in Markdown documents. For site-wide application, pass the themeVariables object to `mermaid.initialize()` in your site's configuration file.

**Rules:**
- HTML comments must use the exact labels shown
- The `%%{init}%%` line is a standalone line (not inside a code fence)
- Always include the usage note

---

## Mode 3: `prompt-scaffold`

A reusable LLM prompt prefix for session-level visual governance.

**Format:**

```
When generating Mermaid diagrams for this conversation, always include the following theme initialization block at the top of every diagram:

%%{init: { 'theme': 'base', 'themeVariables': { [all 21 variables] } }}%%

Rules:
- Always use 'theme': 'base' as the base theme. Never use 'default', 'dark', 'forest', or 'neutral'.
- Preserve all themeVariables exactly as provided. Do not substitute, approximate, or omit any variable.
- Place the %%{init}%% block on the first line of the Mermaid code, before the diagram type keyword.
- For flowchart diagrams, also add classDef definitions for any nodes that need semantic color differentiation beyond the base palette.
- Do not add inline style declarations that override themeVariables unless explicitly requested.
```

**Rules:**
- Present as a plain text block (not a code fence), ready to paste into a chat session
- The `%%{init}%%` line must contain all 21 variables inline (single line)
- The five rules must appear exactly as above — do not paraphrase

---

## Mode 4: `theme-json`

A standalone JSON object for programmatic use with `mermaid.initialize()`.

**Format:**

```json
{
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#hex",
    "primaryTextColor": "#hex",
    "primaryBorderColor": "#hex",
    "secondaryColor": "#hex",
    "secondaryTextColor": "#hex",
    "secondaryBorderColor": "#hex",
    "tertiaryColor": "#hex",
    "tertiaryTextColor": "#hex",
    "tertiaryBorderColor": "#hex",
    "background": "#hex",
    "mainBkg": "#hex",
    "nodeBorder": "#hex",
    "clusterBkg": "#hex",
    "clusterBorder": "#hex",
    "lineColor": "#hex",
    "edgeLabelBackground": "#hex",
    "fontFamily": "Segoe UI, sans-serif",
    "fontSize": "14px",
    "labelBackground": "#hex",
    "labelTextColor": "#hex",
    "titleColor": "#hex"
  }
}
```

**Rules:**
- Valid JSON only — no trailing commas, no comments inside the JSON block
- The `%%{init}%%` wrapper is NOT included — this is the raw object for `mermaid.initialize()`
- Present inside a `json` code fence

---

## Mode 5: `validation-report`

A structured report of palette and output validity.

**Format:**

```
Validation Report — [Palette Name] / [Diagram Family]

Variables: 21 / 21 present
Hex values: all valid (#RRGGBB format)
Font: fontFamily valid, fontSize valid
Unknown variables: none

Renderer compatibility:
  - [Target renderer]: [Full / Partial / None]
  [Advisory if applicable]

Family-specific notes:
  - [Any reduced-compat warnings for this family]

Result: PASS / WARN / FAIL
```

**Rules:**
- `PASS` — all 21 variables present and valid, no unknown variable names, renderer supports init blocks
- `WARN` — renderer has partial support or family has reduced compat; theming will be applied but with noted limitations
- `FAIL` — invalid hex values, missing required variables, or completely unsupported renderer
- Always state the count of variables present vs. expected (21)

---

## Mode 6: `before-after-report`

Side-by-side presentation of original and styled diagram.

**Format:**

````
### Before (original)

```mermaid
[original diagram body, no init block]
```

### After ([Palette Display Name])

```mermaid
%%{init: { ... }}%%
[original diagram body]
```

**Changes applied:**
- Palette: [display name]
- Theme mode: [dark / light]
- themeVariables: 21 variables injected
- [Any renderer or family notes]
````

**Rules:**
- The "Before" block must be the original input exactly, with no modifications
- The "After" block must be a valid `styled-mermaid` output
- The changes list must include palette name, theme mode, and variable count
- Include renderer notes in the changes list if applicable
