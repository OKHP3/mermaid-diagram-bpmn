#!/usr/bin/env node
/**
 * normalize-mermaid.mjs
 * Strips code fences, surrounding prose, and existing %%{init}%% blocks.
 * Returns the clean diagram body only.
 *
 * Usage:
 *   node normalize-mermaid.mjs --source "..." | --file path.mmd
 *   import { normalizeMermaid } from './normalize-mermaid.mjs'
 */

/**
 * @param {string} source - Raw input (may contain code fences, prose, init blocks)
 * @returns {{ body: string, strippedInitBlock: string|null, warnings: string[] }}
 */
export function normalizeMermaid(source) {
  const warnings = [];
  let text = source;

  // Strip leading/trailing whitespace
  text = text.trim();

  // Extract and remove code fence if present
  const fenceMatch = text.match(/^```[a-z]*\n?([\s\S]*?)```\s*$/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Extract and remove %%{init}%% block if present
  let strippedInitBlock = null;
  const initMatch = text.match(/^(%%\{[\s\S]*?\}%%)\n?/);
  if (initMatch) {
    strippedInitBlock = initMatch[1].trim();
    text = text.slice(initMatch[0].length).trim();
    warnings.push('Existing %%{init}%% block was stripped. A new one will be generated from the selected palette.');
  }

  // Strip YAML frontmatter (--- ... ---)
  const frontmatterMatch = text.match(/^---[\s\S]*?---\n?/);
  if (frontmatterMatch) {
    text = text.slice(frontmatterMatch[0].length).trim();
    warnings.push('YAML frontmatter was stripped from the input.');
  }

  // Strip %% comment lines
  text = text
    .split('\n')
    .filter((line) => !line.trim().startsWith('%%') || line.trim().startsWith('%%{'))
    .join('\n')
    .trim();

  // Validate that something diagram-like remains
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) {
    warnings.push('No diagram content found after normalization. Input may be prose-only or empty.');
    return { body: '', strippedInitBlock, warnings };
  }

  return { body: text, strippedInitBlock, warnings };
}

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
    console.error('Usage: normalize-mermaid.mjs --source "..." | --file path.mmd | < file.mmd');
    process.exit(1);
  }

  const result = normalizeMermaid(source);
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
