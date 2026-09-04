---
name: naming-conventions
description: Portable kebab-case naming default and its structural exceptions, for use by okhp3-repl-repo-janitor across any Repl.
---

# Naming conventions (portable subset)

## Default: lowercase-with-hyphens (kebab-case)

Every file and folder name defaults to lowercase letters and digits, words
separated by single hyphens. Applies to documentation, config, assets, data
files, stylesheets, plain scripts, and folder names.

Correct: `site-tokens.css`, `design-system.md`, `sync-skills.sh`,
`brand-sigil.svg`, `scripts/build-search-index.py`

Wrong (must be renamed when discovered, with every importer updated in the
same change): `SiteTokens.css`, `designSystem.md`, `My Document.md`

## Structural exceptions (not violations)

| File role | Convention | Examples |
|---|---|---|
| React components (`.tsx`/`.jsx`) | PascalCase matching the component | `ChatPane.tsx` |
| React hooks (`.ts` exporting `useFoo`) | camelCase matching the hook | `useDebounce.ts` |
| Root governance files | ALL CAPS (ecosystem convention) | `README.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `AGENTS.md`, `SKILL.md` |
| Tool-required filenames | Whatever the tool requires | `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `.replit`, `.env*`, `Makefile`, `Dockerfile` |
| Web-standard files | Whatever the spec dictates | `humans.txt`, `robots.txt`, `llms.txt`, `404.html`, `_headers`, `favicon.ico`, `site.webmanifest` |

Code identifiers (variables, functions, types) follow their language's own
convention and are untouched by file-naming cleanup — do not rename an
identifier just because the file it lives in gets renamed.

## Decision tree

1. Root governance file with a universally expected name? Keep ALL CAPS.
2. Tool-required filename (dotfile, `package.json`, etc.)? Use what the tool requires.
3. `.tsx`/`.jsx` exporting a component? PascalCase matching the component.
4. `.ts` exporting a `useFoo` hook? camelCase matching the hook.
5. Otherwise: kebab-case.

## Forbidden / detritus folder names at repo root

Reserved for working-buffer artifacts, not legitimate content:
`_unused/`, `attached_assets/`, `attached-assets/`, `_drafts/`, `_scratch/`,
`_old/`, `tmp/`, `temp/`, `unused/`. If one of these exists and is tracked,
triage its contents (confirm nothing important is stranded) then delete or
gitignore-and-untrack it.

## Renaming policy

Renaming a file changes import paths and, for web content, deployed URLs.
- Update every importer/reference in the same change.
- If the file is reachable by a deployed URL, add a redirect or keep a stub
  at the old path until traffic clears.
- Never rename without running the build/tests (or at minimum restarting
  the workflow and checking the preview) afterward.
