# Mermaid Renderer Profiles — okhp3-mermaid-theme-builder

Compatibility matrix for `themeVariables` and `%%{init}%%` blocks across 12 Mermaid renderers.

---

## Compatibility Matrix

| Renderer | themeVariables | %%{init}%% block | Dark/Light Mode | fontFamily | Config Level | Notes |
|---|---|---|---|---|---|---|
| **Mermaid Live Editor** (mermaid.live) | Full | Yes | Manual toggle | Yes | Inline init block | Reference renderer. Use to validate output before targeting other platforms. |
| **Mermaid.ai** (mermaid.ai) | Full | Yes | Manual toggle | Yes | Inline init block | Full init block support. Good validation target. |
| **GitHub Markdown** | Partial | No | System/forced | Limited | Application-level only | Strips `%%{init}%%` entirely. Applies GitHub's own forced Mermaid theme. Theming via init block has no effect. Use JSON export + `mermaid.initialize()` at app level if available. |
| **GitLab Markdown** | Partial | No | System/forced | Limited | Application-level only | Similar to GitHub. Init block stripped. Platform-enforced theme applies. |
| **Notion** | None | No | None | No | Not available | Renders diagram content only. No theming of any kind. Output will appear with Notion's default Mermaid appearance. |
| **Obsidian** | Full | Yes | Adapts to vault theme | Yes | Inline init block | Best themeVariables support among Markdown hosts. `%%{init}%%` block respected. Test with both light and dark vault themes. |
| **Confluence** | Partial | Plugin-dependent | Confluence theme | Plugin-dependent | Plugin config | Depends on which Mermaid plugin is installed. Official Atlassian plugin supports init blocks in recent versions; third-party plugins vary. Check plugin version. |
| **VS Code Preview** | Full | Yes | Editor theme | Yes | Inline init block | Requires Mermaid Preview extension or equivalent. Init block fully respected in current extension versions. |
| **Docusaurus** | Full | Yes | Site theme | Yes | `mermaid.initialize()` or inline | Configure via `themeConfig.mermaid.theme` and `themeConfig.mermaid.options.themeVariables` in `docusaurus.config.js`. Inline init blocks also work in MDX. |
| **VitePress** | Full | Yes | Site theme | Yes | `markdown.mermaidOptions` | Configure in `vitepress.config.ts` via `markdown.mermaidOptions.themeVariables`. Inline init blocks also respected. |
| **Mermaid CLI** (mmdc) | Full | Yes | Specified via flag | Yes | Config file or inline | Use `--configFile` for site-wide theming or embed `%%{init}%%` inline. Full support. Good for CI/CD pipeline rendering. |
| **Backstage** | Partial | Plugin-dependent | Backstage theme | Partial | Plugin config | Depends on Backstage Mermaid plugin version. Recent versions support themeVariables via plugin config. Init blocks may not be respected. |

---

## Advisory Policy

When a user's target renderer does not support `%%{init}%%` blocks, add this advisory **after** the styled output (not before):

### GitHub / GitLab Advisory
```
Renderer advisory: GitHub/GitLab Markdown strips the %%{init}%% theming block. Your diagram will render with the platform's default theme. To apply theming at the application level, use the themeVariables JSON export (Export A) and pass it to mermaid.initialize() in your site's configuration file — this only applies if you control the Mermaid configuration for the site, not for diagrams embedded in standard GitHub/GitLab README files or issue comments.
```

### Notion Advisory
```
Renderer advisory: Notion does not support Mermaid themeVariables or %%{init}%% blocks. Your diagram will render with Notion's default Mermaid theme. No workaround is available within Notion's editor. Consider exporting the diagram as a styled SVG image from mermaid.live or Mermaid CLI and embedding the image instead.
```

### Confluence Advisory
```
Renderer advisory: Confluence Mermaid support depends on the installed plugin. If using the official Atlassian Mermaid plugin (version 1.3+), %%{init}%% blocks are respected. If using an older or third-party plugin, theming may not apply. Check your plugin version and test output in your Confluence instance.
```

---

## Renderer Selection Guide

| Use Case | Recommended Renderer |
|---|---|
| Validating palette output | Mermaid Live Editor or Mermaid.ai |
| Personal notes / knowledge base | Obsidian |
| Engineering docs site | Docusaurus or VitePress |
| Local development documentation | VS Code Preview |
| CI/CD diagram generation | Mermaid CLI |
| Corporate wiki | Confluence (check plugin version) |
| Public GitHub README | Do not expect theming; use image export |
| Notion documentation | Do not expect theming; use image export |

---

## Version Dependency Notes

- Mermaid v10+ required for reliable `themeVariables` support
- Mermaid v11+ introduced improved `stateDiagram-v2` and `xychart-beta` theming
- `%%{init}%%` syntax has been stable since Mermaid v8.x
- Some renderers pin an older Mermaid version; always verify the host's Mermaid version when theming fails unexpectedly
- `bpmn-beta` is the OKHP3 prototype diagram type — not a Mermaid core type; theming applies to the standalone SVG renderer, not through the standard Mermaid rendering pipeline on external hosts
