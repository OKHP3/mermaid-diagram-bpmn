/**
 * repair-bpmn-beta.mjs
 * Auto-repairs common repairable errors in bpmn-beta diagrams.
 *
 * Repairs applied (in order):
 *   R1 — Missing bpmn-beta header -> prepend
 *   R2 — Unquoted element labels containing spaces -> wrap in double quotes
 *   R3 — Node IDs containing hyphens -> convert to underscores; fix all flow references
 *   R4 — Duplicate element IDs -> rename duplicate(s) with _dup2, _dup3 suffix
 *   R5 — Missing start event -> insert stub start declaration
 *   R6 — Missing end event -> append stub end declaration
 *
 * Usage: node scripts/repair-bpmn-beta.mjs <file.mmd> [--write]
 * Export: repairBpmnBeta(source: string) => { valid, errors[], warnings[], repaired: string, repairs_applied: string[] }
 */

import { validateBpmnBeta } from './validate-bpmn-beta.mjs';

const INIT_BLOCK_RE = /%%\{[\s\S]*?\}%%/g;
const ELEMENT_KEYWORDS_RE = /^(start|end|event:[a-z:]+|task(?::[a-z]+)?|xor|or|and)\s+/;
const ELEMENT_DECL_FULL_RE = /^(\s*(?:start|end|event:[a-z:]+|task(?::[a-z]+)?|xor|or|and)\s+)([^\s]+)((?:\s+.*)?)$/;
const UNQUOTED_LABEL_RE = /^(\s*(?:start|end|event:[a-z:]+|task(?::[a-z]+)?|xor|or|and)\s+[a-zA-Z][a-zA-Z0-9_-]*\s+)([^"\n{].+)$/;

function hasInvalidIdChars(id) {
  return /[^a-zA-Z0-9_]/.test(id);
}

function sanitizeId(id) {
  return id.replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'id_auto';
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceIdOutsideQuotes(text, oldId, newId) {
  let result = '';
  let i = 0;
  const re = new RegExp(`\\b${escapeRegex(oldId)}\\b`, 'g');
  while (i < text.length) {
    if (text[i] === '"') {
      const j = text.indexOf('"', i + 1);
      if (j === -1) { result += text.slice(i); break; }
      result += text.slice(i, j + 1);
      i = j + 1;
    } else {
      const j = text.indexOf('"', i);
      const segment = j === -1 ? text.slice(i) : text.slice(i, j);
      result += segment.replace(re, newId);
      if (j === -1) break;
      i = j;
    }
  }
  return result;
}

function extractId(trimmed) {
  const m = trimmed.match(/^(?:start|end|event:[a-z:]+|task(?::[a-z]+)?|xor|or|and)\s+([a-zA-Z][a-zA-Z0-9_-]*)/);
  return m ? m[1] : null;
}

/**
 * @param {string} source
 * @returns {{ valid: boolean, errors: object[], warnings: object[], repaired: string, repairs_applied: string[] }}
 */
export function repairBpmnBeta(source) {
  const repairs = [];
  let lines = source.split('\n');

  // ── R1: Missing bpmn-beta header ─────────────────────────────────────────
  const strippedForHeader = source.replace(INIT_BLOCK_RE, '');
  const firstNonEmpty = strippedForHeader.split('\n')
    .map(l => l.trim())
    .find(l => l && !l.startsWith('%'));
  if (firstNonEmpty !== 'bpmn-beta') {
    lines.unshift('bpmn-beta');
    repairs.push('R1: Prepended missing bpmn-beta header');
  }

  // ── R2: Unquoted element labels ───────────────────────────────────────────
  lines = lines.map((line, i) => {
    const m = line.match(UNQUOTED_LABEL_RE);
    if (m) {
      const label = m[2].trim();
      if (!label.startsWith('"') && !label.startsWith('{') && label !== '') {
        repairs.push(`R2: Line ${i + 1}: wrapped unquoted label "${label}" in double quotes`);
        return `${m[1]}"${label}"`;
      }
    }
    return line;
  });

  // ── R3: Element IDs with non-alphanumeric/non-underscore characters ──────
  const idRenames = new Map();
  lines = lines.map((line, i) => {
    const trimmed = line.trim();
    if (!ELEMENT_KEYWORDS_RE.test(trimmed)) return line;
    const m = line.match(ELEMENT_DECL_FULL_RE);
    if (!m) return line;
    const [, prefix, rawId, rest] = m;
    if (!hasInvalidIdChars(rawId)) return line;
    const newId = sanitizeId(rawId);
    if (newId === rawId) return line;
    if (!idRenames.has(rawId)) idRenames.set(rawId, newId);
    repairs.push(`R3: Line ${i + 1}: sanitized ID '${rawId}' -> '${newId}' (invalid chars -> underscores)`);
    return `${prefix}${newId}${rest}`;
  });
  if (idRenames.size > 0) {
    lines = lines.map(line => {
      const t = line.trim();
      if (/-->|==>|~~>/.test(t) || ELEMENT_KEYWORDS_RE.test(t)) {
        let updated = line;
        for (const [oldId, newId] of idRenames) {
          updated = replaceIdOutsideQuotes(updated, oldId, newId);
        }
        return updated;
      }
      return line;
    });
  }

  // ── R4: Duplicate element IDs ─────────────────────────────────────────────
  const seenIds = new Map();
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (ELEMENT_KEYWORDS_RE.test(trimmed)) {
      const id = extractId(trimmed);
      if (id) {
        if (!seenIds.has(id)) seenIds.set(id, [i]);
        else seenIds.get(id).push(i);
      }
    }
  });
  for (const [id, lineIndices] of seenIds) {
    if (lineIndices.length > 1) {
      for (let k = 1; k < lineIndices.length; k++) {
        const newId = `${id}_dup${k + 1}`;
        const m = lines[lineIndices[k]].match(ELEMENT_DECL_FULL_RE);
        if (m && m[2] === id) {
          lines[lineIndices[k]] = `${m[1]}${newId}${m[3]}`;
          repairs.push(`R4: Renamed duplicate ID '${id}' at line ${lineIndices[k] + 1} -> '${newId}' (orphaned — add flows manually)`);
        }
      }
    }
  }

  // ── R5 + R6: Missing start / end events ──────────────────────────────────
  const joined = lines.join('\n');
  const hasStart = /\bstart\s+[a-zA-Z][a-zA-Z0-9_]*\s+"/.test(joined);
  const hasEnd = /\bend\s+[a-zA-Z][a-zA-Z0-9_]*\s+"/.test(joined);

  if (!hasStart || !hasEnd) {
    let insertIdx = lines.findIndex(l => l.trim() === 'bpmn-beta');
    if (insertIdx === -1) insertIdx = 0;
    insertIdx++;
    while (insertIdx < lines.length) {
      const t = lines[insertIdx].trim();
      if (t.startsWith('accTitle') || t.startsWith('accDescr') || t === '') insertIdx++;
      else break;
    }
    if (!hasStart) {
      lines.splice(insertIdx, 0, 'start s_auto "Process Start"');
      repairs.push('R5: Inserted stub start event s_auto — connect it to your first task');
      insertIdx++;
    }
    if (!hasEnd) {
      lines.push('end e_auto "Process End"');
      repairs.push('R6: Appended stub end event e_auto — connect your last task to it');
    }
  }

  const repairedCode = lines.join('\n');
  const validation = validateBpmnBeta(repairedCode);

  return {
    valid: validation.errors.length === 0,
    errors: validation.errors,
    warnings: validation.warnings,
    repaired: repairedCode,
    repairs_applied: repairs,
  };
}

// ─── CLI runner ───────────────────────────────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith('repair-bpmn-beta.mjs')) {
  import('node:fs').then(({ readFileSync, writeFileSync }) => {
    import('node:path').then(({ resolve }) => {
      const file = process.argv[2];
      if (!file) {
        console.log('Usage: node scripts/repair-bpmn-beta.mjs <file.mmd> [--write]');
        console.log('Auto-repairs common bpmn-beta errors. Use --write to overwrite the input file.');
        process.exit(0);
      }
      try {
        const code = readFileSync(resolve(file), 'utf8');
        const result = repairBpmnBeta(code);
        console.log(`Repairs applied: ${result.repairs_applied.length}`);
        result.repairs_applied.forEach(r => console.log(`  ${r}`));
        if (result.valid) {
          console.log('Post-repair validation: PASS');
        } else {
          console.log(`Post-repair validation: FAIL (${result.errors.length} remaining issue(s))`);
          result.errors.forEach((e, i) => console.log(`  [${i + 1}] [${e.ruleId}] ${e.message}`));
        }
        if (process.argv.includes('--write')) {
          writeFileSync(resolve(file), result.repaired, 'utf8');
          console.log(`Wrote repaired diagram to: ${file}`);
        } else {
          console.log('\n--- Repaired diagram ---');
          console.log(result.repaired);
        }
        process.exit(result.valid ? 0 : 1);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
  });
}
