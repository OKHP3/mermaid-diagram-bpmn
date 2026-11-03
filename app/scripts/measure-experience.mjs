import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Development-only laboratory measurement. No application telemetry is added.
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  if (!['--url', '--output', '--label', '--samples'].includes(args[i]) || !args[i + 1]) {
    throw new Error('Use --url <preview URL> --output <absolute JSON path> --label <label> [--samples 7].');
  }
  options[args[i].slice(2)] = args[i + 1];
}
const base = new URL(options.url);
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname) || base.protocol !== 'http:' || base.search || base.hash) {
  throw new Error('Measure a local production preview with no query or fragment. Live visits are a separate check.');
}
if (!base.pathname.endsWith('/')) throw new Error('The preview URL must end in /.');
if (!options.output || !path.isAbsolute(options.output) || !options.label) throw new Error('An absolute output path and label are required.');
const samples = Number(options.samples ?? 7);
if (!Number.isInteger(samples) || samples < 3 || samples > 30) throw new Error('Use 3 to 30 samples per route and viewport.');
const root = fileURLToPath(new URL('../../', import.meta.url));
const git = (...parts) => execFileSync('git', parts, { cwd: root, encoding: 'utf8' }).trim();
const manifest = await readFile(new URL('../dist/public/.vite/manifest.json', import.meta.url));
const rows = [];
const browser = await chromium.launch();
const report = {
  format: 'bpmn-experience-lab', version: 1, label: options.label,
  measuredAt: new Date().toISOString(), sourceCommit: git('rev-parse', 'HEAD'),
  sourceChanges: git('status', '--porcelain').split('\n').filter(Boolean),
  buildManifestSha256: createHash('sha256').update(manifest).digest('hex'),
  environment: { os: `${os.platform()} ${os.release()}`, cpu: os.cpus()[0]?.model, logicalCpus: os.cpus().length, node: process.version, chromium: browser.version(), preview: base.href },
  method: 'Fresh browser context per sample; local production preview; unthrottled CPU/network; external font requests blocked consistently. Seven samples by default. Action timings include browser automation and two animation frames. These are laboratory observations, not field Core Web Vitals, INP, human task times, or a usability study.',
  samplesPerCase: samples, rows,
};
const frame = (page) => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const clock = (page) => page.evaluate(() => performance.now());
async function observedAction(page, action, ready) {
  const start = await clock(page);
  await action();
  await ready();
  await frame(page);
  return Math.round((await clock(page) - start) * 10) / 10;
}
try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    for (const route of ['', 'intake', 'playground?example=02-gateway&view=diagram']) {
      for (let sample = 1; sample <= samples; sample++) {
        const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
        // Same font policy before/after; avoids measuring a remote font service.
        await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, request => request.abort());
        const page = await context.newPage();
        const failures = [];
        page.on('pageerror', error => failures.push(error.message));
        page.on('requestfailed', request => {
          if (new URL(request.url()).origin === base.origin) failures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
        });
        const response = await page.goto(new URL(route, base).href);
        if (!response?.ok()) throw new Error(`Preview returned ${response?.status()} for ${route}`);
        const ready = route.startsWith('playground')
          ? page.getByTestId('div-diagram-preview').locator('svg')
          : route === 'intake' ? page.getByLabel('Process name', { exact: true }) : page.locator('main h1');
        await ready.waitFor({ state: 'visible' });
        await frame(page);
        const metrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          const resources = performance.getEntriesByType('resource');
          const js = resources.filter(entry => new URL(entry.name).pathname.endsWith('.js'));
          return {
            readyMs: performance.now(), domContentLoadedMs: navigation.domContentLoadedEventEnd,
            firstContentfulPaintMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
            javascriptEncodedBytes: js.reduce((sum, entry) => sum + entry.encodedBodySize, 0),
            javascriptRequests: js.length,
          };
        });
        const actions = {};
        if (route === 'intake') {
          actions.starterMs = await observedAction(page,
            () => page.getByRole('button', { name: 'Use purchase starter' }).click(),
            () => page.getByLabel('Process name', { exact: true }).getAttribute('value'));
          actions.peopleStageMs = await observedAction(page,
            () => page.getByRole('button', { name: '02 People & steps' }).click(),
            () => page.getByLabel('Step 1', { exact: true }).waitFor({ state: 'visible' }));
          actions.editStepMs = await observedAction(page,
            () => page.getByLabel('Step 1', { exact: true }).fill('Submit a purchase request with a quote'),
            () => page.getByText('Brief saved in this browser.', { exact: true }).waitFor({ state: 'visible' }));
          actions.handoffStageMs = await observedAction(page,
            () => page.getByRole('button', { name: '03 Agent handoff' }).click(),
            () => page.getByRole('button', { name: 'Download agent handoff' }).waitFor({ state: 'visible' }));
          const download = page.waitForEvent('download');
          actions.handoffDownloadMs = await observedAction(page,
            () => page.getByRole('button', { name: 'Download agent handoff' }).click(),
            async () => { if (await (await download).failure()) throw new Error('Handoff download failed'); });
        }
        if (route.startsWith('playground')) {
          actions.sourceViewMs = await observedAction(page,
            () => page.getByRole('tab', { name: 'Source', exact: true }).click(),
            () => page.getByTestId('textarea-bpmn-source').waitFor({ state: 'visible' }));
          actions.diagramViewMs = await observedAction(page,
            () => page.getByRole('tab', { name: 'Diagram', exact: true }).click(),
            () => page.getByTestId('div-diagram-preview').locator('svg').waitFor({ state: 'visible' }));
        }
        if (failures.length) throw new Error(failures.join('\n'));
        rows.push({ viewport: `${viewport.width}x${viewport.height}`, route: route || '/', sample, ...metrics, ...actions });
        await context.close();
      }
    }
  }
  report.summary = [];
  for (const row of rows) {
    for (const [metric, value] of Object.entries(row)) {
      if (!metric.endsWith('Ms') && !metric.startsWith('javascript')) continue;
      if (value === null) continue;
      if (report.summary.some(item => item.viewport === row.viewport && item.route === row.route && item.metric === metric)) continue;
      const values = rows.filter(item => item.viewport === row.viewport && item.route === row.route).map(item => item[metric]).filter(value => typeof value === 'number').sort((a, b) => a - b);
      const middle = Math.floor(values.length / 2);
      const median = values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
      report.summary.push({ viewport: row.viewport, route: row.route, metric, samples: values.length, median: Math.round(median * 10) / 10, min: Math.round(values[0] * 10) / 10, max: Math.round(values.at(-1) * 10) / 10 });
    }
  }
  await writeFile(options.output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(`Measured ${rows.length} samples. Saved ${options.output}`);
} finally {
  await browser.close();
}
