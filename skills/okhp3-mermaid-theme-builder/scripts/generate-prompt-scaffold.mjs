#!/usr/bin/env node
/**
 * generate-prompt-scaffold.mjs
 * Emits an LLM prompt scaffold for a given palette and optional renderer target.
 *
 * Usage:
 *   node generate-prompt-scaffold.mjs --palette ocean-depth [--renderer obsidian] [--diagram-type bpmn-beta]
 *   import { generatePromptScaffold } from './generate-prompt-scaffold.mjs'
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const PALETTES_PATH = join(__dir, '../assets/palettes.json');
const RENDERER_PROFILES_PATH = join(__dir, '../assets/renderer-profiles.json');

function buildInitBlock(themeVariables) {
  const vars = Object.entries(themeVariables)
    .map(([k, v]) => `'${k}': '${v}'`)
    .join(', ');
  return `%%{init: { 'theme': 'base', 'themeVariables': { ${vars} } }}%%`;
}

/**
 * @param {string} paletteId - Palette slug (e.g. 'ocean-depth')
 * @param {object} [options]
 * @param {string} [options.rendererId] - Optional renderer ID from renderer-profiles.json
 * @param {string} [options.diagramType] - Optional diagram type to add type-specific rules
 * @returns {{ scaffold: string, palette: object, rendererAdvisory: string|null, warnings: string[] }}
 */
export function generatePromptScaffold(paletteId, options = {}) {
  const { rendererId, diagramType } = options;
  const warnings = [];

  const palettes = JSON.parse(readFileSync(PALETTES_PATH, 'utf-8'));
  const palette = palettes.find((p) => p.name === paletteId);
  if (!palette) {
    const names = palettes.map((p) => p.name).join(', ');
    throw new Error(`Unknown palette: "${paletteId}". Available: ${names}`);
  }

  const initBlock = buildInitBlock(palette.themeVariables);

  let rendererAdvisory = null;
  if (rendererId) {
    const renderers = JSON.parse(readFileSync(RENDERER_PROFILES_PATH, 'utf-8'));
    const renderer = renderers.find((r) => r.id === rendererId);
    if (renderer) {
      if (!renderer.initBlock || renderer.initBlock === false) {
        rendererAdvisory = renderer.advisory ?? `${renderer.display} does not support %%{init}%% blocks. The prompt scaffold will have no effect for diagrams embedded in ${renderer.display}.`;
        warnings.push(`Renderer "${renderer.display}" does not support %%{init}%% blocks. The scaffold is still generated but will not apply in this renderer.`);
      }
    } else {
      warnings.push(`Unknown renderer ID: "${rendererId}". Proceeding without renderer-specific advisory.`);
    }
  }

  const typeSpecificRules = [];
  if (diagramType === 'bpmn-beta') {
    typeSpecificRules.push(
      "- The %%{init}%% block must appear before 'bpmn-beta', not after.",
      "- Start every diagram with 'bpmn-beta' (this is the keyword, not a string literal).",
      '- Follow all okhp3-bpmn-for-mermaid DSL rules: use stable IDs, double-quoted labels, sequence flows inside pool scope.',
      '- Do not use invented bpmn-beta syntax.',
      '- Include accTitle and accDescr when the subject is known.'
    );
  } else if (diagramType === 'flowchart' || diagramType === 'graph') {
    typeSpecificRules.push(
      "- Add classDef statements for any nodes requiring semantic color differentiation beyond the base palette.",
      "- Use LR or TD direction unless the user specifies otherwise."
    );
  }

  const lines = [
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
  ];

  if (typeSpecificRules.length > 0) {
    lines.push('', `${diagramType} diagram rules:`);
    lines.push(...typeSpecificRules);
  }

  if (rendererAdvisory) {
    lines.push('', `Renderer note: ${rendererAdvisory}`);
  }

  const scaffold = lines.join('\n');

  return {
    scaffold,
    palette: { name: palette.name, display: palette.display, theme: palette.theme },
    rendererAdvisory,
    warnings,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

  const paletteId = get('--palette');
  const rendererId = get('--renderer');
  const diagramType = get('--diagram-type');

  if (!paletteId) {
    console.error('Usage: generate-prompt-scaffold.mjs --palette <name> [--renderer <id>] [--diagram-type <type>]');
    process.exit(1);
  }

  const result = generatePromptScaffold(paletteId, { rendererId, diagramType });
  console.log(result.scaffold);
  if (result.warnings.length > 0) {
    console.error('\nWarnings:');
    result.warnings.forEach((w) => console.error('  ' + w));
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
