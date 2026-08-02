#!/usr/bin/env node

/**
 * Dependency-free structural validator for Agent Skills directories.
 * It validates the portable Agent Skills contract; it does not execute a skill.
 */
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node validate-skill-suite.cjs [--skills-dir <directory> | --root <directory>]');
  console.log('  --skills-dir  Validate direct child skill packages (default: .agents/skills).');
  console.log('  --root        Recursively validate packages beneath a directory, or that directory when it is a package.');
  process.exit(0);
}
const dirIndex = args.indexOf('--skills-dir');
const rootIndex = args.indexOf('--root');
if ((dirIndex >= 0 && !args[dirIndex + 1]) || (rootIndex >= 0 && !args[rootIndex + 1])) {
  console.error('ERROR --skills-dir and --root each require a directory argument. Use --help for usage.');
  process.exit(1);
}
const targetDir = path.resolve(
  rootIndex >= 0 ? args[rootIndex + 1] : dirIndex >= 0 ? args[dirIndex + 1] : '.agents/skills'
);
const recursive = rootIndex >= 0;
const errors = [];
const warnings = [];
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SPEC_NAME_MAX = 64;
const PACKAGE_NAME_MAX = 36;
const DESCRIPTION_MAX = 1024;
const COMPATIBILITY_MAX = 500;
const BODY_LINE_MAX = 500;
const PATH_MAX = 180;
const ENTRY_NAME_MAX = 64;

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function readFrontmatter(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!text.startsWith('---\n')) return { text, frontmatter: '', body: text };
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) return { text, frontmatter: '', body: text };
  return { text, frontmatter: text.slice(4, end), body: text.slice(end + 5) };
}
function scalar(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/);
  const index = lines.findIndex(line => new RegExp(`^${key}:\\s*`).test(line));
  if (index < 0) return '';
  const first = lines[index].replace(new RegExp(`^${key}:\\s*`), '').trim();
  if (first !== '>' && first !== '|') return first.replace(/^['"]|['"]$/g, '');
  const continuation = [];
  for (const line of lines.slice(index + 1)) {
    if (/^[A-Za-z0-9_-]+:/.test(line)) break;
    continuation.push(line.trim());
  }
  return continuation.join(' ').trim();
}
function quotedMetadataValue(frontmatter, key) {
  return new RegExp(`^\\s{2}${key}:\\s*(["']).*\\1\\s*$`, 'm').test(frontmatter);
}
function metadataScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^\\s{2}${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}
function references(body, skillDir) {
  const found = new Set();
  for (const match of body.matchAll(/`((?:references|assets|scripts)\/[^`\s]+)[^`]*`/g)) found.add(match[1]);
  for (const ref of found) {
    if (path.isAbsolute(ref) || ref.split('/').includes('..')) {
      fail(`${skillDir}: reference must stay inside the skill package: ${ref}`);
      continue;
    }
    if (/[?*\[]/.test(ref)) continue;
    if (!fs.existsSync(path.join(skillDir, ref))) fail(`${skillDir}: missing referenced file ${ref}`);
  }
}
function findSkills(dir, deep) {
  if (!fs.existsSync(dir)) return [];
  if (fs.existsSync(path.join(dir, 'SKILL.md'))) return [dir];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === '.git' || entry.name === 'node_modules') continue;
    const child = path.join(dir, entry.name);
    if (fs.existsSync(path.join(child, 'SKILL.md'))) results.push(child);
    else if (deep) results.push(...findSkills(child, true));
  }
  return results;
}
function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${label}: invalid JSON (${error.message})`);
    return null;
  }
}
function isPlaceholder(value) {
  return typeof value !== 'string' || !value.trim() || /<[^>]+>|not-recorded|record after/i.test(value);
}
function validateSyncVerification(skillDir) {
  const benchmarkDir = path.join(skillDir, 'benchmarks');
  if (!fs.existsSync(benchmarkDir)) return;
  const records = fs.readdirSync(benchmarkDir)
    .filter(name => /^sync-verification-\d{4}-\d{2}-\d{2}\.json$/.test(name));
  for (const name of records) {
    const relativeRecord = `benchmarks/${name}`;
    const record = readJson(path.join(benchmarkDir, name), `${skillDir}/${relativeRecord}`);
    if (!record) continue;
    if (record.schema_version !== '1.0' || record.verification_kind !== 'current-state-reconciliation') {
      fail(`${skillDir}: ${relativeRecord} must declare schema 1.0 current-state-reconciliation`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.verification_date || '')) fail(`${skillDir}: ${relativeRecord} needs an ISO verification_date`);
    if (!record.canonical || isPlaceholder(record.canonical.package) || isPlaceholder(record.canonical.commit_or_hash)) {
      fail(`${skillDir}: ${relativeRecord} needs a non-placeholder canonical package and commit or hash`);
    }
    if (isPlaceholder(record.authorization_for_this_verification) || isPlaceholder(record.historical_limit)) {
      fail(`${skillDir}: ${relativeRecord} needs a verification authorization and historical-limit statement`);
    }
    const hashes = record.core_file_hashes;
    if (!hashes || typeof hashes !== 'object' || Array.isArray(hashes) || !Object.keys(hashes).length) {
      fail(`${skillDir}: ${relativeRecord} needs core_file_hashes`);
    } else {
      for (const [relative, hash] of Object.entries(hashes)) {
        if (path.isAbsolute(relative) || relative.split('/').includes('..') || !/^[A-F0-9]{64}$/.test(hash)) {
          fail(`${skillDir}: ${relativeRecord} has an invalid core-file hash entry: ${relative}`);
          continue;
        }
        const actualPath = path.join(skillDir, ...relative.split('/'));
        if (!fs.existsSync(actualPath)) fail(`${skillDir}: ${relativeRecord} hashes a missing file: ${relative}`);
        else {
          const actual = require('node:crypto').createHash('sha256').update(fs.readFileSync(actualPath)).digest('hex').toUpperCase();
          if (actual !== hash) fail(`${skillDir}: ${relativeRecord} core-file hash mismatch: ${relative}`);
        }
      }
    }
    if (!Array.isArray(record.mirrors) || !record.mirrors.length) fail(`${skillDir}: ${relativeRecord} needs at least one verified mirror`);
    for (const mirror of record.mirrors || []) {
      if (isPlaceholder(mirror.repository) || isPlaceholder(mirror.package) || mirror.core_files_match !== true ||
        !Number.isInteger(mirror.observed_core_file_count) || mirror.observed_core_file_count !== Object.keys(hashes || {}).length ||
        isPlaceholder(mirror.adapter_semantic_review) || isPlaceholder(mirror.validator_result)) {
        fail(`${skillDir}: ${relativeRecord} has an incomplete mirror verification entry`);
      }
    }
  }
}
function validateFoundryEvidence(skillDir, currentVersion) {
  if (path.basename(skillDir) !== 'okhp3-skill-foundry') return;
  const evalsFile = path.join(skillDir, 'evals', 'evals.json');
  const benchmarkFile = path.join(skillDir, 'benchmarks', 'benchmark.json');
  const ledgerFile = path.join(skillDir, 'benchmarks', 'learning-ledger-2026-07-27.json');
  if (!fs.existsSync(evalsFile)) {
    fail(`${skillDir}: Foundry package is missing evals/evals.json`);
  } else {
    const evals = readJson(evalsFile, `${skillDir}/evals/evals.json`);
    if (evals) {
      if (evals.skill_name !== path.basename(skillDir) || evals.skill_version !== currentVersion || !evals.status || !Array.isArray(evals.evals) || evals.evals.length < 3) {
        fail(`${skillDir}: evals/evals.json must declare version, status, and at least three cases`);
      }
      const development = Array.isArray(evals.evals) ? evals.evals.filter(item => item.partition === 'development') : [];
      if (development.length < 3) fail(`${skillDir}: Foundry requires at least three development evaluation cases`);
      for (const item of evals.evals || []) {
        for (const key of ['id', 'name', 'partition', 'risk', 'prompt', 'fixtures', 'output_contract', 'failure_consequence']) {
          if (!item[key]) fail(`${skillDir}: eval ${item.id || '<unnamed>'} is missing ${key}`);
        }
        if (!['development', 'holdout'].includes(item.partition)) fail(`${skillDir}: eval ${item.id || '<unnamed>'} has invalid partition`);
        if (!Array.isArray(item.expectations) || item.expectations.length < 3) fail(`${skillDir}: eval ${item.id || '<unnamed>'} needs at least three expectations`);
        for (const expectation of item.expectations || []) {
          if (!expectation.id || !expectation.text) fail(`${skillDir}: eval ${item.id || '<unnamed>'} contains an incomplete expectation`);
        }
      }
      const holdout = evals.release_holdout;
      const holdoutCases = (evals.evals || []).filter(item => item.partition === 'holdout');
      if (!holdout || !['external-required', 'protected'].includes(holdout.status) || typeof holdout.holdout_seen !== 'boolean' || !holdout.reason) {
        fail(`${skillDir}: evals/evals.json must declare a valid release holdout state, Boolean holdout_seen, and reason`);
      } else if (holdout.status === 'external-required' && (!holdout.holdout_seen || holdoutCases.length)) {
        fail(`${skillDir}: external-required holdout state requires holdout_seen true and zero packaged holdout cases`);
      } else if (holdout.status === 'protected' && (holdout.holdout_seen || !holdoutCases.length)) {
        fail(`${skillDir}: protected holdout state requires holdout_seen false and at least one packaged holdout case`);
      }
    }
  }
  if (!fs.existsSync(benchmarkFile)) {
    fail(`${skillDir}: Foundry package is missing benchmarks/benchmark.json`);
  } else {
    const benchmark = readJson(benchmarkFile, `${skillDir}/benchmarks/benchmark.json`);
    if (benchmark) {
      const metadata = benchmark.metadata || {};
      const status = metadata.evaluation_status;
      if (!benchmark.schema_version || metadata.skill_name !== path.basename(skillDir) || !metadata.evaluated_skill_version || !['live', 'analytical', 'historical', 'not-run'].includes(status)) {
        fail(`${skillDir}: benchmark metadata must declare schema version, evaluated version, and evidence status`);
      }
      if (metadata.evaluated_skill_version !== currentVersion && status !== 'historical') {
        fail(`${skillDir}: a version-mismatched benchmark must be historical`);
      }
      if (String(benchmark.schema_version).includes('historical') && metadata.evaluation_status !== 'historical') {
        fail(`${skillDir}: historical benchmark schema requires evaluation_status historical`);
      }
      if (status === 'live' && (metadata.evaluated_skill_version !== currentVersion || benchmark.schema_version !== '2.0' || !Array.isArray(benchmark.runs) || !benchmark.runs.length || !metadata.runner || !metadata.model || !metadata.fixtures || !benchmark.acceptance_criteria)) {
        fail(`${skillDir}: live benchmark must be current-version schema 2.0 evidence with runs, runner, model, fixtures, and acceptance criteria`);
      }
      if (benchmark.schema_version === '2.0' && (!metadata.runner || !metadata.fixtures || !benchmark.acceptance_criteria)) {
        fail(`${skillDir}: version 2.0 benchmark requires runner, fixtures, and acceptance criteria`);
      }
    }
  }
  if (!fs.existsSync(ledgerFile)) {
    warn(`${skillDir}: no dated Foundry learning ledger found`);
  } else {
    const ledgers = fs.readdirSync(path.join(skillDir, 'benchmarks')).filter(name => /^learning-ledger-\d{4}-\d{2}-\d{2}\.json$/.test(name));
    for (const ledgerName of ledgers) {
      const ledger = readJson(path.join(skillDir, 'benchmarks', ledgerName), `${skillDir}/benchmarks/${ledgerName}`);
      if (ledger && (!Array.isArray(ledger.evidence_sources) || !Array.isArray(ledger.review_passes) || !Array.isArray(ledger.changes))) {
        fail(`${skillDir}: learning ledger must contain evidence_sources, review_passes, and changes arrays`);
      }
    }
  }
  validateSyncVerification(skillDir);
}
function validatePortablePaths(skillDir, rootDir) {
  const stack = [skillDir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const full = path.join(current, entry.name);
      const relative = path.relative(rootDir, full).split(path.sep).join('/');
      if (entry.name.length > ENTRY_NAME_MAX) fail(`${skillDir}: path element exceeds ${ENTRY_NAME_MAX} characters: ${entry.name}`);
      if (relative.length > PATH_MAX) fail(`${skillDir}: path exceeds ${PATH_MAX} characters from scan root: ${relative}`);
      if (entry.isDirectory()) stack.push(full);
    }
  }
}
function validateSkill(skillDir, rootDir) {
  const entry = { name: path.basename(skillDir) };
  const file = path.join(skillDir, 'SKILL.md');
  const { text, frontmatter, body } = readFrontmatter(file);
  const name = scalar(frontmatter, 'name');
  const description = scalar(frontmatter, 'description');
  if (!frontmatter) fail(`${entry.name}: missing or malformed YAML frontmatter`);
  const compatibility = scalar(frontmatter, 'compatibility');
  if (!NAME.test(name) || name !== entry.name || name.length > SPEC_NAME_MAX) fail(`${entry.name}: name must match directory, use lowercase hyphen syntax, and be at most ${SPEC_NAME_MAX} characters`);
  if (entry.name.length > PACKAGE_NAME_MAX) fail(`${entry.name}: package directory exceeds the ${PACKAGE_NAME_MAX}-character portable repository limit`);
  if (!description || description.length > DESCRIPTION_MAX) fail(`${entry.name}: description must be 1-${DESCRIPTION_MAX} characters`);
  if (compatibility.length > COMPATIBILITY_MAX) fail(`${entry.name}: compatibility must be at most ${COMPATIBILITY_MAX} characters`);
  if (body.split('\n').length > BODY_LINE_MAX) fail(`${entry.name}: SKILL.md body exceeds the ${BODY_LINE_MAX}-line progressive-disclosure limit`);
  if (entry.name.startsWith('okhp3-') && !quotedMetadataValue(frontmatter, 'version')) fail(`${entry.name}: OKHP3 metadata.version must be a quoted semver string`);
  if (entry.name.startsWith('okhp3-') && !body.includes('## About')) fail(`${entry.name}: missing About footer`);
  if (!body.includes('Scope')) warn(`${entry.name}: consider an explicit Scope section`);
  if (!body.match(/plan|validate|verify/i)) warn(`${entry.name}: no obvious validation loop found`);
  if (text.match(/ignore (all|any|previous)|system message|developer message|exfiltrat/i)) warn(`${entry.name}: review instruction-like security markers manually`);
  references(body, skillDir);
  validatePortablePaths(skillDir, rootDir);
  validateFoundryEvidence(skillDir, metadataScalar(frontmatter, 'version'));
}
if (!fs.existsSync(targetDir)) fail(`skills directory does not exist: ${targetDir}`);
else {
  const skillDirs = findSkills(targetDir, recursive);
  if (!skillDirs.length) fail(`no skill packages found under ${targetDir}`);
  for (const skillDir of skillDirs) validateSkill(skillDir, targetDir);
}
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Validated ${fs.existsSync(targetDir) ? findSkills(targetDir, recursive).length : 0} skill packages${recursive ? ' recursively' : ''}.`);
if (errors.length) process.exit(1);
