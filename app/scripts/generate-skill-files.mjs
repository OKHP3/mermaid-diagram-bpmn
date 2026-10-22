#!/usr/bin/env node
/**
 * generate-skill-files.mjs
 * Pre-build script: copies SKILL.md files and context templates into
 * public/skills/{id}/SKILL.md and public/context/ so that download
 * buttons in the React app have real static assets to fetch.
 *
 * Also generates public/pns-template.yaml.
 *
 * Run: node scripts/generate-skill-files.mjs
 * Wired into: pnpm build (runs first via "build" script in package.json)
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { syncPnsValidator } from '../../scripts/sync-pns-validator.mjs';
syncPnsValidator();

const __dirname = dirname(fileURLToPath(import.meta.url));
const artifactRoot = resolve(__dirname, '..');         // app/
const repoRoot     = resolve(artifactRoot, '..');      // workspace root
const skillsDir    = join(repoRoot, 'skills');         // workspace/skills/
const contextDir   = join(repoRoot, 'context');        // workspace/context/
const publicDir    = join(artifactRoot, 'public');

const publicSkillsDir  = join(publicDir, 'skills');
const publicContextDir = join(publicDir, 'context');

let copied = 0, skipped = 0;

// ─── 1. Copy SKILL.md files ─────────────────────────────────────────────────

if (!existsSync(skillsDir)) {
  console.warn(`[skill:generate] skills/ dir not found at ${skillsDir} — skipping SKILL.md copy`);
} else {
  const skillIds = readdirSync(skillsDir).filter((d) => {
    const p = join(skillsDir, d);
    try { return statSync(p).isDirectory(); } catch { return true; }
  });

  // The 15 BP-SKILL pipeline skill IDs (all okhp3-* prefixed as of v0.2.0 rename).
  // This list is the single source of truth for which skills/ subdirectories
  // are BP-SKILL pipeline members; it intentionally does not use readdirSync
  // directly so unrelated dirs (e.g. skills/__tests__/) are never picked up.
  const BP_SKILL_IDS = [
    'okhp3-process-intake-and-scope',
    'okhp3-stakeholder-and-role-mapping',
    'okhp3-elicitation-interviews',
    'okhp3-as-is-process-capture',
    'okhp3-process-narrative-authoring',
    'okhp3-visual-process-modeling',
    'okhp3-process-gap-exception-analysis',
    'okhp3-future-state-change-strategy',
    'okhp3-decision-model-authoring',
    'okhp3-process-validation-scoring',
    'okhp3-process-measures-controls',
    'okhp3-sop-work-instructions',
    'okhp3-raci-governance-matrix',
    'okhp3-sipoc-generation',
    'okhp3-publication-handoff-packaging',
  ];

  for (const id of BP_SKILL_IDS) {
    const srcFile = join(skillsDir, id, 'SKILL.md');
    const destDir = join(publicSkillsDir, id);
    const destFile = join(destDir, 'SKILL.md');

    if (!existsSync(srcFile)) {
      skipped++;
      console.warn(`  [skip] ${id}/SKILL.md — source not found`);
      continue;
    }

    mkdirSync(destDir, { recursive: true });
    copyFileSync(srcFile, destFile);
    copied++;
    console.log(`  [ok] skills/${id}/SKILL.md`);
  }
}

// ─── 2. Copy context/variable template files ────────────────────────────────

if (!existsSync(contextDir)) {
  console.warn(`[skill:generate] context/ dir not found at ${contextDir} — skipping context copy`);
} else {
  mkdirSync(publicContextDir, { recursive: true });

  const contextFiles = readdirSync(contextDir).filter((f) => f.endsWith('.md'));
  for (const filename of contextFiles) {
    const srcFile = join(contextDir, filename);
    const destFile = join(publicContextDir, filename);
    copyFileSync(srcFile, destFile);
    copied++;
    console.log(`  [ok] context/${filename}`);
  }
}

// ─── 3. Generate pns-template.yaml ──────────────────────────────────────────

const pnsTemplate = readFileSync(join(skillsDir,
  'okhp3-process-narrative-authoring/assets/pns-template.yaml'), 'utf8');

const pnsTemplatePath = join(publicDir, 'pns-template.yaml');
writeFileSync(pnsTemplatePath, pnsTemplate, 'utf8');
copied++;
console.log(`  [ok] pns-template.yaml`);

// ─── 4. Generate suite README ────────────────────────────────────────────────

const suiteReadme = `# BP-SKILL v0.3 — Business Process Agent Skill Suite

An open-standard domain extension to agentskills.io
Built by OverKill Hill P³™ — overkillhill.com
Source: github.com/OKHP3/mermaid-diagram-bpmn
Licensed MIT (code) / CC-BY-4.0 (documentation)

## What is BP-SKILL?

15 portable SKILL.md agent skills covering the full business process documentation lifecycle.
Aligned to BABOK v3, BPM CBOK v4.0, APQC PCF v7.4, BPMN 2.0.2, DMN 1.4, and ISO 9001:2015.

## Installation

Place each SKILL.md file in your agent platform's skills directory.
See agentskills.io for platform-specific install paths.

## Contents

skills/                 — 15 SKILL.md files in their respective subdirectories
context/                — 9 variable layer template files
pns-template.yaml       — Process Narrative Specification blank template

## Standards Alignment

- BABOK v3 (Business Analysis Body of Knowledge)
- BPM CBOK v4.0 (Business Process Management Common Body of Knowledge)
- APQC PCF v7.4 (Process Classification Framework)
- BPMN 2.0.2 / ISO 19510
- OMG DMN 1.4
- ISO 9001:2015

## License

Code: MIT
Documentation (SKILL.md content): CC-BY-4.0
`;

writeFileSync(join(publicDir, 'bp-skill-readme.md'), suiteReadme, 'utf8');

// ─── Done ────────────────────────────────────────────────────────────────────

console.log(`\n[skill:generate] Done — ${copied} files written, ${skipped} skipped`);
