# Technology inventory

Snapshot date: 2026-07-13

This inventory covers the checked-in application, workspace packages, build and
test configuration, Replit configuration, and GitHub Actions workflows. The
resolved version is the version installed from `pnpm-lock.yaml`. The latest
version is a stable release reported by the npm registry or the upstream
project release page on the snapshot date.

## Executive summary

The active solution is a client-side React application written in TypeScript,
built with Vite and Tailwind CSS, tested with Vitest, and published as a static
GitHub Pages site. Node.js and pnpm run the workspace and validation scripts.

Python 3.11 is provisioned in `.replit`, but the repository contains no Python
source or Python package manifest. Express and Drizzle are mentioned in older
project notes but are not installed or imported by the current solution.

The foundational upgrade in this change moves the workspace to TypeScript 7,
Vite 8, Vitest 4, Tailwind CSS 4.3, and the React 19.2 release line. The
production build and application test suite pass on the upgraded stack.

## Core technology matrix

| Technology                 | In use now                                                              | Latest stable reference                     | Evidence and notes                                       |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| JavaScript                 | ESM JavaScript in 13 `.mjs` scripts plus browser output from TypeScript | ECMAScript target is intentionally `ES2022` | `package.json`, `app/package.json`, `tsconfig.base.json` |
| TypeScript                 | 7.0.2 resolved, `~7.0.2` declared                                       | 7.0.2                                       | Root and workspace TypeScript compilation                |
| Node.js                    | 24.11.1 on this workstation; Node 24 in Replit and CI                   | 24.18.0 LTS; 26.5.0 current                 | Node 24 is the selected compatibility line               |
| pnpm                       | 10.26.1 (`pnpm@10.26.1` declared in root `package.json`)                | 11.12.0                                     | Workspace package manager and lockfile producer          |
| React                      | 19.2.7                                                                  | 19.2.7                                      | Browser UI and SVG renderer                              |
| React DOM                  | 19.2.7                                                                  | 19.2.7                                      | Browser mount in `app/src/main.tsx`                      |
| Vite                       | 8.1.4                                                                   | 8.1.4                                       | Dev server and production bundler                        |
| Vite React plugin          | 6.0.3                                                                   | 6.0.3                                       | TypeScript JSX transform and React integration           |
| Tailwind CSS               | 4.3.2                                                                   | 4.3.2                                       | CSS utility framework via the Vite plugin                |
| Tailwind Vite plugin       | 4.3.2                                                                   | 4.3.2                                       | `app/vite.config.ts`                                     |
| Tailwind Typography        | 0.5.20                                                                  | 0.5.20                                      | Tailwind plugin dependency                               |
| Routing                    | wouter 3.10.0                                                           | 3.10.0                                      | Client-side routes in `app/src/app.tsx`                  |
| Icons                      | lucide-react 0.545.0                                                    | 1.24.0                                      | UI icon components                                       |
| CSS class composition      | clsx 2.1.1 and tailwind-merge 3.6.0                                     | 2.1.1 and 3.6.0                             | `app/src/lib/utils.ts`                                   |
| ZIP packaging              | fflate 0.8.3 in the browser; archiver 8.0.0 in scripts                  | 0.8.3 and 8.0.0                             | Browser downloads and skill package creation             |
| Unit testing               | Vitest 4.1.10                                                           | 4.1.10                                      | TypeScript and TSX tests                                 |
| React testing              | Testing Library React 16.3.2 and DOM 10.4.1                             | 16.3.2 and 10.4.1                           | Renderer tests                                           |
| Test DOM support           | happy-dom 20.10.6                                                       | 20.10.6                                     | Installed test dependency                                |
| TypeScript script runner   | tsx 4.23.0                                                              | 4.23.1                                      | 4.23.1 is within the 24-hour maturity window             |
| Static hosting             | GitHub Pages                                                            | Current platform service                    | `.github/workflows/deploy-gh-pages.yml`                  |
| CI automation              | GitHub Actions                                                          | Current action releases listed below        | Deployment and audit workflows                           |
| Replit development plugins | cartographer 0.5.5, dev-banner 0.1.2, runtime-error-modal 0.0.6         | 0.6.0, 0.1.2, 0.0.6                         | Development-only Vite integration                        |
| Python                     | 3.11 provisioned by Replit only                                         | 3.14.6                                      | No `.py` files or Python dependency manifest found       |

### Current GitHub Actions versions

| Action                          | Workflow reference | Latest stable release |
| ------------------------------- | ------------------ | --------------------- |
| `actions/checkout`              | `v7`               | `v7.0.0`              |
| `pnpm/action-setup`             | `v6`               | `v6.0.8`              |
| `actions/setup-node`            | `v6`               | `v6.4.0`              |
| `actions/upload-pages-artifact` | `v5`               | `v5.0.0`              |
| `actions/deploy-pages`          | `v5`               | `v5.0.0`              |

Dependabot is configured to propose GitHub Actions updates for review.

## Direct npm package inventory

These are all direct packages declared in the root, `app`, or `scripts`
workspace manifests. Packages below are development dependencies unless noted.
The list includes the current UI starter packages even where a source import
was not found. Keeping them visible makes cleanup or future use an explicit
decision.

### Root workspace

| Package                                                | Resolved | Latest stable |
| ------------------------------------------------------ | -------: | ------------: |
| [prettier](https://www.npmjs.com/package/prettier)     |    3.9.5 |         3.9.5 |
| [typescript](https://www.npmjs.com/package/typescript) |    7.0.2 |         7.0.2 |

### Application workspace

| Package                                                                                                          | Resolved | Latest stable |
| ---------------------------------------------------------------------------------------------------------------- | -------: | ------------: |
| [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers)                                         |   3.10.0 |         5.4.0 |
| [@radix-ui/react-accordion](https://www.npmjs.com/package/@radix-ui/react-accordion)                             |   1.2.12 |        1.2.16 |
| [@radix-ui/react-alert-dialog](https://www.npmjs.com/package/@radix-ui/react-alert-dialog)                       |   1.1.15 |        1.1.19 |
| [@radix-ui/react-aspect-ratio](https://www.npmjs.com/package/@radix-ui/react-aspect-ratio)                       |    1.1.8 |        1.1.11 |
| [@radix-ui/react-avatar](https://www.npmjs.com/package/@radix-ui/react-avatar)                                   |   1.1.11 |         1.2.2 |
| [@radix-ui/react-checkbox](https://www.npmjs.com/package/@radix-ui/react-checkbox)                               |    1.3.3 |         1.3.7 |
| [@radix-ui/react-collapsible](https://www.npmjs.com/package/@radix-ui/react-collapsible)                         |   1.1.12 |        1.1.16 |
| [@radix-ui/react-context-menu](https://www.npmjs.com/package/@radix-ui/react-context-menu)                       |    2.3.1 |         2.3.3 |
| [@radix-ui/react-dialog](https://www.npmjs.com/package/@radix-ui/react-dialog)                                   |   1.1.15 |        1.1.19 |
| [@radix-ui/react-dropdown-menu](https://www.npmjs.com/package/@radix-ui/react-dropdown-menu)                     |   2.1.16 |        2.1.20 |
| [@radix-ui/react-hover-card](https://www.npmjs.com/package/@radix-ui/react-hover-card)                           |   1.1.15 |        1.1.19 |
| [@radix-ui/react-label](https://www.npmjs.com/package/@radix-ui/react-label)                                     |    2.1.8 |        2.1.11 |
| [@radix-ui/react-menubar](https://www.npmjs.com/package/@radix-ui/react-menubar)                                 |   1.1.16 |        1.1.20 |
| [@radix-ui/react-navigation-menu](https://www.npmjs.com/package/@radix-ui/react-navigation-menu)                 |   1.2.14 |        1.2.18 |
| [@radix-ui/react-popover](https://www.npmjs.com/package/@radix-ui/react-popover)                                 |   1.1.15 |        1.1.19 |
| [@radix-ui/react-progress](https://www.npmjs.com/package/@radix-ui/react-progress)                               |    1.1.8 |        1.1.12 |
| [@radix-ui/react-radio-group](https://www.npmjs.com/package/@radix-ui/react-radio-group)                         |    1.3.8 |         1.4.3 |
| [@radix-ui/react-scroll-area](https://www.npmjs.com/package/@radix-ui/react-scroll-area)                         |   1.2.10 |        1.2.14 |
| [@radix-ui/react-select](https://www.npmjs.com/package/@radix-ui/react-select)                                   |    2.2.6 |         2.3.3 |
| [@radix-ui/react-separator](https://www.npmjs.com/package/@radix-ui/react-separator)                             |    1.1.8 |        1.1.11 |
| [@radix-ui/react-slider](https://www.npmjs.com/package/@radix-ui/react-slider)                                   |    1.3.6 |         1.4.3 |
| [@radix-ui/react-slot](https://www.npmjs.com/package/@radix-ui/react-slot)                                       |    1.2.4 |         1.3.0 |
| [@radix-ui/react-switch](https://www.npmjs.com/package/@radix-ui/react-switch)                                   |    1.2.6 |         1.3.3 |
| [@radix-ui/react-tabs](https://www.npmjs.com/package/@radix-ui/react-tabs)                                       |   1.1.13 |        1.1.17 |
| [@radix-ui/react-toast](https://www.npmjs.com/package/@radix-ui/react-toast)                                     |   1.2.15 |        1.2.19 |
| [@radix-ui/react-toggle](https://www.npmjs.com/package/@radix-ui/react-toggle)                                   |   1.1.10 |        1.1.14 |
| [@radix-ui/react-toggle-group](https://www.npmjs.com/package/@radix-ui/react-toggle-group)                       |   1.1.11 |        1.1.15 |
| [@radix-ui/react-tooltip](https://www.npmjs.com/package/@radix-ui/react-tooltip)                                 |    1.2.8 |        1.2.12 |
| [@replit/vite-plugin-cartographer](https://www.npmjs.com/package/@replit/vite-plugin-cartographer)               |    0.5.5 |         0.6.0 |
| [@replit/vite-plugin-dev-banner](https://www.npmjs.com/package/@replit/vite-plugin-dev-banner)                   |    0.1.2 |         0.1.2 |
| [@replit/vite-plugin-runtime-error-modal](https://www.npmjs.com/package/@replit/vite-plugin-runtime-error-modal) |    0.0.6 |         0.0.6 |
| [@tailwindcss/typography](https://www.npmjs.com/package/@tailwindcss/typography)                                 |   0.5.19 |        0.5.20 |
| [@tailwindcss/vite](https://www.npmjs.com/package/@tailwindcss/vite)                                             |    4.3.2 |         4.3.2 |
| [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query)                                     |  5.90.21 |       5.101.2 |
| [@testing-library/dom](https://www.npmjs.com/package/@testing-library/dom)                                       |   10.4.1 |        10.4.1 |
| [@testing-library/react](https://www.npmjs.com/package/@testing-library/react)                                   |   16.3.2 |        16.3.2 |
| [@types/node](https://www.npmjs.com/package/@types/node)                                                         |   26.1.1 |        26.1.1 |
| [@types/react](https://www.npmjs.com/package/@types/react)                                                       |  19.2.17 |       19.2.17 |
| [@types/react-dom](https://www.npmjs.com/package/@types/react-dom)                                               |   19.2.3 |        19.2.3 |
| [@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react)                                       |    6.0.3 |         6.0.3 |
| [class-variance-authority](https://www.npmjs.com/package/class-variance-authority)                               |    0.7.1 |         0.7.1 |
| [clsx](https://www.npmjs.com/package/clsx)                                                                       |    2.1.1 |         2.1.1 |
| [cmdk](https://www.npmjs.com/package/cmdk)                                                                       |    1.1.1 |         1.1.1 |
| [date-fns](https://www.npmjs.com/package/date-fns)                                                               |    3.6.0 |         4.4.0 |
| [embla-carousel-react](https://www.npmjs.com/package/embla-carousel-react)                                       |    8.6.0 |         8.6.0 |
| [fflate](https://www.npmjs.com/package/fflate)                                                                   |    0.8.3 |         0.8.3 |
| [framer-motion](https://www.npmjs.com/package/framer-motion)                                                     |  12.40.0 |       12.42.2 |
| [happy-dom](https://www.npmjs.com/package/happy-dom)                                                             |  20.10.6 |       20.10.6 |
| [input-otp](https://www.npmjs.com/package/input-otp)                                                             |    1.4.2 |         1.4.2 |
| [lucide-react](https://www.npmjs.com/package/lucide-react)                                                       |  0.545.0 |        1.24.0 |
| [next-themes](https://www.npmjs.com/package/next-themes)                                                         |    0.4.6 |         0.4.6 |
| [react](https://www.npmjs.com/package/react)                                                                     |   19.2.7 |        19.2.7 |
| [react-day-picker](https://www.npmjs.com/package/react-day-picker)                                               |   9.14.0 |        10.0.1 |
| [react-dom](https://www.npmjs.com/package/react-dom)                                                             |   19.2.7 |        19.2.7 |
| [react-hook-form](https://www.npmjs.com/package/react-hook-form)                                                 |   7.77.0 |        7.81.0 |
| [react-icons](https://www.npmjs.com/package/react-icons)                                                         |    5.6.0 |         5.7.0 |
| [react-resizable-panels](https://www.npmjs.com/package/react-resizable-panels)                                   |    2.1.9 |        4.12.2 |
| [recharts](https://www.npmjs.com/package/recharts)                                                               |   2.15.4 |         3.9.2 |
| [sonner](https://www.npmjs.com/package/sonner)                                                                   |    2.0.7 |         2.0.7 |
| [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)                                                   |    3.6.0 |         3.6.0 |
| [tailwindcss](https://www.npmjs.com/package/tailwindcss)                                                         |    4.3.2 |         4.3.2 |
| [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)                                                   |    1.4.0 |         1.4.0 |
| [vaul](https://www.npmjs.com/package/vaul)                                                                       |    1.1.2 |         1.1.2 |
| [vite](https://www.npmjs.com/package/vite)                                                                       |    8.1.4 |         8.1.4 |
| [vitest](https://www.npmjs.com/package/vitest)                                                                   |   4.1.10 |        4.1.10 |
| [wouter](https://www.npmjs.com/package/wouter)                                                                   |   3.10.0 |        3.10.0 |
| [zod](https://www.npmjs.com/package/zod)                                                                         |    4.4.3 |         4.4.3 |

### Scripts workspace

| Package                                                  | Resolved | Latest stable |
| -------------------------------------------------------- | -------: | ------------: |
| [archiver](https://www.npmjs.com/package/archiver)       |    8.0.0 |         8.0.0 |
| [@types/node](https://www.npmjs.com/package/@types/node) |   26.1.1 |        26.1.1 |
| [tsx](https://www.npmjs.com/package/tsx)                 |   4.23.0 |        4.23.1 |

## Other technologies and standards in the solution

| Technology or standard          | Version or status                                            | Use                                                  |
| ------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| HTML                            | HTML5 document structure                                     | Vite entry point and static assets                   |
| CSS                             | Native CSS with Tailwind v4 directives and custom properties | Forge theme tokens and application styles            |
| SVG                             | SVG 1.1 style output                                         | Hand-written BPMN renderer output                    |
| YAML                            | YAML configuration and fixture files                         | Workflows, workspace config, skills, and evaluations |
| TOML                            | Replit artifact and runtime configuration                    | `.replit` and Replit artifact registration           |
| Markdown                        | GitHub-flavored Markdown                                     | Documentation, skills, context, and examples         |
| Mermaid external diagram API    | API target, not installed as a runtime dependency            | `registerExternalDiagrams()` integration path        |
| BPMN 2.0.2 descriptive notation | Standards reference                                          | Shapes, markers, flows, pools, and lanes             |
| Google Fonts                    | Alfa Slab One, DM Sans, JetBrains Mono                       | Font resources linked from `app/index.html`          |
| Git                             | Repository version control                                   | Source history and lockfile review                   |

## Version maintenance plan

The repository now uses three layers of maintenance:

1. `.github/dependabot.yml` checks npm dependencies and GitHub Actions weekly
   and opens reviewable pull requests. The existing major-version exception for
   the Mermaid contract remains in place.
2. `scripts/check-technology-versions.mjs` runs `pnpm outdated`, checks the
   current Node and pnpm releases, and writes a GitHub Actions job summary when
   run with `--ci`. It does not modify source or dependency files.
3. `.github/workflows/technology-version-audit.yml` runs the audit every Monday,
   on relevant pull requests, and on demand. This makes drift visible even when
   a dependency is not covered by a package manifest, such as a runtime major
   version in `.replit` or an action tag.

The root `package.json` declares `packageManager: pnpm@10.26.1`. The deploy
workflow no longer hardcodes a separate pnpm major, so the workflow and local
workspace use the same package-manager declaration.

### Review sequence for an update pull request

1. Let Dependabot create the version update pull request.
2. Inspect the audit summary and the dependency changelog.
3. Run `pnpm run typecheck`, the application test command, skill validation,
   skill tests, and `pnpm build`.
4. For Vite, TypeScript, React, Vitest, Tailwind, or Mermaid compatibility
   changes, review the associated migration guide and plugin contract before
   merging.
5. Regenerate `pnpm-lock.yaml` only through pnpm and commit it with the manifest
   change.

Major upgrades remain deliberate review points. Patch and minor updates can be
handled by the scheduled Dependabot cycle when the validation suite stays green.

## Sources

- [Node.js release status and release lines](https://nodejs.org/en/about/previous-releases)
- [Node.js release index](https://nodejs.org/dist/index.json)
- [pnpm releases](https://github.com/pnpm/pnpm/releases)
- [React 19.2 release](https://react.dev/blog/2025/10/01/react-19-2)
- [Vite 8 release](https://vite.dev/blog/announcing-vite8)
- [Vite supported releases](https://vite.dev/releases)
- [Tailwind CSS v4.3 announcement](https://tailwindcss.com/blog)
- [Python 3.14.6 release](https://www.python.org/downloads/release/python-3146/)
- [GitHub Dependabot version updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-version-updates)
- [GitHub Actions updates with Dependabot](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/auto-update-actions)
- [actions/checkout releases](https://github.com/actions/checkout/releases)
- [actions/setup-node releases](https://github.com/actions/setup-node/releases)
- [pnpm/action-setup releases](https://github.com/pnpm/action-setup/releases)
- [actions/upload-pages-artifact releases](https://github.com/actions/upload-pages-artifact/releases)
- [actions/deploy-pages releases](https://github.com/actions/deploy-pages/releases)

Package-level latest versions are linked to each package's npm page in the
inventory tables. Re-run `pnpm run technology:check` before relying on this
dated snapshot for a new release decision.
