#!/usr/bin/env node
/**
 * init-process-artifact.mjs
 * Scaffolds the per-process artifact output tree under artifacts/<process-id>/
 * as defined in the BP-SKILL v0.2 directory specification.
 *
 * Usage: node scripts/init-process-artifact.mjs <process-id>
 * Example: node scripts/init-process-artifact.mjs proc-001
 *
 * Creates:
 *   artifacts/<process-id>/
 *     pns.yaml         - canonical machine-readable PNS template
 *     PNS.md           - human companion
 *     bpmn/            — bpmn-beta diagram output
 *     dmn/             — DMN decision model output
 *     sop/             — SOP and work instruction output
 *     governance/      — RACI and governance matrix output
 *     publication/     — final publication bundle
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE      = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..');

const processId = process.argv[2];

if (!processId) {
  console.error('Usage: node scripts/init-process-artifact.mjs <process-id>');
  console.error('Example: node scripts/init-process-artifact.mjs proc-purchase-approval-001');
  process.exit(1);
}

if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(processId)) {
  console.error(`Error: process-id must be lowercase alphanumeric with hyphens — got "${processId}"`);
  process.exit(1);
}

const artifactRoot = join(REPO_ROOT, 'artifacts', processId);

if (existsSync(artifactRoot)) {
  console.error(`Error: artifacts/${processId}/ already exists — will not overwrite`);
  process.exit(1);
}

const subdirs = ['bpmn', 'dmn', 'sop', 'governance', 'publication'];
const today   = new Date().toISOString().slice(0, 10);

const yamlTemplate = readFileSync(join(REPO_ROOT,
  'skills/okhp3-process-narrative-authoring/assets/pns-template.yaml'), 'utf8')
  .replace('process_id: ""', `process_id: "${processId}"`)
  .replace('created_date: ""', `created_date: "${today}"`)
  .replace('last_modified_date: ""', `last_modified_date: "${today}"`);
const sectionNames = ['Process Box', 'Activity Sequence', 'Roles and RACI', 'Business Rules',
  'Decision Points', 'Exception Paths', 'KPIs', 'Systems and Integrations',
  'Controls and Compliance', 'Open Questions', 'BABOK Core Concepts', 'Revision History', 'Validation'];
const pnsTemplate = `# Process Narrative: ${processId}\n\n` +
  'Human companion to pns.yaml. Complete and validate the YAML before handoff.\n\n' +
  sectionNames.map((name, index) => `## ${index + 1}. ${name}\n\n_Unresolved: populate from source evidence._\n`).join('\n');

const gitkeepDirs = subdirs.map(d => join(artifactRoot, d));
const pnsPath     = join(artifactRoot, 'PNS.md');

mkdirSync(artifactRoot, { recursive: true });
for (const d of gitkeepDirs) {
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, '.gitkeep'), '');
}
writeFileSync(join(artifactRoot, 'pns.yaml'), yamlTemplate, 'utf8');
writeFileSync(pnsPath, pnsTemplate, 'utf8');

console.log(`✔ Scaffolded artifacts/${processId}/`);
for (const d of subdirs) {
  console.log(`    ${d}/`);
}
console.log(`    pns.yaml and PNS.md (status: draft-intake)`);
console.log(`\nNext: complete intake, author pns.yaml, and validate before handoff.`);
