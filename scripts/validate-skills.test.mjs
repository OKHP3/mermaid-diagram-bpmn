#!/usr/bin/env node
/**
 * validate-skills.test.mjs
 *
 * Verifies that validate-skills.mjs and validate-agent-skills.mjs:
 *   - exit 0 for a valid SKILL.md
 *   - exit 1 and name the failing check when a defect is present
 *
 * Both scripts support env-var directory overrides added for testability:
 *   SKILLS_DIR_OVERRIDE / CONTEXT_DIR_OVERRIDE (validate-skills.mjs)
 *   AGENT_SKILLS_DIR_OVERRIDE                  (validate-agent-skills.mjs)
 *
 * Run:  node --test scripts/validate-skills.test.mjs
 *       pnpm run skill:validate:test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_SCRIPT       = resolve(__dirname, 'validate-skills.mjs');
const AGENT_SKILLS_SCRIPT = resolve(__dirname, 'validate-agent-skills.mjs');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VALID_FRONTMATTER = `---
name: my-test-skill
description: This description is long enough to meet the minimum fifty character requirement here.
produces: A validated output artifact
bp_skill_version: "0.3"
---

# My Test Skill

Body content here.
`;

const SHORT_DESC_FRONTMATTER = `---
name: my-test-skill
description: too short
produces: A validated output artifact
bp_skill_version: "0.3"
---

# My Test Skill

Body content here.
`;

const MISSING_PRODUCES_FRONTMATTER = `---
name: my-test-skill
description: This description is long enough to meet the minimum fifty character requirement here.
bp_skill_version: "0.3"
---

# My Test Skill

Body content here.
`;

const NAME_MISMATCH_FRONTMATTER = `---
name: wrong-name
description: This description is long enough to meet the minimum fifty character requirement here.
produces: A validated output artifact
bp_skill_version: "0.3"
---

# My Test Skill

Body content here.
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Create a temp skills/ dir with one skill directory containing the given SKILL.md content. */
function makeSkillsDir(skillId, skillMdContent) {
  const base     = mkdtempSync(join(tmpdir(), 'bpmn-skill-test-'));
  const skillDir = join(base, skillId);
  mkdirSync(skillDir, { recursive: true });
  writeFileSync(join(skillDir, 'SKILL.md'), skillMdContent, 'utf-8');
  return base;
}

/** Create a minimal valid context/ dir (prevents C13 failures from muddying per-skill results). */
function makeEmptyContextDir() {
  const dir = mkdtempSync(join(tmpdir(), 'bpmn-context-test-'));
  // C13 requires at least one .md file with document_type, schema_version (0.2.0),
  // and the keys owner, last_reviewed, applicability (may be empty).
  writeFileSync(join(dir, 'placeholder.md'), `---
document_type: placeholder
schema_version: "0.2.0"
owner: ""
last_reviewed: ""
applicability: ""
---

Placeholder context file for test isolation.
`, 'utf-8');
  return dir;
}

function runValidateSkills(skillsDir, contextDir) {
  const result = spawnSync(process.execPath, [SKILLS_SCRIPT], {
    encoding: 'utf-8',
    env: {
      ...process.env,
      SKILLS_DIR_OVERRIDE:  skillsDir,
      CONTEXT_DIR_OVERRIDE: contextDir,
    },
    timeout: 20_000,
  });
  return {
    exitCode: result.status ?? 1,
    output:   (result.stdout ?? '') + (result.stderr ?? ''),
  };
}

function runValidateAgentSkills(agentSkillsDir) {
  const result = spawnSync(process.execPath, [AGENT_SKILLS_SCRIPT], {
    encoding: 'utf-8',
    env: { ...process.env, AGENT_SKILLS_DIR_OVERRIDE: agentSkillsDir },
    timeout: 20_000,
  });
  return {
    exitCode: result.status ?? 1,
    output:   (result.stdout ?? '') + (result.stderr ?? ''),
  };
}

// ── validate-skills.mjs tests ─────────────────────────────────────────────────

test('validate-skills exits 0 for a valid SKILL.md', () => {
  const skillsDir  = makeSkillsDir('my-test-skill', VALID_FRONTMATTER);
  const contextDir = makeEmptyContextDir();
  const { exitCode } = runValidateSkills(skillsDir, contextDir);
  assert.equal(exitCode, 0, 'should exit 0 for a fully valid skill');
});

test('validate-skills exits 1 when description is shorter than 50 chars', () => {
  const skillsDir  = makeSkillsDir('my-test-skill', SHORT_DESC_FRONTMATTER);
  const contextDir = makeEmptyContextDir();
  const { exitCode, output } = runValidateSkills(skillsDir, contextDir);
  assert.equal(exitCode, 1, 'should exit 1 when description is too short');
  assert.ok(
    output.includes('C4') || output.toLowerCase().includes('description'),
    `failure output should mention C4 or description; got:\n${output}`,
  );
});

test('validate-skills exits 1 when produces field is missing', () => {
  const skillsDir  = makeSkillsDir('my-test-skill', MISSING_PRODUCES_FRONTMATTER);
  const contextDir = makeEmptyContextDir();
  const { exitCode, output } = runValidateSkills(skillsDir, contextDir);
  assert.equal(exitCode, 1, 'should exit 1 when produces is missing');
  assert.ok(
    output.includes('C5') || output.toLowerCase().includes('produces'),
    `failure output should mention C5 or produces; got:\n${output}`,
  );
});

test('validate-skills exits 1 when skill name does not match directory', () => {
  const skillsDir  = makeSkillsDir('my-test-skill', NAME_MISMATCH_FRONTMATTER);
  const contextDir = makeEmptyContextDir();
  const { exitCode, output } = runValidateSkills(skillsDir, contextDir);
  assert.equal(exitCode, 1, 'should exit 1 when skill name mismatches directory');
  assert.ok(
    output.includes('C3') || output.toLowerCase().includes('name'),
    `failure output should mention C3 or name; got:\n${output}`,
  );
});

// ── validate-agent-skills.mjs tests ──────────────────────────────────────────

test('validate-agent-skills exits 0 for a valid agent skill', () => {
  const dir = makeSkillsDir('my-test-skill', VALID_FRONTMATTER);
  const { exitCode } = runValidateAgentSkills(dir);
  assert.equal(exitCode, 0, 'should exit 0 for a fully valid agent skill');
});

test('validate-agent-skills exits 1 when description is shorter than 50 chars', () => {
  const dir = makeSkillsDir('my-test-skill', SHORT_DESC_FRONTMATTER);
  const { exitCode, output } = runValidateAgentSkills(dir);
  assert.equal(exitCode, 1, 'should exit 1 when agent skill description is too short');
  assert.ok(
    output.toLowerCase().includes('description'),
    `failure output should mention description; got:\n${output}`,
  );
});

// ── Folded-block description regression tests (Task #266) ─────────────────────
// Skills in .agents/skills often use YAML folded-strip form (>-) for
// multi-line descriptions. The parser must handle >, >-, >+, |, |-, |+
// and measure the joined content — not the 2-char indicator literal.

const FOLDED_STRIP_FRONTMATTER = `---
name: my-test-skill
description: >-
  Build, audit, and improve OpenAI Custom GPTs with production-grade methodology.
  Use this skill when the user asks to create, configure, test, evaluate, audit,
  improve, troubleshoot, compare, document, or package a Custom GPT or reusable
  ChatGPT workflow.
license: MIT
metadata:
  version: "1.0.0"
  author: "Test Author"
---

# My Test Skill

Body content here.
`;

const LITERAL_STRIP_FRONTMATTER = `---
name: my-test-skill
description: |-
  Build, audit, and improve OpenAI Custom GPTs with production-grade methodology.
  Use this skill when the user asks to create, configure, test, or package a
  Custom GPT or reusable ChatGPT workflow. Also use it for GPT Builder instructions.
license: MIT
metadata:
  version: "1.0.0"
  author: "Test Author"
---

# My Test Skill

Body content here.
`;

const FOLDED_KEEP_FRONTMATTER = `---
name: my-test-skill
description: >+
  Build, audit, and improve OpenAI Custom GPTs with production-grade methodology.
  Use this skill when the user asks to create, configure, test, or package a
  Custom GPT or reusable ChatGPT workflow. Also use for GPT Builder instructions.
license: MIT
metadata:
  version: "1.0.0"
  author: "Test Author"
---

# My Test Skill

Body content here.
`;

test('validate-agent-skills exits 0 for a skill with folded-strip (>-) description', () => {
  // Regression for Task #266: >- was previously parsed as the 2-char literal ">-"
  // instead of the joined multi-line content, causing a spurious description-length failure.
  const dir = makeSkillsDir('my-test-skill', FOLDED_STRIP_FRONTMATTER);
  const { exitCode, output } = runValidateAgentSkills(dir);
  assert.equal(
    exitCode, 0,
    `>- folded-strip description should pass length check; got:\n${output}`,
  );
});

test('validate-agent-skills exits 0 for a skill with literal-strip (|-) description', () => {
  const dir = makeSkillsDir('my-test-skill', LITERAL_STRIP_FRONTMATTER);
  const { exitCode, output } = runValidateAgentSkills(dir);
  assert.equal(
    exitCode, 0,
    `|- literal-strip description should pass length check; got:\n${output}`,
  );
});

test('validate-agent-skills exits 0 for a skill with folded-keep (>+) description', () => {
  const dir = makeSkillsDir('my-test-skill', FOLDED_KEEP_FRONTMATTER);
  const { exitCode, output } = runValidateAgentSkills(dir);
  assert.equal(
    exitCode, 0,
    `>+ folded-keep description should pass length check; got:\n${output}`,
  );
});

test('validate-agent-skills exits 1 when a folded-strip (>-) description is too short', () => {
  // The parser must measure the joined content length, not skip the check for folded forms.
  const shortFolded = `---
name: my-test-skill
description: >-
  Too short.
license: MIT
metadata:
  version: "1.0.0"
  author: "Test Author"
---

# My Test Skill

Body content here.
`;
  const dir = makeSkillsDir('my-test-skill', shortFolded);
  const { exitCode, output } = runValidateAgentSkills(dir);
  assert.equal(
    exitCode, 1,
    `>- description shorter than 50 chars should still fail; got:\n${output}`,
  );
  assert.ok(
    output.toLowerCase().includes('description'),
    `failure output should mention description; got:\n${output}`,
  );
});
