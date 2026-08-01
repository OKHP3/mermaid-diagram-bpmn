# Selective scaffold matrix

Use the smallest row set that makes the repository understandable. `Now` means the file is usually useful when absent. `Conditional` means create it only when the evidence and owner intent justify it. `Do not add` means the directory or file would be misleading without a concrete use.

| Area | Now | Conditional | Do not add |
|---|---|---|---|
| Orientation | Root `README.md` with purpose, audience, status, map, start-here links, provenance, and non-goals | `docs/` for longer narrative material | A second competing README without an explicit reason |
| Agent operations | `AGENTS.md` when agents will inspect or edit the repository | `CLAUDE.md` as a pointer when Claude-compatible workflows need it | Platform-specific instructions copied from another repository |
| History and state | Preserve existing history and date meaningful changes | `CHANGELOG.md` for evolving releases; `LIFECYCLE.md` for state transitions; `MIGRATION.md` for a move ledger | Empty placeholder files that promise a process nobody uses |
| Knowledge content | Keep a small root map; group real topic collections under `knowledge/`, `research/`, or `references/` | Split by audience, source, or lifecycle only when the distinction is visible in the files | Moving all PDFs or all Markdown into format-only folders when topic is the stronger relationship |
| Prompt or agent assets | Use `prompts/`, `packs/`, `eval/`, or `tests/` only for populated, distinguishable sets | `.agents/` for local skills and agent tooling; `.kit/` for a coherent reusable prompt/configuration kit | Empty `.agents/` or `.kit/` folders created for appearances |
| Media and derivatives | `assets/` when media is a first-class input | `source/`, `exports/`, or `archive/` when provenance and derivatives require separation | Replacing originals with compressed or renamed derivatives |
| Collaboration | Existing `LICENSE` remains in place; add only when licensing is known | `.github/CONTRIBUTING.md`, `SUPPORT.md`, `SECURITY.md`, issue/PR templates, or workflows when collaboration requires them | Copying organization defaults into every repository without checking local needs |

## Suggested top-level vocabulary

```text
README.md
AGENTS.md
LICENSE
docs/          narrative, decisions, lifecycle, migration, and indexes
knowledge/     curated topic material
research/      research inputs and annotated references
prompts/       instruction and prompt source
eval/          evaluation cases and rubrics
assets/        images, audio, video, and other first-class media
examples/      worked examples or fixtures
archive/       superseded material retained for provenance
scripts/       small local utilities with documented commands
.agents/       repository-local agent skills and support
.kit/          intentional prompt/configuration kit
.github/       GitHub collaboration and automation configuration
```

Do not adopt the entire vocabulary by default. A two-file concept repository may need only `README.md`, `AGENTS.md`, and its existing content. A populated prompt repository may need `prompts/`, `knowledge/`, `eval/`, and `ops/`. A reference library may need `research/`, `sources/`, and `archive/` but no `.kit/`.

## Naming rules

Use `references/cross-platform-naming.md` for the full portability gate.

1. Prefer stable, descriptive, ASCII lowercase kebab-case names for new ordinary files and folders unless an external tool requires a different name.
2. Preserve established public or authority anchors, including URLs, manifest names, required GitHub filenames, and filenames referenced by external workflows.
3. Prefer semantic names over format names: `research/market-history/` is usually clearer than `pdf/`.
4. Preserve meaningful version and date signals. Normalize only when the current convention is demonstrably confusing and the move plan records the mapping.
5. Avoid collisions by planning the full destination path with case-folded and Unicode-normalized comparisons before moving anything. Never let a rename overwrite an existing path.
