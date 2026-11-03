import { test } from "node:test";
import assert from "node:assert/strict";
import { releaseState } from "./watch-mermaid-release.mjs";
const metadata = {
  versions: { "12.2.0": {}, "12.3.0": {}, "13.0.0-beta.1": {} },
  time: {
    "12.2.0": "2026-11-01T00:00:00Z",
    "12.3.0": "2026-11-03T13:18:31.144Z",
    "13.0.0-beta.1": "2026-11-01T00:00:00Z",
  },
};
const releases = ["12.2.0", "12.3.0"].map((v) => ({
  tag_name: `mermaid@${v}`,
  published_at: metadata.time[v],
  html_url: `https://github.com/mermaid-js/mermaid/releases/tag/mermaid%40${v}`,
  draft: false,
  prerelease: false,
}));
test("detects a fresh stable release without advancing before maturity", () => {
  const r = releaseState(
    metadata,
    releases,
    "12.2.0",
    undefined,
    24,
    Date.parse("2026-11-03T18:00:00Z"),
  );
  assert.equal(r.latest, "12.3.0");
  assert.equal(r.status, "waiting-for-maturity");
  assert.equal(r.dispatch, false);
  assert.equal(r.eligibleAt, "2026-11-04T13:18:31.144Z");
});
test("dispatches at the maturity boundary and avoids repeating an existing candidate", () => {
  const now = Date.parse("2026-11-04T13:18:31.144Z");
  assert.equal(
    releaseState(metadata, releases, "12.2.0", "12.2.0", 24, now).dispatch,
    true,
  );
  assert.equal(
    releaseState(metadata, releases, "12.2.0", "12.3.0", 24, now).status,
    "candidate-awaiting-review",
  );
  assert.equal(
    releaseState(metadata, releases, "12.3.0", undefined, 24, now).dispatch,
    false,
  );
});
test("fails closed when publisher metadata is incomplete and ignores tiny releases", () => {
  assert.throws(
    () =>
      releaseState(
        metadata,
        releases.slice(0, 1),
        "12.2.0",
        undefined,
        24,
        Date.parse("2026-11-05"),
      ),
    /matching stable/,
  );
  assert.throws(
    () =>
      releaseState(
        metadata,
        [{ ...releases[1], tag_name: "@mermaid-js/tiny@12.3.0" }],
        "12.2.0",
        undefined,
        24,
        Date.parse("2026-11-05"),
      ),
    /matching stable/,
  );
  assert.throws(
    () =>
      releaseState(
        metadata,
        releases.map((r) => ({ ...r, prerelease: true })),
        "12.2.0",
        undefined,
        24,
        Date.parse("2026-11-05"),
      ),
    /matching stable/,
  );
});
test("does not downgrade newer pins or dispatch future or deprecated releases", () => {
  assert.equal(
    releaseState(
      metadata,
      releases,
      "12.4.0",
      undefined,
      24,
      Date.parse("2026-11-05"),
    ).dispatch,
    false,
  );
  assert.equal(
    releaseState(
      metadata,
      releases,
      "12.2.0",
      undefined,
      24,
      Date.parse("2026-11-02"),
    ).latest,
    "12.2.0",
  );
  const copy = structuredClone(metadata);
  copy.versions["12.3.0"].deprecated = "withdrawn";
  assert.equal(
    releaseState(
      copy,
      releases,
      "12.2.0",
      undefined,
      24,
      Date.parse("2026-11-05"),
    ).latest,
    "12.2.0",
  );
});
