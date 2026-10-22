/**
 * parse-yaml-minimal.mjs
 * Recursive-descent YAML parser -- no external dependencies.
 * Handles: flat scalars, nested objects, arrays of maps, arrays of scalars,
 * empty arrays ([] notation), quoted strings, and unquoted multi-word values.
 *
 * Not a full YAML implementation -- designed specifically for PNS fixture files.
 */

/**
 * @param {string} text  Raw YAML text
 * @returns {object}     Parsed JavaScript object
 */
export function parseYaml(text) {
  const tokens = text
    .split('\n')
    .map((l) => ({ indent: (l.match(/^(\s*)/)[1] || '').length, content: l.trim() }))
    .filter((t) => t.content !== '' && !t.content.startsWith('#'));

  let pos = 0;

  function peek() {
    return pos < tokens.length ? tokens[pos] : null;
  }

  function coerce(raw) {
    if (raw === '[]') return [];
    if (raw === '{}') return {};
    if (raw === 'null' || raw === '~') return null;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    if (raw.startsWith('"') && raw.endsWith('"')) return JSON.parse(raw);
    if (raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1).replaceAll("''", "'");
    if (raw.startsWith('[') && raw.endsWith(']')) {
      const values = [];
      let value = '', quote = '', depth = 0, escaped = false;
      for (const char of raw.slice(1, -1)) {
        if (quote) {
          value += char;
          if (escaped) escaped = false;
          else if (char === '\\' && quote === '"') escaped = true;
          else if (char === quote) quote = '';
        } else if ((char === '"' || char === "'") && !value.trim()) {
          quote = char;
          value += char;
        } else if (char === '[') { depth++; value += char; }
        else if (char === ']') { depth--; value += char; }
        else if (char === ',' && depth === 0) { values.push(coerce(value.trim())); value = ''; }
        else value += char;
      }
      if (quote || depth !== 0) throw new SyntaxError('Unclosed inline YAML sequence');
      if (value.trim()) values.push(coerce(value.trim()));
      return values;
    }
    const num = Number(raw);
    if (raw !== '' && !isNaN(num)) return num;
    return raw;
  }

  function parseObject(minIndent) {
    const obj = {};
    while (pos < tokens.length) {
      const tok = tokens[pos];
      if (tok.indent < minIndent) break;
      if (tok.content.startsWith('- ') || tok.content === '-') break;

      const colon = tok.content.indexOf(':');
      if (colon === -1) { pos++; continue; }

      const key = tok.content.slice(0, colon).trim();
      const rest = tok.content.slice(colon + 1).trim();
      pos++;

      if (rest === '[]') {
        obj[key] = [];
      } else if (rest !== '') {
        obj[key] = coerce(rest);
      } else {
        const next = peek();
        if (!next || next.indent <= tok.indent) {
          obj[key] = null;
        } else if (next.content.startsWith('- ') || next.content === '-') {
          obj[key] = parseArray(next.indent);
        } else {
          obj[key] = parseObject(next.indent);
        }
      }
    }
    return obj;
  }

  function parseArray(minIndent) {
    const arr = [];
    while (pos < tokens.length) {
      const tok = tokens[pos];
      if (tok.indent < minIndent) break;
      if (tok.content !== '-' && !tok.content.startsWith('- ')) break;

      const itemContent = tok.content === '-' ? '' : tok.content.slice(2).trim();
      pos++;

      if (itemContent === '') {
        const next = peek();
        if (!next || next.indent <= tok.indent) {
          arr.push(null);
        } else if (next.content.startsWith('- ')) {
          arr.push(parseArray(next.indent));
        } else {
          arr.push(parseObject(next.indent));
        }
        continue;
      }

      const colon = itemContent.indexOf(':');
      if (colon === -1) {
        arr.push(coerce(itemContent));
        continue;
      }

      const obj = {};
      const key = itemContent.slice(0, colon).trim();
      const rest = itemContent.slice(colon + 1).trim();

      if (rest === '[]') {
        obj[key] = [];
      } else if (rest !== '') {
        obj[key] = coerce(rest);
      } else {
        const next = peek();
        if (!next || next.indent <= tok.indent) {
          obj[key] = null;
        } else if (next.content.startsWith('- ') || next.content === '-') {
          obj[key] = parseArray(next.indent);
        } else {
          obj[key] = parseObject(next.indent);
        }
      }

      while (pos < tokens.length) {
        const nt = tokens[pos];
        if (nt.indent <= tok.indent) break;
        if (nt.content.startsWith('- ') || nt.content === '-') break;

        const nc = nt.content.indexOf(':');
        if (nc === -1) { pos++; continue; }

        const nk = nt.content.slice(0, nc).trim();
        const nv = nt.content.slice(nc + 1).trim();
        pos++;

        if (nv === '[]') {
          obj[nk] = [];
        } else if (nv !== '') {
          obj[nk] = coerce(nv);
        } else {
          const nn = peek();
          if (!nn || nn.indent <= nt.indent) {
            obj[nk] = null;
          } else if (nn.content.startsWith('- ') || nn.content === '-') {
            obj[nk] = parseArray(nn.indent);
          } else {
            obj[nk] = parseObject(nn.indent);
          }
        }
      }

      arr.push(obj);
    }
    return arr;
  }

  return parseObject(0);
}

/**
 * Load and parse a YAML or JSON file.
 * @param {string} filePath
 * @returns {object}
 */
export async function loadFile(filePath) {
  const { readFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');
  const abs = resolve(filePath);
  const text = readFileSync(abs, 'utf-8');
  if (filePath.endsWith('.json')) return JSON.parse(text);
  return parseYaml(text);
}
