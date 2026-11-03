import { copyFileSync } from 'node:fs';

const source = new URL('../lib/bpmn-plugin/index.d.ts', import.meta.url);
for (const name of ['index.d.ts', 'index.d.cts']) {
  copyFileSync(source, new URL(`../lib/bpmn-plugin/dist/${name}`, import.meta.url));
}
