#!/usr/bin/env node
/**
 * Compare the published test total with a real Vitest JSON result.
 *
 * With TEST_COUNT_RESULT_FILE, this consumes a result produced by the CI unit
 * test step. Without it, the command runs Vitest itself and writes a temporary
 * JSON report, making the check useful locally as well.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CANON_PATH = process.env.CONTENT_CANON_OVERRIDE
  ?? resolve(ROOT, 'scripts/content-canon.json');
const RESULT_OVERRIDE = process.env.TEST_COUNT_RESULT_FILE;

export function readVitestTestCount(resultPath) {
  let report;
  try {
    report = JSON.parse(readFileSync(resultPath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read Vitest JSON result ${resultPath}: ${error.message}`);
  }

  if (!Number.isInteger(report.numTotalTests)) {
    throw new Error(`Vitest JSON result ${resultPath} has no integer numTotalTests`);
  }
  return {
    total: report.numTotalTests,
    failed: report.numFailedTests ?? 0,
    suites: report.numTotalTestSuites ?? null,
  };
}

function readCanonicalCount() {
  let canon;
  try {
    canon = JSON.parse(readFileSync(CANON_PATH, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read canonical test count ${CANON_PATH}: ${error.message}`);
  }
  if (!Number.isInteger(canon.testCount)) {
    throw new Error(`Canonical test count in ${CANON_PATH} is not an integer`);
  }
  return canon.testCount;
}

function getResultPath() {
  if (RESULT_OVERRIDE) return { path: RESULT_OVERRIDE, temporary: false };
  const directory = mkdtempSync(join(tmpdir(), 'bpmn-vitest-count-'));
  return { path: join(directory, 'vitest-results.json'), temporary: true, directory };
}

function runVitest(resultPath) {
  const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  try {
    execFileSync(pnpm, [
      '--filter', '@workspace/mermaid-diagram-bpmn',
      'exec', 'vitest', 'run',
      '--config', 'vitest.config.ts',
      '--reporter=json',
      `--outputFile=${resultPath}`,
    ], { cwd: ROOT, stdio: 'inherit' });
  } catch (error) {
    throw new Error(
      `Vitest did not complete successfully (${error.status ?? 'process error'}). ` +
      'Fix the failing suite before publishing a test-count claim.',
    );
  }
}

function main() {
  const expected = readCanonicalCount();
  const result = getResultPath();
  try {
    if (!RESULT_OVERRIDE) {
      console.log('[check-test-count] Running Vitest to obtain the latest test total...');
      runVitest(result.path);
    }
    const observed = readVitestTestCount(result.path);
    console.log(`[check-test-count] Observed Vitest tests: ${observed.total}`);
    console.log(`[check-test-count] Canonical published tests: ${expected}`);
    if (observed.failed > 0) {
      throw new Error(`Vitest report contains ${observed.failed} failed tests`);
    }
    if (expected !== observed.total) {
      throw new Error(
        `Published test count is stale: content-canon.json says ${expected}, ` +
        `but the latest Vitest result reports ${observed.total}. ` +
        'Update scripts/content-canon.json (including testCountUpdated) and ' +
        'the matching claim in app/docs/release-checklist.md, then rerun this check.',
      );
    }
    console.log(`[check-test-count] OK: ${observed.total} Vitest tests match the published canonical count.`);
  } finally {
    if (result.temporary) rmSync(result.directory, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`[check-test-count] FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}