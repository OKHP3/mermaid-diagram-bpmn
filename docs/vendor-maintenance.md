# Vendor version maintenance

The exact current dependency declarations and lockfiles are authoritative.
[Technology versions](technology-versions.md) contains the complete generated
inventory, including current/latest comparisons, transitive packages, actions,
and source links. Dated sections of the older inventory and compatibility
documents remain historical evidence.

## Automated update path

The **Coordinated dependency updates** workflow runs daily at 09:15 UTC and can
also be dispatched manually. It maintains one candidate branch and review PR.

1. Read publisher registry metadata and select the highest stable, nondeprecated
   release at least 24 hours old. Alpha, beta, RC, undated, and future releases
   are rejected. A failed lookup fails the candidate instead of guessing.
2. Pin active workspace and standalone-fixture dependencies exactly. Unused
   catalog entries and local tarball references are preserved. Security
   overrides advance within their existing major; transitive dependencies
   continue to follow their parent packages' supported constraints.
3. Select the current stable Node LTS and Python bugfix release from their
   official release indexes. CI reads `.node-version` and `.python-version`.
   Node types follow that LTS major. The selected pnpm version is exact in
   `packageManager` and is installed before regenerating lockfiles.
4. Synchronize Mermaid's source target, exact source-package peer declaration,
   fixture, CDN example/tests, current documentation, and release manifest.
   Historical evidence is excluded from synchronization and covered by tests.
5. Install and build the packed-plugin fixture to regenerate its isolated
   lockfile, then commit the candidate and workspace lockfile. The fixture's
   local-tarball lockfile remains ignored under the existing repository policy;
   its direct vendor versions are exact and every CI run rebuilds the fixture.
   Explicitly dispatch full CI for that
   exact SHA, including security/license gates, unit tests, Python maintenance
   tests, packaged-plugin smoke, Chromium/Firefox/WebKit, and visual comparison.
6. Open/update the review PR only if CI succeeds. Failed unchanged candidates
   are retried on the next run. Conflicting branches fail for maintainer review;
   history is never force-pushed. No update is automatically merged or published
   to npm. Merging the reviewed PR triggers the normal validated Pages workflow.

The **Mermaid release detection** workflow runs hourly at minute 23 and can be
manually dispatched. It compares stable, dated, nondeprecated npm releases with
matching official `mermaid@X.Y.Z` GitHub releases, excluding tiny-package tags.
Its artifact and job summary report both newly detected and eligible versions.
A newly published release is visible immediately without bypassing the 24-hour
maturity window. GitHub scheduled jobs may be delayed; cadence is not a guarantee
of exact execution time.

Once eligible, a version newer than both main and the existing candidate
explicitly dispatches the coordinated pipeline above. An existing candidate
avoids repeated hourly dispatches; the daily pipeline retries failed unchanged
candidates. Missing publisher metadata fails detection. Detection never edits
pins, proves compatibility, merges or deploys by itself. Use `pnpm run
vendor:watch` for the same read-only check locally; `--output <path>` retains JSON.

On November 3, 2026 this check detected Mermaid 12.3.0 from both publishers.
The later npm publication timestamp was 13:18:31.144 UTC, making it eligible on
November 4 at 13:18:31.144 UTC (7:18 a.m. Central). This is detection evidence,
not a claim that 12.3.0 passed the adapter compatibility suite.

Dependabot owns GitHub Actions version updates. Its normal npm version updater
is replaced by this coordinated workflow so it cannot split the Mermaid pin
from its integration files. GitHub security alerts and security updates remain
separate; the release gate also audits dependencies on each CI run.

GitHub's built-in token can dispatch workflows explicitly. PR-triggered runs
created by that token may require a maintainer to select **Approve workflows to
run**; they are additional to the explicit CI already linked in the PR. The
repository must allow Actions to create pull requests. The updater uses scoped
contents, pull-request, and Actions write permissions and does not approve PRs.

## Supported-runtime exceptions, reviewed November 2, 2026

| Component | Selected policy | Reason / follow-through |
| --- | --- | --- |
| pnpm | Latest stable 11.x (11.28.10 at review) | pnpm 12.17.0 is newer, but its two-document lockfile currently prevents GitHub dependency-graph security alerts. Review GitHub support before changing `pnpmMajor` in `.github/vendor-update-policy.json`; test the lock parser and both operating systems. |
| Replit Node | Provider module `nodejs-24`, observed 24.22.1 | Replit Free exposes Node 20/22/24, not 26. Node 24 remains supported LTS and meets Mermaid 12 requirements. CI uses the current LTS, initially 26.13.0. Recheck module availability monthly and after a provider change. |
| Replit Python | Provider module `python-3.11` | Replit exposes modules through 3.13; none is currently in the Python bugfix-support phase. Python is maintenance tooling only. CI tests the current stable Python, initially 3.15.2. Recheck provider availability monthly; do not describe the Replit runtime as upgraded. |
| Fresh releases | Wait 24 hours | At review, Tailwind 4.3.4, plugin-react 6.2.1, and Vitest 5.1.0 were too new. The next eligible daily candidate selects them automatically after maturity and must pass full CI. |
| Host OS, Nix, browsers | Provider/Playwright-managed | Do not independently replace Playwright's browser revisions or claim unobserved native package versions. Reinstall the browsers selected by the pinned Playwright release. |

This is an update proposal system with explicit compatibility gates. A passing
package lookup is not evidence of runtime compatibility, successful deployment,
or publication of a new npm package. Review the exception table monthly and
when a CI run fails; no premium Replit mode is required by this workflow.

Sources: [Mermaid releases](https://github.com/mermaid-js/mermaid/releases),
[Node support](https://nodejs.org/en/about/previous-releases),
[Python support](https://devguide.python.org/versions/),
[GitHub pnpm support limitation](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories),
[GitHub workflow triggers](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

## Local maintenance

### License evidence after the pnpm 11 migration

The release gate scans all workspace dependencies with `licenses list
--recursive --json`. This static application's runtime imports are declared in
`devDependencies`; `--prod` at the workspace root would silently omit them.
Empty or malformed scans fail. The package-manager gate compares the actual
running version with the exact manifest declaration instead of an old constant.

Mermaid bundles `elkjs` under EPL-2.0, an approved weak-copyleft license in this
project's release policy. `khroma@2.1.0` lacks SPDX metadata, but its installed
`license` file is MIT; the gate verifies the reviewed file's SHA-256. Every
production build includes `third-party-notices.txt` with both installed vendor
license texts and upstream source locations. These libraries are unmodified.
For `elkjs@0.12.1`, the publisher declares `EPL-2.0 OR GPL-3.0-or-later`.
The gate selects the already approved EPL-2.0 alternative only for that exact
package, version and expression, and verifies every installed `LICENSE.md`
against SHA-256 `637e81f4a1b6b4079535c499fca05e238cf7605c1ff5b76d60d7da7ce96700c9`.
The installed file matches the publisher's
[release source license](https://github.com/kieler/elkjs/blob/624ae90aa37110033a8af59c5ccbb292708b4317/LICENSE.md)
and [manifest](https://github.com/kieler/elkjs/blob/624ae90aa37110033a8af59c5ccbb292708b4317/package.json).
Changed bytes, versions, missing files and unreviewed expressions still block
release. This does not add GPL-only or AND expressions to the allowed licenses.
Sources: [ELK license](https://github.com/kieler/elkjs/blob/master/LICENSE.md)
and [Khroma license](https://github.com/fabiospampinato/khroma/blob/master/license).

Three Replit Vite tools have missing license metadata. The gate records their
exact reviewed versions separately, and the Vite configuration includes them
only for `serve`, never `build`. This is a development-only exception, not a
license claim. A changed version or any other unknown license blocks the
candidate until reviewed. No blanket `Unknown` allowance is used.

### Commands

Use the exact pnpm in `packageManager`, then run:

```sh
pnpm run vendor:test
pnpm run vendor:update
pnpm install --no-frozen-lockfile
pnpm run plugin:smoke
pnpm run vendor:check
pnpm run technology:check -- --output docs/technology-versions.md --json docs/technology-versions.json
```

Run full CI before merge. On Windows, use `pnpm run plugin:smoke` so child
processes inherit the selected package manager. The plugin declaration-copy
step uses Node APIs and does not require Unix `cp`.

In Replit, prefix these commands with `corepack`: its Nix pnpm 10 launcher was
observed looping during the pnpm 11 migration. Corepack invokes the declared
version directly. Replit's artifact commands and post-merge hook use this path;
the hook sets `CI=true` for unattended replacement of the generated dependency
directory during a package-manager migration. No paid Agent mode is needed.
