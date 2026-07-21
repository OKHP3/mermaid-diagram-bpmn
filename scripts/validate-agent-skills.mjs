#!/usr/bin/env node
/** Validate every local .agents/skills package against the portable format. */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSkillField, parseSkillFrontmatter } from './skill-frontmatter.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const skillsRoot = join(root, '.agents', 'skills');
const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const refPattern = /`((?:references|scripts|assets|context)\/[^\s`]+\.[a-zA-Z0-9]+)`/g;
const failures = [];
let checked = 0;

function containsFile(dir) {
  return readdirSync(dir, { withFileTypes: true }).some((entry) =>
    entry.isFile() || (entry.isDirectory() && containsFile(join(dir, entry.name)))
  );
}

for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('__')) continue;
  const skillDir = join(skillsRoot, entry.name);
  const skillPath = join(skillDir, 'SKILL.md');
  const childEntries = readdirSync(skillDir, { withFileTypes: true });
  checked += 1;
  if (!existsSync(skillPath)) {
    if (childEntries.length === 0 || !containsFile(skillDir)) continue;
    failures.push(`${entry.name}: SKILL.md is required (lowercase skill.md is not portable)`);
    continue;
  }

  const content = readFileSync(skillPath, 'utf8');
  const fm = parseSkillFrontmatter(content);
  if (!fm) {
    failures.push(`${entry.name}: missing or invalid frontmatter`);
    continue;
  }

  const name = getSkillField(fm, 'name');
  const description = getSkillField(fm, 'description');
  if (name !== entry.name) failures.push(`${entry.name}: name must match directory, got ${JSON.stringify(name)}`);
  if (!namePattern.test(name)) failures.push(`${entry.name}: name is not lowercase hyphenated`);
  if (description.length < 50 || description.length > 1024) failures.push(`${entry.name}: description must be 50-1024 characters`);
  if (content.split(/\r?\n/).length > 500) failures.push(`${entry.name}: SKILL.md exceeds 500 lines`);

  for (const [key, value] of Object.entries(fm.metadata)) {
    if (typeof value !== 'string') failures.push(`${entry.name}: metadata.${key} must be a string`);
  }

  const refs = new Set();
  let match;
  while ((match = refPattern.exec(content)) !== null) refs.add(match[1]);
  for (const ref of refs) {
    if (ref.includes('*')) {
      const parent = join(skillDir, ref.slice(0, ref.lastIndexOf('/')));
      const pattern = ref.slice(ref.lastIndexOf('/') + 1).replace('*', '');
      if (!existsSync(parent) || readdirSync(parent).every((file) => !file.endsWith(pattern))) {
        failures.push(`${entry.name}: wildcard reference has no matching file ${ref}`);
      }
    } else if (!existsSync(join(skillDir, ref))) failures.push(`${entry.name}: missing referenced file ${ref}`);
  }

  const scriptsDir = join(skillDir, 'scripts');
  if (existsSync(scriptsDir)) {
    for (const script of readdirSync(scriptsDir).filter((file) => file.endsWith('.mjs'))) {
      const source = readFileSync(join(scriptsDir, script), 'utf8');
      if (/from\s+["']react["']|from\s+["']react-dom["']|\bwindow\.addEventListener\s*\(/.test(source)) {
        failures.push(`${entry.name}: ${script} contains browser UI code`);
      }
    }
  }
}

console.log(`Validated ${checked} .agents/skills package(s).`);
if (failures.length) {
  for (const failure of failures) console.error(`✖ ${failure}`);
  process.exitCode = 1;
} else {
  console.log('✔ All .agents/skills packages pass the portable format checks.');
}
