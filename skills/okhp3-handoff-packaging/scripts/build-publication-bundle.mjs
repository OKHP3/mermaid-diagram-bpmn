#!/usr/bin/env node
/**
 * build-publication-bundle.mjs
 * Assembles MANIFEST.yaml + APPROVALS.yaml stub and validates bundle completeness.
 *
 * Usage: node build-publication-bundle.mjs --dir <process-artifacts/proc-id>
 * Named exports: buildPublicationBundle(dir, opts) → { valid, errors, warnings, manifest, approvals }
 */

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createHash } from 'node:crypto';

const REQUIRED_ARTIFACTS = ['pir.yaml', 'pns.yaml', 'bpmn-beta.mmd', 'sop.md', 'validation-report.yaml'];
const RECOMMENDED_ARTIFACTS = ['stakeholder-register.yaml', 'raci.md', 'sipoc.md', 'work-instructions.md', 'pns.md'];

function sha256(filePath) {
  try {
    const content = readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
  } catch {
    return '';
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * @param {string} dir - Path to process-artifacts/<process-id> directory
 * @param {{ processId?: string, processName?: string, qualityBand?: string, compositeScore?: number }} [opts]
 * @returns {{ valid: boolean, errors: string[], warnings: string[], manifest: object, approvals: object }}
 */
export function buildPublicationBundle(dir, opts = {}) {
  const errors = [];
  const warnings = [];

  if (!dir) {
    errors.push('dir must be provided');
    return { valid: false, errors, warnings, manifest: null, approvals: null };
  }

  if (!existsSync(dir)) {
    errors.push(`Directory "${dir}" does not exist`);
    return { valid: false, errors, warnings, manifest: null, approvals: null };
  }

  const processId = opts.processId || basename(dir);
  const processName = opts.processName || processId;

  // Check validation report first
  const reportPath = join(dir, 'validation-report.yaml');
  if (existsSync(reportPath)) {
    const reportContent = readFileSync(reportPath, 'utf8');
    const readyMatch = reportContent.match(/ready_for_publication:\s*(true|false)/);
    if (readyMatch && readyMatch[1] === 'false') {
      errors.push('BUNDLE-1: validation-report.yaml has ready_for_publication: false — resolve errors before bundling');
    }
  } else {
    errors.push('BUNDLE-1: validation-report.yaml is missing — run process-validation-and-quality-scoring first');
  }

  // Inventory all files
  const presentFiles = new Set(readdirSync(dir).filter(f => statSync(join(dir, f)).isFile()));
  const artifacts = [];
  const missingRequired = [];
  const missingRecommended = [];

  for (const filename of REQUIRED_ARTIFACTS) {
    const present = presentFiles.has(filename);
    if (!present) missingRequired.push(filename);
    artifacts.push({
      filename,
      source_skill: sourceSkillFor(filename),
      status: present ? 'present' : 'missing',
      sha256: present ? sha256(join(dir, filename)) : '',
    });
  }

  for (const filename of RECOMMENDED_ARTIFACTS) {
    const present = presentFiles.has(filename);
    if (!present) missingRecommended.push(filename);
    artifacts.push({
      filename,
      source_skill: sourceSkillFor(filename),
      status: present ? 'present' : 'optional',
      sha256: present ? sha256(join(dir, filename)) : '',
    });
  }

  // Add any other files in the directory
  for (const filename of presentFiles) {
    if (!REQUIRED_ARTIFACTS.includes(filename) && !RECOMMENDED_ARTIFACTS.includes(filename)) {
      artifacts.push({
        filename,
        source_skill: sourceSkillFor(filename),
        status: 'present',
        sha256: sha256(join(dir, filename)),
      });
    }
  }

  if (missingRequired.length > 0) {
    errors.push(`BUNDLE-2: Missing required artifacts: ${missingRequired.join(', ')}`);
  }
  if (missingRecommended.length > 0) {
    warnings.push(`BUNDLE-3: Missing recommended artifacts: ${missingRecommended.join(', ')}`);
  }

  const manifest = {
    manifest_version: '0.1',
    process_id: processId,
    process_name: processName,
    bundle_date: todayIso(),
    bundle_version: 'v1.0',
    quality_band: opts.qualityBand || '',
    composite_score: opts.compositeScore || null,
    artifacts,
    missing_required: missingRequired,
    missing_recommended: missingRecommended,
  };

  const approvals = {
    approvals_version: '0.1',
    process_id: processId,
    process_name: processName,
    bundle_version: 'v1.0',
    approvals: [
      {
        role: 'Process Owner',
        approval_date: '',
        status: 'pending',
        comments: '',
      },
    ],
    effective_date: '',
    review_date: '',
    distribution: ['Process Owner'],
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    manifest,
    approvals,
  };
}

function sourceSkillFor(filename) {
  if (filename === 'pir.yaml') return 'process-intake-and-scope';
  if (filename === 'pns.yaml' || filename === 'pns.md') return 'process-narrative-authoring';
  if (filename === 'bpmn-beta.mmd') return 'visual-process-modeling';
  if (filename === 'sop.md' || filename === 'work-instructions.md') return 'sop-and-work-instruction-generation';
  if (filename === 'validation-report.yaml') return 'process-validation-and-quality-scoring';
  if (filename === 'stakeholder-register.yaml') return 'stakeholder-and-role-mapping';
  if (filename === 'raci.md' || filename === 'governance-matrix.md') return 'raci-and-governance-matrix-generation';
  if (filename === 'sipoc.md') return 'sipoc-generation';
  if (filename === 'decision-model.yaml' || filename === 'dmn-table.md') return 'decision-model-authoring';
  if (filename === 'gap-analysis.yaml' || filename === 'exception-catalog.yaml') return 'process-gap-and-exception-analysis';
  if (filename === 'measures-register.yaml' || filename === 'controls-register.yaml') return 'process-measures-and-controls-definition';
  return 'unknown';
}

// ─── CLI entrypoint ──────────────────────────────────────────────────────────
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const dirArg = process.argv.indexOf('--dir');
  const dir = dirArg !== -1 ? process.argv[dirArg + 1] : process.argv[2];
  if (!dir) {
    console.error('Usage: node build-publication-bundle.mjs --dir <process-artifacts/proc-id>');
    process.exit(1);
  }
  const result = buildPublicationBundle(dir);
  if (!result.valid) {
    for (const e of result.errors) console.error('ERROR:', e);
    process.exit(1);
  }
  for (const w of result.warnings) console.warn('WARN:', w);
  console.log('Bundle complete — missing_required:', result.manifest.missing_required.length);
}
