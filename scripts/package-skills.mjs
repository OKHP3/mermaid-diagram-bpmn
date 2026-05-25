#!/usr/bin/env node
/**
 * package-skills.mjs
 * Packages each skill directory into a ZIP archive in dist/ using the
 * `archiver` library — no external system tools required.
 *
 * Usage: node scripts/package-skills.mjs [--dry-run]
 *
 * Produces:
 *   dist/okhp3-process-discovery-skill.zip
 *   dist/okhp3-process-narrative-skill.zip
 *   dist/okhp3-bpmn-for-mermaid-skill.zip
 *   dist/okhp3-mermaid-theme-builder-skill.zip
 *   dist/okhp3-bp-skill-suite-v0.2.zip  (discovery + narrative + bpmn + context/)
 */

import { ZipArchive } from 'archiver';
import { mkdirSync, existsSync, readdirSync, statSync, createWriteStream } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const skillsDir = join(repoRoot, 'skills');
const distDir = join(repoRoot, 'dist');

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Create a ZIP archive with the archiver library ───────────────────────────

/**
 * @param {string} outPath  — destination .zip path
 * @param {Array<{srcDir: string, entryName: string}>} dirs — directories to include
 * @returns {Promise<{path: string, bytes: number}>}
 */
async function createZip(outPath, dirs) {
  if (DRY_RUN) {
    let totalFiles = 0;
    for (const { srcDir } of dirs) {
      totalFiles += countFiles(srcDir);
    }
    return { path: outPath, bytes: 0, files: totalFiles, dryRun: true };
  }

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    archive.on('error', reject);
    output.on('close', () => resolve({ path: outPath, bytes: archive.pointer() }));

    archive.pipe(output);

    for (const { srcDir, entryName, globPattern, globCwd } of dirs) {
      if (globPattern && globCwd) {
        archive.glob(globPattern, { cwd: globCwd });
      } else {
        // Exclude tests/ and node_modules/
        archive.directory(srcDir, entryName, (entry) => {
          if (entry.name.includes('node_modules/')) return false;
          if (entry.name.includes('tests/')) return false;
          if (entry.name.includes('.git/')) return false;
          return entry;
        });
      }
    }

    archive.finalize();
  });
}

function countFiles(dir) {
  if (!existsSync(dir)) return 0;
  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'tests' || entry.name === '.git') continue;
    if (entry.isDirectory()) count += countFiles(join(dir, entry.name));
    else count++;
  }
  return count;
}

function fmt(bytes) {
  if (bytes === 0) return 'dry-run';
  return `${(bytes / 1024).toFixed(1)} KB`;
}

// ─── Ensure dist/ exists ──────────────────────────────────────────────────────

if (!DRY_RUN) mkdirSync(distDir, { recursive: true });

const created = [];

// ─── Individual skill zips ────────────────────────────────────────────────────

const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .sort();

for (const skillName of skillDirs) {
  const outName = `${skillName}-skill.zip`;
  const outPath = join(distDir, outName);
  const srcDir = join(skillsDir, skillName);

  const result = await createZip(outPath, [{ srcDir, entryName: skillName }]);

  if (DRY_RUN) {
    console.log(`  ${outName}: ${result.files} file(s) [dry-run — nothing written]`);
  } else {
    console.log(`✔ dist/${outName} (${fmt(result.bytes)})`);
    created.push(outPath);
  }
}

// ─── Combined BP suite ZIP ────────────────────────────────────────────────────

const suiteZipPath = join(distDir, 'okhp3-bp-skill-suite-v0.2.zip');
const suiteSkills = [
  'okhp3-process-discovery',
  'okhp3-process-narrative',
  'okhp3-bpmn-for-mermaid',
].filter(s => existsSync(join(skillsDir, s)));

const contextDir = join(repoRoot, 'context');
const suiteDirs = [
  ...suiteSkills.map(s => ({ srcDir: join(skillsDir, s), entryName: s })),
  ...(existsSync(contextDir) ? [{ srcDir: contextDir, entryName: 'context' }] : []),
];

if (suiteDirs.length === 0) {
  console.warn('⚠  No BP suite skills found — skipping suite ZIP');
} else {
  const result = await createZip(suiteZipPath, suiteDirs);

  if (DRY_RUN) {
    console.log(`  okhp3-bp-skill-suite-v0.2.zip: ${result.files} file(s) [dry-run — nothing written]`);
  } else {
    console.log(`✔ dist/okhp3-bp-skill-suite-v0.2.zip (${fmt(result.bytes)})`);
    created.push(suiteZipPath);
  }
}

if (DRY_RUN) {
  console.log('\n(dry-run) No files written. Run without --dry-run to create archives.');
} else {
  console.log(`\nPackaged ${created.length} archive(s) into dist/`);
}
