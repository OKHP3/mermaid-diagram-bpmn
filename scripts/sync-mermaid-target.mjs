import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPackage = JSON.parse(fs.readFileSync(path.join(root, 'app/package.json'), 'utf8'));
const version = appPackage.dependencies?.mermaid ?? appPackage.devDependencies?.mermaid;
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
  throw new Error(`Expected an exact stable Mermaid pin in app/package.json; got ${version}`);
}

const files = [
  'app/src/lib/bpmn-plugin.ts',
  'app/public/browser-cdn-example.html',
  'app/e2e/browser-cdn.spec.ts',
  'app/src/pages/PluginInstallation.tsx',
  'scripts/check-browser-cdn.mjs',
  'scripts/check-release-gates.mjs',
  'README.md',
  'docs/mermaid-compatibility.md',
  'docs/release-gates.md',
  'app/docs/competitive-landscape.md',
  'lib/bpmn-plugin/README.md',
];
for (const relativePath of files) {
  const absolutePath = path.join(root, relativePath);
  let text = fs.readFileSync(absolutePath, 'utf8');
  text = text.replace(/mermaid@(\d+\.\d+\.\d+)/g, `mermaid@${version}`);
  text = text.replace(/MERMAID_VERSION_TARGET = '(\d+\.\d+\.\d+)'/, `MERMAID_VERSION_TARGET = '${version}'`);
  text = text.replace(/Mermaid (\d+\.\d+\.\d+)/g, `Mermaid ${version}`);
  text = text.replace(/at (\d+\.\d+\.\d+) with \${mermaidFindings.length}/g, `at ${version} with \${mermaidFindings.length}`);
  fs.writeFileSync(absolutePath, text);
}

for (const relativePath of ['fixtures/plugin-smoke/package.json', 'lib/bpmn-plugin/package.json']) {
  const absolutePath = path.join(root, relativePath);
  const manifest = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  if (relativePath.startsWith('fixtures/')) {
    const field = manifest.dependencies?.mermaid !== undefined ? 'dependencies' : 'devDependencies';
    manifest[field].mermaid = version;
  }
  else manifest.peerDependencies.mermaid = version;
  fs.writeFileSync(absolutePath, `${JSON.stringify(manifest, null, 2)}\n`);
}

console.log(`Synchronized Mermaid ${version} across source, CDN, fixture, and current compatibility docs.`);
