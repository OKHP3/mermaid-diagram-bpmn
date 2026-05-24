#!/usr/bin/env node
/**
 * apply-theme.mjs
 * Applies a named palette to Mermaid source. Returns styled code and a report.
 *
 * Usage:
 *   node apply-theme.mjs --palette ocean-depth [--source "..."] [--file path.mmd] [--mode styled-mermaid]
 *   import { applyTheme } from './apply-theme.mjs'
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const PALETTES_PATH = join(__dir, '../assets/palettes.json');

function loadPalettes() {
  return JSON.parse(readFileSync(PALETTES_PATH, 'utf-8'));
}

function buildInitBlock(themeVariables) {
  const vars = Object.entries(themeVariables)
    .map(([k, v]) => `'${k}': '${v}'`)
    .join(', ');
  return `%%{init: { 'theme': 'base', 'themeVariables': { ${vars} } }}%%`;
}

/**
 * @param {string} source - Normalized Mermaid diagram body (no fences, no init block)
 * @param {string} paletteId - Palette name slug (e.g. 'ocean-depth')
 * @param {object} [options]
 * @param {string} [options.mode] - Output mode: 'styled-mermaid' | 'theme-json' | 'theme-bootstrap' | 'prompt-scaffold' | 'before-after-report'
 * @returns {{ styled: string, initBlock: string, palette: object, warnings: string[] }}
 */
export function applyTheme(source, paletteId, options = {}) {
  const { mode = 'styled-mermaid' } = options;
  const warnings = [];
  const palettes = loadPalettes();
  const palette = palettes.find((p) => p.name === paletteId);

  if (!palette) {
    const names = palettes.map((p) => p.name).join(', ');
    throw new Error(`Unknown palette: "${paletteId}". Available palettes: ${names}`);
  }

  const initBlock = buildInitBlock(palette.themeVariables);
  const styled = `${initBlock}\n${source.trim()}`;

  const result = {
    palette: { name: palette.name, display: palette.display, theme: palette.theme },
    initBlock,
    warnings,
  };

  if (mode === 'styled-mermaid') {
    result.styled = `\`\`\`mermaid\n${styled}\n\`\`\``;
  } else if (mode === 'theme-json') {
    result.styled = JSON.stringify({ theme: 'base', themeVariables: palette.themeVariables }, null, 2);
  } else if (mode === 'theme-bootstrap') {
    result.styled = [
      `<!-- Mermaid Theme: ${palette.display} — OverKill Hill P³ -->`,
      `<!-- Apply this init block before each diagram or set globally in your Mermaid config -->`,
      '',
      initBlock,
      '',
      '> Paste this block immediately before each Mermaid code fence in Markdown documents. For site-wide application, pass the themeVariables object to `mermaid.initialize()`.',
    ].join('\n');
  } else if (mode === 'prompt-scaffold') {
    result.styled = [
      'When generating Mermaid diagrams for this conversation, always include the following theme initialization block at the top of every diagram:',
      '',
      initBlock,
      '',
      'Rules:',
      "- Always use 'theme': 'base' as the base theme. Never use 'default', 'dark', 'forest', or 'neutral'.",
      '- Preserve all themeVariables exactly as provided. Do not substitute, approximate, or omit any variable.',
      '- Place the %%{init}%% block on the first line of the Mermaid code, before the diagram type keyword.',
      '- For flowchart diagrams, also add classDef definitions for any nodes that need semantic color differentiation beyond the base palette.',
      '- Do not add inline style declarations that override themeVariables unless explicitly requested.',
    ].join('\n');
  } else if (mode === 'before-after-report') {
    result.styled = [
      '### Before (original)',
      '',
      '```mermaid',
      source.trim(),
      '```',
      '',
      `### After (${palette.display})`,
      '',
      '```mermaid',
      styled,
      '```',
      '',
      '**Changes applied:**',
      `- Palette: ${palette.display}`,
      `- Theme mode: ${palette.theme}`,
      '- themeVariables: 21 variables injected',
    ].join('\n');
  } else {
    warnings.push(`Unknown mode "${mode}". Defaulting to styled-mermaid.`);
    result.styled = `\`\`\`mermaid\n${styled}\n\`\`\``;
  }

  return result;
}

async function main() {
  const args = process.argv.slice(2);

  const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
  };

  const paletteId = get('--palette');
  const mode = get('--mode') ?? 'styled-mermaid';
  const filePath = get('--file');
  const sourceArg = get('--source');

  if (!paletteId) {
    console.error('Usage: apply-theme.mjs --palette <name> [--source "..."] [--file path.mmd] [--mode styled-mermaid]');
    process.exit(1);
  }

  let source = '';
  if (sourceArg) {
    source = sourceArg;
  } else if (filePath) {
    source = readFileSync(filePath, 'utf-8');
  } else if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    source = Buffer.concat(chunks).toString('utf-8');
  } else {
    console.error('Provide --source, --file, or pipe input.');
    process.exit(1);
  }

  const result = applyTheme(source, paletteId, { mode });
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
