#!/usr/bin/env node
/**
 * generate-manifest.mjs
 *
 * Generates app/public/release-manifest.json from canonical sources:
 *   - lib/bpmn-plugin/package.json   → pluginVersion, mermaidCompatRange
 *   - app/src/lib/bpmn-plugin.ts     → mermaidVersionTarget
 *
 * The committed manifest intentionally omits the source commit SHA and the
 * current timestamp — both change on every commit and are injected at Vite
 * build time via VITE_COMMIT_SHA and rendered in ReleasePage.tsx.
 *
 * Non-temporal fields are checked for drift in --check mode. CI fails if the
 * manifest is stale relative to the canonical sources.
 *
 * Usage (from workspace root):
 *   node scripts/generate-manifest.mjs           # write manifest
 *   node scripts/generate-manifest.mjs --check   # exit 1 if manifest would change
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'app/public/release-manifest.json');
const CHECK_MODE = process.argv.includes('--check');

// ── Read canonical sources ───────────────────────────────────────────────────

const pluginPkg = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'lib/bpmn-plugin/package.json'), 'utf8'),
);
const pluginVersion = pluginPkg.version;
const mermaidCompatRange = pluginPkg.peerDependencies?.mermaid ?? '>=10.0.0';

const pluginSrc = fs.readFileSync(
  path.join(ROOT, 'app/src/lib/bpmn-plugin.ts'),
  'utf8',
);
const mermaidVersionTarget = (() => {
  const m = pluginSrc.match(/MERMAID_VERSION_TARGET\s*=\s*['"]([^'"]+)['"]/);
  if (!m) throw new Error('MERMAID_VERSION_TARGET not found in app/src/lib/bpmn-plugin.ts');
  return m[1];
})();

// ── Evidence tiers ───────────────────────────────────────────────────────────
// Sourced from the dated maturity evidence baseline and CI config.
// Tiers: supported | provisional | disputed | blocked

const EVIDENCE_TIERS = [
  {
    id: 'playground-renders',
    claim: 'React Playground renders supported DSL syntax',
    evidence:
      'Application test suite — 839/839 tests across 46 files on 2026-08-22',
    tier: 'confirmed',
  },
  {
    id: 'mermaid-integration',
    claim: 'Mermaid source adapter tested via real mermaid.render()',
    evidence:
      'bpmn-plugin-integration.test.ts plus packed plugin smoke (12/12) on 2026-08-22; real mermaid@11.4.1',
    tier: 'supported',
  },
  {
    id: 'e2e-browser',
    claim: 'Plugin renders correctly in a real Chromium browser',
    evidence:
      'Chromium host-demo checks pass; full Chromium run is blocked at 49/57 by 8 worked-example node-navigation timeouts on 2026-08-22',
    tier: 'blocked',
  },
  {
    id: 'accessibility',
    claim: 'WCAG 2.2 AA accessibility gate',
    evidence:
      'axe-core checks and Playwright visual/mobile assertions pass; contrast, touch, and complete keyboard work-surface behavior remain unproven (2026-08-22)',
    tier: 'provisional',
  },
  {
    id: 'theme-binding',
    claim: 'Live theme-variable binding (FR-018)',
    evidence:
      'bpmn-plugin-integration.test.ts FR-018 block supplies resolved themeVariables at render time; reviewed 2026-08-22',
    tier: 'supported',
  },
  {
    id: 'bundle-size',
    claim: 'Plugin bundle size < 200 kB gzip NFR',
    evidence:
      'ESM: 20.08 kB / 5.94 kB gzip; CJS: 16.78 kB / 5.44 kB gzip — plugin build on 2026-08-22',
    tier: 'supported',
  },
  {
    id: 'npm-published',
    claim: 'Package published to npm registry',
    evidence:
      'npm registry version endpoint returned HTTP 200 for 0.1.1 and packed install smoke passed 12/12 on 2026-08-22',
    tier: 'supported',
  },
  {
    id: 'visual-regression',
    claim: 'Pixel-diff visual regression blocks PRs on unexpected layout change',
    evidence:
      'Playwright visual spec with 17 Linux/Chromium baselines and 2–3% thresholds; source/CI configuration reviewed 2026-08-22',
    tier: 'supported',
  },
  {
    id: 'bp-skill-validator',
    claim: 'BP-SKILL validator passes 15 core + 3 supplemental packages',
    evidence:
      'pnpm run skill:test 196/196, skill:validate 235/235, eval:run 14/14 on 2026-08-22',
    tier: 'supported',
  },
];

// ── Build manifest ────────────────────────────────────────────────────────────

const manifest = {
  schemaVersion: '1',
  pluginPackage: '@okhp3/mermaid-diagram-bpmn',
  pluginVersion,
  mermaidVersionTarget,
  mermaidCompatRange,
  generatedDate: new Date().toISOString().slice(0, 10),
  evidenceTiers: EVIDENCE_TIERS,
};

// ── Check mode ────────────────────────────────────────────────────────────────

if (CHECK_MODE) {
  if (!fs.existsSync(OUT_PATH)) {
    console.error(
      `FAIL  app/public/release-manifest.json does not exist.\n` +
      `      Run: node scripts/generate-manifest.mjs`,
    );
    process.exit(1);
  }

  const committed = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));

  // Only non-temporal fields are checked. generatedDate is volatile (changes
  // every run) and is intentionally excluded from the drift check.
  const CHECKED_FIELDS = [
    'schemaVersion',
    'pluginPackage',
    'pluginVersion',
    'mermaidVersionTarget',
    'mermaidCompatRange',
  ];

  const diffs = [];
  for (const field of CHECKED_FIELDS) {
    if (committed[field] !== manifest[field]) {
      diffs.push(
        `  ${field}:\n    committed:  ${JSON.stringify(committed[field])}\n    generated:  ${JSON.stringify(manifest[field])}`,
      );
    }
  }

  // Evidence tiers: compare the full content of each tier entry (id, claim,
  // evidence, tier). Index committed entries by id for lookup.
  const committedById = Object.fromEntries(
    (committed.evidenceTiers ?? []).map((t) => [t.id, t]),
  );
  for (const gen of EVIDENCE_TIERS) {
    const com = committedById[gen.id];
    if (!com) {
      diffs.push(`  evidenceTiers[${gen.id}]: missing from committed manifest`);
      continue;
    }
    for (const key of ['claim', 'evidence', 'tier']) {
      if (com[key] !== gen[key]) {
        diffs.push(
          `  evidenceTiers[${gen.id}].${key}:\n    committed:  ${JSON.stringify(com[key])}\n    generated:  ${JSON.stringify(gen[key])}`,
        );
      }
    }
  }
  // Catch any IDs in the committed file that are no longer in the source.
  const generatedIds = new Set(EVIDENCE_TIERS.map((t) => t.id));
  for (const com of committed.evidenceTiers ?? []) {
    if (!generatedIds.has(com.id)) {
      diffs.push(`  evidenceTiers[${com.id}]: present in committed manifest but removed from source`);
    }
  }

  if (diffs.length > 0) {
    console.error(
      `FAIL  app/public/release-manifest.json is out of date.\n` +
      `      Run: node scripts/generate-manifest.mjs\n\n` +
      diffs.join('\n\n'),
    );
    process.exit(1);
  }

  console.log('OK    app/public/release-manifest.json is up to date');
  process.exit(0);
}

// ── Write ─────────────────────────────────────────────────────────────────────

const outDir = path.dirname(OUT_PATH);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Wrote app/public/release-manifest.json`);
