---
name: okhp3-vite-github-pages
description: "OverKill Hill P³ Vite-to-GitHub-Pages deployment runbook. Use when deploying or troubleshooting this React/Vite app, its Actions workflow, /kierans-lifetrkr/ production base, HashRouter fallback, dist artifacts, build validation, or Pages environment variables. Also activate for subpath asset failures or SPA refresh diagnosis. Do not use for gh-pages branches, backend hosting, or unrelated UI work."
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: deployment
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Deployment and repair of React or Vue Vite SPAs on GitHub Pages, including base paths and router behavior."
  out_of_scope: "Unapproved publication, unrelated application redesign, or credential and repository administration."
---

# okhp3-vite-github-pages

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Use this focused runbook to keep Kieran’s LifeTrkr compatible with its client-only Vite build and GitHub Pages Actions deployment. Verify the repository before relying on any remembered version or workflow detail.

## Scope

| In scope | Out of scope |
| --- | --- |
| `vite.config.ts`, `.github/workflows/static.yml`, production base paths, `HashRouter`, build artifacts, Pages permissions/artifacts, environment wiring, and deployment diagnosis | Servers, databases, backend proxies, `gh-pages` branches, the legacy `npm run deploy`, secret creation, commits, pushes, and unrelated application changes |

## Project contract

Treat these current facts as constraints, then re-read the files if the task may have changed them:

- `vite.config.ts` sets `base` to `/kierans-lifetrkr/` when `NODE_ENV === 'production'` and `/` otherwise. The dev server listens on `0.0.0.0:5000`.
- `src/App.tsx` uses `HashRouter`; preserve it for the GitHub Pages subpath.
- `.github/workflows/static.yml` runs on pushes to `main` or manual dispatch, uses Pages permissions and concurrency, installs with `npm ci`, builds with `npm run build`, passes `VITE_GOOGLE_CLIENT_ID`, copies `dist/index.html` to `dist/404.html`, uploads `dist`, and deploys with the Pages actions.
- The workflow normalizes Replit-internal package URLs to `https://registry.npmjs.org/` before installation. Preserve this portability step unless the owner changes the dependency source.
- The checked-in `npm run deploy` script is legacy `gh-pages` plumbing. Do not use or revive it.

## Workflow

### 1. Plan

Read `AGENTS.md`, `vite.config.ts`, `.github/workflows/static.yml`, `package.json`, `src/App.tsx`, and the relevant recent diff. Check `git status --short`. Classify the request as configuration, workflow, artifact, or diagnosis before editing. Do not change deployment settings merely because a validation command succeeds.

### 2. Validate the source of truth

Confirm the intended repository name, Pages base, router, build script, artifact path, trigger branch, environment variables, permissions, and fallback behavior from the files. If the requested result conflicts with the client-only boundary or the checked-in workflow, stop and report the conflict.

### 3. Execute safely

Make the smallest compatible edit. Keep the production base exactly `/kierans-lifetrkr/`, local development at `/`, `HashRouter`, npm, and Actions-based Pages deployment. Never place OAuth/API secrets in source, workflow text, or skill output; reference GitHub secrets by name only. Do not create a `gh-pages` branch or add a server workaround for an SPA that already uses hash routing.

### 4. Validate

Run `npm run check`, then `npm run build` for build-affecting changes. Inspect the generated `dist/index.html` for `/kierans-lifetrkr/` asset URLs and confirm the workflow creates `dist/404.html` after the build. If dependencies are unavailable and `npm ci` fails before installation with missing `@emnapi/core` or `@emnapi/runtime`, report that lockfile blocker without silently repairing unrelated dependency metadata. For workflow-only edits, inspect YAML structure and still run the narrowest available checks.

### 5. Report

Summarize changed files, verified local results, expected Actions behavior, required repository/environment configuration, and unresolved risks. Distinguish a successful local build from a verified live Pages deployment; the latter requires an actual environment smoke test.

## Gotchas

- A wrong production `base` causes asset 404s under the repository subpath; do not “fix” this by changing the router to `BrowserRouter`.
- A successful Vite build does not prove Pages permissions, secrets, CORS, or deployed behavior are healthy.
- `VITE_GOOGLE_CLIENT_ID` is passed at build time; never print or hard-code secret values.
- Preserve `npm ci` and the checked-in lockfile. Do not switch to pnpm or `npm install` as a workaround.
- Do not claim `dist/404.html` exists from a local build unless the copy step was actually run; it is created by the workflow.

## Output contract

Return:

1. deployment diagnosis or implementation summary;
2. exact files and invariants preserved;
3. validation commands/results and any blocked checks;
4. required GitHub/Pages environment configuration without secret values;
5. live-verification status and remaining risks.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
