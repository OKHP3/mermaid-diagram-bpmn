#!/usr/bin/env node
/**
 * Verify the exact native-ESM CDN contract used by app/public/browser-cdn-example.html.
 * This deliberately checks URLs, version pairing, and the published plugin export.
 */
import fs from 'node:fs/promises';
import process from 'node:process';

const html = await fs.readFile(new URL('../app/public/browser-cdn-example.html', import.meta.url), 'utf8');
const urls = [...html.matchAll(/https:\/\/cdn\.jsdelivr\.net\/npm\/[^"' ]+/g)].map(([url]) => url);
const expected = [
  'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/+esm',
  'https://cdn.jsdelivr.net/npm/@okhp3/mermaid-diagram-bpmn@0.1.1/dist/index.mjs',
];
const failures = [];
for (const url of expected) {
  if (!urls.includes(url)) failures.push(`missing canonical URL: ${url}`);
  const response = await fetch(url, { method: 'HEAD' });
  if (!response.ok) failures.push(`${response.status} ${response.statusText}: ${url}`);
}
if (!html.includes('registerExternalDiagrams') || !html.includes('securityLevel: "strict"')) {
  failures.push('standalone example must register the plugin with strict security');
}
if (failures.length) {
  console.error('[check:browser-cdn] FAIL');
  failures.forEach((failure) => console.error(`  ${failure}`));
  process.exit(1);
}
console.log('[check:browser-cdn] OK — canonical Mermaid/plugin CDN assets return HTTP 2xx');