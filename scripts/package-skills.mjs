#!/usr/bin/env node
/**
 * package-skills.mjs
 * Packages each skill directory into a ZIP archive in dist/ using the
 * `archiver` library — no external system tools required.
 *
 * Usage: node scripts/package-skills.mjs [--dry-run]
 *
 * Individual skill archives (one per skill):
 *   dist/bp-skill-<slug>-v0.1.zip   (19 skills total)
 *
 * Complete suite archive:
 *   dist/bp-skill-suite-complete-v0.2.zip
 *     — all 19 skills/ + context/ + evals/ (BP-SKILL v0.2 spec)
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
 * @param {string[]} [excludePatterns] — sub-path fragments to exclude from all dirs
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
  const outName = `bp-skill-${skillName}-v0.1.zip`;
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

// ─── Complete BP-SKILL suite ZIP (all skills + context/ + evals/) ─────────────

const suiteZipName = 'bp-skill-suite-complete-v0.2.zip';
const suiteZipPath = join(distDir, suiteZipName);
const contextDir   = join(repoRoot, 'context');
const evalsDir     = join(repoRoot, 'evals');

const suiteDirs = [
  // All skills (every subdirectory of skills/)
  ...skillDirs.map(s => ({ srcDir: join(skillsDir, s), entryName: join('skills', s) })),
  // Context variable files
  ...(existsSync(contextDir) ? [{ srcDir: contextDir, entryName: 'context' }] : []),
  // Eval suite rubrics + fixtures
  ...(existsSync(evalsDir)   ? [{ srcDir: evalsDir,   entryName: 'evals'   }] : []),
];

if (suiteDirs.length === 0) {
  console.warn('⚠  No BP suite content found — skipping suite ZIP');
} else {
  const result = await createZip(suiteZipPath, suiteDirs);

  if (DRY_RUN) {
    console.log(`  ${suiteZipName}: ${result.files} file(s) [dry-run — nothing written]`);
  } else {
    console.log(`✔ dist/${suiteZipName} (${fmt(result.bytes)})`);
    created.push(suiteZipPath);
  }
}

if (DRY_RUN) {
  console.log('\n(dry-run) No files written. Run without --dry-run to create archives.');
} else {
  console.log(`\nPackaged ${created.length} archive(s) into dist/`);
}
