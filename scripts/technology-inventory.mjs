import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("..", import.meta.url));
export const read = (path) => readFileSync(resolve(root, path), "utf8");
const fields = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];
const unquote = (value) => value.replace(/^(['"])(.*)\1$/, "$2");
export const isStable = (version) => /^\d+\.\d+\.\d+$/.test(version);
export function compareVersions(a, b) {
  const left = a.replace(/^v/, "").split(".").map(Number);
  const right = b.replace(/^v/, "").split(".").map(Number);
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}
const unique = (values) => [...new Set(values)].sort();

// Extract only pnpm v9 block-map fields. Unsupported identities fail explicitly.
export function parseLockfile(text) {
  if (!/^lockfileVersion: ['"]?9\.0['"]?\s*$/m.test(text))
    throw new Error(
      "Unsupported lockfile format; expected pnpm lockfileVersion 9.0",
    );
  const importers = {},
    packages = {};
  let section, importer, field, name;
  for (const line of text.split(/\r?\n/)) {
    if (/^\S/.test(line)) section = line.split(":")[0];
    const key = line.match(/^  (\S.*):\s*$/);
    if (section === "packages" && key) {
      const id = unquote(key[1]);
      const match = id.match(/^(.+)@(\d+\.\d+\.\d+[^()]*)$/);
      if (!match) throw new Error(`Unsupported lockfile package: ${id}`);
      (packages[match[1]] ??= []).push(match[2]);
    }
    if (section !== "importers") continue;
    if (key) {
      importer = unquote(key[1]);
      importers[importer] = {};
      field = undefined;
    }
    const group = line.match(/^    (\w+):\s*$/);
    if (group) {
      field = group[1];
      importers[importer][field] = {};
    }
    const dep = line.match(/^      (\S.*):\s*$/);
    if (dep && fields.includes(field)) {
      name = unquote(dep[1]);
      importers[importer][field][name] = {};
    }
    const value = line.match(/^        (specifier|version): (.+)$/);
    if (value && fields.includes(field))
      importers[importer][field][name][value[1]] = unquote(value[2]);
  }
  if (!Object.keys(importers).length || !Object.keys(packages).length)
    throw new Error("Empty lockfile inventory");
  return { importers, packages };
}
export function blockMap(text, block) {
  const result = {};
  let active = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\S/.test(line)) active = line === `${block}:`;
    if (!active) continue;
    const match = line.match(/^  ('.*?'|".*?"|[^:]+): (.+)$/);
    if (match) result[unquote(match[1])] = unquote(match[2]);
  }
  return result;
}
export function collectInventory(files, readFile) {
  const lock = parseLockfile(readFile("pnpm-lock.yaml"));
  const workspace = readFile("pnpm-workspace.yaml");
  const catalog = blockMap(workspace, "catalog");
  const overrides = blockMap(workspace, "overrides");
  const manifests = files.filter((path) => /(^|\/)package\.json$/.test(path));
  const declarations = [],
    localPackages = [];
  for (const path of manifests) {
    const manifest = JSON.parse(readFile(path));
    localPackages.push({
      path,
      name: manifest.name,
      version: manifest.version,
    });
    const importer =
      path === "package.json" ? "." : path.replace(/\/package\.json$/, "");
    for (const field of fields)
      for (const [name, declared] of Object.entries(manifest[field] ?? {})) {
        if (declared.startsWith("catalog:") && declared !== "catalog:")
          throw new Error(
            `Named catalogs need audit support: ${path}: ${name}`,
          );
        const effective = declared === "catalog:" ? catalog[name] : declared;
        if (!effective)
          throw new Error(`Unresolved catalog entry: ${path}: ${name}`);
        const locked = lock.importers[importer]?.[field]?.[name];
        if (
          lock.importers[importer] &&
          field !== "peerDependencies" &&
          !/^(file|link|workspace):/.test(declared)
        ) {
          if (!locked?.version || locked.specifier !== declared)
            throw new Error(`Manifest/lockfile drift: ${path}: ${name}`);
        }
        declarations.push({
          name,
          path,
          field,
          declared,
          effective,
          resolved: locked?.version?.split("(")[0] ?? null,
          kind: /^(file|link|workspace):/.test(declared)
            ? "local artifact"
            : field === "peerDependencies"
              ? "peer contract"
              : lock.importers[importer]
                ? "workspace"
                : "standalone fixture",
        });
      }
  }
  for (const importer of Object.keys(lock.importers)) {
    const path = importer === "." ? "package.json" : `${importer}/package.json`;
    if (!manifests.includes(path))
      throw new Error(`Lockfile importer has no manifest: ${path}`);
  }
  const actions = {},
    nodeLines = [];
  for (const path of files.filter((path) =>
    /^\.github\/workflows\/.*\.ya?ml$/.test(path),
  )) {
    const text = readFile(path);
    for (const match of text.matchAll(
      /\buses:\s*([\w.-]+\/[\w./-]+)@([^\s#]+)/g,
    ))
      (actions[match[1]] ??= []).push({ ref: unquote(match[2]), path });
    for (const match of text.matchAll(/\bnode-version:\s*["']?([^\s"']+)/g))
      nodeLines.push({ path, version: match[1] });
  }
  const replit = readFile(".replit");
  const packageManager = JSON.parse(readFile("package.json")).packageManager;
  const unusedCatalog = Object.entries(catalog).filter(
    ([name]) =>
      !declarations.some((d) => d.name === name && d.declared === "catalog:"),
  );
  return {
    declarations,
    localPackages,
    locked: lock.packages,
    catalog,
    unusedCatalog,
    overrides,
    actions,
    nodeLines,
    packageManager,
    replitNode: replit.match(/"nodejs-([^"\s]+)"/)?.[1],
    replitPython: replit.match(/"python-([^"\s]+)"/)?.[1],
    nixChannel: replit.match(/channel\s*=\s*"([^"]+)"/)?.[1],
    pythonFiles: files.filter((path) => path.endsWith(".py")),
    sources: unique([
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      ".replit",
      ...manifests,
      ...Object.values(actions)
        .flat()
        .map((a) => a.path),
    ]),
  };
}
export function selectNpmRelease(data, now = Date.now()) {
  const stable = Object.keys(data.versions ?? {})
    .filter(
      (v) =>
        isStable(v) &&
        !data.versions[v].deprecated &&
        Date.parse(data.time?.[v]) <= now,
    )
    .sort(compareVersions);
  const latest = stable.at(-1);
  if (!latest) throw new Error("No dated, nondeprecated stable release found");
  return {
    latest,
    latestTag: data["dist-tags"]?.latest ?? null,
    published: data.time[latest],
    engines: data.versions[latest].engines ?? {},
    stableByMajor: Object.fromEntries(stable.map((v) => [v.split(".")[0], v])),
    matureByMajor: Object.fromEntries(
      stable
        .filter((v) => Date.parse(data.time[v]) <= now - 86_400_000)
        .map((v) => [v.split(".")[0], v]),
    ),
  };
}
async function fetchText(url) {
  const headers = {
    "User-Agent": "bpmn-technology-audit",
    Accept: "application/json",
  };
  // Never send the GitHub credential to a registry or HTML source.
  if (new URL(url).hostname === "api.github.com" && process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  let error;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (caught) {
      error = caught;
    }
  }
  throw new Error(`${url}: ${error.message}`);
}
const fetchJson = async (url) => JSON.parse(await fetchText(url));
export async function audit(
  inventory,
  getJson = fetchJson,
  getText = fetchText,
) {
  const errors = [],
    npm = {},
    actions = {};
  const capture = async (label, operation) => {
    try {
      return await operation();
    } catch (error) {
      errors.push(`${label}: ${error.message}`);
      return null;
    }
  };
  const names = unique([
    ...Object.keys(inventory.locked),
    ...Object.keys(inventory.catalog),
    ...inventory.declarations
      .filter((d) => d.kind !== "local artifact")
      .map((d) => d.name),
    "pnpm",
  ]);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (cursor < names.length) {
        const name = names[cursor++],
          source = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
        npm[name] = await capture(name, async () => ({
          ...selectNpmRelease(await getJson(source)),
          source,
        }));
      }
    }),
  );
  for (const name of Object.keys(inventory.actions).sort()) {
    const source = `https://api.github.com/repos/${name.split("/").slice(0, 2).join("/")}/releases/latest`;
    actions[name] = await capture(name, async () => {
      const data = await getJson(source);
      if (
        data.draft ||
        data.prerelease ||
        !isStable(data.tag_name?.replace(/^v/, ""))
      )
        throw new Error("Latest release is not stable");
      return {
        latest: data.tag_name,
        published: data.published_at,
        source: data.html_url,
      };
    });
  }
  const node = await capture("Node.js", async () => {
    const releases = (await getJson("https://nodejs.org/dist/index.json"))
      .filter((r) => isStable(r.version.replace(/^v/, "")))
      .sort((a, b) => compareVersions(b.version, a.version));
    const selected = releases.find((r) =>
      r.version.startsWith(`v${inventory.replitNode}.`),
    );
    if (!selected || !releases.find((r) => r.lts))
      throw new Error("Missing current or LTS release");
    return {
      latest: releases[0].version,
      lts: releases.find((r) => r.lts).version,
      selectedLine: selected.version,
      source: "https://nodejs.org/dist/index.json",
    };
  });
  const python = await capture("Python", async () => {
    const source = "https://www.python.org/downloads/";
    const html = await getText(source);
    const versions = unique(
      [...html.matchAll(/>Python (3\.\d+\.\d+)</g)].map((m) => m[1]),
    ).sort(compareVersions);
    if (!versions.length) throw new Error("Stable release list not found");
    return {
      latest: versions.at(-1),
      selectedLine:
        versions
          .filter((v) => v.startsWith(`${inventory.replitPython}.`))
          .at(-1) ?? null,
      source,
    };
  });
  return {
    generatedAt: new Date().toISOString(),
    complete: errors.length === 0,
    errors,
    inventory,
    npm: Object.fromEntries(
      Object.entries(npm).sort(([a], [b]) => a.localeCompare(b)),
    ),
    actions,
    node,
    python,
  };
}
const cell = (v) =>
  String(v ?? "UNKNOWN")
    .replaceAll("|", "&#124;")
    .replace(/[\r\n]/g, " ");
function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
    "",
  ];
}
export function formatReport(report) {
  const i = report.inventory,
    latest = (name) => report.npm[name]?.latest ?? "UNKNOWN";
  const link = (name) =>
    `[${name}](https://registry.npmjs.org/${encodeURIComponent(name)})`;
  return [
    "# Technology version evidence",
    "",
    `Retrieved: ${report.generatedAt}`,
    "",
    `Source commit: ${report.sourceCommit ?? "fixture"}; inventory inputs: ${report.sourceDirty ? "working tree contains local edits" : "clean or test fixture"}; completeness: **${report.complete ? "PASS" : "INCOMPLETE"}**.`,
    "",
    "Generated by `pnpm run technology:check`. Application versions come from the working copy of the tracked lockfile, not the local installation. Every registry identity in the lockfile is included, including optional platform packages. This does not mean every package ships in the browser.",
    "",
    "Latest stable is the highest dated, nondeprecated x.y.z release. Prereleases and future publication dates are excluded. JSON records also include the npm latest tag, Node engine requirements, and publication dates. Latest does not prove compatibility. Sources are publisher registry records, the Node release index, Python release page, and action repositories.",
    "",
    "## Runtimes",
    "",
    ...table(
      ["Technology", "Declared", "Latest stable", "Supported-line reference"],
      [
        [
          "Node.js",
          `Replit ${i.replitNode}; CI ${unique(i.nodeLines.map((r) => r.version)).join(", ")}`,
          `[${report.node?.latest ?? "UNKNOWN"}](https://nodejs.org/dist/index.json)`,
          `LTS ${report.node?.lts ?? "UNKNOWN"}; selected ${report.node?.selectedLine ?? "UNKNOWN"}`,
        ],
        [
          "pnpm",
          i.packageManager,
          `${link("pnpm")}: ${latest("pnpm")}`,
          report.npm.pnpm?.stableByMajor[
            i.packageManager.split("@")[1].split(".")[0]
          ],
        ],
        [
          "Python tooling",
          `Replit ${i.replitPython}`,
          `[${report.python?.latest ?? "UNKNOWN"}](https://www.python.org/downloads/)`,
          report.python?.selectedLine,
        ],
        [
          "Nix channel",
          i.nixChannel,
          "Replit-managed availability",
          "Exact system package versions require live host inspection",
        ],
      ],
    ),
    "## Every dependency declaration",
    "",
    "A range, peer contract, or standalone fixture is not an exact installed version. Smoke fixtures are installed separately and have no committed lockfile.",
    "",
    ...table(
      [
        "Package",
        "Manifest / role",
        "Declared range",
        "Locked workspace version",
        "Latest stable",
      ],
      i.declarations.map((d) => [
        d.kind === "local artifact" ? d.name : link(d.name),
        `${d.path}: ${d.field} (${d.kind})`,
        d.declared === "catalog:" ? `catalog: ${d.effective}` : d.declared,
        d.resolved ?? "Not locked here",
        d.kind === "local artifact" ? "Local project artifact" : latest(d.name),
      ]),
    ),
    "## Catalog entries not consumed through catalog:",
    "",
    ...table(
      ["Package", "Catalog declaration", "Latest stable"],
      i.unusedCatalog.map(([name, range]) => [link(name), range, latest(name)]),
    ),
    "These entries do not establish application use. A package may still occur transitively or be declared without its catalog entry.",
    "",
    "## GitHub Actions",
    "",
    ...table(
      ["Action", "Configured references", "Latest stable release"],
      Object.entries(i.actions)
        .sort()
        .map(([name, refs]) => [
          name,
          unique(refs.map((r) => r.ref)).join(", "),
          report.actions[name]
            ? `[${report.actions[name].latest}](${report.actions[name].source})`
            : "UNKNOWN",
        ]),
    ),
    "Major tags float within their major. Exact executed action SHAs belong to specific workflow runs.",
    "",
    "## Update plan for this snapshot",
    "",
    `- pnpm: review ${i.packageManager} against same-major candidate ${report.npm.pnpm?.matureByMajor[i.packageManager.split("@")[1].split(".")[0]] ?? "UNKNOWN"} after the 24-hour release maturity window. Change packageManager, install with that exact pnpm, and commit its regenerated lockfile together.`,
    `- Node: retain the selected compatibility major until a migration passes. Bring local and Replit runtimes to ${report.node?.selectedLine ?? "UNKNOWN"} when each host supports it; the latest upstream LTS is ${report.node?.lts ?? "UNKNOWN"}.`,
    `- Python: Replit offers the ${i.replitPython} module; its upstream patch reference is ${report.python?.selectedLine ?? "UNKNOWN"}. Evaluate ${report.python?.latest ?? "UNKNOWN"} separately against skill scripts and available Replit modules.`,
    "- GitHub Actions: Dependabot prepares version PRs. Inspect major runtime changes before merging.",
    "- npm: use the candidates below through Dependabot, retain the maturity window, regenerate with the declared pnpm, and require CI before merging. A registry latest tag can differ from the highest stable release; inspect that difference before selecting a version.",
    "",
    ...table(
      ["Direct workspace package", "Locked", "Latest stable", "Disposition"],
      i.declarations
        .filter(
          (d) =>
            d.kind === "workspace" &&
            report.npm[d.name] &&
            isStable(d.resolved) &&
            compareVersions(latest(d.name), d.resolved) > 0,
        )
        .filter(
          (d, index, rows) =>
            rows.findIndex(
              (other) => other.name === d.name && other.resolved === d.resolved,
            ) === index,
        )
        .map((d) => [
          link(d.name),
          d.resolved,
          latest(d.name),
          d.name === "mermaid"
            ? "Coordinate app, fixture, CDN, tests, and compatibility evidence"
            : d.resolved.split(".")[0] !== latest(d.name).split(".")[0]
              ? "Separate major migration PR"
              : "Grouped dependency PR and validation",
        ]),
    ),
    "## Complete locked npm package graph",
    "",
    `${Object.keys(i.locked).length} package names; ${Object.values(i.locked).flat().length} versions. Includes direct, transitive, test, development, and optional platform dependencies. Update transitives through their parents and lockfile, not by independently replacing every row with its latest major.`,
    "",
    ...table(
      ["Package", "All locked versions", "Latest stable"],
      Object.entries(i.locked)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, versions]) => [
          link(name),
          unique(versions).join(", "),
          latest(name),
        ]),
    ),
    "## Overrides and exclusions",
    "",
    ...table(["Selector", "Override"], Object.entries(i.overrides)),
    "A dash excludes a platform dependency. Review security overrides and native-platform exclusions when their parents change.",
    "",
    "## Local project packages",
    "",
    ...table(
      ["Manifest", "Package", "Project version"],
      i.localPackages.map((p) => [p.path, p.name, p.version]),
    ),
    "Project and skill package versions are locally controlled releases, not upstream technology versions.",
    "",
    "## Python source inventory",
    "",
    ...i.pythonFiles.map((p) => `- ${p}`),
    "",
    "## Evidence gaps",
    "",
    ...(report.errors.length
      ? report.errors.map((e) => `- ${e}`)
      : ["No release lookup failures."]),
    "",
    "See [technology-inventory.md](technology-inventory.md) for host observations, standards, platform boundaries, priorities, and the maintenance procedure.",
    "",
  ].join("\n");
}
