#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readVitestTestCount } from './check-test-count.mjs';
import { writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';

function writeReport(report) {
  const path = join(tmpdir(), `bpmn-vitest-report-${randomBytes(6).toString('hex')}.json`);
  writeFileSync(path, JSON.stringify(report));
  return path;
}

test('reads the total and failures from a Vitest JSON result', () => {
  const result = readVitestTestCount(writeReport({
    numTotalTests: 839,
    numPassedTests: 839,
    numFailedTests: 0,
    numTotalTestSuites: 46,
  }));
  assert.deepEqual(result, { total: 839, failed: 0, suites: 46 });
});

test('treats a missing total as an invalid result instead of passing silently', () => {
  assert.throws(
    () => readVitestTestCount(writeReport({ numPassedTests: 839 })),
    /no integer numTotalTests/,
  );
});

test('fails with an actionable message when the canonical count is stale', () => {
  const reportPath = writeReport({ numTotalTests: 839, numFailedTests: 0 });
  const canonPath = join(tmpdir(), `bpmn-test-canon-${randomBytes(6).toString('hex')}.json`);
  const canon = JSON.parse(readFileSync(new URL('./content-canon.json', import.meta.url), 'utf8'));
  writeFileSync(canonPath, JSON.stringify({ ...canon, testCount: 838 }));

  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./check-test-count.mjs', import.meta.url))], {
    encoding: 'utf8',
    env: {
      ...process.env,
      CONTENT_CANON_OVERRIDE: canonPath,
      TEST_COUNT_RESULT_FILE: reportPath,
    },
  });

  assert.equal(result.status, 1);
  assert.match(
    `${result.stdout}${result.stderr}`,
    /Published test count is stale.*838.*839/s,
  );
  assert.match(
    `${result.stdout}${result.stderr}`,
    /Update scripts\/content-canon\.json/,
  );
});