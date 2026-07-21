/**
 * Small, dependency-free reader for Agent Skills frontmatter.
 *
 * The repository deliberately avoids a YAML dependency in its validation
 * scripts. This reader handles the subset used by SKILL.md: scalar fields,
 * folded/literal descriptions, and one-level metadata maps. It accepts both
 * LF and CRLF files so validation is portable across Windows and Unix.
 */

export function parseSkillFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;

  const lines = match[1].split(/\r?\n/);
  const fields = {};
  const metadata = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;

    const topLevel = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!topLevel) continue;

    const [, key, rawValue] = topLevel;
    if (key === 'metadata') {
      index += 1;
      for (; index < lines.length; index += 1) {
        const child = lines[index];
        if (!child.trim() || child.trimStart().startsWith('#')) continue;
        if (!/^\s+/.test(child)) {
          index -= 1;
          break;
        }

        const childMatch = child.match(/^\s{2}([A-Za-z0-9_-]+):\s*(.*)$/);
        if (!childMatch) continue;
        const [, childKey, childValue] = childMatch;
        const items = [];
        if (!childValue && index + 1 < lines.length) {
          let cursor = index + 1;
          while (cursor < lines.length) {
            const item = lines[cursor].match(/^\s+-\s*["']?(.*?)["']?\s*$/);
            if (!item) break;
            items.push(item[1]);
            cursor += 1;
          }
          if (items.length > 0) index = cursor - 1;
        }
        metadata[childKey] = items.length > 0 ? items.join('; ') : cleanScalar(childValue);
      }
      continue;
    }

    if (rawValue === '>' || rawValue === '|') {
      const continuation = [];
      let cursor = index + 1;
      while (cursor < lines.length && (/^\s+/.test(lines[cursor]) || !lines[cursor].trim())) {
        continuation.push(lines[cursor].trim());
        cursor += 1;
      }
      fields[key] = continuation.join(rawValue === '>' ? ' ' : '\n').trim();
      index = cursor - 1;
    } else {
      fields[key] = cleanScalar(rawValue);
    }
  }

  return { fields, metadata, raw: match[1] };
}

export function getSkillField(frontmatter, key) {
  if (!frontmatter) return '';
  return frontmatter.fields[key] ?? frontmatter.metadata[key] ?? '';
}

function cleanScalar(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try { return JSON.parse(trimmed); } catch { /* fall through to conservative trimming */ }
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean).join('; ');
  }
  return trimmed;
}
