/**
 * validate-skill.test.mjs
 * Validates the okhp3-mermaid-theme-builder skill package against
 * the Agent Skills spec and project-specific acceptance criteria.
 *
 * Run: node --test skills/okhp3-mermaid-theme-builder/tests/validate-skill.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = join(__dir, '..');

function read(relPath) {
  return readFileSync(join(SKILL_ROOT, relPath), 'utf-8');
}

function exists(relPath) {
  return existsSync(join(SKILL_ROOT, relPath));
}

// --- Frontmatter parser (no external deps) ---
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    fm[key] = val;
  }
  return fm;
}

// === Structural tests ===

test('SKILL.md exists', () => {
  assert.ok(exists('SKILL.md'), 'SKILL.md must exist at skill root');
});

test('SKILL.md has valid YAML frontmatter', () => {
  const content = read('SKILL.md');
  const fm = parseFrontmatter(content);
  assert.ok(fm, 'SKILL.md must have YAML frontmatter delimited by ---');
});

test('name field equals okhp3-mermaid-theme-builder', () => {
  const content = read('SKILL.md');
  const fm = parseFrontmatter(content);
  assert.equal(fm.name, 'okhp3-mermaid-theme-builder', 'name must be okhp3-mermaid-theme-builder');
});

test('parent directory matches name field', () => {
  const parts = SKILL_ROOT.split('/');
  const dirName = parts[parts.length - 1];
  assert.equal(dirName, 'okhp3-mermaid-theme-builder', 'parent directory must match name field');
});

test('description is present and within 1024 characters', () => {
  const content = read('SKILL.md');
  const fm = parseFrontmatter(content);
  assert.ok(fm.description && fm.description.length > 0, 'description must be non-empty');
  assert.ok(fm.description.length <= 1024, `description must be <=1024 chars, got ${fm.description.length}`);
});

test('SKILL.md body is under 500 lines', () => {
  const content = read('SKILL.md');
  const lines = content.split('\n').length;
  assert.ok(lines <= 500, `SKILL.md must be under 500 lines, got ${lines}`);
});

test('license field is present', () => {
  const content = read('SKILL.md');
  const fm = parseFrontmatter(content);
  assert.ok(fm.license, 'license field must be present');
});

// === Reference files exist ===

const EXPECTED_REFERENCES = [
  'references/palette-contract.md',
  'references/diagram-family-rules.md',
  'references/mermaid-renderer-profiles.md',
  'references/output-format-contract.md',
  'references/prompt-scaffold-patterns.md',
  'references/scope-firewall.md',
];

for (const ref of EXPECTED_REFERENCES) {
  test(`reference file exists: ${ref}`, () => {
    assert.ok(exists(ref), `${ref} must exist`);
  });
}

// === Asset files exist ===

const EXPECTED_ASSETS = [
  'assets/palettes.json',
  'assets/renderer-profiles.json',
  'assets/theme-variable-map.json',
  'assets/fixtures/flowchart-basic.mmd',
  'assets/fixtures/sequence-basic.mmd',
  'assets/fixtures/class-basic.mmd',
  'assets/fixtures/state-basic.mmd',
  'assets/fixtures/gantt-basic.mmd',
];

for (const asset of EXPECTED_ASSETS) {
  test(`asset file exists: ${asset}`, () => {
    assert.ok(exists(asset), `${asset} must exist`);
  });
}

// === Script files exist ===

const EXPECTED_SCRIPTS = [
  'scripts/detect-diagram.mjs',
  'scripts/normalize-mermaid.mjs',
  'scripts/apply-theme.mjs',
  'scripts/validate-theme.mjs',
  'scripts/generate-prompt-scaffold.mjs',
];

for (const script of EXPECTED_SCRIPTS) {
  test(`script file exists: ${script}`, () => {
    assert.ok(exists(script), `${script} must exist`);
  });
}

// === JSON asset validity ===

test('palettes.json parses as valid JSON', () => {
  const raw = read('assets/palettes.json');
  const parsed = JSON.parse(raw);
  assert.ok(Array.isArray(parsed), 'palettes.json must be a JSON array');
});

test('palettes.json has exactly 8 entries', () => {
  const palettes = JSON.parse(read('assets/palettes.json'));
  assert.equal(palettes.length, 8, 'Must have 8 palettes');
});

test('all palettes have name, display, brand, theme, themeVariables', () => {
  const palettes = JSON.parse(read('assets/palettes.json'));
  for (const p of palettes) {
    assert.ok(p.name, `Palette missing name: ${JSON.stringify(p)}`);
    assert.ok(p.display, `Palette ${p.name} missing display`);
    assert.ok(Object.prototype.hasOwnProperty.call(p, 'brand'), `Palette ${p.name} missing brand field`);
    assert.ok(p.theme === 'dark' || p.theme === 'light', `Palette ${p.name} theme must be dark or light`);
    assert.ok(p.themeVariables && typeof p.themeVariables === 'object', `Palette ${p.name} missing themeVariables`);
  }
});

test('all palettes have exactly 21 themeVariables', () => {
  const palettes = JSON.parse(read('assets/palettes.json'));
  const REQUIRED = [
    'primaryColor', 'primaryTextColor', 'primaryBorderColor',
    'secondaryColor', 'secondaryTextColor', 'secondaryBorderColor',
    'tertiaryColor', 'tertiaryTextColor', 'tertiaryBorderColor',
    'background', 'mainBkg', 'nodeBorder', 'clusterBkg', 'clusterBorder',
    'lineColor', 'edgeLabelBackground', 'fontFamily', 'fontSize',
    'labelBackground', 'labelTextColor', 'titleColor',
  ];
  for (const p of palettes) {
    for (const v of REQUIRED) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(p.themeVariables, v),
        `Palette ${p.name} missing themeVariable: ${v}`
      );
    }
    assert.equal(Object.keys(p.themeVariables).length, 21, `Palette ${p.name} must have exactly 21 themeVariables`);
  }
});

test('all palette hex values are valid #RRGGBB format', () => {
  const palettes = JSON.parse(read('assets/palettes.json'));
  const HEX_VARS = [
    'primaryColor', 'primaryTextColor', 'primaryBorderColor',
    'secondaryColor', 'secondaryTextColor', 'secondaryBorderColor',
    'tertiaryColor', 'tertiaryTextColor', 'tertiaryBorderColor',
    'background', 'mainBkg', 'nodeBorder', 'clusterBkg', 'clusterBorder',
    'lineColor', 'edgeLabelBackground', 'labelBackground', 'labelTextColor', 'titleColor',
  ];
  const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  for (const p of palettes) {
    for (const v of HEX_VARS) {
      const val = p.themeVariables[v];
      assert.match(val, HEX_RE, `Palette ${p.name}.${v} has invalid hex: "${val}"`);
    }
    assert.match(
      p.themeVariables.fontSize,
      /^\d+(\.\d+)?(px|rem|em|pt)$/,
      `Palette ${p.name}.fontSize must include unit: "${p.themeVariables.fontSize}"`
    );
  }
});

test('renderer-profiles.json parses as valid JSON array', () => {
  const raw = read('assets/renderer-profiles.json');
  const parsed = JSON.parse(raw);
  assert.ok(Array.isArray(parsed), 'renderer-profiles.json must be a JSON array');
  assert.ok(parsed.length >= 8, 'Must have at least 8 renderer profiles');
});

test('theme-variable-map.json parses as valid JSON', () => {
  const raw = read('assets/theme-variable-map.json');
  const parsed = JSON.parse(raw);
  assert.ok(parsed.variables && Array.isArray(parsed.variables), 'Must have variables array');
  assert.equal(parsed.variables.length, 21, 'Must document all 21 themeVariables');
});

// === Scope firewall — no BFS content ===

const ALL_SKILL_FILES = [
  'SKILL.md',
  ...EXPECTED_REFERENCES,
  ...EXPECTED_ASSETS.filter((f) => !f.endsWith('.mmd')),
  ...EXPECTED_SCRIPTS,
];

test('no BFS / Builders FirstSource strings in skill package (except scope-firewall.md)', () => {
  const FORBIDDEN = ['Builders FirstSource'];
  for (const relPath of ALL_SKILL_FILES) {
    if (relPath === 'references/scope-firewall.md') continue;
    if (!exists(relPath)) continue;
    const content = read(relPath);
    for (const term of FORBIDDEN) {
      assert.ok(
        !content.includes(term),
        `Forbidden term "${term}" found in ${relPath}`
      );
    }
  }
});

// === No React/UI imports in scripts ===

test('scripts do not import React, Tailwind, or browser DOM APIs', () => {
  const FORBIDDEN_IMPORTS = ['from "react"', "from 'react'", 'require("react")', "require('react')", 'document.', 'window.', 'localStorage'];
  for (const script of EXPECTED_SCRIPTS) {
    if (!exists(script)) continue;
    const content = read(script);
    for (const forbidden of FORBIDDEN_IMPORTS) {
      assert.ok(
        !content.includes(forbidden),
        `Script ${script} contains forbidden import/usage: "${forbidden}"`
      );
    }
  }
});

// === SKILL.md does not claim bpmn-beta is native Mermaid core ===

test('SKILL.md does not claim bpmn-beta is native Mermaid core syntax', () => {
  const content = read('SKILL.md');
  const FORBIDDEN_CLAIMS = [
    'Mermaid v11.15 ships',
    'native Mermaid BPMN',
    'built-in Mermaid BPMN',
    'Mermaid core diagram type',
  ];
  for (const claim of FORBIDDEN_CLAIMS) {
    assert.ok(!content.includes(claim), `SKILL.md contains forbidden claim: "${claim}"`);
  }
});

// === Five fixture files are non-empty ===

test('all fixture .mmd files are non-empty', () => {
  const fixtures = [
    'assets/fixtures/flowchart-basic.mmd',
    'assets/fixtures/sequence-basic.mmd',
    'assets/fixtures/class-basic.mmd',
    'assets/fixtures/state-basic.mmd',
    'assets/fixtures/gantt-basic.mmd',
  ];
  for (const f of fixtures) {
    assert.ok(exists(f), `${f} must exist`);
    const content = read(f);
    assert.ok(content.trim().length > 0, `${f} must not be empty`);
  }
});
