import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retainUnchangedManifestDate } from './release-manifest-state.mjs';

test('daily no-op runs retain the previous date while substantive changes get a new date', () => {
  const previous = { version: '12.2.0', generatedDate: '2026-11-02', evidence: ['tested'] };
  const next = { ...previous, generatedDate: '2026-11-03' };
  assert.deepEqual(retainUnchangedManifestDate(next, previous), previous);
  for (const changed of [{...next,version:'12.3.0'}, {...next,evidence:['new evidence']}]) {
    assert.deepEqual(retainUnchangedManifestDate(changed, previous), changed);
  }
  assert.deepEqual(retainUnchangedManifestDate(next, undefined), next);
});
