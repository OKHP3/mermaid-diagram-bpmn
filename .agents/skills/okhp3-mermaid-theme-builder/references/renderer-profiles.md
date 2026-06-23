# Renderer Profiles

Full compatibility matrix for 7 Mermaid renderers, derived from `src/data/renderer-parity.ts` (Mermaid v11.15.0 reference).

---

## Compatibility Matrix

| Renderer | `%%{init}%%` | themeVariables | classDef | CSS inject | Custom fonts | Risk | Recommended output |
|---|---|---|---|---|---|---|---|
| mermaid.live | Full | Full | Full | Full | Full | Low | Format A |
| GitHub | Full | Full | Full | None | None | Low | Format A |
| GitLab | Full | Full | Full | None | None | Low | Format A |
| Notion | Partial | Partial | Full | None | None | Medium | Format A |
| Obsidian | Full | Full | Full | Partial | Partial | Low | Format A |
| Confluence + Plugin | Partial | Partial | Partial | None | None | High | Format A |
| CLI (mmdc) | Full | Full | Full | Full | Full | Low | Format A |

**Support levels:**
- **Full** — feature works as documented; safe to use
- **Partial** — feature works with known limitations or caveats; validate before publishing
- **None** — feature is not supported; do not rely on it

---

## mermaid-live

**URL:** https://mermaid.live  
**Mermaid version:** Latest (always current)  
**Risk level:** Low

Reference renderer. All looks (Classic, Neo, Hand-Drawn), themeVariables, classDef, CSS injection, and custom fonts are fully supported. Use this to validate output before committing to other renderers.

**Looks supported:** Classic (full), Neo (full), Hand-Drawn (full)

No caveats.

---

## github

**URL:** https://github.com  
**Mermaid version:** 11.x (pinned, updated periodically)  
**Risk level:** Low

Renders Mermaid in issues, PRs, markdown files, and wikis. The `%%{init}%%` directive is respected and themeVariables apply.

**Looks supported:** Classic (full), Neo (partial — depends on pinned version), Hand-Drawn (none — Rough.js not bundled)

**Caveats:**
- CSS injection not supported — external stylesheets cannot target Mermaid SVG
- Custom web fonts blocked by CSP — system font fallback applies
- Hand-Drawn requires Rough.js — not available in GitHub renderer
- Neo look depends on GitHub's pinned Mermaid version
- Some beta/experimental diagram families may not render

---

## gitlab

**URL:** https://gitlab.com  
**Mermaid version:** 11.x (varies by GitLab version)  
**Risk level:** Low

Similar to GitHub. Mermaid is rendered in markdown files, wikis, and descriptions. themeVariables from `%%{init}%%` are respected.

**Looks supported:** Classic (full), Neo (partial), Hand-Drawn (none)

**Caveats:**
- CSS injection not supported
- Custom web fonts blocked by CSP — system font fallback applies
- Hand-Drawn not available
- Self-hosted instances may use a significantly older Mermaid version

---

## notion

**URL:** https://notion.so  
**Mermaid version:** 10.x (pinned, rarely updated)  
**Risk level:** Medium

Notion embeds Mermaid diagrams in pages. The `%%{init}%%` directive is parsed but only a subset of themeVariables are applied — colors may differ from other renderers.

**Looks supported:** Classic (full), Neo (none), Hand-Drawn (none)

**Caveats:**
- `%%{init}%%` directive parsed but only a subset of themeVariables are applied
- Pinned to an older Mermaid version — Neo and Hand-Drawn unavailable
- CSS injection not supported
- Custom fonts not supported
- Beta and experimental diagram families may fail to render
- No dark-mode theming passthrough

**Workaround:** Use only the core 13 themeVariables (no `secondaryTextColor`, `tertiaryTextColor`, etc.) and validate in Notion before publishing.

---

## obsidian

**URL:** https://obsidian.md  
**Mermaid version:** 11.x (built-in; plugin may update)  
**Risk level:** Low

Obsidian supports Mermaid via a built-in renderer and community plugins. themeVariables are respected. The Mermaid Enhancer or similar plugins can upgrade the bundled Mermaid version.

**Looks supported:** Classic (full), Neo (partial), Hand-Drawn (partial)

**Caveats:**
- Mermaid version depends on Obsidian release or installed plugin
- CSS injection requires custom Obsidian CSS snippets
- Custom web fonts require CSS snippet; system fonts work
- Neo/Hand-Drawn availability depends on bundled Mermaid version

**Workaround:** For CSS injection, create an Obsidian CSS snippet targeting `.mermaid` elements.

---

## confluence

**URL:** https://marketplace.atlassian.com (third-party plugin required)  
**Mermaid version:** Varies by plugin (often 10.x)  
**Risk level:** High

Mermaid in Confluence requires a third-party macro plugin. Plugin quality and Mermaid version vary. Most plugins support basic themeVariables; CSS injection is generally not available.

**Looks supported:** Classic (partial — depends on plugin), Neo (none), Hand-Drawn (none)

**Caveats:**
- Third-party plugin required — not native Confluence functionality
- Plugin version determines Mermaid version and feature support
- `%%{init}%%` support and themeVariable coverage varies by plugin
- classDef rendering quality varies by plugin
- CSS injection not available
- Custom fonts not supported
- Neo and Hand-Drawn looks not supported
- Cloud vs. Data Center plugin behavior may differ

**Workaround:** Use only `primaryColor`, `background`, `titleColor`, and `fontFamily`. Test the specific plugin and version in use before committing to theming.

---

## cli

**URL:** https://github.com/mermaid-js/mermaid-cli  
**Mermaid version:** Pinned to installed npm package version  
**Risk level:** Low

Command-line renderer using Puppeteer + Mermaid. Produces SVG/PNG/PDF. Full feature support — the installed Mermaid version determines look and feature support.

**Looks supported:** Classic (full), Neo (full), Hand-Drawn (full)

**Caveats:**
- Must install matching Mermaid npm version to access new looks/features
- CSS injection via `--cssFile` flag — not inline
- Requires Node.js + Chromium (Puppeteer) in CI environment

---

## Renderer-Specific Workarounds

| Renderer | Issue | Workaround |
|---|---|---|
| GitHub | Custom fonts blocked | Use system-ui or sans-serif font stack; drop custom font name |
| GitHub | Hand-Drawn look fails | Use Classic look only |
| GitLab (self-hosted) | Old Mermaid version | Use stable diagram families only (flowchart, sequence, class, state, ER, Gantt, pie) |
| Notion | themeVariables partially applied | Use core 13 vars only; validate in Notion before publishing |
| Notion | Beta families may not render | Use only stable families in Notion |
| Obsidian | CSS injection blocked | Use CSS snippets in Obsidian vault settings |
| Confluence | Plugin version unknown | Test with `%%{init}%%` in the actual Confluence instance first |
| Confluence | classDef varies by plugin | Verify classDef rendering in the target plugin before relying on it |
| CLI | CSS injection inline fails | Use `--cssFile` flag to pass a CSS file to mmdc |
