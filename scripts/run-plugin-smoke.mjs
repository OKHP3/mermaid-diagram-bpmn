#!/usr/bin/env node
/**
 * run-plugin-smoke.mjs
 *
 * Orchestrates the plugin package boundary smoke test:
 *   1. Builds @okhp3/mermaid-diagram-bpmn from lib/bpmn-plugin/
 *   2. Packs it to a .tgz artifact (clean publish boundary proof)
 *   3. Installs the .tgz into fixtures/plugin-smoke/ with its own node_modules
 *   4. Runs fixtures/plugin-smoke/smoke.mjs to verify the public API works
 *
 * Exit 0 — all smoke assertions pass.
 * Exit 1 — build, pack, install, or assertions failed.
 *
 * Usage: node scripts/run-plugin-smoke.mjs [--verbose]
 */

import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const PLUGIN_DIR = join(ROOT, 'lib', 'bpmn-plugin');
const FIXTURE_DIR = join(ROOT, 'fixtures', 'plugin-smoke');
const VERBOSE = process.argv.includes('--verbose');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED   = '\x1b[31m';
const BOLD  = '\x1b[1m';
const DIM   = '\x1b[2m';

function step(label) {
  console.log(`\n${BOLD}▶ ${label}${RESET}`);
}

function run(cmd, args, cwd) {
  if (VERBOSE) console.log(`  ${DIM}$ ${cmd} ${args.join(' ')}${RESET}`);
  execFileSync(cmd, args, { cwd, stdio: VERBOSE ? 'inherit' : 'pipe' });
}

// ── 1. Build plugin ──────────────────────────────────────────────────────────
step('Build @okhp3/mermaid-diagram-bpmn');
run('pnpm', ['run', 'build'], PLUGIN_DIR);
console.log(`  ${GREEN}✔${RESET} Build complete`);

// ── 2. Clean old tarballs in fixture dir ─────────────────────────────────────
step('Clean old tarballs');
const oldTarballs = existsSync(FIXTURE_DIR)
  ? readdirSync(FIXTURE_DIR).filter(f => f.endsWith('.tgz'))
  : [];
for (const t of oldTarballs) {
  rmSync(join(FIXTURE_DIR, t));
}
if (oldTarballs.length > 0 && VERBOSE) {
  console.log(`  ${DIM}removed ${oldTarballs.length} old tarball(s)${RESET}`);
}

// ── 3. Pack plugin ───────────────────────────────────────────────────────────
step('pnpm pack → fixtures/plugin-smoke/');
run('pnpm', ['pack', '--pack-destination', FIXTURE_DIR], PLUGIN_DIR);

const tarballs = readdirSync(FIXTURE_DIR).filter(
  f => f.endsWith('.tgz') && f.includes('mermaid-diagram-bpmn'),
);
if (tarballs.length === 0) {
  console.error(`${RED}${BOLD}Error:${RESET} pnpm pack produced no .tgz in ${FIXTURE_DIR}`);
  process.exit(1);
}
const tarball = tarballs.sort().at(-1); // newest by name (semver sort safe at 0.x)
console.log(`  ${GREEN}✔${RESET} Packed: ${tarball}`);

// ── 4. Install tarball into fixture (isolated from workspace) ─────────────────
step('Install packed tarball into fixture');
// Remove the old plugin install to force a clean reinstall
const pluginInstall = join(FIXTURE_DIR, 'node_modules', '@okhp3');
if (existsSync(pluginInstall)) rmSync(pluginInstall, { recursive: true });

run('pnpm', ['install', '--ignore-workspace'], FIXTURE_DIR);
run('pnpm', ['add', '--ignore-workspace', `./${tarball}`], FIXTURE_DIR);
console.log(`  ${GREEN}✔${RESET} Installed`);

// ── 5. Run smoke assertions ───────────────────────────────────────────────────
step('Run smoke assertions');
try {
  execFileSync('node', ['smoke.mjs'], {
    cwd: FIXTURE_DIR,
    stdio: 'inherit',
  });
} catch {
  console.error(`\n${RED}${BOLD}Plugin smoke test FAILED.${RESET}\n`);
  process.exit(1);
}

console.log(`\n${GREEN}${BOLD}✅  Plugin smoke test passed.${RESET}\n`);
