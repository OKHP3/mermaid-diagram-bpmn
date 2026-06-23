# Prompt Scaffold Patterns

8 parameterized scaffold templates for pre-prompting LLMs to generate consistently styled Mermaid diagrams. Each template uses `{{PALETTE_NAME}}` and `{{THEME_VARIABLES_JSON}}` substitution tokens.

Substitute template variables before use:
- `{{PALETTE_NAME}}` → display name from `assets/palettes.json` (e.g., `"OverKill Hill P³"`)
- `{{THEME_VARIABLES_JSON}}` → the `themeVariables` object from `assets/palettes.json`
- `{{RENDERER}}` → target renderer name (e.g., `"GitHub"`)

---

## Pattern 1 — General Purpose

Use for: most diagrams where no specific renderer or brand constraint applies.

```markdown
## Mermaid Diagram Style Rules

**Palette:** {{PALETTE_NAME}}
**Theme base:** base (always — never use default, dark, forest, or neutral)

### Required %%{init}%% block

Prepend this exact block to every Mermaid diagram you generate:

\`\`\`
%%{init: {"theme": "base", "themeVariables": {{THEME_VARIABLES_JSON}}}}%%
\`\`\`

### Rules

1. Always use `"theme": "base"`
2. All themeVariable color values must be hex (#RRGGBB format)
3. fontFamily must be a quoted CSS font stack string
4. fontSize must end in `px` if used
5. Strip any existing %%{init}%% block before prepending this one
6. Do not add a `"look"` key unless the user explicitly requests Neo or Hand-Drawn
```

---

## Pattern 2 — GitHub-Safe

Use for: diagrams destined for GitHub markdown files, issues, PRs, or wikis.

```markdown
## Mermaid Diagram Style Rules — GitHub Target

**Palette:** {{PALETTE_NAME}}
**Target renderer:** GitHub
**Theme base:** base (always)

### Required %%{init}%% block

\`\`\`
%%{init: {"theme": "base", "themeVariables": {{THEME_VARIABLES_JSON}}}}%%
\`\`\`

### GitHub renderer constraints

- CSS injection NOT supported — do not suggest or include CSS
- Custom web fonts are blocked by GitHub's CSP — use `system-ui, sans-serif` as font fallback
- Hand-Drawn look NOT supported (requires Rough.js which GitHub does not bundle)
- Neo look availability depends on GitHub's pinned Mermaid version — use Classic look to be safe
- Some beta/experimental diagram families may not render

### Rules

1. Always use `"theme": "base"`
2. Use Classic look only — omit the `"look"` key entirely
3. Replace any custom `fontFamily` with `"system-ui, sans-serif"`
4. Use only stable diagram families: flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, gantt, pie, gitGraph
5. Hex values only in themeVariables
```

---

## Pattern 3 — Documentation Site

Use for: diagrams embedded in static site generators (Docusaurus, MkDocs, VitePress, Astro), technical documentation portals.

```markdown
## Mermaid Diagram Style Rules — Documentation

**Palette:** {{PALETTE_NAME}}
**Theme base:** base (always)

### Required %%{init}%% block

\`\`\`
%%{init: {"theme": "base", "themeVariables": {{THEME_VARIABLES_JSON}}}}%%
\`\`\`

### Documentation diagram conventions

- Prefer flowchart, sequenceDiagram, classDiagram, and erDiagram for technical documentation
- Keep node labels concise — max 5 words; use subgraph titles for context
- Use subgraphs to group related components
- Use `classDef` to differentiate node types (only in flowchart, classDiagram, stateDiagram, block)
- Avoid experimental/beta diagram families unless the site's Mermaid version is pinned to 11.x+

### Rules

1. Always use `"theme": "base"`
2. Hex values only in themeVariables
3. fontFamily must be a quoted CSS font stack
4. Strip any existing %%{init}%% before prepending
```

---

## Pattern 4 — Brand Enforcement

Use for: diagrams that must strictly follow an organization's brand palette with no deviation.

```markdown
## Mermaid Diagram Style Rules — Brand Enforced

**Palette:** {{PALETTE_NAME}}
**Brand:** OverKill Hill P³ (okhp3)
**Theme base:** base (always — immutable)

### Brand identity

This theme is a brand preset. Color values are non-negotiable. Do not adjust, substitute, or suggest alternative colors.

### Required %%{init}%% block — DO NOT MODIFY

\`\`\`
%%{init: {"theme": "base", "themeVariables": {{THEME_VARIABLES_JSON}}}}%%
\`\`\`

### Brand enforcement rules

1. `"theme": "base"` is immutable — never change this
2. The themeVariables block above must be used verbatim — no color substitutions
3. fontFamily must be the exact font stack from the palette — no substitutions
4. Do not add additional themeVariables not listed in this block
5. Do not use `"look": "neo"` or `"look": "handDrawn"` unless explicitly requested
6. Strip any existing %%{init}%% block before prepending this one
7. For brand diagrams: use only flowchart and sequenceDiagram unless a specific family is requested
```

---

## Pattern 5 — Architecture Diagrams

Use for: system architecture, infrastructure maps, C4 diagrams, service topology.

```markdown
## Mermaid Diagram Style Rules — Architecture

**Palette:** {{PALETTE_NAME}}
**Theme base:** base (always)
**Preferred families:** flowchart, c4Diagram, block-beta

### Required %%{init}%% block

\`\`\`
%%{init: {"theme": "base", "themeVariables": {{THEME_VARIABLES_JSON}}}}%%
\`\`\`

### Architecture diagram conventions

- Use flowchart TD or LR for system component maps
- Use subgraphs to define system boundaries (services, regions, layers)
- Use classDef to differentiate node types:
  - Services → primary fill
  - Data stores → secondary fill
  - External systems → tertiary fill
  - Boundaries → cluster/subgraph with dashed border
- Use `c4Context` or `c4Container` for high-level architecture; flowchart for detailed component views
- Keep labels precise and technical — this is for engineers and architects

### Rules

1. Always use `"theme": "base"`
2. Hex values only in themeVariables
3. For multi-system diagrams: use subgraphs with descriptive titles
4. Label edges with protocol or data type (e.g., REST, gRPC, Kafka, SQL)
5. Strip any existing %%{init}%% before prepending
```

---

## Pattern 6 — Process Diagrams

Use for: business process flows, onboarding sequences, approval workflows, decision trees.

```markdown
## Mermaid Diagram Style Rules — Process

**Palette:** {{PALETTE_NAME}}
**Theme base:** base (always)
**Preferred families:** flowchart, sequenceDiagram, stateDiagram

### Required %%{init}%% block

\`\`\`
%%{init: {"theme": "base", "themeVariables": {{THEME_VARIABLES_JSON}}}}%%
\`\`\`

### Process diagram conventions

- Use flowchart for decision trees and linear processes
- Use sequenceDiagram for multi-actor interactions and handoffs
- Use stateDiagram for lifecycle and status transitions
- Use diamond shapes `{Decision}` for branch points in flowchart
- Use round shapes `(Step)` for process steps
- Keep labels action-oriented: verb + noun (e.g., "Review application", "Send notification")
- Group related steps in subgraphs with phase names

### Rules

1. Always use `"theme": "base"`
2. Hex values only in themeVariables
3. fontFamily must be a quoted CSS font stack
4. Limit diagram depth — max 3 levels of nesting for readability
5. Strip any existing %%{init}%% before prepending
```

---

## Pattern 7 — Data Visualization

Use for: Gantt charts, XY charts, Sankey diagrams, pie charts, quadrant charts.

```markdown
## Mermaid Diagram Style Rules — Data Visualization

**Palette:** {{PALETTE_NAME}}
**Theme base:** base (always)
**Preferred families:** gantt, xychart-beta, sankey-beta, pie, quadrantChart

### Required %%{init}%% block

\`\`\`
%%{init: {"theme": "base", "themeVariables": {{THEME_VARIABLES_JSON}}}}%%
\`\`\`

### Data visualization constraints

- Gantt: individual task bar colors are managed internally — themeVariables control background and titles only
- Pie: slice colors cycle through Mermaid's internal palette — themeVariables control background and title only
- XY Chart (beta): background, axis labels, and titles apply; bar/line series colors partially respond to themeVariables
- Sankey (beta): node fills and labels respond to themeVariables; link flow colors are internally cycled
- Quadrant: background, axis labels, and grid lines apply; quadrant fills partially respond

### Rules

1. Always use `"theme": "base"`
2. Hex values only in themeVariables
3. For beta families (xychart-beta, sankey-beta): validate in target renderer before publishing
4. For Gantt and Pie: do not promise full color control — themeVariables only control canvas-level colors
5. Strip any existing %%{init}%% before prepending
```

---

## Pattern 8 — Minimal / Accessible

Use for: high-contrast diagrams, accessibility-first output, minimal styling with clear legibility.

```markdown
## Mermaid Diagram Style Rules — Minimal / Accessible

**Palette:** {{PALETTE_NAME}}
**Theme base:** base (always)

### Required %%{init}%% block

\`\`\`
%%{init: {"theme": "base", "themeVariables": {{THEME_VARIABLES_JSON}}}}%%
\`\`\`

### Accessibility conventions

- Prioritize high contrast between node fills and text (minimum 4.5:1 ratio for normal text)
- Avoid color as the only differentiator — use shape and label to convey meaning
- Keep node labels short and plain-language (max 4 words)
- Avoid Hand-Drawn look — it reduces legibility
- Use Classic look for maximum renderer compatibility
- Prefer flowchart and stateDiagram — they have the broadest styling surface

### Rules

1. Always use `"theme": "base"`
2. Hex values only in themeVariables
3. Use Classic look only — omit the `"look"` key
4. Do not use fontFamily values with decorative or low-legibility fonts
5. Strip any existing %%{init}%% before prepending
6. Do not use opacity or transparency modifiers in themeVariables
```
