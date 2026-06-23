/**
 * validate-theme.mjs
 * Validate a themed Mermaid diagram's %%{init}%% block.
 * No external dependencies — runs with: node scripts/validate-theme.mjs
 */

const HEX_RE = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
const PX_RE = /^\d+(\.\d+)?px$/;

const KNOWN_VARS = new Set([
  "primaryColor", "primaryTextColor", "primaryBorderColor",
  "lineColor", "secondaryColor", "secondaryTextColor", "secondaryBorderColor",
  "tertiaryColor", "tertiaryTextColor", "tertiaryBorderColor",
  "textColor", "background", "mainBkg", "nodeBorder", "clusterBkg",
  "titleColor", "edgeLabelBackground", "fontFamily", "fontSize",
  "actorBkg", "noteBkgColor", "gridColor",
  "fillType0", "fillType1", "fillType2", "fillType3",
  "fillType4", "fillType5", "fillType6", "fillType7",
  "cScale0", "cScale1", "cScale2", "cScale3", "cScale4",
  "cScale5", "cScale6", "cScale7", "cScale8", "cScale9",
  "cScale10", "cScale11",
  "edgeLabelBackground",
  "nodeTextColor",
  "labelColor",
  "labelBackground",
  "attributeBackgroundColorEven",
  "attributeBackgroundColorOdd",
  "git0", "git1", "git2", "git3", "git4", "git5", "git6", "git7",
  "gitBranchLabel0", "gitBranchLabel1", "gitBranchLabel2", "gitBranchLabel3",
  "gitBranchLabel4", "gitBranchLabel5", "gitBranchLabel6", "gitBranchLabel7",
  "gitInv0", "gitInv1", "gitInv2", "gitInv3", "gitInv4", "gitInv5", "gitInv6", "gitInv7",
  "sequenceNumberColor",
  "activationBorderColor",
  "activationBkgColor",
  "loopTextColor",
  "altBackground",
  "sectionBkgColor", "sectionBkgColor2",
  "altSectionBkgColor",
  "gridColor",
  "todayLineColor",
  "taskTextColor",
  "taskTextOutsideColor",
  "taskTextClickableColor",
  "taskTextLightColor",
  "taskBorderColor",
  "taskBkgColor",
  "activeTaskBorderColor",
  "activeTaskBkgColor",
  "doneTaskBkgColor",
  "doneTaskBorderColor",
  "critBorderColor",
  "critBkgColor",
  "pieLegendTextColor",
  "pie1", "pie2", "pie3", "pie4", "pie5", "pie6", "pie7", "pie8", "pie9", "pie10", "pie11", "pie12",
  "pieTitleTextColor",
  "pieSectionTextColor",
  "pieLegendTextSize",
  "pieStrokeWidth",
  "pieOuterStrokeWidth",
  "pieOuterStrokeColor",
  "pieOpacity",
  "quadrant1Fill", "quadrant2Fill", "quadrant3Fill", "quadrant4Fill",
  "quadrant1TextFill", "quadrant2TextFill", "quadrant3TextFill", "quadrant4TextFill",
  "quadrantPointFill", "quadrantPointTextFill",
  "quadrantXAxisTextFill", "quadrantYAxisTextFill",
  "quadrantTitleFill", "quadrantInternalBorderStrokeFill",
  "quadrantExternalBorderStrokeFill",
  "xyChart",
  "classText",
  "stateLabelColor", "stateBkg", "labelBackgroundColor",
  "compositeBackground", "compositeTitleBackground", "compositeBorder",
  "innerEndBackground", "errorBkgColor", "errorTextColor",
  "specialStateColor",
  "transitionColor", "transitionLabelColor",
  "requirementBackground", "requirementBorderColor", "requirementBorderSize",
  "requirementTextColor",
  "relationColor", "relationLabelBackground", "relationLabelColor",
  "fillType",
  "look",
]);

/**
 * Extract themeVariables from a %%{init}%% block using simple text parsing.
 * Returns null if no init block is found.
 * Handles both quoted keys ("theme") and unquoted keys (theme).
 *
 * @param {string} code
 * @returns {{ theme?: string, vars: Record<string, string> } | null}
 */
function extractInitBlock(code) {
  const initMatch = code.match(/%%\s*\{[\s\S]*?init\s*:\s*([\s\S]*?)\}\s*%%/);
  if (!initMatch) return null;

  const directiveBlock = initMatch[0];

  const themeMatch =
    directiveBlock.match(/"theme"\s*:\s*"([A-Za-z][\w-]*)"/) ||
    directiveBlock.match(/'theme'\s*:\s*'([A-Za-z][\w-]*)'/) ||
    directiveBlock.match(/\btheme\s*:\s*["']?([A-Za-z][\w-]*)["']?/);
  const theme = themeMatch ? themeMatch[1] : undefined;

  const tvMatch = directiveBlock.match(/(?:"themeVariables"|themeVariables)\s*:\s*\{([\s\S]*?)\}/);
  if (!tvMatch) return { theme, vars: {} };

  const inside = tvMatch[1];
  const vars = {};
  const kvRe = /(?:["']([A-Za-z_][\w-]*)["']|([A-Za-z_][\w-]*))\s*:\s*(?:"([^"]*)"|'([^']*)'|([^,}\n]+))/g;
  let m;
  while ((m = kvRe.exec(inside)) !== null) {
    const key = m[1] ?? m[2];
    const value = (m[3] ?? m[4] ?? m[5] ?? "").trim().replace(/,\s*$/, "");
    if (key && value) vars[key] = value;
  }

  return { theme, vars };
}

/**
 * Validate a themed Mermaid diagram.
 *
 * @param {string} code - Themed Mermaid code (should start with %%{init}%%)
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateTheme(code) {
  const errors = [];
  const warnings = [];

  if (!code || typeof code !== "string") {
    return { valid: false, errors: ["No code provided"], warnings: [] };
  }

  const lines = code.split("\n");
  const firstLine = lines[0].trim();

  if (!firstLine.startsWith("%%{init:") && !firstLine.startsWith("%%{init :")) {
    errors.push("%%{init}%% block must be on line 1 of the output");
  }

  const extracted = extractInitBlock(code);

  if (!extracted) {
    errors.push("No %%{init}%% block found in code");
    return { valid: errors.length === 0, errors, warnings };
  }

  const { theme, vars } = extracted;

  if (theme && theme !== "base") {
    errors.push(`theme must be "base" — found "${theme}"`);
  }

  if (!theme) {
    errors.push('theme key is missing — must be "base"');
  }

  for (const [key, value] of Object.entries(vars)) {
    if (key === "fontFamily") {
      if (!value || value.trim().length === 0) {
        errors.push(`fontFamily must be a non-empty quoted CSS font stack string`);
      }
      const quotedFontFamilyRe = /"fontFamily"\s*:\s*"([^"]*)"/;
      if (!quotedFontFamilyRe.test(code)) {
        errors.push(`fontFamily value must be a double-quoted string in the %%{init}%% block`);
      }
      continue;
    }

    if (key === "fontSize") {
      if (!PX_RE.test(value)) {
        errors.push(`fontSize must end in "px" — found "${value}" for key "${key}"`);
      }
      continue;
    }

    const isColorVar =
      key.toLowerCase().includes("color") ||
      key.toLowerCase().includes("bkg") ||
      key.toLowerCase().includes("background") ||
      key.toLowerCase().includes("border") ||
      key === "lineColor" ||
      key === "mainBkg" ||
      key === "nodeBorder" ||
      key === "clusterBkg" ||
      key === "titleColor" ||
      key === "textColor" ||
      key === "background" ||
      key.startsWith("pie") ||
      key.startsWith("git") ||
      key.startsWith("cScale") ||
      key.startsWith("quadrant") ||
      key.startsWith("fill") ||
      key.startsWith("task") ||
      key.startsWith("active") ||
      key.startsWith("done") ||
      key.startsWith("crit") ||
      key.startsWith("section") ||
      key.startsWith("alt") ||
      key.startsWith("relation") ||
      key.startsWith("requirement") ||
      key.startsWith("state") ||
      key.startsWith("composite") ||
      key.startsWith("special") ||
      key.startsWith("transition") ||
      key.startsWith("label");

    if (isColorVar && !HEX_RE.test(value)) {
      errors.push(`Invalid hex value "${value}" for variable "${key}" — must match #RGB or #RRGGBB`);
    }

    if (!KNOWN_VARS.has(key)) {
      warnings.push(`Unknown themeVariable "${key}" — may be ignored by Mermaid renderer`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const validCode = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "primaryTextColor": "#ffffff", "background": "#f0f9ff", "mainBkg": "#dbeafe", "nodeBorder": "#1d4ed8", "titleColor": "#1e3a5f", "lineColor": "#2563eb", "fontFamily": "DM Sans, system-ui, sans-serif"}}}%%
flowchart TD
  A --> B`;

  console.log("Valid:", JSON.stringify(validateTheme(validCode), null, 2));

  const invalidHex = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#GGGGGG", "background": "#ffffff"}}}%%
flowchart TD
  A --> B`;

  console.log("\nInvalid hex:", JSON.stringify(validateTheme(invalidHex), null, 2));

  const missingPx = `%%{init: {"theme": "base", "themeVariables": {"primaryColor": "#1a4f8a", "fontSize": "14", "background": "#ffffff"}}}%%
flowchart TD
  A --> B`;

  console.log("\nMissing px:", JSON.stringify(validateTheme(missingPx), null, 2));
}
