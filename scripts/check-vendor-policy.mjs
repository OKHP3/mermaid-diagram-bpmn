import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectInventory, isStable } from './technology-inventory.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const inventory = collectInventory(files, read);
const failures = [];
for (const declaration of inventory.declarations) {
  if (['local artifact', 'peer contract'].includes(declaration.kind)) continue;
  if (!isStable(declaration.effective)) failures.push(`${declaration.path}: ${declaration.name} must have an exact stable pin`);
}
for (const [name, versions] of Object.entries(inventory.locked)) {
  if (versions.some((version) => !isStable(version))) failures.push(`Prerelease in workspace lockfile: ${name} ${versions.join(', ')}`);
}
for (const file of ['.node-version', '.python-version']) {
  if (!isStable(read(file).trim())) failures.push(`Expected exact stable runtime in ${file}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('Vendor policy: exact direct pins and stable locked packages verified.');
