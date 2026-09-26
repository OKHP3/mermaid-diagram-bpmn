# Technology inventory and update maintenance

Reviewed: September 26, 2026 (America/Chicago). Retrieval timestamps use UTC.
Baseline before this refresh: `bdb952daea855ee13d231ac119da5fe3cc26bdff`, verified against GitHub main and Replit.

The complete version list is [technology-versions.md](technology-versions.md), with structured evidence in [technology-versions.json](technology-versions.json). The generated report records its manifest, lockfile, runtime, action, and Python coverage along with the retrieval timestamp and lookup result. Each package's latest-version claim links to its publisher's npm registry record.

**Confirmed:** This solution comprises a static React/TypeScript application, a Mermaid plugin source package, and portable process skills. Node runs builds and maintenance scripts. Python supports repository and skill maintenance, not a web backend. JavaScript, HTML, CSS, SVG, and browser APIs support the application. There is no Python application or pip manifest. Express and Drizzle are not application dependencies; the unused Drizzle catalog declaration does not establish runtime use.

## Main technologies and available releases

These are snapshot observations, not upgrades performed by this change. npm comparisons come from the [registry evidence](technology-versions.json). The generated report contains every direct, peer, fixture, transitive, action, and override entry.

| Technology                  | Repository / locked version | Latest stable found                       | Treatment                                                             |
| --------------------------- | --------------------------- | ----------------------------------------- | --------------------------------------------------------------------- |
| TypeScript                  | 7.0.2                       | 7.0.2                                     | Current                                                               |
| React / React DOM           | 19.3.0 / 19.3.0             | 19.3.0 / 19.3.0                           | Current                                                               |
| Vite                        | 8.3.0                       | 8.3.1                                     | Hold until the 24-hour release-maturity window passes                  |
| Vite React plugin           | 6.1.1                       | 6.1.1                                     | Current                                                               |
| Tailwind CSS / Vite adapter | 4.3.3 / 4.3.3               | 4.3.3 / 4.3.3                             | Current                                                               |
| Vitest                      | 5.0.2                       | 5.0.2                                     | Major update; all required checks passed                              |
| Playwright                  | 1.63.0                      | 1.63.0                                    | Current; test all three engines                                       |
| Mermaid                     | 11.17.2                     | 12.0.0                                    | Stay on 11.x until compatibility migration passes                     |
| lucide-react                | 1.48.0                      | 1.48.0                                    | Current; visual checks passed                                         |
| wouter                      | 3.11.0                      | 3.11.1                                    | Hold until the 24-hour release-maturity window passes                  |
| happy-dom                   | 20.14.5                     | 20.14.5                                   | Current                                                               |
| tsx                         | 4.23.15                     | 4.23.15                                   | Current                                                               |
| Prettier                    | 3.9.9                       | 3.9.9                                     | Current                                                               |
| `@types/node`               | 26.6.2                      | 26.6.3                                    | Hold until the 24-hour release-maturity window passes                  |
| Node.js                     | Major 24 in CI and Replit   | 26.10.0 Current; 24.21.0 LTS              | Follow Node 24 patches; review new LTS major before migration         |
| pnpm                        | 10.26.1 declared            | Highest stable 12.7.0; supported 10.34.5  | Keep declared major until tested; review major migration separately   |
| Python                      | Replit module 3.11          | 3.14.7; 3.11 line 3.11.16                 | Host/tooling maintenance                                              |

The pnpm highest release and npm default tag differ. The audit records both, filters prereleases and deprecated releases, and computes candidates at least 24 hours old. A new version does not establish compatibility. Runtime sources: [Node release index](https://nodejs.org/dist/index.json), [Python releases](https://www.python.org/downloads/), [pnpm registry](https://registry.npmjs.org/pnpm).

Patch candidates published inside the 24-hour window remain unpinned until they mature; pnpm enforces this policy during lockfile resolution. Do not bypass `minimumReleaseAge` to consume a newly published release.

## Actual host observations

| Surface                      | Node                      | pnpm                           | Python         | Other observed tooling                                                           |
| ---------------------------- | ------------------------- | ------------------------------ | -------------- | -------------------------------------------------------------------------------- |
| Windows, this session        | 24.11.1                   | 11.25.0                        | 3.14.0rc1      | Git 2.55.0.windows.5; npm 11.6.2; GitHub CLI 2.96.0                              |
| Replit shell                 | 24.13.0                   | 10.26.1                        | 3.11.14        | Git 2.50.1; Bash 5.2.37; Nix 2.31.1 (Determinate Nix 3.11.2); Ubuntu 24.04.4 LTS |
| GitHub Actions configuration | 24, floating within major | Root packageManager            | Not configured | ubuntu-latest; action references in generated report                             |

**Confirmed:** Replit reported commit `51ef371` and a clean working tree. The GitHub connector reported the same full main SHA. Windows was clean before this audit work. **Unknown:** exact runtime/runner-image versions of a new hosted CI run; this change has not run in hosted CI.

The local pnpm command differs from the declaration. Use the repository's exact pnpm before regenerating its lockfile. Windows Python is a release candidate, not stable. This change does not alter globally installed tools. npm and GitHub CLI are workstation utilities, not application dependencies. Git upstream is [2.55.0](https://git-scm.com/install/), and Windows matches the [current Windows release](https://github.com/git-for-windows/git/releases/latest).

Workstation release references are [npm 12.0.2](https://registry.npmjs.org/npm/12.0.2) and [GitHub CLI 2.101.0](https://github.com/cli/cli/releases/tag/v2.101.0). npm 12 requires Node 24.15.0 or later within Node 24, so the observed hosts need a Node patch upgrade first. Replit's Determinate Nix 3.11.2 is behind [3.22.5, based on upstream Nix 2.35.2](https://github.com/DeterminateSystems/nix-src/releases/tag/v3.22.5); availability in the Replit environment remains provider-controlled. These utilities should be reviewed with monthly host maintenance.

## Languages, standards, services, and platform dependencies

| Technology                     | In-place contract                                              | Current reference / version treatment                                                                                                                                                      |
| ------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| JavaScript / ECMAScript        | ESM scripts; TypeScript target and library ES2022              | [ECMAScript 2026, edition 17](https://ecma-international.org/publications-and-standards/standards/ecma-262/). Raising the target changes browser requirements; it is not a package update. |
| HTML and browser APIs          | HTML doctype; DOM, clipboard, download, URL, storage, SVG APIs | [HTML Living Standard](https://html.spec.whatwg.org/); browser-managed, no pinned application version                                                                                      |
| CSS                            | Native CSS, custom properties, Tailwind v4 directives          | [CSS Snapshot 2026](https://www.w3.org/TR/css/); modules have separate maturity levels                                                                                                     |
| SVG                            | Native React and imperative SVG paths                          | [SVG 1.1 Recommendation](https://www.w3.org/TR/SVG11/); [SVG 2 is a Candidate Recommendation](https://www.w3.org/TR/SVG2/), not a package upgrade                                          |
| JSON                           | Manifests, evidence, application data                          | [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)                                                                                                                                         |
| YAML                           | Workflows, workspace, fixtures; limited custom parser          | [YAML 1.2.2](https://yaml.org/spec/1.2.2/); no repository-wide schema pin; custom parser is not a full implementation                                                                      |
| TOML                           | Replit runtime and artifact registration                       | [TOML 1.1.0](https://toml.io/en/); Replit parser support is host-controlled                                                                                                                |
| Markdown                       | Documentation and skills                                       | [GitHub Flavored Markdown 0.29-gfm](https://github.github.com/gfm/); files do not pin a parser edition                                                                                     |
| BPMN                           | Descriptive subset; project bpmn-beta DSL                      | [OMG BPMN 2.0.2](https://www.omg.org/spec/BPMN); no executable/full-conformance claim                                                                                                      |
| Agent Skills / BP-SKILL / PNS  | Repository-owned Markdown, YAML, metadata, generators          | [Agent Skills](https://agentskills.io/specification) is a living format; local package versions are in the generated inventory                                                             |
| Actions / Pages / Dependabot   | Hosted CI, deployment, dependency PRs                          | Vendor-managed services; action references inventoried separately                                                                                                                          |
| Replit                         | Development environment, modules, artifact registration        | Vendor-managed; verify runtime changes on the actual host                                                                                                                                  |
| Google Fonts                   | CSS2 API: Alfa Slab One, DM Sans, JetBrains Mono               | [API v2](https://developers.google.com/fonts/docs/css2); remote font bytes are service-managed and not pinned                                                                              |
| Google Analytics               | Existing gtag.js script in app/index.html                      | [Google tag](https://developers.google.com/tag-platform/gtagjs); no version pin. Existing exception to the stated production-CDN policy, requiring a separate decision.                    |
| Optional analytics beacon      | VITE_ANALYTICS_ENDPOINT and analytics.ts                       | Operator-selected endpoint; GoatCounter/Plausible examples do not prove an active provider                                                                                                 |
| jsDelivr                       | Example pins Mermaid 11.4.1 and project plugin 0.1.1           | Hosted CDN; coordinate package pins with integration/CDN tests                                                                                                                             |
| Notion development integration | Direct REST; Notion-Version 2022-06-28; no SDK                 | Current API [2026-03-11](https://developers.notion.com/reference/versioning); migration needs integration review. No Notion request was sent.                                              |
| Bash                           | Replit 5.2.37; shell helpers and Linux CI                      | [5.3 stable line](https://www.gnu.org/s/bash/manual/html_node/index.html); patch/backport selection belongs to host maintenance                                                            |
| Nix                            | Replit Nix 2.31.1; stable-25_05 channel                        | Host-managed; upstream release availability does not prove Replit channel support                                                                                                          |
| Ubuntu                         | Replit 24.04.4 LTS; CI ubuntu-latest alias                     | [26.04 LTS](https://documentation.ubuntu.com/release-notes/26.04/) exists; Replit base-image upgrades are provider-controlled                                                              |

Replit declares these browser-test system packages: `glib`, `nspr`, `nss`, `atk`, `xorg.libX11`, `xorg.libXcomposite`, `xorg.libXdamage`, `xorg.libXext`, `xorg.libXfixes`, `xorg.libXrandr`, `libgbm`, `libxkbcommon`, and `alsa-lib`. **Unknown:** exact active versions and latest compatible releases available in Replit's selected channel. No individual versions are pinned, and pkg-config was unavailable. Maintain these together through the host channel and Playwright system-dependency installation. This inventory covers declared identities, not a full operating-system SBOM or exact builds of unversioned services.

The installed Playwright 1.62.1 browser manifest selects Chromium 151.0.7922.34 (revision 1234), Firefox 153.0 (1538), WebKit 26.5 (2336, with OS overrides), and FFmpeg revision 1011. This is manifest evidence, not proof every binary was launched. Track the revisions delivered by the selected Playwright release instead of independently replacing its test browsers.

## Implemented maintenance mechanism

1. **Update proposals:** Dependabot checks workspace npm daily with a one-day cooldown. React and Tailwind are grouped with related packages. Other compatible minor/patch tooling updates share a group; Mermaid and lucide stay separate. Major upgrades need separate review. Actions are checked weekly and grouped. The existing Mermaid-major exclusion remains, with a manual migration path below.
2. **Independent audit:** technology:check discovers tracked manifests, lockfile identities, catalog entries, overrides, and actions. Live release comparisons include a snapshot-specific update plan. It uses Node built-ins and Git without an application install or new dependencies.
3. **Scheduled evidence:** technology-version-audit.yml runs Mondays at 08:30 UTC, relevant PRs, and manual dispatch. It tests the audit, writes a summary, and uploads Markdown/JSON for 30 days. Its read-only GitHub token goes only to GitHub release queries. Lookup failures fail the job and preserve incomplete evidence.
4. **Validation:** audit regression tests also run in normal CI. Existing application, skill, plugin, browser, content, and deployment gates remain. Nothing auto-merges or changes the live app merely because a version exists.

Release lookups share a four-minute deadline. On expiry, in-flight requests are canceled, queued lookups are marked incomplete, and the report is saved with a failure status. The ten-minute workflow timeout leaves time to upload this evidence.

The revised files must reach the default branch before the new schedule behavior/grouping is active. Local validation does not prove hosted execution. Dependabot was already configured in the baseline; this change improves grouping and audit coverage.

GitHub documents [pnpm catalogs](https://github.blog/changelog/2025-02-04-dependabot-now-supports-pnpm-workspace-catalogs-ga/) and currently lists [pnpm through v10](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories). Validate updater support before jumping to pnpm 12. The [options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) governs grouping, cooldown, and ignores.

## Gaps outside Dependabot and required follow-through

Owner: repository maintainer. Review the weekly report and use one maintenance PR per compatibility boundary. Every exception should record current/candidate versions, reason for holding, required checks, and next review date. Detection and supported dependency PRs are automated; approval, runtime migrations, and rollout are deliberate steps.

| Surface                                | Follow-through                                                                                                                                                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| pnpm                                   | Evaluate same-major 10.34.5 first. Update packageManager, use that exact pnpm, regenerate/commit its lockfile, and test Linux plus Windows. Major migrations must confirm updater and build-script/lockfile support.                                   |
| Node                                   | CI's 24 selector tracks that line. Update local Node and supported Replit runtime, then verify node --version. New LTS majors need all workflow selectors and .replit updated together after tests; Current is not an automatic LTS migration trigger. |
| Python                                 | Evaluate 3.11.16 for Replit and stable 3.14.7 locally. Verify Replit module availability and run skill Python tests before a line change. No pip manifest is needed for standard-library tooling.                                                      |
| Mermaid                                | Update app pin, standalone smoke fixture, CDN example, integration assertions, compatibility record, release manifest, and peer claims together. Require real host, packed-plugin, strict CDN, and visual checks for either 11.x or 12.x.              |
| Standalone smoke fixture               | It contains a generated local tarball reference and is outside the workspace. Coordinate happy-dom/Mermaid declarations in the app PR and run plugin:smoke; do not ask Dependabot to install a missing tarball.                                        |
| Transitives / overrides                | Update responsible parents and regenerate with pnpm. Review security purpose, licenses, and native exclusions. Do not force every transitive package to its latest major independently.                                                                |
| Node types                             | Version 26 types accompany Node 24. Review alignment to avoid accepting APIs absent from the runtime. Types do not update Node.                                                                                                                        |
| Host packages / browsers               | Reinstall browsers for the chosen Playwright version; verify Linux libraries and Windows behavior. Replit controls base-image/channel availability. Record actual versions after changes.                                                              |
| Notion / standards / external services | Review release/deprecation notices monthly and after behavior changes. API migrations need targeted checks. Living standards and hosted services are not semver package updates.                                                                       |

## Commands and acceptance

Refresh evidence without updating dependencies:

```sh
pnpm run technology:test
pnpm run technology:check -- --output docs/technology-versions.md --json docs/technology-versions.json
```

GitHub API rate limits may require a locally supplied GITHUB_TOKEN; never commit it. CI supplies a built-in read token. Resolve failed queries and rerun instead of replacing UNKNOWN with a guess.

The audit also works directly with Node, even when local pnpm and the installed dependency tree disagree:

```sh
node --test scripts/technology-inventory.test.mjs
node scripts/check-technology-versions.mjs --output docs/technology-versions.md --json docs/technology-versions.json
```

During this review, local pnpm 11 attempted an automatic dependency reinstall before running a formatting command and stopped with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`. The operation was not forced. Validation and formatting used Node directly, and dependency manifests and lockfile versions were not upgraded.

For actual update PRs, use the declared pnpm and run the existing gates:

```sh
pnpm install --frozen-lockfile
pnpm run technology:test
pnpm run typecheck
pnpm --filter @workspace/mermaid-diagram-bpmn run test
pnpm run skill:test
pnpm run skill:validate
pnpm run skill:validate:agents
pnpm run check:generated
pnpm run eval:run
pnpm run check:release-gates -- --output .local/release-gate-report.json
pnpm run check:content
pnpm run check:version-status
pnpm run manifest:check
pnpm run check:browser-cdn
pnpm run plugin:smoke
pnpm run build
pnpm --filter @workspace/mermaid-diagram-bpmn run test:e2e
pnpm --filter @workspace/mermaid-diagram-bpmn run test:e2e:visual
```

Require CI for the exact PR commit, including Linux browser/visual jobs. After an approved merge, verify Pages and the live source SHA, then bring local and Replit copies forward while preserving uncommitted work. Failing upgrades stay open for remediation; retain the last passing lockfile and use a normal revert PR for released regressions.

## Local validation of this maintenance change

- Audit regression suite: 10 passed, covering lockfile extraction, catalog resolution, fixture boundaries, release selection, explicit lookup failures, and a stalled-provider deadline with partial evidence retained.
- Live audit at 2026-09-19T02:05:16Z: 332 npm registry lookups plus seven action release queries and Node/Python release checks; zero lookup failures.
- Content validation, formatting checks for the new audit and configuration files, and `git diff --check`: passed. Git reported only its normal Windows line-ending conversion notices.
- Application dependencies, application source, and the lockfile were not upgraded. Full application/browser suites and hosted CI were not run for this maintenance-only change.
- Replit inspection was read-only; its shell was returned to an idle prompt. No Replit runtime or system package was installed or changed.

## Evidence boundary

| Claim                               | Tier                              | Evidence                                     | Remaining check                    |
| ----------------------------------- | --------------------------------- | -------------------------------------------- | ---------------------------------- |
| Version identities and ranges       | Confirmed                         | Manifests, lockfile, configuration scan      | Refresh after changes              |
| Latest releases                     | Confirmed at retrieval            | Publisher URLs/timestamps in generated files | Refresh before choosing candidates |
| Candidates work with this app       | Proposal                          | Version comparison only                      | Per-upgrade validation             |
| Exact service/native-library builds | Unknown where unpinned/unobserved | Platform boundaries above                    | Provider/live-host inventory       |
| Revised automation active           | Not yet verified                  | Local implementation                         | Merge and run once on GitHub       |

Next action: land the maintenance files, run the hosted audit once, and process candidates through CI and deployment checks.

## September 20 dependency convergence

PRs #64-69 are incorporated together with compatibility repairs. The current
manifest and regenerated lockfile govern versions: React 19.3, Vite 8.3,
Lucide 1.47, Mermaid 11.17.2, and the reviewed tooling/CSS updates. The removed
Lucide GitHub brand export is replaced by a code icon on the same labeled link.
The Mermaid source target, packed fixture, and pinned CDN example move together
and retain the complete integration and three-browser checks. Earlier tables
above remain the dated September 18 inventory. This does not publish a new npm
plugin version or adopt Mermaid 12.
