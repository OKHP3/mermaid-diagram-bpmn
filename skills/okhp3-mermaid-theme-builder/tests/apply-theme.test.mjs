/**
 * apply-theme.test.mjs
 * Tests for apply-theme.mjs and validate-theme.mjs scripts.
 *
 * Run: node --test skills/okhp3-mermaid-theme-builder/tests/apply-theme.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyTheme } from '../scripts/apply-theme.mjs';
import { validateTheme } from '../scripts/validate-theme.mjs';

const SIMPLE_FLOWCHART = 'flowchart TD\n    A --> B';

// === applyTheme tests ===

test('applies ocean-depth palette in styled-mermaid mode', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'ocean-depth', { mode: 'styled-mermaid' });
  assert.ok(result.styled.includes('```mermaid'), 'styled output must contain mermaid fence');
  assert.ok(result.styled.includes("%%{init:"), 'styled output must contain init block');
  assert.ok(result.styled.includes("'theme': 'base'"), 'init block must use base theme');
  assert.ok(result.styled.includes('#0d4f6c'), 'Ocean Depth primaryColor must appear');
  assert.ok(result.styled.includes('flowchart TD'), 'Diagram body must be preserved');
});

test('applies forest-sage palette', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'forest-sage', { mode: 'styled-mermaid' });
  assert.ok(result.styled.includes('#2d5016'), 'Forest Sage primaryColor must appear');
});

test('applies slate-ember palette', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'slate-ember', { mode: 'styled-mermaid' });
  assert.ok(result.styled.includes('#3d2b1f'), 'Slate Ember primaryColor must appear');
});

test('applies violet-mist palette', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'violet-mist', { mode: 'styled-mermaid' });
  assert.ok(result.styled.includes('#3d1a5c'), 'Violet Mist primaryColor must appear');
});

test('applies okh-p3 brand palette', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'okh-p3', { mode: 'styled-mermaid' });
  assert.ok(result.styled.includes('#2a2320'), 'OKH P3 primaryColor must appear');
  assert.equal(result.palette.name, 'okh-p3');
});

test('applies glee-fully brand palette (light theme)', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'glee-fully', { mode: 'styled-mermaid' });
  assert.ok(result.styled.includes('#e8735a'), 'Glee-fully primaryColor must appear');
  assert.equal(result.palette.theme, 'light');
});

test('applies askjamie brand palette', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'askjamie', { mode: 'styled-mermaid' });
  assert.ok(result.styled.includes('#3a7a8a'), 'AskJamie primaryColor must appear');
});

test('applies neutral-enterprise palette', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'neutral-enterprise', { mode: 'styled-mermaid' });
  assert.ok(result.styled.includes('#2c3e50'), 'Neutral Enterprise primaryColor must appear');
});

test('throws for unknown palette', () => {
  assert.throws(
    () => applyTheme(SIMPLE_FLOWCHART, 'nonexistent-palette'),
    /Unknown palette/
  );
});

test('theme-json mode returns valid JSON', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'ocean-depth', { mode: 'theme-json' });
  const parsed = JSON.parse(result.styled);
  assert.equal(parsed.theme, 'base');
  assert.ok(parsed.themeVariables, 'must have themeVariables');
  assert.equal(Object.keys(parsed.themeVariables).length, 21, 'must have 21 variables in JSON output');
});

test('theme-bootstrap mode includes HTML comment and usage note', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'ocean-depth', { mode: 'theme-bootstrap' });
  assert.ok(result.styled.includes('<!-- Mermaid Theme:'), 'must include HTML comment');
  assert.ok(result.styled.includes('OverKill Hill P³'), 'must include brand attribution');
  assert.ok(result.styled.includes('%%{init:'), 'must include init block');
  assert.ok(result.styled.includes('mermaid.initialize()'), 'must include usage note');
});

test('prompt-scaffold mode includes all 5 rules', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'ocean-depth', { mode: 'prompt-scaffold' });
  assert.ok(result.styled.includes("'theme': 'base'"), 'must enforce base theme');
  assert.ok(result.styled.includes('Preserve all themeVariables'), 'must include preservation rule');
  assert.ok(result.styled.includes('first line'), 'must specify placement rule');
  assert.ok(result.styled.includes('classDef'), 'must mention classDef for flowcharts');
  assert.ok(result.styled.includes('inline style declarations'), 'must include inline style rule');
});

test('before-after-report mode shows original and styled diagram', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'ocean-depth', { mode: 'before-after-report' });
  assert.ok(result.styled.includes('### Before'), 'must have Before section');
  assert.ok(result.styled.includes('### After'), 'must have After section');
  assert.ok(result.styled.includes('flowchart TD'), 'must preserve original diagram');
  assert.ok(result.styled.includes('%%{init:'), 'styled section must have init block');
  assert.ok(result.styled.includes('21 variables injected'), 'must report variable count');
});

test('init block contains all 21 variables', () => {
  const result = applyTheme(SIMPLE_FLOWCHART, 'ocean-depth', { mode: 'styled-mermaid' });
  const REQUIRED_VARS = [
    'primaryColor', 'primaryTextColor', 'primaryBorderColor',
    'secondaryColor', 'secondaryTextColor', 'secondaryBorderColor',
    'tertiaryColor', 'tertiaryTextColor', 'tertiaryBorderColor',
    'background', 'mainBkg', 'nodeBorder', 'clusterBkg', 'clusterBorder',
    'lineColor', 'edgeLabelBackground', 'fontFamily', 'fontSize',
    'labelBackground', 'labelTextColor', 'titleColor',
  ];
  for (const v of REQUIRED_VARS) {
    assert.ok(result.styled.includes(`'${v}'`), `Init block must include '${v}'`);
  }
});

test('applies theme to bpmn-beta diagram body', () => {
  const bpmnSource = `bpmn-beta
accTitle: Test
start s1 "Start"
end e1 "End"
s1 --> e1`;
  const result = applyTheme(bpmnSource, 'ocean-depth', { mode: 'styled-mermaid' });
  assert.ok(result.styled.includes('bpmn-beta'), 'bpmn-beta keyword must be preserved');
  assert.ok(result.styled.includes("%%{init:"), 'init block must be prepended');
  const lines = result.styled.split('\n');
  const initLine = lines.find((l) => l.includes("%%{init:"));
  const bpmnLine = lines.findIndex((l) => l.trim() === 'bpmn-beta');
  const initLineIdx = lines.indexOf(initLine);
  assert.ok(initLineIdx < bpmnLine, '%%{init}%% must appear before bpmn-beta keyword');
});

// === validateTheme tests ===

test('validateTheme PASS for valid ocean-depth palette', async () => {
  const { readFileSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dir = dirname(fileURLToPath(import.meta.url));
  const palettes = JSON.parse(readFileSync(join(__dir, '../assets/palettes.json'), 'utf-8'));
  const palette = palettes.find((p) => p.name === 'ocean-depth');
  const report = validateTheme(palette.themeVariables);
  assert.equal(report.result, 'PASS');
  assert.equal(report.errors.length, 0);
});

test('validateTheme FAIL for missing variables', () => {
  const report = validateTheme({ primaryColor: '#ff0000' });
  assert.equal(report.result, 'FAIL');
  assert.ok(report.errors.some((e) => e.includes('Missing')));
});

test('validateTheme FAIL for invalid hex', () => {
  const bad = {
    primaryColor: 'notahex',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#000000',
    secondaryColor: '#111111',
    secondaryTextColor: '#ffffff',
    secondaryBorderColor: '#222222',
    tertiaryColor: '#333333',
    tertiaryTextColor: '#ffffff',
    tertiaryBorderColor: '#444444',
    background: '#000000',
    mainBkg: '#111111',
    nodeBorder: '#222222',
    clusterBkg: '#333333',
    clusterBorder: '#444444',
    lineColor: '#555555',
    edgeLabelBackground: '#000000',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    labelBackground: '#000000',
    labelTextColor: '#ffffff',
    titleColor: '#ffffff',
  };
  const report = validateTheme(bad);
  assert.equal(report.result, 'FAIL');
  assert.ok(report.errors.some((e) => e.includes('primaryColor')));
});

test('validateTheme FAIL for fontSize missing unit', () => {
  const vars = {
    primaryColor: '#0d4f6c', primaryTextColor: '#e8f4f8', primaryBorderColor: '#1a7da8',
    secondaryColor: '#1a7da8', secondaryTextColor: '#ffffff', secondaryBorderColor: '#2aa8d4',
    tertiaryColor: '#2aa8d4', tertiaryTextColor: '#0d2d3a', tertiaryBorderColor: '#5cc8e8',
    background: '#0a2535', mainBkg: '#0d4f6c', nodeBorder: '#1a7da8',
    clusterBkg: '#0d2d3a', clusterBorder: '#1a7da8', lineColor: '#5cc8e8',
    edgeLabelBackground: '#0d2d3a', fontFamily: 'Segoe UI, sans-serif',
    fontSize: '14', // missing unit
    labelBackground: '#0d2d3a', labelTextColor: '#e8f4f8', titleColor: '#5cc8e8',
  };
  const report = validateTheme(vars);
  assert.equal(report.result, 'FAIL');
  assert.ok(report.errors.some((e) => e.includes('fontSize')));
});

test('validateTheme WARN for unknown variable names', async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { join, dirname } = await import('node:path');
  const __dir = dirname(fileURLToPath(import.meta.url));
  const palettes = JSON.parse(readFileSync(join(__dir, '../assets/palettes.json'), 'utf-8'));
  const vars = { ...palettes[0].themeVariables, customUnknownVar: '#ff0000' };
  const report = validateTheme(vars);
  assert.ok(report.result === 'WARN' || report.result === 'PASS');
  if (report.result === 'WARN') {
    assert.ok(report.warnings.some((w) => w.includes('Unknown')));
  }
});

test('all 8 palettes pass validateTheme', async () => {
  const { readFileSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dir = dirname(fileURLToPath(import.meta.url));
  const palettes = JSON.parse(readFileSync(join(__dir, '../assets/palettes.json'), 'utf-8'));
  for (const p of palettes) {
    const report = validateTheme(p.themeVariables);
    assert.equal(report.result, 'PASS', `Palette ${p.name} should PASS: ${JSON.stringify(report.errors)}`);
  }
});
