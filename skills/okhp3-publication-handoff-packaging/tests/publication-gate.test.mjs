import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPublicationBundle } from '../scripts/build-publication-bundle.mjs';

test('publication packaging requires explicit validation readiness and never invents approval', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bp-skill-bundle-'));
  try {
    for (const file of ['pir.yaml', 'pns.yaml', 'bpmn-beta.mmd', 'sop.md']) {
      writeFileSync(join(dir, file), 'Synthetic gate fixture\n');
    }
    for (const report of ['', 'composite_score: 100\n', 'ready_for_publication: false\n', '# ready_for_publication: true\n', 'note: ready_for_publication: true\n']) {
      writeFileSync(join(dir, 'validation-report.yaml'), report);
      assert.equal(buildPublicationBundle(dir).valid, false);
    }
    writeFileSync(join(dir, 'validation-report.yaml'), 'ready_for_publication: true\n');
    const result = buildPublicationBundle(dir);
    assert.equal(result.valid, true);
    assert.ok(result.approvals.approvals.every(approval => approval.status === 'pending'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
