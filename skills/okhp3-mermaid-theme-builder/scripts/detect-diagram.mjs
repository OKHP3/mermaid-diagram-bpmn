#!/usr/bin/env node
/**
 * detect-diagram.mjs
 * Detects the Mermaid diagram family from source text.
 * Returns { family, keyword, confidence, warnings }
 *
 * Usage:
 *   node detect-diagram.mjs [--source "mermaid source"] [--file path.mmd]
 *   import { detectDiagram } from './detect-diagram.mjs'
 */

const FAMILY_MAP = {
  flowchart: 'flowchart',
  graph: 'flowchart',
  sequenceDiagram: 'sequence',
  classDiagram: 'class',
  gantt: 'gantt',
  erDiagram: 'er',
  'stateDiagram-v2': 'state',
  stateDiagram: 'state',
  pie: 'pie',
  journey: 'journey',
  'bpmn-beta': 'bpmn-beta',
  mindmap: 'mindmap',
  'xychart-beta': 'xychart-beta',
  timeline: 'timeline',
  'block-beta': 'block',
  quadrantChart: 'quadrant',
  requirementDiagram: 'requirement',
  gitGraph: 'git',
};

const REDUCED_COMPAT_FAMILIES = new Set([
  'sequence',
  'gantt',
  'pie',
  'journey',
  'mindmap',
  'timeline',
]);

/**
 * @param {string} source - Raw Mermaid diagram text (with or without code fences)
 * @returns {{ family: string, keyword: string, confidence: 'high'|'low', warnings: string[] }}
 */
export function detectDiagram(source) {
  const warnings = [];

  const stripped = source
    .replace(/^```[a-z]*\n?/m, '')
    .replace(/```\s*$/m, '')
    .replace(/^---[\s\S]*?---\n?/, '')
    .replace(/%%\{[\s\S]*?\}%%\n?/g, '')
    .replace(/%%[^\n]*\n?/g, '');

  const lines = stripped
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { family: 'unknown', keyword: '', confidence: 'low', warnings: ['No content found after stripping fences and init blocks.'] };
  }

  const firstLine = lines[0];
  const keyword = firstLine.split(/\s+/)[0];

  if (Object.prototype.hasOwnProperty.call(FAMILY_MAP, keyword)) {
    const family = FAMILY_MAP[keyword];

    if (REDUCED_COMPAT_FAMILIES.has(family)) {
      warnings.push(
        `${family} diagrams have partial themeVariables compatibility. Some variables will not apply. ` +
        `Include a renderer note after styled output.`
      );
    }

    if (family === 'bpmn-beta') {
      warnings.push(
        'bpmn-beta is the OKHP3 prototype DSL — not a Mermaid v11 native diagram type. ' +
        'Theming applies to the standalone OKHP3 SVG renderer, not through the standard Mermaid pipeline on external hosts.'
      );
    }

    return { family, keyword, confidence: 'high', warnings };
  }

  warnings.push(`Unrecognized keyword "${keyword}". Defaulting to unknown family. Applying full themeVariables set as safe default.`);
  return { family: 'unknown', keyword, confidence: 'low', warnings };
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  let source = '';

  const sourceIdx = args.indexOf('--source');
  const fileIdx = args.indexOf('--file');

  if (sourceIdx !== -1 && args[sourceIdx + 1]) {
    source = args[sourceIdx + 1];
  } else if (fileIdx !== -1 && args[fileIdx + 1]) {
    const { readFileSync } = await import('fs');
    source = readFileSync(args[fileIdx + 1], 'utf-8');
  } else if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    source = Buffer.concat(chunks).toString('utf-8');
  } else {
    console.error('Usage: detect-diagram.mjs --source "..." | --file path.mmd | < file.mmd');
    process.exit(1);
  }

  const result = detectDiagram(source);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
