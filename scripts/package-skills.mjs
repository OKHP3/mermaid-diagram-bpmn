#!/usr/bin/env node
/**
 * package-skills.mjs
 * Packages each skill directory into a ZIP archive in dist/.
 * Also produces a combined Business Process Skill Suite ZIP.
 *
 * Usage: node scripts/package-skills.mjs
 *
 * Produces:
 *   dist/okhp3-process-discovery-skill.zip
 *   dist/okhp3-process-narrative-skill.zip
 *   dist/okhp3-bpmn-for-mermaid-skill.zip
 *   dist/okhp3-mermaid-theme-builder-skill.zip
 *   dist/okhp3-bp-skill-suite-v0.1.zip  (discovery + narrative + bpmn + variables/)
 */

import { mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const skillsDir = join(repoRoot, 'skills');
const distDir = join(repoRoot, 'dist');

// ─── Verify zip is available ──────────────────────────────────────────────────
function zipAvailable() {
  try {
    execSync('zip --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

if (!zipAvailable()) {
  console.error('✖ zip command not found. Install zip (e.g. nix-env -iA nixpkgs.zip) and try again.');
  process.exit(1);
}

// ─── Ensure dist/ exists ──────────────────────────────────────────────────────
mkdirSync(distDir, { recursive: true });

const created = [];

// ─── Individual skill zips ────────────────────────────────────────────────────
const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

for (const skillName of skillDirs) {
  const outName = `${skillName}-skill.zip`;
  const outPath = join(distDir, outName);
  const cmd = [
    `cd "${join(repoRoot, 'skills')}"`,
    `zip -r "${outPath}" "${skillName}"`,
    `--exclude "*/node_modules/*"`,
    `--exclude "*/.git/*"`,
    `--exclude "*/tests/*"`,
    `--exclude "*/__pycache__/*"`,
  ].join(' ');

  try {
    execSync(cmd, { stdio: 'pipe' });
    const size = statSync(outPath).size;
    console.log(`✔ dist/${outName} (${(size / 1024).toFixed(1)} KB)`);
    created.push(outPath);
  } catch (err) {
    console.error(`✖ Failed to create dist/${outName}: ${err.stderr?.toString() || err.message}`);
    process.exit(1);
  }
}

// ─── Combined suite ZIP ───────────────────────────────────────────────────────
const suiteZipPath = join(distDir, 'okhp3-bp-skill-suite-v0.1.zip');
const suiteSkills = [
  'okhp3-process-discovery',
  'okhp3-process-narrative',
  'okhp3-bpmn-for-mermaid',
].filter(s => existsSync(join(skillsDir, s)));

if (suiteSkills.length === 0) {
  console.warn('⚠  No BP suite skills found — skipping suite ZIP');
} else {
  const skillArgs = suiteSkills.map(s => `"${s}"`).join(' ');
  const suiteCmd = [
    `cd "${join(repoRoot, 'skills')}"`,
    `zip -r "${suiteZipPath}" ${skillArgs}`,
    `--exclude "*/node_modules/*"`,
    `--exclude "*/.git/*"`,
    `--exclude "*/tests/*"`,
  ].join(' ');

  try {
    execSync(suiteCmd, { stdio: 'pipe' });

    // Append variables/ if it exists
    const variablesDir = join(repoRoot, 'variables');
    if (existsSync(variablesDir)) {
      execSync(
        `cd "${repoRoot}" && zip -r "${suiteZipPath}" variables/ --exclude "*/node_modules/*"`,
        { stdio: 'pipe' }
      );
    }

    const size = statSync(suiteZipPath).size;
    console.log(`✔ dist/okhp3-bp-skill-suite-v0.1.zip (${(size / 1024).toFixed(1)} KB)`);
    created.push(suiteZipPath);
  } catch (err) {
    console.error(`✖ Failed to create suite ZIP: ${err.stderr?.toString() || err.message}`);
    process.exit(1);
  }
}

console.log(`\nPackaged ${created.length} archive(s) into dist/`);
