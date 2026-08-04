#!/usr/bin/env node
/**
 * check-forge-profile.mjs
 *
 * Validates that key token values in the Forge CSS source files match the
 * values declared in both brand-style profiles:
 *
 *   okhp3-forge.yaml         — page-level palette, fonts, radius, grid
 *   okhp3-forge-diagram.yaml — --mermaid-* render tokens + code-panel primitives
 *
 * The profiles are the single source of truth. This script reads expected
 * values from each profile and compares them to what the CSS actually declares
 * — so updating a profile (+ version bump) is sufficient; this script never
 * needs its own constants edited.
 *
 * Run:  node scripts/check-forge-profile.mjs
 *       pnpm brand:check
 *
 * Exit 0 — all checks pass.
 * Exit 1 — one or more tokens have drifted; update the profile token values
 *           to match CSS (or vice-versa), bump style.version, and set
 *           style.updated_on before committing.
 *
 * What it checks — okhp3-forge.yaml
 * ──────────────────────────────────
 * Palette  (forge-tokens.css):  --okh-forge-bg/paper/ink/teal/rust/amber/
 *                                code-bg/code-fg + --forge-footer-bg
 * Radius   (index.css):         --radius  ← tokens.geometry.radius.base
 * Fonts    (forge-tokens.css):  --app-font-display/sans/mono (partial match)
 * Grid     (index.css):         .forge-grid background-size ← tokens.geometry.grid.size
 *
 * What it checks — okhp3-forge-diagram.yaml
 * ──────────────────────────────────────────
 * Mermaid tokens (forge-tokens.css):  --mermaid-primary-color/primary-border-color/
 *                                      line-color/cluster-bg/text-color
 * Panel primitives (forge-tokens.css): --okh-forge-code-bg, --okh-forge-code-fg
 *
 * Extending this script
 * ─────────────────────
 * Add entries to PALETTE_CHECKS, FONT_CHECKS, or DIAGRAM_CHECKS.
 * Provide a profileExtract function that reads the expected value from the
 * parsed profile text.  Expected values come from the profile — never
 * hardcode them in this script.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const PROFILE_REL         = 'brand-styles/profiles/okhp3-forge.yaml';
const DIAGRAM_PROFILE_REL = 'brand-styles/profiles/okhp3-forge-diagram.yaml';

function readFile(relPath) {
  return readFileSync(resolve(root, relPath), 'utf-8');
}

// ─── Testability: env-var path overrides ─────────────────────────────────────
// When set, these replace the real source files so tests can inject fixtures
// without touching the live codebase.  All four must be absolute paths when
// provided.  The script behaves identically whether overrides are set or not.
function readSource(defaultRelPath, envKey) {
  const override = process.env[envKey];
  if (override) return readFileSync(override, 'utf-8');
  return readFile(defaultRelPath);
}

// ─── Lightweight profile value extractor ─────────────────────────────────────
// Rather than a full YAML parse, we extract specific known fields by pattern.
// This is intentional: the profile has block scalars and inline arrays that
// a minimal parser handles poorly.  We target only the scalar token fields
// that the check actually needs.

/**
 * Extract a YAML scalar value from a line matching `key: "value"` or
 * `key: value` (unquoted).  Returns the value string without surrounding
 * quotes, or null if not found.
 */
function yamlScalar(text, key) {
  const re = new RegExp(`(?:^|\\n)[ \\t]*${escapeRe(key)}:\\s+(?:"([^"]+)"|'([^']+)'|([^\\n#]+))`, 'm');
  const m = text.match(re);
  if (!m) return null;
  return (m[1] ?? m[2] ?? m[3] ?? '').trim();
}

function escapeRe(s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// ─── CSS value extractors ─────────────────────────────────────────────────────

/** Extract the value of a CSS custom property (first occurrence). */
function cssVar(css, varName) {
  const re = new RegExp(`${escapeRe(varName)}\\s*:\\s*([^;\\n]+);`);
  const m = css.match(re);
  return m ? m[1].trim() : null;
}

/** Extract background-size from the first .forge-grid { } block in CSS. */
function forgeGridBgSize(css) {
  const m = css.match(/\.forge-grid\s*\{([^}]+)\}/s);
  if (!m) return null;
  const inner = m[1];
  const sz = inner.match(/background-size:\s*([^\n;]+)/);
  return sz ? sz[1].trim() : null;
}

/**
 * Extract a CSS property value from the first rule block matching `selector`.
 * Strips trailing `!important` before returning.
 * Returns null if the selector or property is not found.
 */
function cssClassProp(css, selector, property) {
  const blockRe = new RegExp(`${escapeRe(selector)}\\s*\\{([^}]+)\\}`, 's');
  const blockMatch = css.match(blockRe);
  if (!blockMatch) return null;
  const inner = blockMatch[1];
  // Anchor to line-start (with optional indentation) so 'color' doesn't
  // accidentally match inside 'background-color'.
  const propRe = new RegExp(`(?:^|\\n)[ \\t]*${escapeRe(property)}\\s*:\\s*([^;!\\n]+)`);
  const propMatch = inner.match(propRe);
  return propMatch ? propMatch[1].trim() : null;
}

// ─── Load files ───────────────────────────────────────────────────────────────

const profileText     = readSource(PROFILE_REL,                        'FORGE_PROFILE_OVERRIDE');
const diagProfileText = readSource(DIAGRAM_PROFILE_REL,                'DIAGRAM_PROFILE_OVERRIDE');
const forgeCss        = readSource('app/src/styles/forge-tokens.css',  'FORGE_TOKENS_CSS_OVERRIDE');
const indexCss        = readSource('app/src/index.css',                'INDEX_CSS_OVERRIDE');

// ─── Extract version metadata from the profiles ───────────────────────────────
// style.version is indented 2 spaces; schema_version is at root (0 spaces).

const styleVersionMatch = profileText.match(/^  version:\s+"([^"]+)"/m);
const styleVersion   = styleVersionMatch ? styleVersionMatch[1] : '(not found)';

const updatedOnMatch = profileText.match(/^  updated_on:\s+"([^"]+)"/m);
const updatedOn      = updatedOnMatch ? updatedOnMatch[1] : '(not found)';

const diagVersionMatch = diagProfileText.match(/^  version:\s+"([^"]+)"/m);
const diagVersion    = diagVersionMatch ? diagVersionMatch[1] : '(not found)';

const diagUpdatedOnMatch = diagProfileText.match(/^  updated_on:\s+"([^"]+)"/m);
const diagUpdatedOn  = diagUpdatedOnMatch ? diagUpdatedOnMatch[1] : '(not found)';

// ─── Check definitions ────────────────────────────────────────────────────────
//
// Each entry maps a CSS token to a profile value.
//   cssFile         — which CSS source to search ('forge' or 'index')
//   cssVar          — CSS custom property name
//   profileExtract  — fn(profileText) → expected value string from the profile
//   profileField    — YAML path shown in failure output so reviewers know what
//                     to fix in okhp3-forge.yaml
//   compare         — 'exact' (case-insensitive) | 'contains' (for font lists)

const PALETTE_CHECKS = [
  {
    label: '--okh-forge-bg',
    cssFile: 'forge', cssVarName: '--okh-forge-bg',
    profileExtract: t => yamlScalar(t, 'forge-bg'),
    profileField: 'tokens.color.foundation.forge-bg',
    compare: 'exact',
  },
  {
    label: '--okh-forge-paper',
    cssFile: 'forge', cssVarName: '--okh-forge-paper',
    profileExtract: t => yamlScalar(t, 'forge-paper'),
    profileField: 'tokens.color.foundation.forge-paper',
    compare: 'exact',
  },
  {
    label: '--okh-forge-ink',
    cssFile: 'forge', cssVarName: '--okh-forge-ink',
    profileExtract: t => yamlScalar(t, 'forge-ink'),
    profileField: 'tokens.color.foundation.forge-ink',
    compare: 'exact',
  },
  {
    label: '--okh-forge-teal',
    cssFile: 'forge', cssVarName: '--okh-forge-teal',
    profileExtract: t => yamlScalar(t, 'forge-teal'),
    profileField: 'tokens.color.foundation.forge-teal',
    compare: 'exact',
  },
  {
    label: '--okh-forge-rust',
    cssFile: 'forge', cssVarName: '--okh-forge-rust',
    profileExtract: t => yamlScalar(t, 'forge-rust'),
    profileField: 'tokens.color.foundation.forge-rust',
    compare: 'exact',
  },
  {
    label: '--okh-forge-amber',
    cssFile: 'forge', cssVarName: '--okh-forge-amber',
    profileExtract: t => yamlScalar(t, 'forge-amber'),
    profileField: 'tokens.color.foundation.forge-amber',
    compare: 'exact',
  },
  {
    label: '--okh-forge-code-bg',
    cssFile: 'forge', cssVarName: '--okh-forge-code-bg',
    profileExtract: t => yamlScalar(t, 'forge-code-bg'),
    profileField: 'tokens.color.foundation.forge-code-bg',
    compare: 'exact',
  },
  {
    label: '--okh-forge-code-fg',
    cssFile: 'forge', cssVarName: '--okh-forge-code-fg',
    profileExtract: t => yamlScalar(t, 'forge-code-fg'),
    profileField: 'tokens.color.foundation.forge-code-fg',
    compare: 'exact',
  },
  {
    label: '--forge-footer-bg',
    cssFile: 'forge', cssVarName: '--forge-footer-bg',
    profileExtract: t => yamlScalar(t, 'forge-footer'),
    profileField: 'tokens.color.foundation.forge-footer',
    compare: 'exact',
  },
  {
    label: '--radius (base border radius)',
    cssFile: 'index', cssVarName: '--radius',
    profileExtract: t => {
      // 'base' key appears in multiple places; look for it after 'radius:'
      const radiusSection = t.match(/radius:\s*\n((?:[ \t]+.+\n)*)/m);
      if (!radiusSection) return null;
      const m = radiusSection[1].match(/base:\s+"([^"]+)"/);
      return m ? m[1] : null;
    },
    profileField: 'tokens.geometry.radius.base',
    compare: 'exact',
  },
];

// Font checks: the CSS value includes fallbacks; we require only the primary
// family name to appear in the CSS declaration.  Expected value from the
// profile is the primary family name (inner quotes stripped).
//
// Extraction uses string positions rather than lookahead regexes because the
// typography block has three sibling role keys (heading/body/mono) and the
// greedy regex was matching across role boundaries.

/**
 * Extract the primary font family for a typography role from the profile.
 * Finds the role key, then reads the first `family:` line in that block.
 * @param {string} text - full profile text
 * @param {string} role - 'heading' | 'body' | 'mono'
 * @returns {string|null}
 */
function extractTypographyFamily(text, role) {
  // The role keys sit at 8-space indent inside tokens.typography.roles.
  // We locate the role by searching for its key as a full line.
  const marker = `\n        ${role}:\n`;
  const idx = text.indexOf(marker);
  if (idx === -1) return null;

  // Scan forward (up to 400 chars) to find the first family: line.
  const slice = text.slice(idx + marker.length, idx + marker.length + 400);
  const m = slice.match(/^[ \t]+family:\s+"([^"]+)"/m);
  if (!m) return null;

  // Strip surrounding single quotes that YAML profiles use inside the double-
  // quoted scalar, e.g. "'Alfa Slab One'" → "Alfa Slab One".
  return m[1].replace(/^'+|'+$/g, '').trim();
}

const FONT_CHECKS = [
  {
    label: '--app-font-display (heading font)',
    cssVarName: '--app-font-display',
    profileExtract: t => extractTypographyFamily(t, 'heading'),
    profileField: 'tokens.typography.roles.heading.family',
  },
  {
    label: '--app-font-sans (body font)',
    cssVarName: '--app-font-sans',
    profileExtract: t => extractTypographyFamily(t, 'body'),
    profileField: 'tokens.typography.roles.body.family',
  },
  {
    label: '--app-font-mono (mono font)',
    cssVarName: '--app-font-mono',
    profileExtract: t => extractTypographyFamily(t, 'mono'),
    profileField: 'tokens.typography.roles.mono.family',
  },
];

// ─── Diagram profile checks ───────────────────────────────────────────────────
//
// These check okhp3-forge-diagram.yaml against the --mermaid-* and
// --okh-forge-code-* tokens in forge-tokens.css.
//
// If any of these tokens change in forge-tokens.css the diagram profile must be
// updated to match (bump style.version + style.updated_on) before merging.
//
// Adding a new diagram token: add an entry here with the CSS var name, a
// profileExtract that reads the expected value from the diagram profile text,
// and the YAML path for error messages.

const DIAGRAM_MERMAID_CHECKS = [
  {
    label: '--mermaid-primary-color (diagram node fill)',
    cssVarName: '--mermaid-primary-color',
    profileExtract: t => yamlScalar(t, 'primaryColor'),
    profileField: `${DIAGRAM_PROFILE_REL}: mermaid_theme_vars.primaryColor`,
    compare: 'exact',
  },
  {
    label: '--mermaid-primary-border-color (diagram node border)',
    cssVarName: '--mermaid-primary-border-color',
    profileExtract: t => yamlScalar(t, 'primaryBorderColor'),
    profileField: `${DIAGRAM_PROFILE_REL}: mermaid_theme_vars.primaryBorderColor`,
    compare: 'exact',
  },
  {
    label: '--mermaid-line-color (diagram connecting lines)',
    cssVarName: '--mermaid-line-color',
    profileExtract: t => yamlScalar(t, 'lineColor'),
    profileField: `${DIAGRAM_PROFILE_REL}: mermaid_theme_vars.lineColor`,
    compare: 'exact',
  },
  {
    label: '--mermaid-cluster-bg (swim-lane pool fill)',
    cssVarName: '--mermaid-cluster-bg',
    profileExtract: t => yamlScalar(t, 'clusterBkg'),
    profileField: `${DIAGRAM_PROFILE_REL}: mermaid_theme_vars.clusterBkg`,
    compare: 'exact',
  },
  {
    label: '--mermaid-text-color (diagram node text)',
    cssVarName: '--mermaid-text-color',
    profileExtract: t => yamlScalar(t, 'textColor'),
    profileField: `${DIAGRAM_PROFILE_REL}: mermaid_theme_vars.textColor`,
    compare: 'exact',
  },
];

// These cross-check the code-panel primitives that the diagram profile also
// declares (as diagram-bg / diagram-fg in tokens.color.foundation).
const DIAGRAM_PANEL_CHECKS = [
  {
    label: '--okh-forge-code-bg → diagram-bg (diagram panel base)',
    cssVarName: '--okh-forge-code-bg',
    profileExtract: t => yamlScalar(t, 'diagram-bg'),
    profileField: `${DIAGRAM_PROFILE_REL}: tokens.color.foundation.diagram-bg`,
    compare: 'exact',
  },
  {
    label: '--okh-forge-code-fg → diagram-fg (diagram panel text)',
    cssVarName: '--okh-forge-code-fg',
    profileExtract: t => yamlScalar(t, 'diagram-fg'),
    profileField: `${DIAGRAM_PROFILE_REL}: tokens.color.foundation.diagram-fg`,
    compare: 'exact',
  },
];

// Tokens declared directly in index.css utility classes — not CSS variables.
// Each entry reads from the class rule and compares to the diagram profile.
const DIAGRAM_INDEX_CHECKS = [
  {
    label: '.forge-code-panel-tab border-color → tab-border',
    cssSelector: '.forge-code-panel-tab',
    cssProp: 'border-color',
    profileExtract: t => yamlScalar(t, 'tab-border'),
    profileField: `${DIAGRAM_PROFILE_REL}: tokens.color.foundation.tab-border`,
    compare: 'exact',
  },
  {
    label: '.forge-code-panel-tab color → tab-fg-muted',
    cssSelector: '.forge-code-panel-tab',
    cssProp: 'color',
    profileExtract: t => yamlScalar(t, 'tab-fg-muted'),
    profileField: `${DIAGRAM_PROFILE_REL}: tokens.color.foundation.tab-fg-muted`,
    compare: 'exact',
  },
  {
    label: '.forge-code-panel::placeholder color → placeholder',
    cssSelector: '.forge-code-panel::placeholder',
    cssProp: 'color',
    profileExtract: t => yamlScalar(t, 'placeholder'),
    profileField: `${DIAGRAM_PROFILE_REL}: tokens.color.foundation.placeholder`,
    compare: 'exact',
  },
  {
    label: '.forge-parse-error-text color → error-text',
    cssSelector: '.forge-parse-error-text',
    cssProp: 'color',
    profileExtract: t => yamlScalar(t, 'error-text'),
    profileField: `${DIAGRAM_PROFILE_REL}: tokens.color.foundation.error-text`,
    compare: 'exact',
  },
  {
    label: '.forge-parse-error-bar background → error-bg-tint',
    cssSelector: '.forge-parse-error-bar',
    cssProp: 'background',
    profileExtract: t => yamlScalar(t, 'error-bg-tint'),
    profileField: `${DIAGRAM_PROFILE_REL}: tokens.color.foundation.error-bg-tint`,
    compare: 'exact',
  },
  {
    label: '.forge-parse-error-bar border-color → error-border',
    cssSelector: '.forge-parse-error-bar',
    cssProp: 'border-color',
    profileExtract: t => yamlScalar(t, 'error-border'),
    profileField: `${DIAGRAM_PROFILE_REL}: tokens.color.foundation.error-border`,
    compare: 'exact',
  },
];

// ─── Run checks ───────────────────────────────────────────────────────────────

const failures = [];
const passes   = [];
const warnings = [];

function runCheck(label, cssActual, profileExpected, compareMode, profileField) {
  if (profileExpected === null || profileExpected === undefined) {
    warnings.push({ label, issue: 'could not extract expected value from profile', profileField });
    return;
  }
  if (cssActual === null) {
    failures.push({ label, issue: 'CSS property not found', profileExpected, profileField });
    return;
  }

  const match = compareMode === 'contains'
    ? cssActual.includes(profileExpected)
    : cssActual.toLowerCase() === profileExpected.toLowerCase();

  if (match) {
    passes.push(label);
  } else {
    failures.push({
      label,
      issue: compareMode === 'contains' ? 'family name not in CSS declaration' : 'value mismatch',
      cssActual,
      profileExpected,
      profileField,
    });
  }
}

for (const c of PALETTE_CHECKS) {
  const css = c.cssFile === 'forge' ? forgeCss : indexCss;
  const cssActual = cssVar(css, c.cssVarName);
  const profileExpected = c.profileExtract(profileText);
  runCheck(c.label, cssActual, profileExpected, c.compare, c.profileField);
}

for (const f of FONT_CHECKS) {
  // Font vars may be in either file; prefer forge-tokens.css
  const cssActual = cssVar(forgeCss, f.cssVarName) ?? cssVar(indexCss, f.cssVarName);
  const profileExpected = f.profileExtract(profileText);
  runCheck(f.label, cssActual, profileExpected, 'contains', f.profileField);
}

// Grid size — checks the rendered .forge-grid background-size against the
// profile's tokens.geometry.grid.size.  They should agree (see grid note above).
(function checkGrid() {
  const label = '.forge-grid background-size (rendered grid size)';
  const profileField = 'tokens.geometry.grid.size';
  // 'size' appears in other sections too; narrow to the grid block
  const gridBlock = profileText.match(/grid:\s*\n((?:[ \t]+.+\n)*)/m);
  const sizeFromGrid = gridBlock
    ? (gridBlock[1].match(/size:\s+"([^"]+)"/)?.[1] ?? null)
    : null;
  const expected = sizeFromGrid;
  // CSS background-size may be a literal "32px 32px" or use a var() reference.
  // If it's var(--some-var), resolve the variable from the CSS sources so the
  // comparison still works after the variable was wired in.
  const cssRaw = forgeGridBgSize(indexCss);
  let cssNorm = cssRaw ? cssRaw.split(/\s+/)[0] : null; // take the X dimension
  if (cssNorm) {
    const varRef = cssNorm.match(/^var\(\s*(--[^,\s)]+)/);
    if (varRef) {
      // Resolve the referenced variable from forge-tokens.css, then index.css.
      const resolved = cssVar(forgeCss, varRef[1]) ?? cssVar(indexCss, varRef[1]);
      cssNorm = resolved ? resolved.trim() : cssNorm;
    }
  }
  runCheck(label, cssNorm, expected, 'exact', profileField);
})();

// ─── Diagram profile checks ───────────────────────────────────────────────────
//
// All diagram token values come from forge-tokens.css (same source as the main
// profile).  Any --mermaid-* or --okh-forge-code-* change in forge-tokens.css
// that alters a value declared in okhp3-forge-diagram.yaml must be reflected in
// the diagram profile (+ version bump) before the check will pass.

for (const c of DIAGRAM_MERMAID_CHECKS) {
  const cssActual = cssVar(forgeCss, c.cssVarName);
  const profileExpected = c.profileExtract(diagProfileText);
  runCheck(c.label, cssActual, profileExpected, c.compare, c.profileField);
}

for (const c of DIAGRAM_PANEL_CHECKS) {
  const cssActual = cssVar(forgeCss, c.cssVarName);
  const profileExpected = c.profileExtract(diagProfileText);
  runCheck(c.label, cssActual, profileExpected, c.compare, c.profileField);
}

// Diagram tokens sourced from index.css class rules (not CSS variables).
for (const c of DIAGRAM_INDEX_CHECKS) {
  const cssActual = cssClassProp(indexCss, c.cssSelector, c.cssProp);
  const profileExpected = c.profileExtract(diagProfileText);
  runCheck(c.label, cssActual, profileExpected, c.compare, c.profileField);
}

// ─── Report ──────────────────────────────────────────────────────────────────

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  Forge Brand Profiles — token drift check                    ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`  Profile (page):    ${PROFILE_REL}`);
console.log(`  version:           ${styleVersion}`);
console.log(`  updated_on:        ${updatedOn}`);
console.log('');
console.log(`  Profile (diagram): ${DIAGRAM_PROFILE_REL}`);
console.log(`  version:           ${diagVersion}`);
console.log(`  updated_on:        ${diagUpdatedOn}`);
console.log('');

if (passes.length > 0) {
  console.log(`  ✓ ${passes.length} check(s) passed`);
}

if (warnings.length > 0) {
  console.log('');
  console.log(`  ⚠  ${warnings.length} warning(s) — could not extract profile value:`);
  for (const w of warnings) {
    console.log(`     ${w.label}`);
    console.log(`       Profile path: ${w.profileField}`);
    console.log(`       ${w.issue}`);
  }
}

if (failures.length === 0 && warnings.length === 0) {
  console.log('');
  console.log('  All token values match the profile. No drift detected.');
  console.log('');
  process.exit(0);
}

if (failures.length > 0) {
  console.log('');
  console.log(`  ✗ ${failures.length} drift(s) detected — fix before merging:`);
  console.log('');
  for (const f of failures) {
    console.log(`  ✗ ${f.label}`);
    console.log(`      Issue:           ${f.issue}`);
    if (f.cssActual !== undefined)     console.log(`      CSS value:       ${f.cssActual}`);
    if (f.profileExpected !== undefined) console.log(`      Profile expects: ${f.profileExpected}`);
    console.log(`      Profile path:    ${f.profileField}`);
    console.log('');
  }
  console.log('  To fix: update CSS or profile so both agree, then bump:');
  console.log(`    style.version    (current: ${styleVersion})`);
  console.log(`    style.updated_on (current: ${updatedOn})`);
  console.log('');
  console.log('  See CONTRIBUTING.md § "Forge brand profile" for full guidance.');
  console.log('');
}

process.exit(failures.length > 0 ? 1 : 0);
