import assert from "node:assert/strict";
import test from "node:test";
import { execFileSync } from "node:child_process";
import {
  audit,
  blockMap,
  collectInventory,
  compareVersions,
  formatReport,
  lookupBudgetMs,
  parseLockfile,
  read,
  root,
  selectNpmRelease,
} from "./technology-inventory.mjs";

const lock = `lockfileVersion: '9.0'
importers:
  .:
    devDependencies:
      '@scope/tool':
        specifier: 'catalog:'
        version: 1.2.3(peer@2.0.0)
packages:
  '@scope/tool@1.2.3':
    bundledDependencies:
      - internal
  'peer@2.0.0':
    resolution: {integrity: example}
  'peer@1.9.0':
    resolution: {integrity: example}
snapshots:
  '@scope/tool@1.2.3(peer@2.0.0)': {}
`;
function fixture() {
  return {
    "pnpm-lock.yaml": lock,
    "pnpm-workspace.yaml":
      "catalog:\n  '@scope/tool': ^1.2.0\n  unused: ^1.0.0\noverrides:\n  'parent>child': '-'\n",
    "package.json": JSON.stringify({
      name: "test",
      version: "1.0.0",
      packageManager: "pnpm@10.26.1",
      devDependencies: { "@scope/tool": "catalog:" },
    }),
    "fixtures/plugin-smoke/package.json": JSON.stringify({
      dependencies: { peer: "^2.0.0", local: "file:local.tgz" },
    }),
    "lib/plugin/package.json": JSON.stringify({
      peerDependencies: { peer: ">=1.0.0" },
    }),
    ".replit":
      'modules = ["nodejs-24", "python-3.11"]\nchannel = "stable-25_05"',
    ".github/workflows/ci.yml": 'uses: actions/checkout@v7\nnode-version: "24"',
    "skills/tool/script.py": "import json",
  };
}
const inventory = () => {
  const f = fixture();
  return collectInventory(Object.keys(f), (path) => f[path]);
};
test("extracts scoped packages, all resolutions, and ignores nested fields and snapshots", () => {
  const parsed = parseLockfile(lock.replaceAll("\n", "\r\n"));
  assert.deepEqual(parsed.packages, {
    "@scope/tool": ["1.2.3"],
    peer: ["2.0.0", "1.9.0"],
  });
  assert.equal(
    parsed.importers["."].devDependencies["@scope/tool"].specifier,
    "catalog:",
  );
});
test("unsupported or empty lockfiles fail instead of reporting no dependencies", () => {
  assert.throws(() => parseLockfile("lockfileVersion: '10.0'"), /Unsupported/);
  assert.throws(() => parseLockfile("lockfileVersion: '9.0'"), /Empty/);
  assert.throws(
    () => parseLockfile(lock.replace("'peer@2.0.0':", "'peer@git:unknown':")),
    /Unsupported lockfile package/,
  );
});
test("catalog ranges, standalone fixtures, peer contracts, and local artifacts remain distinct", () => {
  const i = inventory();
  assert.equal(i.declarations[0].effective, "^1.2.0");
  assert.equal(i.declarations[0].resolved, "1.2.3");
  assert.deepEqual(
    i.declarations.slice(1).map((d) => [d.kind, d.resolved]),
    [
      ["standalone fixture", null],
      ["local artifact", null],
      ["peer contract", null],
    ],
  );
  assert.deepEqual(i.unusedCatalog, [["unused", "^1.0.0"]]);
  assert.equal(i.replitPython, "3.11");
  assert.equal(i.actions["actions/checkout"][0].ref, "v7");
});
test("manifest mismatch and missing catalog cannot be hidden", () => {
  const f = fixture();
  f["package.json"] = f["package.json"].replace("catalog:", "^9.0.0");
  assert.throws(
    () => collectInventory(Object.keys(f), (path) => f[path]),
    /Manifest\/lockfile drift/,
  );
  const g = fixture();
  g["pnpm-workspace.yaml"] = "catalog:\n  unused: ^1.0.0";
  assert.throws(
    () => collectInventory(Object.keys(g), (path) => g[path]),
    /Unresolved catalog/,
  );
});
test("quoted scoped overrides survive without leaking into another section", () => {
  assert.deepEqual(
    blockMap(
      "overrides:\n  '@scope/tool': ^1.0.0\n  'parent>child': '-'\nother:\n  nope: 2",
      "overrides",
    ),
    { "@scope/tool": "^1.0.0", "parent>child": "-" },
  );
});
const metadata = {
  "dist-tags": { latest: "3.0.0-beta.1" },
  versions: {
    "1.9.0": {},
    "1.10.0": {},
    "2.0.0": {},
    "2.1.0": { deprecated: "withdrawn" },
    "3.0.0-beta.1": {},
    "4.0.0": {},
  },
  time: {
    "1.9.0": "2025-01-01",
    "1.10.0": "2026-01-01",
    "2.0.0": "2026-01-02T23:00:00Z",
    "2.1.0": "2026-01-01",
    "3.0.0-beta.1": "2026-01-01",
    "4.0.0": "2099-01-01",
  },
};
test("stable selection rejects prereleases, deprecated, and future versions and honors maturity", () => {
  const r = selectNpmRelease(metadata, Date.parse("2026-01-03T00:00:00Z"));
  assert.equal(r.latest, "2.0.0");
  assert.equal(r.latestTag, "3.0.0-beta.1");
  assert.equal(r.stableByMajor["1"], "1.10.0");
  assert.equal(r.matureByMajor["2"], undefined);
  assert.ok(compareVersions("1.10.0", "1.9.0") > 0);
  assert.throws(() => selectNpmRelease({ versions: {} }), /No dated/);
});
test("registry failures retain evidence gaps and never become an up-to-date pass", async () => {
  const report = await audit(
    inventory(),
    async () => {
      throw new Error("fixture outage");
    },
    async () => "invalid response",
  );
  assert.equal(report.complete, false);
  assert.ok(report.errors.some((e) => e.includes("@scope/tool")));
  assert.match(formatReport(report), /INCOMPLETE/);
  assert.match(formatReport(report), /UNKNOWN/);
});
test("successful audit checks all sources while excluding local tarballs", async () => {
  const requested = [];
  const report = await audit(
    inventory(),
    async (url) => {
      requested.push(url);
      if (url.includes("nodejs.org"))
        return [
          { version: "v26.1.0", lts: false },
          { version: "v24.5.0", lts: "Example" },
        ];
      if (url.includes("api.github.com"))
        return {
          tag_name: "v7.0.1",
          html_url: "https://github.com/actions/checkout/releases/tag/v7.0.1",
        };
      return metadata;
    },
    async () => ">Python 3.14.7< >Python 3.15.0rc1< >Python 3.11.16<",
  );
  assert.equal(report.complete, true);
  assert.equal(report.python.latest, "3.14.7");
  assert.equal(report.node.lts, "v24.5.0");
  assert.equal(
    requested.some((url) => url.includes("local.tgz")),
    false,
  );
});
test(
  "a shared deadline preserves partial evidence and stops queued lookups",
  { timeout: 2000 },
  async () => {
    const i = inventory();
    for (let n = 0; n < 12; n++) i.locked[`queued-${n}`] = ["1.0.0"];
    const requested = [],
      signals = [];
    const report = await audit(
      i,
      async (url, signal) => {
        requested.push(url);
        signals.push(signal);
        if (url.endsWith(encodeURIComponent("@scope/tool"))) return metadata;
        return new Promise(() => {});
      },
      async () => {
        throw new Error("Later sources must not start after timeout");
      },
      { timeoutMs: 30 },
    );
    assert.equal(report.complete, false);
    assert.ok(report.npm["@scope/tool"]);
    assert.equal(report.node, null);
    assert.equal(report.python, null);
    assert.ok(signals.every((signal) => signal.aborted));
    assert.ok(requested.length < Object.keys(report.npm).length);
    assert.ok(
      report.errors.every((error) => error.includes("deadline exceeded")),
    );
    assert.match(formatReport(report), /INCOMPLETE/);
    const jobMinutes = Number(
      read(".github/workflows/technology-version-audit.yml").match(
        /timeout-minutes:\s*(\d+)/,
      )[1],
    );
    assert.ok(
      lookupBudgetMs + 60_000 < jobMinutes * 60_000,
      "Leave time to write and upload incomplete reports",
    );
  },
);
test("current repository includes every tracked manifest, lockfile identity, and action", () => {
  const files = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean);
  const i = collectInventory(files, read);
  assert.equal(
    i.localPackages.length,
    files.filter((p) => /(^|\/)package\.json$/.test(p)).length,
  );
  assert.ok(
    i.declarations.some((d) => d.path === "lib/bpmn-plugin/package.json"),
  );
  assert.ok(
    i.declarations.some((d) => d.path === "fixtures/plugin-smoke/package.json"),
  );
  const appMermaid = i.declarations.find(
    (d) => d.name === "mermaid" && d.path === "app/package.json",
  );
  assert.ok(i.locked.mermaid.includes(appMermaid.resolved));
  assert.ok(i.actions["actions/cache"]);
});
