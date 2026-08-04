# Agent Guide: BPMN for Mermaid

This file is the canonical agent guide for this repository. Read it before
editing files. `CLAUDE.md` and `.github/copilot-instructions.md` point here.
`replit.md` contains Replit-specific notes and is useful context, but this file
is authoritative when the two disagree.

## Project identity

**Confirmed:** This is the `OKHP3/mermaid-diagram-bpmn` Git repository. It is a
pnpm monorepo containing a React playground application and a BP-SKILL suite.
The public project name is **BPMN for Mermaid**. The DSL header is
`bpmn-beta`.

**Confirmed purpose:** The project provides a readable, text-first DSL for a
documented BPMN descriptive subset. The browser application parses the DSL,
lays out the model, and renders SVG. The repository also contains 15 portable
business process skills, context templates, evaluation fixtures, and a static
skills browser.

**Inferred mission:** Make process diagrams and related process documentation
easy to author, review, version, and reuse in Mermaid-oriented workflows.

**Inferred vision:** Stabilize the DSL and its rendering contracts well enough
to support a real Mermaid external diagram contribution. This is a direction,
not a current production guarantee.

## Current status

The project is a working prototype and documentation site, not a finished npm
plugin or BPMN execution platform.

- The parser, typed `BpmnDb`, layout engine, React SVG renderer, detector, and
  source-level Mermaid adapter are present under `app/src/lib/`.
- The playground and documentation routes are present under `app/src/pages/`.
- Pools, lanes, message flows, task markers, gateways, accessibility metadata,
  and multiple example diagrams are represented in the current source.
- `app/src/lib/bpmn-plugin.ts` is an adapter source file. End-to-end validation
  against a live Mermaid `registerExternalDiagrams()` and `mermaid.render()`
  host is verified by `app/src/lib/__tests__/bpmn-plugin-integration.test.ts`,
  which runs real `mermaid@11.4.1` against two corpus examples and is a
  merge-blocking CI check. See `docs/mermaid-compatibility.md` for the full
  evidence record. What remains: a real package boundary and a browser-host
  demo without `securityLevel: "loose"` (Phases 2 and 3 of PRD-04).
- The 15 source skills and five evaluation suites are present. Generated skill
  and context copies are present under `app/public/`.
- The application is intended to be static and browser-only. GitHub Pages is
  deployed by `.github/workflows/deploy-gh-pages.yml`.

The following issues were observed during this context pass and are not fixed
by this guidance-only change:

- `node scripts/validate-skills.mjs` passes for all 15 source skills and all
  nine context templates. The separate `.agents/skills` validator still
  reports four portability or metadata failures: one package uses lowercase
  `skill.md`, and three packages have descriptions shorter than the required
  minimum.
- All generated files (`pns-transitions-auto.ts`, `skill-deps-auto.ts`) are
  confirmed up to date as of the 2026-08-04 baseline run.
- The Pages deployment workflow (`deploy-gh-pages.yml`) runs typecheck, app
  tests, skill tests, and skill validation before the build step.
- The full O1 verification suite passes on Linux: typecheck, app tests (390/390),
  skill tests (196/196), check:generated, skill:validate (235/235), eval:run
  (14/14), and build. See `docs/capability-ledger.md` for the baseline record.

Treat these as evidence-backed risks. Do not silently describe them as fixed.

## Scope and non-goals

The application is deliberately client-side and static. Do not add any of the
following without an explicit project decision:

- backend routes, API services, databases, or server-side diagram processing
- login, authentication, user accounts, payment processing, or cloud storage
- AI API calls or LLM inference inside the application
- BPMN XML import or export
- `bpmn-js`, `bpmn-moddle`, or another BPMN runtime dependency
- unpinned production CDN dependencies
- executable BPMN semantics or claims of full BPMN 2.0 conformance

The BP-SKILL suite is a separate deliverable in the same repository. Skills
must remain portable, conform to the Agent Skills format, use lowercase
hyphenated directory names, and avoid embedding copyrighted external standards
content.

## Repository map

There are no nested Git repositories or separate projects inside this checkout.

```text
app/                         React/Vite static application package
  src/lib/                   parser, database, detector, layout, renderers
  src/pages/                 application routes and walkthroughs
  src/components/            React components
  src/__tests__/             application-level Vitest tests
  src/lib/__tests__/         parser, database, renderer, and corpus tests
  data/                      hand-authored and generated application data
  examples/                  canonical bpmn-beta .mmd fixtures
  docs/                      application architecture and product documents
  standards/                 DSL, parser-safety, and BPMN references
  public/                    static assets plus generated skill/context files
  scripts/generate-skill-files.mjs
                             generator for public skill and context files
  .replit-artifact/artifact.toml
                             required Replit registration file
scripts/                     root validation and packaging scripts package
  src/parse-yaml-minimal.mjs shared YAML helper used by root scripts
skills/                      15 source SKILL.md packages
context/                     nine source variable-layer templates
evals/                       five evaluation suites
docs/                        repository-level documentation
.github/workflows/           GitHub Pages deployment workflow
```

The root workspace declares `app`, `lib/*`, `lib/integrations/*`, and
`scripts` package patterns. Only `app` and `scripts` currently exist as
workspace packages. Do not assume a `lib` package exists until it is added and
documented.

## Architecture and data flow

Preserve this application pipeline:

```text
bpmn-beta text
  -> bpmn-detector.ts
  -> bpmn-parser.ts
  -> BpmnDb
  -> bpmn-layout.ts
  -> bpmn-renderer.tsx
  -> SVG
```

The source-level Mermaid adapter in `bpmn-plugin.ts` reuses the detector,
parser, database, layout, and styles contracts while producing imperative SVG
for Mermaid's external diagram API. The React playground renderer and the
Mermaid adapter are separate output paths over the same model pipeline.

The parser source and the formal DSL reference are the authorities for syntax:

- `app/src/lib/bpmn-parser.ts`
- `app/standards/bpmn-beta-standard.md`
- `app/standards/parser-safety-checklist.md`

Use syntax such as `task:user t1 "Review Request"`, `start s1`, and
`flow t1 -> g1` only when it matches the current parser and standard. Do not
introduce flowchart metadata syntax as bpmn-beta syntax.

## Technology and runtime

The declared and checked-in stack is:

- Node.js 24 compatibility line in Replit and GitHub Actions
- pnpm 10, declared as `pnpm@10.26.1` in the root manifest
- TypeScript 7.0.2
- React 19.2.7 and Vite 8.1.4
- Tailwind CSS 4 through the Vite plugin
- wouter for client-side routing
- Vitest 4.1.10 for application tests
- ESM JavaScript for root validation and packaging scripts

Replit provisions Python 3.11, but the repository has no Python application.
Older notes mention Express and Drizzle; the current application architecture
does not use a backend, API, or database.

## Commands

Run from the repository root after dependencies are installed:

```bash
pnpm install
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/mermaid-diagram-bpmn run dev
pnpm --filter @workspace/mermaid-diagram-bpmn run test
pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck
pnpm --filter @workspace/mermaid-diagram-bpmn run skill:generate
pnpm run skill:validate
pnpm run skill:test
pnpm run check:generated
pnpm run eval:run
pnpm run technology:check
```

The application build generates `app/public/skills/`,
`app/public/context/`, and `app/dist/public/`. The first two are generated
static inputs and the last is build output. Do not hand-edit them. When
canonical sources change, regenerate and review the generated diff, then
follow the repository's existing policy for whether generated files are
committed.

`pnpm run technology:check` uses the npm registry and needs network access.
The other commands may also require the installed dependency tree.

The deployment workflow uses this sequence:

1. install with `pnpm install --frozen-lockfile`
2. generate application skill files
3. build with `BASE_PATH=/mermaid-diagram-bpmn/`
4. upload `app/dist/public` to GitHub Pages

## Change conventions

- Work in small, localized steps. Ask before a large refactor.
- Preserve unrelated user changes and never use destructive version-control
  commands.
- Do not add dependencies unless the user explicitly requests them.
- Use US English in new user-facing copy, documentation, comments, and
  identifiers. Do not use em dashes in new content.
- Use existing Forge theme tokens and utility classes for new UI. Do not hand
  edit `app/src/styles/forge-tokens.css` as part of an unrelated change.
- Use PascalCase filenames for React components, camelCase filenames for React
  hooks, and kebab-case for other authored files unless a tool requires another
  name.
- Preserve the public title `BPMN for Mermaid` and the DSL keyword `bpmn-beta`.
- Do not claim full BPMN 2.0 compliance, executable semantics, or a production
  Mermaid plugin unless the repository evidence supports the claim.
- Do not add employer or unrelated corporate branding to this personal project.

When changing the parser or renderer, add or update focused tests and examples.
For a DSL change, update the parser tests, canonical examples, and
`app/docs/dsl-spec.md`. Check both the rendering contract and BPMN notation
against the standards files.

## Generated and canonical files

Canonical sources that may be edited intentionally:

- `skills/*/SKILL.md`
- `context/*.md`
- `app/src/data/skills-registry.ts`
- source files under `app/src/`

Generated or derived files that must not be hand-edited:

- `app/public/skills/`
- `app/public/context/`
- `app/src/data/pns-transitions-auto.ts`
- `app/src/data/skill-deps-auto.ts`
- `app/public/pns-template.yaml`
- `app/public/bp-skill-readme.md`
- `app/public/skill-dependency-flow.md`
- `app/dist/`

After intentional changes to `skills/` or `context/`, run the application
`skill:generate` command. Before proposing skill changes, run the root skill
validation and skill test commands and report any pre-existing failures.

## Security and operations

- Never invent or commit credentials, tokens, or private configuration.
- `scripts/push-notion-diagram.mjs` requires a `NOTION_TOKEN` secret and is a
  development-only integration. Stop and ask before using a missing secret.
- Keep `app/.replit-artifact/artifact.toml` because Replit requires it.
- Keep build output, dependency directories, test reports, and paste-buffer
  artifacts out of version control.
- The canonical deployment workflow is
  `.github/workflows/deploy-gh-pages.yml`. Do not rename it or describe it as
  `deploy.yml` without changing the workflow and its documentation together.

## Guidance maintenance

Update this file when the repository structure, commands, deployment model,
architecture boundaries, or validation gates change. Base changes on files or
checks in the repository. Label important statements as confirmed, inferred,
or unknown when evidence is incomplete. Keep `CLAUDE.md` and
`.github/copilot-instructions.md` as short pointers instead of creating
duplicate long guides.

Known documentation drift remains in some historical `app/docs/` files,
including references to the former `artifacts/` path and older workflow names.
Treat current source, manifests, workflow files, and this guide as the source
of truth until those documents are separately reconciled.
