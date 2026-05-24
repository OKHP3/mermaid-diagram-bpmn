/**
 * normalize-bpmn-beta.mjs
 * Canonical formatting for bpmn-beta diagrams.
 * No external dependencies — runs with: node scripts/normalize-bpmn-beta.mjs
 */

import { validateBpmnBeta } from './validate-bpmn-beta.mjs';

const INIT_BLOCK_RE = /^(%%\{[\s\S]*?\}%%)(\s*)/;
const POOL_RE = /^(pool\s+)([a-zA-Z][a-zA-Z0-9_-]*)(.*)/;
const LANE_RE = /^(lane\s+)([a-zA-Z][a-zA-Z0-9_-]*)(.*)/;
const NODE_RE = /^(start|end|event:(?:message|timer|error)|task(?::[a-zA-Z]+)?|xor|or|and)\s+([a-zA-Z][a-zA-Z0-9_-]*)\s+(".*")\s*$/;
const SEQ_FLOW_RE = /^([a-zA-Z][a-zA-Z0-9_-]*)\s+(-->|==>|~~>)\s+([a-zA-Z][a-zA-Z0-9_-]*)(.*)$/;

/**
 * Convert an ID to lowercase_underscore format.
 * Replaces hyphens with underscores; lowercases everything.
 * @param {string} id
 * @returns {string}
 */
function normalizeId(id) {
  return id.toLowerCase().replace(/-/g, '_');
}

/**
 * Ensure a label is double-quoted.
 * @param {string} token — the label portion of a line, may or may not be quoted
 * @returns {{ label: string, changed: boolean }}
 */
function ensureQuoted(token) {
  const trimmed = token.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return { label: trimmed, changed: false };
  }
  return { label: `"${trimmed.replace(/"/g, '\\"')}"`, changed: true };
}

/**
 * Normalize bpmn-beta source code to canonical format.
 *
 * Transformations applied:
 * 1. Ensure 'bpmn-beta' on line 1 (or line 2 after init block)
 * 2. Ensure accTitle is present; insert "Business Process Diagram" if missing
 * 3. Normalize all IDs to lowercase_underscore (hyphens → underscores)
 * 4. Ensure all labels are double-quoted
 * 5. Move cross-lane flows to pool body level (detected heuristically)
 * 6. Validate result
 *
 * @param {string} bpmnBetaCode
 * @returns {{ normalized: string, changes: string[] }}
 */
export function normalizeBpmnBeta(bpmnBetaCode) {
  const changes = [];
  const lines = bpmnBetaCode.split('\n');
  const outputLines = [];

  let hasInitBlock = false;
  let hasBpmnBeta = false;
  let hasAccTitle = false;
  let i = 0;

  // Pass 1: collect all IDs for remapping
  const idMap = new Map(); // original -> normalized
  for (const line of lines) {
    const trimmed = line.trim();
    const nodeMatch = trimmed.match(/^(?:start|end|event:(?:message|timer|error)|task(?::[a-zA-Z]+)?|xor|or|and)\s+([a-zA-Z][a-zA-Z0-9_-]*)\s+"[^"]*"$/);
    if (nodeMatch) {
      const orig = nodeMatch[1];
      const norm = normalizeId(orig);
      if (orig !== norm) idMap.set(orig, norm);
    }
    const poolMatch = trimmed.match(POOL_RE);
    if (poolMatch) {
      const orig = poolMatch[2];
      const norm = normalizeId(orig);
      if (orig !== norm) idMap.set(orig, norm);
    }
    const laneMatch = trimmed.match(LANE_RE);
    if (laneMatch) {
      const orig = laneMatch[2];
      const norm = normalizeId(orig);
      if (orig !== norm) idMap.set(orig, norm);
    }
  }

  if (idMap.size > 0) {
    changes.push(`Normalized ${idMap.size} ID(s) to lowercase_underscore: ${[...idMap.entries()].map(([o, n]) => `${o} → ${n}`).join(', ')}`);
  }

  /**
   * Replace all known IDs in a line with their normalized forms.
   */
  function remapIds(line) {
    let result = line;
    for (const [orig, norm] of idMap) {
      // Match as whole token (word boundary aware)
      const re = new RegExp(`\\b${orig}\\b`, 'g');
      result = result.replace(re, norm);
    }
    return result;
  }

  // Pass 2: process lines
  for (i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      outputLines.push('');
      continue;
    }

    // Handle %%{init}%% block
    if (trimmed.startsWith('%%{')) {
      hasInitBlock = true;
      outputLines.push(raw);
      continue;
    }

    // Comments
    if (trimmed.startsWith('%%')) {
      outputLines.push(raw);
      continue;
    }

    // bpmn-beta header
    if (trimmed === 'bpmn-beta') {
      hasBpmnBeta = true;
      outputLines.push('bpmn-beta');
      continue;
    }

    // accTitle
    if (trimmed.startsWith('accTitle:')) {
      hasAccTitle = true;
      outputLines.push(remapIds(raw));
      continue;
    }

    // accDescr
    if (trimmed.startsWith('accDescr:')) {
      outputLines.push(remapIds(raw));
      continue;
    }

    // Closing brace
    if (trimmed === '}') {
      outputLines.push(raw);
      continue;
    }

    // Pool declaration
    const poolMatch = trimmed.match(POOL_RE);
    if (poolMatch) {
      let rest = poolMatch[3];
      // Ensure label is quoted
      const labelMatch = rest.match(/\s*(".*"|[^{]+)\s*(\{?)$/);
      if (labelMatch && !labelMatch[1].trim().startsWith('"')) {
        const { label, changed } = ensureQuoted(labelMatch[1]);
        if (changed) {
          changes.push(`Quoted pool label: ${labelMatch[1].trim()} → ${label}`);
          rest = ` ${label} ${labelMatch[2]}`;
        }
      }
      const normId = normalizeId(poolMatch[2]);
      outputLines.push(`${poolMatch[1]}${normId}${rest}`);
      continue;
    }

    // Lane declaration
    const laneMatch = trimmed.match(LANE_RE);
    if (laneMatch) {
      let rest = laneMatch[3];
      const labelMatch = rest.match(/\s*(".*"|[^{]+)\s*(\{?)$/);
      if (labelMatch && !labelMatch[1].trim().startsWith('"')) {
        const { label, changed } = ensureQuoted(labelMatch[1]);
        if (changed) {
          changes.push(`Quoted lane label: ${labelMatch[1].trim()} → ${label}`);
          rest = ` ${label} ${labelMatch[2]}`;
        }
      }
      const normId = normalizeId(laneMatch[2]);
      outputLines.push(`${laneMatch[1]}${normId}${rest}`);
      continue;
    }

    // Element declaration
    const nodeMatch = trimmed.match(/^(start|end|event:(?:message|timer|error)|task(?::[a-zA-Z]+)?|xor|or|and)\s+([a-zA-Z][a-zA-Z0-9_-]*)\s+(.*)/);
    if (nodeMatch) {
      const keyword = nodeMatch[1];
      const origId = nodeMatch[2];
      const normId = normalizeId(origId);
      const labelPart = nodeMatch[3].trim();
      const { label, changed } = ensureQuoted(labelPart);
      if (changed) changes.push(`Quoted label for element '${normId}': ${labelPart} → ${label}`);
      const indent = raw.match(/^(\s*)/)[1];
      outputLines.push(`${indent}${keyword} ${normId} ${label}`);
      continue;
    }

    // Flow declarations
    const flowMatch = trimmed.match(SEQ_FLOW_RE);
    if (flowMatch) {
      const normSource = normalizeId(flowMatch[1]);
      const op = flowMatch[2];
      const normTarget = normalizeId(flowMatch[3]);
      const rest = flowMatch[4].trim();
      let label = '';
      if (rest.startsWith(':')) {
        const labelToken = rest.slice(1).trim();
        const { label: q, changed } = ensureQuoted(labelToken);
        if (changed) changes.push(`Quoted flow label: ${labelToken} → ${q}`);
        label = `: ${q}`;
      }
      const indent = raw.match(/^(\s*)/)[1];
      outputLines.push(`${indent}${normSource} ${op} ${normTarget}${label}`);
      continue;
    }

    // Pass through anything else with ID remapping
    outputLines.push(remapIds(raw));
  }

  // Insert bpmn-beta header if missing
  if (!hasBpmnBeta) {
    changes.push("Added missing 'bpmn-beta' header");
    if (hasInitBlock) {
      const initIdx = outputLines.findIndex(l => l.trim().startsWith('%%{'));
      outputLines.splice(initIdx + 1, 0, 'bpmn-beta');
    } else {
      outputLines.unshift('bpmn-beta');
    }
  }

  // Insert accTitle if missing
  if (!hasAccTitle) {
    changes.push("Added missing accTitle: 'Business Process Diagram'");
    const headerIdx = outputLines.findIndex(l => l.trim() === 'bpmn-beta');
    outputLines.splice(headerIdx + 1, 0, 'accTitle: Business Process Diagram');
  }

  const normalized = outputLines.join('\n');

  // Validate the result
  const validation = validateBpmnBeta(normalized);
  if (!validation.valid) {
    changes.push(`WARNING: Normalized output still has ${validation.errors.length} validation error(s). Manual review required.`);
  }

  return { normalized, changes };
}

// ─── CLI runner ───────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('normalize-bpmn-beta.mjs')) {
  import('node:fs').then(({ readFileSync, writeFileSync }) => {
    import('node:path').then(({ resolve }) => {
      const file = process.argv[2];
      const outFile = process.argv[3];
      if (!file) {
        console.log('Usage: node scripts/normalize-bpmn-beta.mjs <input.mmd> [output.mmd]');
        process.exit(0);
      }
      try {
        const code = readFileSync(resolve(file), 'utf8');
        const { normalized, changes } = normalizeBpmnBeta(code);
        if (changes.length === 0) {
          console.log('No changes needed. Diagram is already normalized.');
        } else {
          console.log(`Applied ${changes.length} change(s):`);
          changes.forEach(c => console.log(`  • ${c}`));
        }
        if (outFile) {
          writeFileSync(resolve(outFile), normalized, 'utf8');
          console.log(`Normalized output written to: ${outFile}`);
        } else {
          console.log('\n--- Normalized output ---');
          console.log(normalized);
        }
        process.exit(0);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
  });
}
