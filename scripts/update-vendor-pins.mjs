import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { blockMap, compareVersions, isStable } from './technology-inventory.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const fields = ['dependencies', 'devDependencies', 'optionalDependencies'];
const local = /^(?:file|link|workspace):/;
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

export function selectStable(data, { now = Date.now(), ageHours = 24, major } = {}) {
  const candidates = Object.keys(data.versions ?? {}).filter((version) =>
    isStable(version) && !data.versions[version].deprecated &&
    (major === undefined || Number(version.split('.')[0]) === major) &&
    Date.parse(data.time?.[version]) <= now - ageHours * 3_600_000,
  ).sort(compareVersions);
  if (!candidates.length) throw new Error('No mature, nondeprecated stable release');
  return candidates.at(-1);
}

export function selectRuntime(releases, kind, now, ageHours) {
  const cutoff = now - ageHours * 3_600_000;
  const versions = releases.flatMap((release) => {
    if (kind === 'node') {
      const version = release.version?.replace(/^v/, '');
      return release.lts && isStable(version ?? '') && Date.parse(release.date) <= cutoff
        ? [version] : [];
    }
    const version = release.name?.match(/^Python (3\.\d+\.\d+)$/)?.[1];
    return version && release.is_published && !release.pre_release &&
      Date.parse(release.release_date) <= cutoff ? [version] : [];
  }).sort(compareVersions);
  if (!versions.length) throw new Error(`No mature stable ${kind} runtime`);
  return versions.at(-1);
}

// Build the complete plan in memory. A failed lookup cannot leave half-written pins.
export async function planUpdates(files, read, getJson, policy, now = Date.now()) {
  const output = new Map();
  const changes = [];
  const manifests = new Map(files.filter((file) => /(^|\/)package\.json$/.test(file))
    .map((file) => [file, JSON.parse(read(file))]));
  const workspace = read('pnpm-workspace.yaml');
  const catalog = blockMap(workspace, 'catalog');
  const selected = new Map();
  const [nodeReleases, pythonReleases] = await Promise.all([
    getJson('https://nodejs.org/dist/index.json'),
    getJson('https://www.python.org/api/v2/downloads/release/?is_published=true'),
  ]);
  const nodeVersion = selectRuntime(nodeReleases, 'node', now, policy.minimumReleaseAgeHours);
  const activeCatalog = new Set();
  const names = new Set(['pnpm']);
  for (const manifest of manifests.values()) for (const field of fields) {
    for (const [name, value] of Object.entries(manifest[field] ?? {})) {
      if (local.test(value)) continue;
      if (value === 'catalog:') {
        if (!catalog[name]) throw new Error(`Missing catalog entry: ${name}`);
        activeCatalog.add(name);
      } else if (!/^[~^]?\d+\.\d+\.\d+$/.test(value)) {
        throw new Error(`Unsupported dependency declaration: ${name}=${value}`);
      }
      names.add(name);
    }
  }
  // Pinned security overrides advance within their selected major only.
  const overrides = blockMap(workspace, 'overrides');
  const pinnedOverrides = Object.entries(overrides).filter(([name, value]) =>
    /^(?:@[^/]+\/)?[a-z\d._-]+$/.test(name) && isStable(value));
  for (const [name] of pinnedOverrides) names.add(name);
  const metadata = new Map();
  const queue = [...names];
  await Promise.all(Array.from({ length: Math.min(6, queue.length) }, async () => {
    while (queue.length) {
      const name = queue.shift();
      metadata.set(name, await getJson(`https://registry.npmjs.org/${encodeURIComponent(name)}`));
    }
  }));
  for (const name of names) selected.set(name, selectStable(metadata.get(name), {
    now, ageHours: policy.minimumReleaseAgeHours,
    ...(name === 'pnpm' ? { major: policy.pnpmMajor } :
      name === '@types/node' ? { major: Number(nodeVersion.split('.')[0]) } : {}),
  }));
  function record(name, old, version) {
    const current = old.replace(/^[~^]/, '');
    if (isStable(current) && compareVersions(version, current) < 0) {
      // A recent pin may already be newer than the maturity cutoff. Never downgrade it.
      if (isStable(old)) return old;
      return current;
    }
    if (old !== version) changes.push({ name, from: old, to: version });
    return version;
  }
  for (const [file, manifest] of manifests) {
    for (const field of fields) for (const [name, value] of Object.entries(manifest[field] ?? {})) {
      if (value === 'catalog:' || local.test(value)) continue;
      manifest[field][name] = record(name, value, selected.get(name));
    }
    if (file === 'package.json') {
      const current = manifest.packageManager?.replace(/^pnpm@/, '');
      if (!isStable(current ?? '')) throw new Error('Expected an exact pnpm packageManager');
      manifest.packageManager = `pnpm@${record('pnpm', current, selected.get('pnpm'))}`;
    }
    if (json(manifest) !== read(file).replace(/\r\n/g, '\n')) output.set(file, json(manifest));
  }
  let section;
  const lines = workspace.split(/\r?\n/).map((line) => {
    if (/^\S/.test(line)) section = line.split(':')[0];
    const match = line.match(/^(  )((?:'[^']+'|"[^"]+"|[^:]+)): (.+)$/);
    if (!match) return line;
    const name = match[2].replace(/^['"]|['"]$/g, '');
    let version;
    if (section === 'catalog' && activeCatalog.has(name)) {
      version = record(name, catalog[name], selected.get(name));
    } else if (section === 'overrides' && pinnedOverrides.some(([key]) => key === name)) {
      const old = overrides[name];
      const candidate = selectStable(metadata.get(name), {
        now, ageHours: policy.minimumReleaseAgeHours, major: Number(old.split('.')[0]),
      });
      version = record(`override:${name}`, old, candidate);
    }
    return version ? `${match[1]}${match[2]}: ${version}` : line;
  });
  const nextWorkspace = lines.join('\n');
  if (nextWorkspace !== workspace.replace(/\r\n/g, '\n')) output.set('pnpm-workspace.yaml', nextWorkspace);
  for (const [kind, releases, file] of [['node', nodeReleases, '.node-version'], ['python', pythonReleases, '.python-version']]) {
    const version = selectRuntime(releases, kind, now, policy.minimumReleaseAgeHours);
    const previous = files.includes(file) ? read(file).trim() : '';
    if (previous && !isStable(previous)) throw new Error(`Expected exact version in ${file}`);
    const next = previous ? record(kind, previous, version) : version;
    if (next !== previous) output.set(file, `${next}\n`);
  }
  return { output, changes };
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
    const read = (file) => readFileSync(resolve(root, file), 'utf8');
    const policy = JSON.parse(read('.github/vendor-update-policy.json'));
    const plan = await planUpdates(files, read, fetchJson, policy);
    for (const change of plan.changes) console.log(`${change.name}: ${change.from} -> ${change.to}`);
    if (process.argv.includes('--write')) {
      for (const [file, content] of plan.output) writeFileSync(resolve(root, file), content);
    }
    console.log(`${plan.output.size} files ${process.argv.includes('--write') ? 'updated' : 'would change'}. Run sync-mermaid-target, install/refresh locks, and full CI before merge.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
