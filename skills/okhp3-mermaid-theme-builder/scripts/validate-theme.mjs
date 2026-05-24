#!/usr/bin/env node
/**
 * validate-theme.mjs
 * Validates hex values, known themeVariable names, fontSize/fontFamily format,
 * and produces a structured validation report.
 *
 * Usage:
 *   node validate-theme.mjs --palette ocean-depth
 *   node validate-theme.mjs --json '{"primaryColor":"#abc",...}'
 *   import { validateTheme } from './validate-theme.mjs'
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const PALETTES_PATH = join(__dir, '../assets/palettes.json');
const VAR_MAP_PATH = join(__dir, '../assets/theme-variable-map.json');

const REQUIRED_VARIABLES = [
  'primaryColor', 'primaryTextColor', 'primaryBorderColor',
  'secondaryColor', 'secondaryTextColor', 'secondaryBorderColor',
  'tertiaryColor', 'tertiaryTextColor', 'tertiaryBorderColor',
  'background', 'mainBkg', 'nodeBorder', 'clusterBkg', 'clusterBorder',
  'lineColor', 'edgeLabelBackground', 'fontFamily', 'fontSize',
  'labelBackground', 'labelTextColor', 'titleColor',
];

const HEX_COLOR_VARS = REQUIRED_VARIABLES.filter(
  (v) => v !== 'fontFamily' && v !== 'fontSize'
);

function isValidHex(value) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

function isValidFontSize(value) {
  return /^\d+(\.\d+)?(px|rem|em|pt)$/.test(value);
}

/**
 * @param {Record<string, string>} themeVariables
 * @returns {{ result: 'PASS'|'WARN'|'FAIL', variables: number, errors: string[], warnings: string[] }}
 */
export function validateTheme(themeVariables) {
  const errors = [];
  const warnings = [];

  const present = REQUIRED_VARIABLES.filter((v) =>
    Object.prototype.hasOwnProperty.call(themeVariables, v) && themeVariables[v] !== ''
  );
  const missing = REQUIRED_VARIABLES.filter((v) => !present.includes(v));

  if (missing.length > 0) {
    errors.push(`Missing ${missing.length} required variable(s): ${missing.join(', ')}`);
  }

  for (const varName of HEX_COLOR_VARS) {
    if (!Object.prototype.hasOwnProperty.call(themeVariables, varName)) continue;
    const val = themeVariables[varName];
    if (!isValidHex(val)) {
      errors.push(`Invalid hex value for ${varName}: "${val}" — must be #RGB or #RRGGBB`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(themeVariables, 'fontSize')) {
    if (!isValidFontSize(themeVariables.fontSize)) {
      errors.push(`Invalid fontSize: "${themeVariables.fontSize}" — must include unit (e.g. "14px")`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(themeVariables, 'fontFamily')) {
    const ff = themeVariables.fontFamily;
    if (!ff || ff.trim().length === 0) {
      errors.push('fontFamily must not be empty');
    }
  }

  const unknownVars = Object.keys(themeVariables).filter(
    (k) => !REQUIRED_VARIABLES.includes(k)
  );
  if (unknownVars.length > 0) {
    warnings.push(`Unknown themeVariable(s) (will be ignored by Mermaid): ${unknownVars.join(', ')}`);
  }

  const result = errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARN' : 'PASS';

  return {
    result,
    variables: `${present.length} / ${REQUIRED_VARIABLES.length}`,
    errors,
    warnings,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

  const paletteId = get('--palette');
  const jsonArg = get('--json');

  let themeVariables = null;

  if (paletteId) {
    const palettes = JSON.parse(readFileSync(PALETTES_PATH, 'utf-8'));
    const palette = palettes.find((p) => p.name === paletteId);
    if (!palette) {
      console.error(`Unknown palette: "${paletteId}"`);
      process.exit(1);
    }
    themeVariables = palette.themeVariables;
  } else if (jsonArg) {
    themeVariables = JSON.parse(jsonArg);
  } else {
    console.error('Usage: validate-theme.mjs --palette <name> | --json \'{"primaryColor":"#hex",...}\'');
    process.exit(1);
  }

  const report = validateTheme(themeVariables);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.result === 'FAIL' ? 1 : 0);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
