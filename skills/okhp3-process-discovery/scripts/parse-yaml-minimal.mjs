/**
 * parse-yaml-minimal.mjs
 * Minimal YAML parser for PIR fixture files.
 * Handles: top-level scalars, nested objects, arrays of maps.
 * No external dependencies. Pure ESM.
 *
 * Exports: parseYaml(text: string): object
 */

/**
 * Parse a YAML string into a plain JS object.
 * Supports the structure used by PIR files:
 *   - Scalar values:  key: value
 *   - Nested objects: key:\n  subkey: value
 *   - Arrays of maps: key:\n  - field: value\n    field2: value2
 *
 * @param {string} text
 * @returns {object}
 */
export function parseYaml(text) {
  const lines = text.split('\n');
  let pos = 0;

  function getIndent(line) {
    if (line.trim() === '' || line.trim().startsWith('#')) return -1;
    return line.search(/\S/);
  }

  function coerce(v) {
    if (v === 'null' || v === '~') return null;
    if (v === 'true') return true;
    if (v === 'false') return false;
    return v;
  }

  function stripQuotes(v) {
    return v.replace(/^["']|["']$/g, '');
  }

  function skipEmpty() {
    while (pos < lines.length && (lines[pos].trim() === '' || lines[pos].trim().startsWith('#'))) {
      pos++;
    }
  }

  function peek() {
    let i = pos;
    while (i < lines.length && (lines[i].trim() === '' || lines[i].trim().startsWith('#'))) i++;
    return i < lines.length ? lines[i] : null;
  }

  function parseObject(minIndent) {
    const obj = {};
    while (true) {
      skipEmpty();
      if (pos >= lines.length) break;
      const line = lines[pos];
      const indent = getIndent(line);
      if (indent < minIndent) break;
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) break;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) { pos++; continue; }

      const key = trimmed.slice(0, colonIdx).trim();
      const rest = stripQuotes(trimmed.slice(colonIdx + 1).trim());
      pos++;

      if (rest === 'null' || rest === '~') {
        obj[key] = null;
      } else if (rest !== '') {
        obj[key] = coerce(rest);
      } else {
        const nextLine = peek();
        if (nextLine === null) {
          obj[key] = null;
          continue;
        }
        const nextIndent = getIndent(nextLine);
        const nextTrimmed = nextLine.trim();
        if (nextIndent > indent && nextTrimmed.startsWith('- ')) {
          obj[key] = parseArray(nextIndent);
        } else if (nextIndent > indent) {
          obj[key] = parseObject(nextIndent);
        } else {
          obj[key] = null;
        }
      }
    }
    return obj;
  }

  function parseArray(minIndent) {
    const arr = [];
    while (true) {
      skipEmpty();
      if (pos >= lines.length) break;
      const line = lines[pos];
      const indent = getIndent(line);
      if (indent < minIndent) break;
      const trimmed = line.trim();
      if (!trimmed.startsWith('- ')) break;

      const firstContent = trimmed.slice(2);
      const item = {};
      const ci = firstContent.indexOf(':');
      if (ci !== -1) {
        const k = firstContent.slice(0, ci).trim();
        const v = stripQuotes(firstContent.slice(ci + 1).trim());
        item[k] = coerce(v);
      }
      pos++;

      while (true) {
        skipEmpty();
        if (pos >= lines.length) break;
        const nextLine = lines[pos];
        const nextIndent = getIndent(nextLine);
        const nextTrimmed = nextLine.trim();
        if (nextIndent <= indent) break;
        if (nextTrimmed.startsWith('- ')) break;
        const ci2 = nextTrimmed.indexOf(':');
        if (ci2 !== -1) {
          const k = nextTrimmed.slice(0, ci2).trim();
          const v = stripQuotes(nextTrimmed.slice(ci2 + 1).trim());
          item[k] = coerce(v);
        }
        pos++;
      }
      arr.push(item);
    }
    return arr;
  }

  return parseObject(0);
}
