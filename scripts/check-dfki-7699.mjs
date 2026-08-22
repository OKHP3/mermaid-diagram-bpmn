#!/usr/bin/env node
/**
 * Check whether Mermaid issue #7699 has changed since the project last reviewed
 * the public comparison.
 *
 * This is deliberately a source check, not an automatic documentation updater:
 * a changed issue requires a maintainer to review the comparison and then
 * deliberately refresh the committed baseline.
 *
 * Usage:
 *   node scripts/check-dfki-7699.mjs
 *   node scripts/check-dfki-7699.mjs --update-baseline
 *
 * The check cannot prove that the cited DFKI paper has no DOI or preprint. It
 * only fingerprints the issue and its author-authored fenced examples.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_PATH = process.env.DFKI_7699_BASELINE_OVERRIDE
  ?? resolve(ROOT, 'docs/dfki-7699-source-baseline.json');
const ISSUE_URL = process.env.DFKI_7699_ISSUE_URL
  ?? 'https://api.github.com/repos/mermaid-js/mermaid/issues/7699';
const COMMENTS_URL = process.env.DFKI_7699_COMMENTS_URL
  ?? `${ISSUE_URL}/comments`;
const PUBLIC_ISSUE_URL = 'https://github.com/mermaid-js/mermaid/issues/7699';

function normaliseExample(language, body) {
  return {
    language: language.trim(),
    body: body.replace(/\r\n/g, '\n').trim(),
  };
}

export function extractFencedExamples(markdown) {
  const examples = [];
  const fence = /```([^\n]*)\r?\n([\s\S]*?)```/g;
  let match;
  while ((match = fence.exec(markdown ?? '')) !== null) {
    examples.push(normaliseExample(match[1], match[2]));
  }
  return examples;
}

function hashExample(example) {
  return createHash('sha256')
    .update(`${example.language}\n${example.body}\n`, 'utf8')
    .digest('hex');
}

export function buildSnapshot(issue, comments) {
  const author = issue.user?.login;
  const authorExamples = [];

  for (const comment of comments) {
    if (comment.user?.login !== author) continue;
    extractFencedExamples(comment.body).forEach((example, index) => {
      authorExamples.push({
        commentId: comment.id,
        commentCreatedAt: comment.created_at,
        commentUpdatedAt: comment.updated_at,
        index,
        language: example.language,
        sha256: hashExample(example),
      });
    });
  }

  const examplesFingerprint = createHash('sha256')
    .update(JSON.stringify(authorExamples), 'utf8')
    .digest('hex');

  return {
    schemaVersion: 1,
    source: PUBLIC_ISSUE_URL,
    issue: {
      number: issue.number,
      title: issue.title,
      state: issue.state,
      stateReason: issue.state_reason ?? null,
      updatedAt: issue.updated_at,
      author,
      labels: (issue.labels ?? []).map((label) => label.name).sort(),
    },
    authorExamples: {
      count: authorExamples.length,
      fingerprint: examplesFingerprint,
      items: authorExamples,
    },
  };
}

function changedFields(expected, observed) {
  const changes = [];
  if (expected.issue.state !== observed.issue.state
      || expected.issue.stateReason !== observed.issue.stateReason) {
    changes.push(`issue state: ${expected.issue.state} → ${observed.issue.state}`);
  }
  if (expected.issue.updatedAt !== observed.issue.updatedAt) {
    changes.push(`issue updated timestamp: ${expected.issue.updatedAt} → ${observed.issue.updatedAt}`);
  }
  if (expected.authorExamples.fingerprint !== observed.authorExamples.fingerprint) {
    changes.push(
      `author-authored fenced examples: fingerprint changed ` +
      `(${expected.authorExamples.count} → ${observed.authorExamples.count} examples)`,
    );
  }
  if (JSON.stringify(expected.issue.labels) !== JSON.stringify(observed.issue.labels)) {
    changes.push(`issue labels changed: ${expected.issue.labels.join(', ')} → ${observed.issue.labels.join(', ')}`);
  }
  return changes;
}

export function compareSnapshots(expected, observed) {
  return changedFields(expected, observed);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'bpmn-for-mermaid-source-check',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

function loadBaseline() {
  try {
    return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read baseline ${BASELINE_PATH}: ${error.message}`);
  }
}

async function main() {
  let issue;
  let comments;
  try {
    [issue, comments] = await Promise.all([
      fetchJson(ISSUE_URL),
      fetchJson(`${COMMENTS_URL}?per_page=100`),
    ]);
  } catch (error) {
    console.error(
      `[check-dfki-7699] UNVERIFIED: could not fetch Mermaid issue #7699.\n` +
      `  ${error.message}\n` +
      `  Retry with network access; do not treat an unavailable source as a clean check.`,
    );
    process.exitCode = 1;
    return;
  }

  const observed = buildSnapshot(issue, comments);
  if (process.argv.includes('--update-baseline')) {
    writeFileSync(BASELINE_PATH, `${JSON.stringify({
      ...observed,
      reviewedAt: new Date().toISOString().slice(0, 10),
      limitation: 'This source check cannot prove that the cited DFKI paper has no DOI or preprint.',
    }, null, 2)}\n`);
    console.log(`[check-dfki-7699] Baseline updated: ${BASELINE_PATH}`);
    return;
  }

  const expected = loadBaseline();
  const changes = compareSnapshots(expected, observed);
  if (changes.length > 0) {
    console.error(
      `[check-dfki-7699] WARNING: Mermaid issue #7699 changed since the last review (${expected.reviewedAt}).\n` +
      changes.map((change) => `  - ${change}`).join('\n') +
      `\n  Review ${PUBLIC_ISSUE_URL}, app/src/pages/SyntaxComparison.tsx, and ` +
      `app/docs/competitive-landscape.md before updating the baseline.\n` +
      `  Refresh deliberately with: node scripts/check-dfki-7699.mjs --update-baseline\n` +
      `  This check cannot prove that the cited DFKI paper has no DOI or preprint.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `[check-dfki-7699] OK: issue #7699 is unchanged since ${expected.reviewedAt}; ` +
    `${observed.authorExamples.count} author-authored fenced examples fingerprinted.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}