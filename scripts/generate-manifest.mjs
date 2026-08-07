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
// Sourced from docs/capability-ledger.md (baseline 2026-08-06) and CI config.
// Tiers: confirmed | source-verified | ci-gated | browser-verified | not-complete

const EVIDENCE_TIERS = [
  {
    id: 'playground-renders',
    claim: 'React Playground renders supported DSL syntax',
    evidence:
      'Application tests — bpmn-parser-corpus.test.ts, bpmn-renderer.test.tsx; 600+ assertions in CI',
    tier: 'confirmed',
  },
  {
    id: 'mermaid-integration',
    claim: 'Mermaid source adapter tested via real mermaid.render()',
    evidence:
      'bpmn-plugin-integration.test.ts — imports real mermaid@11.4.1, calls registerExternalDiagrams(), asserts bpmn-* CSS classes present on output SVG',
    tier: 'source-verified',
  },
  {
    id: 'e2e-browser',
    claim: 'Plugin renders correctly in a real Chromium browser',
    evidence:
      'Playwright suite (app/e2e/host-demo.spec.ts) — CI-gated on every push and PR; covers flat flow, gateway, pool/lane, cross-pool, and error case',
    tier: 'ci-gated',
  },
  {
    id: 'accessibility',
    claim: 'WCAG 2.2 AA accessibility gate',
    evidence:
      'axe-core 4.13.0 via @testing-library/react in happy-dom; rules: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice; covers Home, Playground, AgentSkills pages',
    tier: 'source-verified',
  },
  {
    id: 'theme-binding',
    claim: 'Live theme-variable binding (FR-018)',
    evidence:
      'bpmn-plugin-integration.test.ts — styles() provider supplies resolved themeVariables at render time; "FR-018" describe block CI-gated',
    tier: 'source-verified',
  },
  {
    id: 'bundle-size',
    claim: 'Plugin bundle size < 200 kB gzip NFR',
    evidence:
      'ESM: 20.01 kB / 5.88 kB gzip; CJS: 16.74 kB / 5.40 kB gzip — verified via pnpm run plugin:build in CI gate',
    tier: 'ci-gated',
  },
  {
    id: 'npm-published',
    claim: 'Package published to npm registry',
    evidence:
      'npm view @okhp3/mermaid-diagram-bpmn returns 0.1.1; smoke test (12/12 assertions) CI-gated via publish-npm.yml; confirmed live 2026-08-06',
    tier: 'confirmed',
  },
  {
    id: 'visual-regression',
    claim: 'Pixel-diff visual regression blocks PRs on unexpected layout change',
    evidence:
      'Playwright visual spec (app/e2e/visual-regression.spec.ts); maxDiffPixelRatio 2–3%; 6 Linux/Chromium baseline PNGs CI-committed; active on PRs',
    tier: 'ci-gated',
  },
  {
    id: 'bp-skill-validator',
    claim: 'BP-SKILL validator passes 15 core + 3 supplemental packages',
    evidence:
      'pnpm run skill:validate — 235/235 checks, 0 failures across 18 packages and 9 context files; CI-gated',
    tier: 'confirmed',
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
