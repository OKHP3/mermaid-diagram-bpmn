# Content-first repository archetype rubric

Use this rubric after inventory. Select one primary archetype and optional secondary archetypes. Record confidence as high, medium, or low and cite the paths, headings, file families, and Git evidence that support the choice.

| Archetype | Evidence pattern | Useful vocabulary | Do not assume |
|---|---|---|---|
| Knowledge base | Curated reference files, notes, source material, topic folders, exports | `knowledge/`, `research/`, `sources/`, `archive/` | That every file is current or authoritative |
| Prompt or agent specification | Prompt spines, manifests, instructions, skills, tests, knowledge packs | `prompts/`, `eval/`, `tests/`, `packs/`, `ops/` | That a deployable agent or runtime exists |
| Research or reference library | Papers, PDFs, citations, annotated notes, comparative material | `research/`, `references/`, `bibliography/`, `data/` | That the repository owns the source material or permits redistribution |
| Planning and decision workspace | Briefs, options, decisions, roadmaps, meeting notes, open questions | `docs/`, `decisions/`, `plans/`, `logs/` | That drafts are commitments |
| Media or asset collection | Images, audio, video, design exports, source and derivative variants | `assets/`, `source/`, `exports/`, `archive/` | That similarly named assets are duplicates |
| Archive or migration set | Legacy copies, versioned exports, migration ledgers, preserved snapshots | `archive/`, `migration/`, `legacy/` | That old files can be deleted because newer files exist |
| Application or service | Source code, manifests, tests, build/deploy files, runnable commands | `src/`, `app/`, `tests/`, `.github/workflows/` | That application conventions fit a content-first repository |
| Hybrid | Two or more strong, intentionally connected modes | A documented split by area | That one universal layout will clarify it |

## Evidence rules

- Treat a README, manifest, or agent guide as a claim to verify against the tree and history, not as automatic truth.
- Treat repeated filenames, version suffixes, and paired formats as evidence of a production or export workflow, not proof that one variant is canonical.
- Treat URLs and deployment references as pointers. Verify only with an authorized browser or local evidence, and label the result with its date.
- Treat empty directories and `.gitkeep` files as intended areas, not populated capabilities.
- Treat a binary file by type, size, metadata, and a representative visual or text extraction. Do not infer its content from its filename alone.
- Use `TBD` when the evidence cannot distinguish purpose, authority, lifecycle, or ownership.

## Profile sentence patterns

Prefer statements such as:

- `Confirmed purpose: the repository stores ... because ...`
- `Inferred mission: the repeated ... suggests ...; owner confirmation is still needed.`
- `Unknown: no file establishes whether ...`
- `Primary archetype: knowledge base (medium confidence), secondary: prompt specification (low confidence).`

Avoid claims such as `production`, `deployed`, `canonical`, `complete`, or `duplicate` unless the evidence supports the exact claim.
