#!/usr/bin/env node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSnapshot, compareSnapshots, extractFencedExamples } from './check-dfki-7699.mjs';

const issue = {
  number: 7699,
  title: 'Add Native BPMN 2.0 Support to Mermaid.js',
  state: 'open',
  state_reason: null,
  updated_at: '2026-08-05T19:07:08Z',
  user: { login: 'andreas-emrich' },
  labels: [{ name: 'Status: Approved' }, { name: 'Required Grooming' }],
};

const comments = [
  {
    id: 1,
    user: { login: 'someone-else' },
    body: '```mermaid\nnot author content\n```',
    created_at: '2026-05-23T00:00:00Z',
    updated_at: '2026-05-23T00:00:00Z',
  },
  {
    id: 2,
    user: { login: 'andreas-emrich' },
    body: 'Here are examples:\n```mermaid\nbpmn\n  start --> review[Review]\n```\n\n```text\ndetailed form\n```',
    created_at: '2026-05-24T19:30:39Z',
    updated_at: '2026-05-24T19:30:39Z',
  },
];

test('extracts fenced examples with normalized line endings and language', () => {
  assert.deepEqual(extractFencedExamples('``` mermaid\r\none\r\ntwo\r\n```'), [
    { language: 'mermaid', body: 'one\ntwo' },
  ]);
});

test('fingerprints only examples authored by the issue author', () => {
  const snapshot = buildSnapshot(issue, comments);
  assert.equal(snapshot.authorExamples.count, 2);
  assert.equal(snapshot.authorExamples.items[0].commentId, 2);
  assert.equal(snapshot.authorExamples.fingerprint.length, 64);
});

test('reports issue state, timestamp, and example drift', () => {
  const baseline = buildSnapshot(issue, comments);
  const changed = buildSnapshot({
    ...issue,
    state: 'closed',
    updated_at: '2026-08-06T00:00:00Z',
  }, [{
    ...comments[1],
    body: comments[1].body.replace('Review', 'Approve'),
  }]);
  const changes = compareSnapshots(baseline, changed);
  assert.equal(changes.length, 3);
  assert.ok(changes.some((change) => change.includes('issue state')));
  assert.ok(changes.some((change) => change.includes('updated timestamp')));
  assert.ok(changes.some((change) => change.includes('fenced examples')));
});