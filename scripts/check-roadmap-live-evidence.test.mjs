#!/usr/bin/env node
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkRoadmapLiveEvidence,
  DEFAULT_TIMEOUT_MS,
  LIVE_EXTERNAL_EVIDENCE,
  roadmapLiveEvidenceExitCode,
} from "./check-roadmap-live-evidence.mjs";

test("checks the three Mermaid issues and published npm package", () => {
  assert.deepEqual(LIVE_EXTERNAL_EVIDENCE.map(({ id }) => id), [
    "mermaid-issue-7699",
    "mermaid-issue-2623",
    "mermaid-issue-660",
    "published-npm-package",
  ]);
});

test("reports successful external responses as reachable", async () => {
  const results = await checkRoadmapLiveEvidence({
    fetchImpl: async (url, options) => {
      assert.equal(options.method, "GET");
      assert.equal(options.redirect, "follow");
      assert.ok(options.signal instanceof AbortSignal);
      assert.equal(options.signal.aborted, false);
      return { status: 200, url, redirected: false };
    },
  });

  assert.equal(results.length, 4);
  assert.ok(results.every(({ status }) => status === "reachable"));
  assert.equal(roadmapLiveEvidenceExitCode(results), 0);
});

test("follows redirects and records the final successful URL", async () => {
  const results = await checkRoadmapLiveEvidence({
    fetchImpl: async (url) => ({
      status: 200,
      url: url.replace("github.com", "www.github.com"),
      redirected: true,
    }),
  });

  assert.ok(results.every(({ status, redirected }) => status === "reachable" && redirected));
  assert.ok(results[0].finalUrl.includes("www.github.com"));
});

for (const httpStatus of [404, 410]) {
  test(`reports HTTP ${httpStatus} as definitively unavailable`, async () => {
    const results = await checkRoadmapLiveEvidence({
      fetchImpl: async (url) => ({
        status: url.includes("issues/2623") ? httpStatus : 200,
        url,
        redirected: false,
      }),
    });
    const unavailable = results.find(({ id }) => id === "mermaid-issue-2623");

    assert.equal(unavailable.status, "unavailable");
    assert.equal(unavailable.httpStatus, httpStatus);
    assert.equal(roadmapLiveEvidenceExitCode(results), 1);
  });
}

for (const httpStatus of [301, 302, 303, 307, 308, 429, 500, 502, 503, 504]) {
  test(`keeps HTTP ${httpStatus} unverified with a non-zero exit code`, async () => {
    const results = await checkRoadmapLiveEvidence({
      fetchImpl: async (url, options) => {
        assert.equal(options.redirect, "follow");
        return {
          status: url.includes("issues/2623") ? httpStatus : 200,
          url,
          redirected: false,
        };
      },
    });
    const unverified = results.find(({ id }) => id === "mermaid-issue-2623");

    assert.equal(unverified.status, "unverified");
    assert.equal(unverified.httpStatus, httpStatus);
    assert.equal(unverified.reason, `HTTP ${httpStatus}`);
    assert.ok(results
      .filter(({ id }) => id !== unverified.id)
      .every(({ status }) => status === "reachable"));
    assert.equal(roadmapLiveEvidenceExitCode(results), 2);
  });
}

test("preserves missing-page failure when another source is rate limited", async () => {
  const results = await checkRoadmapLiveEvidence({
    fetchImpl: async (url) => ({
      status: url.includes("issues/2623") ? 404 : url.includes("npmjs.com") ? 429 : 200,
      url,
      redirected: false,
    }),
  });

  assert.equal(results.find(({ id }) => id === "mermaid-issue-2623").status, "unavailable");
  assert.equal(results.find(({ id }) => id === "published-npm-package").status, "unverified");
  assert.equal(roadmapLiveEvidenceExitCode(results), 1);
});

test("reports access-denied responses as unverified, not unavailable", async () => {
  const results = await checkRoadmapLiveEvidence({
    fetchImpl: async (url) => ({
      status: url.includes("npmjs.com") ? 403 : 200,
      url,
      redirected: false,
    }),
  });
  const packagePage = results.find(({ id }) => id === "published-npm-package");

  assert.equal(packagePage.status, "unverified");
  assert.equal(packagePage.httpStatus, 403);
  assert.equal(roadmapLiveEvidenceExitCode(results), 2);
});

test("reports network failures as unverified with a distinct exit code", async () => {
  const results = await checkRoadmapLiveEvidence({
    fetchImpl: async (url) => {
      if (url.includes("issues/660")) throw new Error("network unavailable");
      return { status: 200, url, redirected: false };
    },
  });
  const unverified = results.find(({ id }) => id === "mermaid-issue-660");

  assert.equal(unverified.status, "unverified");
  assert.match(unverified.reason, /network unavailable/);
  assert.equal(roadmapLiveEvidenceExitCode(results), 2);
});

test("uses a bounded default timeout and rejects invalid timeout values", async () => {
  assert.equal(DEFAULT_TIMEOUT_MS, 8_000);
  await assert.rejects(
    checkRoadmapLiveEvidence({ fetchImpl: async () => {}, timeoutMs: 0 }),
    /positive finite number/,
  );
});
