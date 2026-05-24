# okhp3-mermaid-theme-builder

**Agent Skill** — Visual governance for Mermaid diagrams.

This skill packages the palette application, themeVariables generation, and prompt scaffold export logic of the [Mermaid Theme Builder](https://okhp3.github.io/mermaid-theme-builder/) application in a form that any SKILL.md-compatible agent platform can load and use.

> **The app is for people. The skill is for agents. The prompt scaffolds are for everyone else.**

---

## What This Skill Does

- Applies one of 8 named palettes to any Mermaid diagram
- Generates a complete 21-variable `themeVariables` block
- Exports themed diagrams, JSON configs, Markdown bootstraps, and LLM prompt scaffolds
- Flags renderer-specific compatibility issues (GitHub, Notion, Obsidian, VS Code, etc.)
- Detects diagram family and warns when themeVariables support is reduced

## Palettes

| Palette | Slug | Mode |
|---|---|---|
| Ocean Depth | `ocean-depth` | Dark |
| Forest Sage | `forest-sage` | Dark |
| Slate Ember | `slate-ember` | Dark |
| Violet Mist | `violet-mist` | Dark |
| OKH P³ | `okh-p3` | Dark |
| Glee-fully | `glee-fully` | Light |
| AskJamie | `askjamie` | Light |
| Neutral Enterprise | `neutral-enterprise` | Light |

## Structure

```
skills/okhp3-mermaid-theme-builder/
├── SKILL.md                          ← Agent instructions (load to activate)
├── README.md                         ← This file
├── LICENSE                           ← MIT
├── references/
│   ├── palette-contract.md           ← Palette schema and derivation rules
│   ├── diagram-family-rules.md       ← Per-family themeVariables coverage
│   ├── mermaid-renderer-profiles.md  ← 12-renderer compatibility matrix
│   ├── output-format-contract.md     ← Exact format specs for all 6 output modes
│   ├── prompt-scaffold-patterns.md   ← Reusable LLM prompt pack formats
│   └── scope-firewall.md             ← What may and may not appear in skill output
├── assets/
│   ├── palettes.json                 ← 8-palette machine-readable registry
│   ├── renderer-profiles.json        ← Renderer compatibility data
│   ├── theme-variable-map.json       ← 21-variable coverage map by diagram family
│   └── fixtures/
│       ├── flowchart-basic.mmd
│       ├── sequence-basic.mmd
│       ├── class-basic.mmd
│       ├── state-basic.mmd
│       └── gantt-basic.mmd
├── scripts/
│   ├── detect-diagram.mjs            ← Detect diagram family from source
│   ├── normalize-mermaid.mjs         ← Strip fences, prose, existing init blocks
│   ├── apply-theme.mjs               ← Apply palette; return styled output
│   ├── validate-theme.mjs            ← Validate hex values and variable completeness
│   └── generate-prompt-scaffold.mjs  ← Emit LLM prompt scaffold for a palette
└── tests/
    ├── validate-skill.test.mjs       ← Structural and spec compliance tests
    ├── detect-diagram.test.mjs       ← detect-diagram.mjs unit tests
    └── apply-theme.test.mjs          ← apply-theme.mjs + validate-theme.mjs tests
```

## Running Tests

```bash
node --test skills/okhp3-mermaid-theme-builder/tests/validate-skill.test.mjs \
              skills/okhp3-mermaid-theme-builder/tests/detect-diagram.test.mjs \
              skills/okhp3-mermaid-theme-builder/tests/apply-theme.test.mjs
```

## Using the Scripts

```bash
# Detect diagram family
node skills/okhp3-mermaid-theme-builder/scripts/detect-diagram.mjs --file diagram.mmd

# Apply a palette
node skills/okhp3-mermaid-theme-builder/scripts/apply-theme.mjs \
  --palette ocean-depth \
  --file diagram.mmd \
  --mode styled-mermaid

# Validate palette variables
node skills/okhp3-mermaid-theme-builder/scripts/validate-theme.mjs --palette ocean-depth

# Generate a prompt scaffold
node skills/okhp3-mermaid-theme-builder/scripts/generate-prompt-scaffold.mjs \
  --palette okh-p3 \
  --diagram-type bpmn-beta
```

## Related Skills

- [`okhp3-bpmn-for-mermaid`](../okhp3-bpmn-for-mermaid/) — Generate and validate bpmn-beta diagrams; compose with this skill for themed BPMN output

## Parent Application

- **Live tool:** https://okhp3.github.io/mermaid-theme-builder/
- **GitHub repo:** https://github.com/OKHP3/mermaid-theme-builder
- **Project page:** https://overkillhill.com/projects/mermaid-theme-builder/

## License

MIT — see [LICENSE](./LICENSE)
