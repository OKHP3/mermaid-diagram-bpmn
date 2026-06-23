/**
 * generate-prompt-scaffold.mjs
 * Generate a prompt scaffold document for LLM pre-prompting.
 * No external dependencies — runs with: node scripts/generate-prompt-scaffold.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

let _palettes = null;
let _renderers = null;

function loadPalettes() {
  if (_palettes) return _palettes;
  _palettes = JSON.parse(
    readFileSync(join(__dirname, "..", "assets", "palettes.json"), "utf-8")
  );
  return _palettes;
}

function loadRenderers() {
  if (_renderers) return _renderers;
  _renderers = JSON.parse(
    readFileSync(join(__dirname, "..", "assets", "renderer-profiles.json"), "utf-8")
  );
  return _renderers;
}

function themeVarsToJson(themeVariables) {
  return (
    "{" +
    Object.entries(themeVariables)
      .filter(([k]) => k !== "fontFamily")
      .map(([k, v]) => `"${k}": "${v}"`)
      .join(", ") +
    (themeVariables.fontFamily ? `, "fontFamily": "${themeVariables.fontFamily}"` : "") +
    "}"
  );
}

function buildRendererSection(renderer) {
  if (!renderer) return "";

  const blocked = [];
  if (renderer.supportsCSSInjection === "none") blocked.push("CSS injection not supported");
  if (renderer.supportsCustomFonts === "none") blocked.push("Custom web fonts blocked (CSP) — use system-ui, sans-serif");
  if (renderer.supportsInitDirective === "partial") blocked.push("%%{init}%% support is partial — validate in target renderer");
  if (renderer.supportsThemeVariables === "partial") blocked.push("themeVariable support is partial — some vars may be ignored");

  if (blocked.length === 0) return "";

  return `\n### Renderer constraints (${renderer.name})\n\n${blocked.map((b) => `- ${b}`).join("\n")}\n`;
}

/**
 * Generate a prompt scaffold document.
 *
 * @param {Object|string} palette - Palette object or palette ID string
 * @param {Object} [options]
 * @param {string} [options.targetModel] - Renderer/model ID from renderer-profiles.json (primary option name)
 * @param {string} [options.targetRenderer] - Alias for targetModel (backward-compatible)
 * @param {'A'|'B'|'C'} [options.format] - Scaffold format (default: 'C')
 * @returns {string} Prompt scaffold Markdown document
 */
export function generatePromptScaffold(palette, options = {}) {
  const { targetModel, targetRenderer, format = "C" } = options;
  const resolvedRenderer = targetModel ?? targetRenderer;

  let paletteObj = palette;
  if (typeof palette === "string") {
    const palettes = loadPalettes();
    paletteObj = palettes.find((p) => p.id === palette);
    if (!paletteObj) {
      throw new Error(`generatePromptScaffold: palette ID "${palette}" not found in palettes.json`);
    }
  }

  if (!paletteObj || !paletteObj.themeVariables) {
    throw new Error("generatePromptScaffold: palette must have a themeVariables object");
  }

  const themeVarsJson = themeVarsToJson(paletteObj.themeVariables);
  const initBlock = `%%{init: {"theme": "base", "themeVariables": ${themeVarsJson}}}%%`;

  let rendererObj = null;
  if (resolvedRenderer) {
    const renderers = loadRenderers();
    rendererObj = renderers.find((r) => r.id === resolvedRenderer) || null;
  }

  const rendererSection = buildRendererSection(rendererObj);
  const rendererLabel = rendererObj ? `\n**Target renderer:** ${rendererObj.name}` : "";

  if (format === "A") {
    return `## Mermaid Styling Rules — ${paletteObj.display}

**Palette:** ${paletteObj.display}${rendererLabel}

\`\`\`
${initBlock}
\`\`\`
`;
  }

  if (format === "B") {
    return `## Mermaid Theme — ${paletteObj.display}

Palette: ${paletteObj.display}${rendererLabel ? `\nRenderer: ${rendererObj?.name}` : ""}

Init block:
\`\`\`
${initBlock}
\`\`\`
${rendererSection}`;
  }

  return `## Mermaid Diagram Style Rules

**Palette:** ${paletteObj.display}${rendererLabel}
**Theme base:** base (always — never use default, dark, forest, or neutral)

### Required %%{init}%% block

Prepend this exact block to every Mermaid diagram you generate:

\`\`\`
${initBlock}
\`\`\`
${rendererSection}
### Rules

1. Always use \`"theme": "base"\` — immutable
2. All themeVariable color values must be hex (#RRGGBB format)
3. fontFamily must be a quoted CSS font stack string
4. fontSize must end in \`px\` if used
5. Strip any existing %%{init}%% block before prepending this one
6. Do not add a \`"look"\` key unless the user explicitly requests Neo or Hand-Drawn
7. Do not invent or substitute themeVariable names not shown in this block
`;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  console.log("=== Format C — General (ocean-depth) ===");
  console.log(generatePromptScaffold("ocean-depth"));

  console.log("\n=== Format C — GitHub renderer (overkill-hill) ===");
  console.log(generatePromptScaffold("overkill-hill", { targetRenderer: "github" }));

  console.log("\n=== Format A — Minimal (askjamie) ===");
  console.log(generatePromptScaffold("askjamie", { format: "A" }));
}
