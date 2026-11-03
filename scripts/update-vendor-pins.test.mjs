import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectStable, selectRuntime, planUpdates } from './update-vendor-pins.mjs';

const now = Date.parse('2026-11-03T00:00:00Z');
const old = '2026-10-01T00:00:00Z';
const metadata = (versions) => ({
  versions: Object.fromEntries(versions.map((v) => [v, {}])),
  time: Object.fromEntries(versions.map((v) => [v, old])),
});
test('excludes prereleases, deprecated, undated, future, and immature releases', () => {
  const data = metadata(['1.2.3', '2.0.0-beta.1', '3.0.0', '4.0.0', '5.0.0', '6.0.0']);
  data.versions['3.0.0'].deprecated = 'retired';
  delete data.time['4.0.0'];
  data.time['5.0.0'] = '2026-11-04T00:00:00Z';
  data.time['6.0.0'] = '2026-11-02T23:00:00Z';
  assert.equal(selectStable(data, { now }), '1.2.3');
  assert.throws(() => selectStable(metadata(['2.0.0-rc.1']), { now }), /No mature/);
});
test('uses semantic ordering and explicit supported-major exceptions', () => {
  const data = metadata(['11.9.0', '11.28.10', '12.17.0']);
  assert.equal(selectStable(data, { now, major: 11 }), '11.28.10');
  assert.equal(selectStable(data, { now }), '12.17.0');
});
test('runtime selection follows stable LTS and published Python releases', () => {
  assert.equal(selectRuntime([
    { version: 'v24.22.2', date: old, lts: 'Krypton' },
    { version: 'v26.13.0', date: old, lts: 'Lithium' },
    { version: 'v27.0.0-alpha.0', date: old, lts: false },
    { version: 'v28.0.0', date: old, lts: false },
  ], 'node', now, 24), '26.13.0');
  assert.equal(selectRuntime([
    { name: 'Python 3.15.2', release_date: old, is_published: true, pre_release: false },
    { name: 'Python 3.16.0a1', release_date: old, is_published: true, pre_release: true },
    { name: 'Python 3.16.0', release_date: old, is_published: false, pre_release: false },
  ], 'python', now, 24), '3.15.2');
});

function fixture() {
  const files = {
    'package.json': JSON.stringify({ packageManager: 'pnpm@10.26.1', devDependencies: { typescript: '~7.0.2' } }),
    'app/package.json': JSON.stringify({ devDependencies: { mermaid: '11.17.2', vite: 'catalog:', '@types/node': 'catalog:' } }),
    'fixtures/plugin-smoke/package.json': JSON.stringify({ dependencies: { mermaid: '11.17.2', local: 'file:./plugin.tgz' } }),
    'pnpm-workspace.yaml': "catalog:\n  vite: ^8.3.4\n  '@types/node': ^26.6.5\n  unused: ^1.0.0\noverrides:\n  dompurify: 3.4.16\n",
  };
  const lookups = [];
  const get = async (url) => {
    lookups.push(url);
    if (url.includes('nodejs.org')) return [{ version: 'v26.13.0', date: old, lts: 'Lithium' }];
    if (url.includes('python.org')) return [{ name: 'Python 3.15.2', release_date: old, is_published: true, pre_release: false }];
    const name = decodeURIComponent(url.split('/').at(-1));
    const versions = { pnpm: ['11.28.10', '12.17.0'], typescript: ['7.0.2'], mermaid: ['12.2.0'], vite: ['8.3.5'], '@types/node': ['26.6.6', '27.0.0'], dompurify: ['3.4.17', '4.0.0'] };
    if (!versions[name]) throw new Error(`Unexpected lookup: ${name}`);
    return metadata(versions[name]);
  };
  return { files, lookups, get };
}
const policy = { minimumReleaseAgeHours: 24, pnpmMajor: 11 };
test('coordinates workspace and standalone pins without touching unused entries or local artifacts', async () => {
  const f = fixture();
  const plan = await planUpdates(Object.keys(f.files), (p) => f.files[p], f.get, policy, now);
  assert.equal(JSON.parse(plan.output.get('app/package.json')).devDependencies.mermaid, '12.2.0');
  assert.equal(JSON.parse(plan.output.get('fixtures/plugin-smoke/package.json')).dependencies.mermaid, '12.2.0');
  assert.equal(JSON.parse(plan.output.get('fixtures/plugin-smoke/package.json')).dependencies.local, 'file:./plugin.tgz');
  assert.match(plan.output.get('pnpm-workspace.yaml'), /vite: 8\.3\.5/);
  assert.match(plan.output.get('pnpm-workspace.yaml'), /unused: \^1\.0\.0/);
  assert.match(plan.output.get('pnpm-workspace.yaml'), /dompurify: 3\.4\.17/);
  assert.match(plan.output.get('pnpm-workspace.yaml'), /'@types\/node': 26\.6\.6/);
  assert.equal(JSON.parse(plan.output.get('package.json')).packageManager, 'pnpm@11.28.10');
  assert.equal(plan.output.get('.node-version'), '26.13.0\n');
  assert.equal(plan.output.get('.python-version'), '3.15.2\n');
  assert.ok(!f.lookups.some((url) => url.includes('unused') || url.includes('plugin.tgz')));
});
test('a failed registry request rejects the plan before any file writes', async () => {
  const f = fixture();
  const before = structuredClone(f.files);
  await assert.rejects(planUpdates(Object.keys(f.files), (p) => f.files[p], async (url) => {
    if (url.includes('mermaid')) throw new Error('registry unavailable');
    return f.get(url);
  }, policy, now), /registry unavailable/);
  assert.deepEqual(f.files, before);
});
test('does not downgrade a newer exact pin inside the maturity window', async () => {
  const f = fixture();
  f.files['app/package.json'] = JSON.stringify({ devDependencies: { mermaid: '12.3.0' } });
  const plan = await planUpdates(Object.keys(f.files), (p) => f.files[p], f.get, policy, now);
  const result = JSON.parse(plan.output.get('app/package.json') ?? f.files['app/package.json']);
  assert.equal(result.devDependencies.mermaid, '12.3.0');
});
