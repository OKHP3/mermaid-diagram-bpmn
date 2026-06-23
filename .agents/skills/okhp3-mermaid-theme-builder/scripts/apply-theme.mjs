/**
 * apply-theme.mjs
 * Apply a palette to Mermaid diagram code.
 * No external dependencies — runs with: node scripts/apply-theme.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const REQUIRED_VARS = [
  "primaryColor",
  "primaryTextColor",
  "primaryBorderColor",
  "lineColor",
  "background",
  "mainBkg",
  "nodeBorder",
  "titleColor",
];

const INIT_BLOCK_RE = /%%\s*\{[\s\S]*?\}[\s\S]*?%%\s*\n?/g;

let _palettes = null;

function loadPalettes() {
  if (_palettes) return _palettes;
  const palettesPath = join(__dirname, "..", "assets", "palettes.json");
  _palettes = JSON.parse(readFileSync(palettesPath, "utf-8"));
  return _palettes;
}

function buildInitDirective(themeVariables) {
  const vars = Object.entries(themeVariables)
    .filter(([k]) => k !== "fontFamily")
    .map(([k, v]) => `"${k}": "${v}"`)
    .join(", ");

  const fontFamily = themeVariables.fontFamily
    ? `, "fontFamily": "${themeVariables.fontFamily}"`
    : "";

  return `%%{init: {"theme": "base", "themeVariables": {${vars}${fontFamily}}}}%%`;
}

/**
 * Apply a palette to Mermaid diagram code.
 *
 * @param {string} code - Mermaid diagram code (may include existing %%{init}%% block)
 * @param {Object|string} palette - Palette object (with themeVariables) or palette ID string
 * @returns {string} Themed Mermaid code with %%{init}%% prepended
 * @throws {Error} If palette is invalid or missing required variables
 */
export function applyTheme(code, palette) {
  if (!code || typeof code !== "string") {
    throw new Error("applyTheme: code must be a non-empty string");
  }

  let paletteObj = palette;

  if (typeof palette === "string") {
    const palettes = loadPalettes();
    paletteObj = palettes.find((p) => p.id === palette);
    if (!paletteObj) {
      throw new Error(`applyTheme: palette ID "${palette}" not found in palettes.json`);
    }
  }

  if (!paletteObj || typeof paletteObj !== "object") {
    throw new Error("applyTheme: palette must be a palette object or a valid palette ID string");
  }

  const themeVariables = paletteObj.themeVariables;
  if (!themeVariables || typeof themeVariables !== "object") {
    throw new Error("applyTheme: palette must have a themeVariables object");
  }

  for (const varName of REQUIRED_VARS) {
    if (!themeVariables[varName]) {
      throw new Error(`applyTheme: palette is missing required variable "${varName}"`);
    }
  }

  const strippedCode = code.replace(INIT_BLOCK_RE, "").trimStart();
  const initDirective = buildInitDirective(themeVariables);

  return `${initDirective}\n${strippedCode.trimEnd()}`;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const flowchart = readFileSync(
    join(__dirname, "..", "assets", "fixtures", "flowchart-basic.mmd"),
    "utf-8"
  );

  const result = applyTheme(flowchart, "ocean-depth");
  console.log("=== ocean-depth applied to flowchart-basic.mmd ===");
  console.log(result);

  const okhResult = applyTheme(flowchart, "overkill-hill");
  console.log("\n=== overkill-hill applied to flowchart-basic.mmd ===");
  console.log(okhResult);

  const existingInit = `%%{init: {"theme": "dark"}}%%\nflowchart LR\n  A --> B`;
  const replaced = applyTheme(existingInit, "forest-sage");
  console.log("\n=== forest-sage replacing existing init block ===");
  console.log(replaced);
}
