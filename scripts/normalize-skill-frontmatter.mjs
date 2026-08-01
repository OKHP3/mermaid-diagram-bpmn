#!/usr/bin/env node
/**
 * Normalize repository skills to the portable Agent Skills frontmatter shape.
 *
 * This is intentionally conservative: it changes only frontmatter, keeps the
 * skill name and body intact, moves repository-specific fields into the
 * spec-supported metadata map, and converts list values to readable strings.
 * Run with --check in CI or --write when a source update is intentional.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSkillFrontmatter } from './skill-frontmatter.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const targets = [
  join(root, 'skills'),
  join(root, '.agents', 'skills'),
];
const write = process.argv.includes('--write');
const processSkillNames = new Set([
  'okhp3-as-is-process-capture',
  'okhp3-decision-model-authoring',
  'okhp3-elicitation-interviews',
  'okhp3-future-state-change-strategy',
  'okhp3-process-gap-exception-analysis',
  'okhp3-process-intake-and-scope',
  'okhp3-process-measures-controls',
  'okhp3-process-narrative-authoring',
  'okhp3-process-validation-scoring',
  'okhp3-publication-handoff-packaging',
  'okhp3-raci-governance-matrix',
  'okhp3-sipoc-generation',
  'okhp3-sop-work-instructions',
  'okhp3-stakeholder-and-role-mapping',
  'okhp3-visual-process-modeling',
]);

function skillFiles(dir) {
  if (!statSync(dir).isDirectory()) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMd = join(dir, entry.name, 'SKILL.md');
    const legacyMd = join(dir, entry.name, 'skill.md');
    try { statSync(skillMd); files.push(skillMd); } catch {
      try { statSync(legacyMd); files.push(legacyMd); } catch { /* not a skill */ }
    }
  }
  return files;
}

function quote(value) {
  return JSON.stringify(String(value).replace(/\s+/g, ' ').trim());
}

function normalize(file) {
  const content = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const parsed = parseSkillFrontmatter(content);
  if (!parsed) throw new Error(`Missing frontmatter: ${file}`);

  const name = parsed.fields.name;
  const description = parsed.fields.description;
  if (!name || !description) throw new Error(`Missing name or description: ${file}`);

  const metadata = { ...parsed.metadata };
  for (const [key, value] of Object.entries(parsed.fields)) {
    if (!['name', 'description', 'license', 'compatibility', 'allowed-tools'].includes(key) && key !== 'metadata') {
      metadata[key] = value;
    }
  }

  const orderedKeys = Object.keys(metadata);
  const lines = [
    '---',
    `name: ${name}`,
    `description: ${quote(description)}`,
  ];
  if (parsed.fields.license) lines.push(`license: ${quote(parsed.fields.license)}`);
  if (parsed.fields.compatibility) lines.push(`compatibility: ${quote(parsed.fields.compatibility)}`);
  if (orderedKeys.length > 0) {
    lines.push('metadata:');
    for (const key of orderedKeys) lines.push(`  ${key}: ${quote(metadata[key])}`);
  }
  lines.push('---');

  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, '').replace(/^\r?\n/, '');
  let next = `${lines.join('\n')}\n\n${body.replace(/\r\n/g, '\n')}`;

  const logicalName = name.replace(/^okhp3-/, '');
  if (processSkillNames.has(logicalName) && !/^## Execution contract\b/m.test(next)) {
    const contract = `## Execution contract

Apply this contract on every run so the artifact is trustworthy and reusable:

1. State the input evidence, assumptions, and unresolved questions before drafting. Never invent missing process facts, owners, controls, dates, or approvals.
2. Preserve stable identifiers and source traceability. When transforming an upstream artifact, retain its IDs and cite the source field or section for each derived decision.
3. Produce the declared artifact exactly, including required fields and valid values. Keep unsupported, uncertain, or not-applicable items explicit instead of silently omitting them.
4. Validate the result with the bundled script or fixture when available. Report validation status, warnings, and any manual review still required.
5. Stop and request the missing input when a boundary, approval authority, or safety-critical rule cannot be inferred. A partial artifact with clearly marked open questions is safer than a confident fabrication.

`;
    next = next.replace(/\n## References\b/, `\n${contract}## References`);
    if (next === `${lines.join('\n')}\n\n${body.replace(/\r\n/g, '\n')}`) next += `\n\n${contract}`;
  }

  return { changed: next !== content.replace(/\r\n/g, '\n'), content: next };
}

const files = targets.flatMap(skillFiles);
let changed = 0;
for (const file of files) {
  const result = normalize(file);
  if (!result.changed) continue;
  changed += 1;
  console.log(`${write ? 'normalize' : 'would normalize'} ${file}`);
  if (write) writeFileSync(file, result.content, 'utf8');
}

console.log(`${files.length} skill file(s) scanned; ${changed} would change.`);
if (!write && changed > 0) process.exitCode = 1;
