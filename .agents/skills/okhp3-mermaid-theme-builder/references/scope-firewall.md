# Scope Firewall

This document defines what must never appear in any skill output. These are hard rules — not guidelines.

---

## 1. Prohibited Content

### Employer brand content

Never include any of the following in skill output:

- The name of any employer, employer brand, or corporate entity not explicitly part of the OverKill Hill P³ / OverKill Hill project family
- Any employer branding, job postings, corporate messaging, or organizational content unrelated to this tool
- Any content that implies this skill, the tool, or its author has an affiliation with any unrelated corporate entity

**Why this matters:** The root codebase includes a legal disassociation disclaimer that names a third-party company. Reproducing that company name in skill output risks creating a false association. The disclaimer stays in the app; agent-facing skill output must not reference any unrelated corporate entity by name.

---

### Hallucinated themeVariable Names

Never use themeVariable names that are not:

1. Present in `assets/palettes.json` (keys of the `themeVariables` object), OR
2. Documented at https://mermaid.js.org/config/theming.html as official Mermaid themeVariables

**Prohibited examples** (do not use):
- `accentColor` — not a Mermaid themeVariable
- `highlightColor` — not a Mermaid themeVariable
- `primaryAccent` — not a Mermaid themeVariable
- `borderRadius` — not a themeVariable (CSS property, not applicable here)
- `linkColor` — not the correct name (use `lineColor`)
- `nodeBackground` — not the correct name (use `mainBkg` or `primaryColor`)

**Why this matters:** Hallucinated variable names silently fail in Mermaid. The renderer ignores unknown keys, leaving the diagram unstyled.

---

### Renderer Promises That Contradict the Matrix

Never claim a renderer supports a feature when `assets/renderer-profiles.json` records `"none"` for that capability.

**Prohibited claims:**

| Claim | Violates |
|---|---|
| "GitHub supports CSS injection" | `github.supportsCSSInjection = "none"` |
| "Notion supports custom fonts" | `notion.supportsCustomFonts = "none"` |
| "Confluence supports Hand-Drawn look" | `confluence` has no look support for neo/handDrawn |
| "GitLab supports CSS injection" | `gitlab.supportsCSSInjection = "none"` |
| "Notion fully supports themeVariables" | `notion.supportsThemeVariables = "partial"` |
| "Confluence fully supports %%{init}%%" | `confluence.supportsInitDirective = "partial"` |

When a renderer has `"partial"` support, always include a caveat explaining the limitation.

---

### Stub or Placeholder Content

Never output:

- Unresolved stub markers (e.g. `FIXME`)
- Unresolved template text in square brackets
- Ellipsis `...` in a JSON block where actual values should appear
- Palette hex values derived from memory instead of `assets/palettes.json`
- Renderer profile data derived from memory instead of `assets/renderer-profiles.json`

---

## 2. Required Accuracy Checks

Before generating any themed output, verify:

1. **Palette ID exists** — The palette ID must match one of the 7 IDs in `assets/palettes.json`: `ocean-depth`, `forest-sage`, `slate-ember`, `violet-mist`, `overkill-hill`, `glee-fully`, `askjamie`

2. **Hex values are exact** — All hex values must match `assets/palettes.json` exactly. Do not round, approximate, or adjust.

3. **themeVariable names are canonical** — Only variable names present in `assets/theme-variable-map.json` or `assets/palettes.json` are permitted.

4. **Renderer claims match the matrix** — All renderer support claims must match `assets/renderer-profiles.json`.

5. **`"theme": "base"` is always present** — Never omit this. Never substitute another theme name.

---

## 3. Private / Internal Content

The following source files exist in the repo for internal use only. Their content must not be reproduced in skill output:

| File | Reason |
|---|---|
| `docs/product-brief.md` | Internal product strategy |
| `docs/market-research.md` | Internal competitive analysis |
| `docs/prototype-to-product-retrospective.md` | Internal retrospective notes |
| `docs/roadmap.md` | Internal planning |
| `docs/legal.md` | Internal legal notes |
| `docs/product-positioning.md` | Internal positioning strategy |

The following are safe to reference: `docs/renderer-compatibility.md`, `docs/mermaid-theming-reference.md`, `docs/mermaid-capability-registry.md`, `docs/capability-crosswalk.md`.

---

## 4. Out-of-Scope Features

Do not attempt to provide, simulate, or reference:

- **Live rendering** — This skill produces text output only. Mermaid rendering requires a browser or CLI environment.
- **DOM manipulation** — No JavaScript, React, or browser API references in skill output.
- **File downloads** — No Blob, FileReader, canvas-to-PNG, or SVG export instructions.
- **Backend services** — The tool is 100% client-side. There is no API, webhook, or backend.
- **Network calls from scripts** — The scripts in `scripts/` must have zero external dependencies. No `fetch`, `axios`, or HTTP requests.
- **BPMN for Mermaid** — A separate skill (`okhp3-bpmn-for-mermaid`) covers BPMN content in the `OKHP3/mermaid-diagram-bpmn` repository. Do not conflate the two.
