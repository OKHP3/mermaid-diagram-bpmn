import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
export const targets = [
  ['app/src/lib/bpmn-plugin.ts', /(?<=MERMAID_VERSION_TARGET = ')\d+\.\d+\.\d+(?=')/g, 1],
  ['app/public/browser-cdn-example.html', /(?<=mermaid@)\d+\.\d+\.\d+/g, 2],
  ['app/e2e/browser-cdn.spec.ts', /(?<=mermaid@)\d+\.\d+\.\d+/g, 1],
  ['app/src/pages/PluginInstallation.tsx', /(?<=mermaid@)\d+\.\d+\.\d+/g, 3],
  ['app/src/__tests__/a11y.test.tsx', /(?<=MERMAID_VERSION_TARGET: ')\d+\.\d+\.\d+(?=')/g, 1],
  ['scripts/check-browser-cdn.mjs', /(?<=mermaid@)\d+\.\d+\.\d+/g, 1],
  ['scripts/check-release-gates.mjs', /(?<=Mermaid remains pinned at )\d+\.\d+\.\d+/g, 1],
  ['README.md', /(?<=browser-tested against `mermaid@)\d+\.\d+\.\d+/g, 1],
  ['AGENTS.md', /(?<=which runs real `mermaid@)\d+\.\d+\.\d+/g, 1],
  ['docs/version-checklist.md', /(?<=mermaid@)\d+\.\d+\.\d+/g, 2],
  ['docs/mermaid-compatibility.md', /(?<=Current adapter target: `mermaid@)\d+\.\d+\.\d+/g, 1],
  ['docs/mermaid-compatibility.md', /(?<=Current CDN target: `mermaid@)\d+\.\d+\.\d+/g, 1],
  ['app/docs/competitive-landscape.md', /(?<=declared and locked Mermaid target is )\d+\.\d+\.\d+/g, 1],
  ['lib/bpmn-plugin/README.md', /(?<=mermaid@)\d+\.\d+\.\d+/g, 4],
  ['lib/bpmn-plugin/README.md', /(?<=console\.log\(MERMAID_VERSION_TARGET\); \/\/ ')\d+\.\d+\.\d+(?=')/g, 1],
];

export function synchronizationPlan(read) {
  const app = JSON.parse(read('app/package.json'));
  const version = app.dependencies?.mermaid ?? app.devDependencies?.mermaid;
  if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) throw new Error(`Expected exact stable Mermaid pin, got ${version}`);
  if (!/^\d+\.\d+\.\d+$/.test(app.devDependencies?.['happy-dom'] ?? '')) throw new Error('Expected exact stable happy-dom fixture pin');
  const output = new Map();
  for (const [file, pattern, count] of targets) {
    const text = output.get(file) ?? read(file);
    const matches = [...text.matchAll(pattern)];
    if (matches.length !== count) throw new Error(`Synchronization contract changed: ${file}, expected ${count} matches, found ${matches.length}`);
    output.set(file, text.replace(pattern, version));
  }
  for (const file of ['fixtures/plugin-smoke/package.json', 'lib/bpmn-plugin/package.json']) {
    const manifest = JSON.parse(read(file));
    if (file.startsWith('fixtures/')) {
      const field = manifest.dependencies?.mermaid !== undefined ? 'dependencies' : 'devDependencies';
      manifest[field].mermaid = version;
      manifest[field]['happy-dom'] = app.devDependencies['happy-dom'];
    } else manifest.peerDependencies.mermaid = version;
    output.set(file, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  return new Map([...output].filter(([file, content]) => content.replace(/\r\n/g, '\n') !== read(file).replace(/\r\n/g, '\n')));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const plan = synchronizationPlan((file) => readFileSync(resolve(root, file), 'utf8'));
    for (const [file, content] of plan) {
      console.log(`${process.argv.includes('--check') ? 'Drift' : 'Updated'}: ${file}`);
      if (!process.argv.includes('--check')) writeFileSync(resolve(root, file), content);
    }
    if (process.argv.includes('--check') && plan.size) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
