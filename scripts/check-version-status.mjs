#!/usr/bin/env node
/**
 * Validate the release-status rules in docs/version-checklist.md.
 *
 * Status labels in the checklist are manually maintained, so this check guards
 * against release-state drift:
 * - a [DONE] version may contain only checked criteria;
 * - a version whose criteria are all checked must be [DONE];
 * - exactly one incomplete version is [CURRENT];
 * - that [CURRENT] version is the lowest-numbered incomplete version.
 *
 * For fixture tests, set VERSION_CHECKLIST_OVERRIDE to an alternative Markdown
 * file. This is intentionally a validator-only override, not a production
 * configuration setting.
 */

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { basename, resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const checklistPath = process.env.VERSION_CHECKLIST_OVERRIDE
  ? resolve(process.env.VERSION_CHECKLIST_OVERRIDE)
  : resolve(root, 'docs/version-checklist.md');
const checklistLabel = process.env.VERSION_CHECKLIST_OVERRIDE
  ? `VERSION_CHECKLIST_OVERRIDE (${basename(checklistPath)})`
  : 'docs/version-checklist.md';

if (!existsSync(checklistPath)) {
  console.error(`[check:version-status] FAIL: ${checklistLabel} was not found.`);
  process.exitCode = 1;
} else {
  const versions = parseVersions(readFileSync(checklistPath, 'utf8'));
  const failures = validateStatuses(versions);

  if (failures.length) {
    console.error(`[check:version-status] FAIL: ${failures.length} release-state rule violation(s) in ${checklistLabel}.`);
    for (const failure of failures) console.error(`✖ ${failure}`);
    process.exitCode = 1;
  } else {
    const current = versions.find((version) => version.status === 'CURRENT');
    console.log(
      `[check:version-status] OK — ${versions.length} versions validated; ` +
      `${current.version} is the lowest incomplete [CURRENT] milestone.`,
    );
  }
}

/**
 * Parse top-level version sections and their checkbox criteria.
 * Only headings shaped like "### V0.4 — Title [CURRENT]" participate so
 * checkboxes in prose elsewhere cannot affect release-state classification.
 */
export function parseVersions(markdown) {
  const lines = markdown.split(/\r?\n/);
  const versions = [];
  let active = null;

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].match(/^###\s+(V(\d+)\.(\d+))\b.*?`?\[(DONE|CURRENT|PLANNED)\]`?\s*$/);
    if (heading) {
      active = {
        version: heading[1],
        major: Number(heading[2]),
        minor: Number(heading[3]),
        status: heading[4],
        line: index + 1,
        criteria: [],
      };
      versions.push(active);
      continue;
    }

    const criterion = lines[index].match(/^\s*-\s+\[([ xX~])\]\s+(.+)$/);
    if (active && criterion) {
      active.criteria.push({
        state: criterion[1].toLowerCase(),
        text: criterion[2].trim(),
        line: index + 1,
      });
    }
  }

  return versions;
}

export function validateStatuses(versions) {
  const failures = [];
  if (versions.length === 0) {
    return ['No version headings with [DONE], [CURRENT], or [PLANNED] status labels were found.'];
  }

  for (const version of versions) {
    if (version.criteria.length === 0) {
      failures.push(`${version.version} (line ${version.line}) has no checklist criteria to validate.`);
      continue;
    }

    const unchecked = version.criteria.filter((criterion) => criterion.state !== 'x');
    const complete = unchecked.length === 0;

    if (version.status === 'DONE' && !complete) {
      const first = unchecked[0];
      failures.push(
        `${version.version} is marked [DONE] at line ${version.line}, but has an unchecked ` +
        `criterion at line ${first.line}: ${first.text}`,
      );
    }
    if (complete && version.status !== 'DONE') {
      failures.push(
        `${version.version} has only checked criteria but is marked [${version.status}] at line ${version.line}; ` +
        'completed versions must be [DONE].',
      );
    }
    version.complete = complete;
  }

  const incomplete = versions
    .filter((version) => !version.complete)
    .sort((a, b) => a.major - b.major || a.minor - b.minor);
  const markedCurrent = versions.filter((version) => version.status === 'CURRENT');

  if (incomplete.length === 0) {
    failures.push('No incomplete version exists, so there must be no [CURRENT] version.');
  } else {
    const expectedCurrent = incomplete[0];
    if (markedCurrent.length !== 1) {
      const found = markedCurrent.length
        ? markedCurrent.map((version) => version.version).join(', ')
        : 'none';
      failures.push(
        `Expected exactly one [CURRENT] version — the lowest incomplete version is ${expectedCurrent.version}; found ${found}.`,
      );
    } else if (markedCurrent[0].version !== expectedCurrent.version) {
      failures.push(
        `${markedCurrent[0].version} is marked [CURRENT] at line ${markedCurrent[0].line}, but ` +
        `${expectedCurrent.version} is the lowest incomplete version and must be [CURRENT].`,
      );
    }
  }

  for (const version of markedCurrent.filter((version) => version.complete)) {
    failures.push(
      `${version.version} is marked [CURRENT] at line ${version.line}, but all of its criteria are checked; ` +
      'completed versions must be [DONE].',
    );
  }

  return failures;
}