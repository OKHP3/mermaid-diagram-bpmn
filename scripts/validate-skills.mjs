#!/usr/bin/env node
/**
 * validate-skills.mjs
 * Validates all skill packages in skills/ against 12 checks per skill,
 * plus pipeline contract integrity across the three-skill BP suite.
 *
 * Usage: node scripts/validate-skills.mjs
 * Exit code: 0 = all pass, 1 = one or more failures
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const skillsDir = join(repoRoot, 'skills');

// ─── Employer name firewall (do not embed literal string) ─────────────────────
const FORBIDDEN_EMPLOYER = ['B','u','i','l','d','e','r','s',' ','F','i','r','s','t',' ','S','o','u','r','c','e'].join('');

// ─── UI/DOM import patterns that must not appear in scripts ───────────────────
const REACT_DOM_PATTERNS = [
  "from 'react'", 'from "react"',
  "from 'react-dom'", 'from "react-dom"',
  "require('react')", 'require("react")',
  'document.', 'window.addEventListener', 'HTMLElement',
];

// ─── Overclaim phrases that must not appear AFFIRMATIVELY in any SKILL.md ────
// Phrases in denial context ("do not claim X", "never assert X") are allowed.
const OVERCLAIM_PHRASES = [
  'bpmn-beta is native mermaid',
  'full bpmn 2.0 conformance',
  'bpmn 2.0 xml compatible',
  'bpmn 2.0 execution conformance',
  'bpmn process engine',
];
const NEGATION_WORDS = ['not', 'never', 'do not', 'must not', 'cannot', 'should not', 'no ', 'excludes', 'avoid', 'claim'];

function isNegationContext(content, phraseIndex, windowSize = 60) {
  const snippet = content.slice(Math.max(0, phraseIndex - windowSize), phraseIndex).toLowerCase();
  return NEGATION_WORDS.some(neg => snippet.includes(neg));
}

let failCount = 0;
let passCount = 0;
const results = [];

function pass(check) {
  passCount++;
  results.push({ status: 'PASS', check });
}

function fail(check, message) {
  failCount++;
  results.push({ status: 'FAIL', check, message });
}

// ─── Parse YAML frontmatter (flat key:value including indented lines) ─────────
function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !key.startsWith('#') && !key.startsWith('-')) fm[key] = val;
  }
  return fm;
}

// ─── Extract file references from SKILL.md body ───────────────────────────────
function extractFileRefs(content) {
  const refs = new Set();
  const re = /`((?:references|scripts|assets|context)\/[^\s`]+\.[a-zA-Z0-9]+)`/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    refs.add(m[1]);
  }
  return [...refs];
}

// ─── Recursively find JSON files ──────────────────────────────────────────────
function findJsonFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...findJsonFiles(full));
    else if (entry.name.endsWith('.json')) results.push(full);
  }
  return results;
}

// ─── Run 11 per-skill checks ──────────────────────────────────────────────────
function validateSkill(skillDir) {
  const skillName = basename(skillDir);
  const p = `[${skillName}]`;

  // C1: SKILL.md exists
  const skillMdPath = join(skillDir, 'SKILL.md');
  if (!existsSync(skillMdPath)) {
    fail(`${p} C1: SKILL.md exists`, 'SKILL.md not found');
    return;
  }
  pass(`${p} C1: SKILL.md exists`);

  const content = readFileSync(skillMdPath, 'utf8');

  // C2: Valid YAML frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    fail(`${p} C2: valid YAML frontmatter`, 'No --- delimited frontmatter block found');
    return;
  }
  pass(`${p} C2: valid YAML frontmatter`);
  const fm = parseFrontmatter(content) || {};

  // C3: name matches directory
  if ((fm.name || '') !== skillName) {
    fail(`${p} C3: name matches directory`, `name="${fm.name}" but dir="${skillName}"`);
  } else {
    pass(`${p} C3: name matches directory`);
  }

  // C4: description length 50–1024 chars
  const desc = fm.description || '';
  if (desc.length < 50) {
    fail(`${p} C4: description ≥50 chars`, `description is ${desc.length} chars`);
  } else if (desc.length > 1024) {
    fail(`${p} C4: description ≤1024 chars`, `description is ${desc.length} chars`);
  } else {
    pass(`${p} C4: description length (${desc.length} chars)`);
  }

  // C5: produces field present
  if (!(fm.produces || '')) {
    fail(`${p} C5: produces field present`, 'metadata.produces missing or empty');
  } else {
    pass(`${p} C5: produces="${fm.produces}"`);
  }

  // C5b: bp_skill_version present (required for BP-SKILL v0.2 skills)
  if (!(fm.bp_skill_version || '')) {
    fail(`${p} C5b: bp_skill_version present`, 'metadata.bp_skill_version missing or empty');
  } else {
    pass(`${p} C5b: bp_skill_version="${fm.bp_skill_version}"`);
  }

  // C6: consumes present if depends_on is set (treat [], "", and absent as "not set")
  const dependsOn = (fm.depends_on || '').replace(/^\[|\]$/g, '').trim();
  if (dependsOn && !(fm.consumes || '')) {
    fail(`${p} C6: consumes field present`, `has depends_on="${fm.depends_on}" but no consumes`);
  } else {
    pass(`${p} C6: consumes/depends_on consistent`);
  }

  // C7: All referenced files exist
  const refs = extractFileRefs(content);
  let allExist = true;
  for (const ref of refs) {
    if (!existsSync(join(skillDir, ref))) {
      fail(`${p} C7: referenced file exists`, `Missing: ${ref}`);
      allExist = false;
    }
  }
  if (allExist) pass(`${p} C7: all ${refs.length} referenced file(s) exist`);

  // C8: JSON assets parse cleanly
  let jsonOk = true;
  for (const jsonPath of findJsonFiles(join(skillDir, 'assets'))) {
    try {
      JSON.parse(readFileSync(jsonPath, 'utf8'));
    } catch (e) {
      fail(`${p} C8: JSON asset valid`, `${basename(jsonPath)}: ${e.message}`);
      jsonOk = false;
    }
  }
  if (jsonOk) pass(`${p} C8: JSON assets valid`);

  // C9: Scripts do not import React/DOM
  const scriptsDir = join(skillDir, 'scripts');
  let noUI = true;
  if (existsSync(scriptsDir)) {
    for (const file of readdirSync(scriptsDir).filter(f => f.endsWith('.mjs'))) {
      const src = readFileSync(join(scriptsDir, file), 'utf8');
      for (const pat of REACT_DOM_PATTERNS) {
        if (src.includes(pat)) {
          fail(`${p} C9: no React/DOM in scripts`, `${file} uses "${pat}"`);
          noUI = false;
        }
      }
    }
  }
  if (noUI) pass(`${p} C9: no React/DOM imports in scripts`);

  // C9b: Run validate script against canonical fixtures (executable-on-fixtures check)
  const validateScript = existsSync(scriptsDir)
    ? readdirSync(scriptsDir).find(f => f.startsWith('validate-') && f.endsWith('.mjs'))
    : null;
  const examplesDir = join(skillDir, 'assets', 'canonical-examples');
  if (validateScript && existsSync(examplesDir)) {
    const fixtures = readdirSync(examplesDir).filter(f => f.endsWith('.mmd'));
    if (fixtures.length > 0) {
      const scriptPath = join(scriptsDir, validateScript);
      const fixturePath = join(examplesDir, fixtures[0]);
      const proc = spawnSync(process.execPath, [scriptPath, fixturePath], {
        encoding: 'utf8',
        timeout: 10000,
      });
      if (proc.status !== 0) {
        fail(
          `${p} C9b: validate script passes on fixture`,
          `${validateScript} exited ${proc.status} on ${fixtures[0]}:\n${(proc.stdout || '') + (proc.stderr || '')}`
        );
      } else {
        pass(`${p} C9b: ${validateScript} passes on ${fixtures[0]}`);
      }
    } else {
      pass(`${p} C9b: no fixtures to test against (skipped)`);
    }
  } else {
    pass(`${p} C9b: no validate script to execute (skipped)`);
  }

  // C10: Employer name firewall
  if (content.includes(FORBIDDEN_EMPLOYER)) {
    fail(`${p} C10: employer name firewall`, 'SKILL.md contains forbidden employer name');
  } else {
    pass(`${p} C10: employer name firewall`);
  }

  // C11: No affirmative overclaims (skip phrases that appear in negation/denial context)
  const lower = content.toLowerCase();
  let noOverclaims = true;
  for (const phrase of OVERCLAIM_PHRASES) {
    let idx = lower.indexOf(phrase);
    while (idx !== -1) {
      if (!isNegationContext(lower, idx)) {
        fail(`${p} C11: no overclaims`, `Affirmative use of: "${phrase}"`);
        noOverclaims = false;
        break;
      }
      idx = lower.indexOf(phrase, idx + phrase.length);
    }
  }
  if (noOverclaims) pass(`${p} C11: no overclaims`);
}

// ─── C13: Context file v0.2 schema validation ─────────────────────────────────
function validateContextFiles() {
  const p = '[context]';
  const contextDir = join(repoRoot, 'context');
  if (!existsSync(contextDir)) {
    fail(`${p} C13: context/ directory exists`, 'context/ directory not found');
    return;
  }

  const contextFiles = readdirSync(contextDir).filter(f => f.endsWith('.md'));
  if (contextFiles.length === 0) {
    fail(`${p} C13: context/ has files`, 'No .md files in context/');
    return;
  }

  // document_type and schema_version must be non-empty
  const V2_NON_EMPTY = ['document_type', 'schema_version'];
  // owner, last_reviewed, applicability must be present (key exists); empty string is ok (template placeholder)
  const V2_PRESENT = ['owner', 'last_reviewed', 'applicability'];
  let allOk = true;

  for (const file of contextFiles) {
    const filePath = join(contextDir, file);
    const content = readFileSync(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    if (!fm) {
      fail(`${p} C13: ${file} has frontmatter`, 'No --- delimited frontmatter block found');
      allOk = false;
      continue;
    }

    for (const field of V2_NON_EMPTY) {
      if (!fm[field]) {
        fail(`${p} C13: ${file} v0.2 schema`, `Missing or empty required field: ${field}`);
        allOk = false;
      }
    }

    for (const field of V2_PRESENT) {
      if (fm[field] === undefined) {
        fail(`${p} C13: ${file} v0.2 schema`, `Missing required field (may be empty): ${field}`);
        allOk = false;
      }
    }

    if (fm.schema_version && fm.schema_version !== '0.2.0') {
      fail(`${p} C13: ${file} schema_version`, `Expected "0.2.0", got "${fm.schema_version}"`);
      allOk = false;
    }

    if (content.includes('bp_skill_variable_type:')) {
      fail(`${p} C13: ${file} no v0.1 keys`, 'Contains deprecated key bp_skill_variable_type');
      allOk = false;
    }
  }

  if (allOk) pass(`${p} C13: ${contextFiles.length} context file(s) pass v0.2 schema check`);
}

// ─── C12: Pipeline contract integrity ─────────────────────────────────────────
function validatePipelineContract() {
  const p = '[pipeline]';
  const paths = {
    discovery: join(skillsDir, 'okhp3-process-discovery', 'SKILL.md'),
    narrative: join(skillsDir, 'okhp3-process-narrative', 'SKILL.md'),
    bpmn: join(skillsDir, 'okhp3-bpmn-for-mermaid', 'SKILL.md'),
  };

  for (const [key, path] of Object.entries(paths)) {
    if (!existsSync(path)) {
      fail(`${p} C12: pipeline contract`, `Missing skill SKILL.md: ${key}`);
      return;
    }
  }

  const disc = parseFrontmatter(readFileSync(paths.discovery, 'utf8')) || {};
  const narr = parseFrontmatter(readFileSync(paths.narrative, 'utf8')) || {};
  const bpmn = parseFrontmatter(readFileSync(paths.bpmn, 'utf8')) || {};

  let ok = true;

  const checks = [
    [(disc.produces || '').includes('pir.yaml'),           'discovery produces pir.yaml',           `produces="${disc.produces}"`],
    [(narr.consumes || '').includes('pir.yaml'),           'narrative consumes pir.yaml',            `consumes="${narr.consumes}"`],
    [(narr.depends_on || '').includes('okhp3-process-discovery'), 'narrative depends_on discovery', `depends_on="${narr.depends_on}"`],
    [(narr.produces || '').includes('pns.yaml'),           'narrative produces pns.yaml',            `produces="${narr.produces}"`],
    [(bpmn.consumes || '').includes('pns.yaml'),           'bpmn-for-mermaid consumes pns.yaml',     `consumes="${bpmn.consumes}"`],
    [(bpmn.depends_on || '').includes('okhp3-process-narrative'), 'bpmn-for-mermaid depends_on narrative', `depends_on="${bpmn.depends_on}"`],
    [(bpmn.produces || '').includes('bpmn-beta.mmd'),      'bpmn-for-mermaid produces bpmn-beta.mmd',`produces="${bpmn.produces}"`],
  ];

  for (const [cond, label, detail] of checks) {
    if (!cond) { fail(`${p} C12: ${label}`, detail); ok = false; }
  }
  if (ok) pass(`${p} C12: pipeline contract PIR → PNS → bpmn-beta.mmd`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => join(skillsDir, e.name));

console.log(`Validating ${skillDirs.length} skill(s) in skills/ ...\n`);

for (const dir of skillDirs) {
  validateSkill(dir);
}
validateContextFiles();
validatePipelineContract();

console.log('\n─── Results ─────────────────────────────────────────────────────────');
for (const r of results) {
  const icon = r.status === 'PASS' ? '✔' : '✖';
  console.log(`${icon} ${r.check}${r.message ? ` — ${r.message}` : ''}`);
}

const total = passCount + failCount;
console.log(`\n${total} check(s): ${passCount} passed, ${failCount} failed`);
if (failCount > 0) {
  console.log(`\n✖ skill:validate FAILED — fix the issues above before publishing.`);
} else {
  console.log(`\n✔ skill:validate PASSED — all skills are ready.`);
}
process.exit(failCount > 0 ? 1 : 0);
