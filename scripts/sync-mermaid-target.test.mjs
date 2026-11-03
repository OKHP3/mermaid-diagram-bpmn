import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { synchronizationPlan } from './sync-mermaid-target.mjs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
function candidateRead(file) {
  if (file === 'app/package.json') {
    const manifest = JSON.parse(read(file));
    manifest.devDependencies.mermaid = '14.2.0';
    return JSON.stringify(manifest);
  }
  return read(file);
}
test('coordinates future major pins and keeps historical evidence untouched', () => {
  const plan = synchronizationPlan(candidateRead);
  assert.match(plan.get('app/src/lib/bpmn-plugin.ts'), /MERMAID_VERSION_TARGET = '14\.2\.0'/);
  assert.match(plan.get('app/public/browser-cdn-example.html'), /mermaid@14\.2\.0/);
  assert.equal(JSON.parse(plan.get('fixtures/plugin-smoke/package.json')).dependencies.mermaid, '14.2.0');
  assert.equal(JSON.parse(plan.get('lib/bpmn-plugin/package.json')).peerDependencies.mermaid, '14.2.0');
  for (const file of ['docs/mermaid-compatibility.md', 'app/docs/competitive-landscape.md']) {
    assert.match(plan.get(file), /11\.4\.1/);
    const oldHistorical = read(file).split('\n').filter((line) => line.includes('11.4.1'));
    assert.deepEqual(plan.get(file).split('\n').filter((line) => line.includes('11.4.1')), oldHistorical);
  }
});
test('rejects ranges and prereleases rather than inventing a pin', () => {
  for (const version of ['^12.2.0', '13.0.0-beta.1']) {
    assert.throws(() => synchronizationPlan((file) => file === 'app/package.json'
      ? JSON.stringify({ devDependencies: { mermaid: version } }) : read(file)), /exact stable/);
  }
});
test('detects a changed synchronization target rather than silently leaving drift', () => {
  assert.throws(() => synchronizationPlan((file) => file === 'app/src/lib/bpmn-plugin.ts'
    ? read(file).replace('MERMAID_VERSION_TARGET =', 'CHANGED_TARGET =') : candidateRead(file)), /Synchronization contract changed/);
});
