---
name: naming-conventions
description: Portable kebab-case naming default and structural exceptions for okhp3-replit-repl-janitor.
---

# Naming conventions

## Default

Use lowercase letters and digits with single hyphens between words. This
applies to ordinary documentation, assets, data files, stylesheets, scripts,
and folders.

Correct: `site-tokens.css`, `design-system.md`, `sync-skills.sh`

Rename: `SiteTokens.css`, `designSystem.md`, `my_file.json`, `My Document.md`

## Structural exceptions

| Role | Convention | Examples |
|---|---|---|
| React components (`.tsx`/`.jsx`) | PascalCase | `ChatPane.tsx` |
| React hooks (`useFoo.ts`) | camelCase | `useDebounce.ts` |
| Root governance | Ecosystem-standard uppercase | `README.md`, `LICENSE`, `AGENTS.md`, `SKILL.md` |
| Tool-required | Tool's exact name | `package.json`, `vite.config.ts`, `.replit`, `Dockerfile` |
| Web-standard | Standard's exact name | `robots.txt`, `404.html`, `_headers`, `site.webmanifest` |

Do not rename code identifiers merely because their containing file changes.

## Decision tree

1. Is the name required by a tool or web standard? Keep it.
2. Is it a root governance file? Keep the ecosystem-standard name.
3. Is it a `.tsx`/`.jsx` component? Keep PascalCase.
4. Is it a `useFoo.ts` hook? Keep camelCase.
5. Otherwise, use kebab-case with a lowercase extension.

## Detritus names

Treat these as triage signals wherever they occur outside ignored build/vendor
trees: `_unused/`, `attached_assets/`, `attached-assets/`, `_drafts/`,
`_scratch/`, `_old/`, `tmp/`, `temp/`, and `unused/`.

Inspect contents and Git tracking state. Then choose:

- delete, when contents are verified disposable;
- gitignore-and-untrack, when generated content should remain locally; or
- review, when provenance or value is uncertain.

## Rename policy

- Update every importer and reference in the same change.
- Preserve public links through a redirect or transition stub.
- Run relevant validation and restart the affected workflow after tracked
  source moves.