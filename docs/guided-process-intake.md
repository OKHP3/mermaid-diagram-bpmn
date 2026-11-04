# Guided process intake and agent handoff

Phase 2 adds `/intake` for process owners and analysts. It is a static, browser-only flow alongside the existing workbench and skills browser. It does not run skills, call an AI service, or generate a diagram from prose.

## Workflow

1. Capture a process brief: purpose, trigger, owner, outcomes, exclusions and evidence. Optional fields capture inputs and elicitation metadata.
2. Capture roles, ordered steps, known exceptions and open questions. Stable identifiers survive renaming and reordering. Removing a role leaves its steps explicitly unassigned.
3. Select an agent environment and download a focused handoff. The purchase starter is illustrative and intentionally incomplete. It supplies no approval thresholds or invented validation results.
4. Import returned `process-bundle.json` or `diagram.mmd`, inspect the preview, then apply a copy. Open the existing workbench inside the intake to edit source and export SVG while retaining process context.

Syntax diagnostics, open questions and a reported stakeholder review are separate. Source or brief changes reset the review record and computed PIR validation. A recorded review requires a reviewer, notes and parseable source. It is not independent approval verification, and unresolved questions may remain.

## Transport contract

`app/src/lib/process-bundle.ts` defines the `bpmn-process-bundle`, version `1` envelope. Its `pir` member follows the existing PIR `0.1` fields in `skills/okhp3-process-intake-and-scope/references/pir-schema.md`. This is an editable discovery draft: empty values are permitted and remain unresolved. The envelope adds `scope` (purpose, exclusions, evidence), `diagram` (source, provenance), and `review` (reported status, reviewer, notes). These support the existing scope-statement and diagram deliverables; they do not replace PIR or PNS.

The import boundary validates required shapes, enums, supported versions, dates, stable IDs, duplicate IDs and text/list limits. Unsupported fields are rejected with an explicit message instead of being silently discarded. All supported optional PIR fields survive a round trip even when the form has no dedicated editor for them. An unmatched step owner is retained and exposed as an unresolved question. Imported review assertions are labeled as reported, not verified.

Limits: 1 MB per imported file and complete formatted JSON export, 500,000 source characters, 10,000 characters per other text field, 200 entries per collection. Import and edit checks reserve the full UTF-8 envelope, including JSON escaping, so accepted data can be downloaded and reopened. Oversized edits leave the previous version intact with a visible error. A `.mmd` file must have a `bpmn-beta` header; the shared detector permits leading comments, and syntax errors remain available for repair. YAML, ZIP, BPMN XML and other Mermaid formats are not imported. Unzip the handoff and select its JSON or source file. Additional PNS, mapping, narrative and evidence files remain outside the envelope and should be retained alongside it.

## Handoff package

The downloadable ZIP contains the bundle, PIR YAML, scope statement, instructions, the current browser syntax standard, and these five complete source skill packages (excluding tests and dependency directories): intake, elicitation, stakeholder mapping, narrative authoring and visual process modeling. Vite reads canonical repository files at build time. Downloads do not fetch a mutable upstream package or substitute placeholders for missing files. The ZIP module loads only when requested.

The browser standard takes precedence over older shorthand examples in portable skills. The handoff requires the agent to disclose missing mappings, unperformed checks and unresolved facts. `validate-intake.mjs` invokes the canonical PIR validator and scorer using JSON input, avoiding the legacy minimal YAML reader's string coercion and escaping limitations. It reports results without mutating the bundle. The browser checklist is not the canonical completeness score.

Platform folders are `.agents/skills` for this project's Codex convention, `.claude/skills` for Claude Code, `.github/skills` for Copilot in VS Code, or `skills` for an explicit portable handoff. Verify platform support when changing this contract. References checked November 3, 2026: [Claude Code skills](https://code.claude.com/docs/en/skills), [VS Code agent skills](https://code.visualstudio.com/docs/agent-customization/agent-skills). No provider integration or provider execution is claimed by packaging alone.

## Recovery and privacy

Brief recovery uses `bpmn-intake:draft:v1:` keys, separate from standalone workbench drafts. Each mounted intake owns its key; another tab never silently replaces its active record. Opening an example, imported result or saved brief retains the previous record and opens a copy. Unavailable storage is visible, with download and navigation protection. Malformed recovery records are ignored without deletion. Saved briefs can be removed explicitly.

Intake content is not put in the address bar. The embedded workbench suppresses ordinary source URL synchronization. Its explicit Share action creates a standalone `/playground` link containing source only. Download a bundle to retain the accompanying context. The site privacy notice describes both storage paths.

## Verification

`app/src/__tests__/process-bundle.test.ts` covers transport validation, canonical PIR compatibility, unknowns, lossless JSON round trips, source import, YAML quoting, package completeness and platform instructions. `app/e2e/process-intake.spec.ts` exercises the complete purchase path, actual ZIP contents and Node validation adapter, import previews, recovery across tabs, review invalidation, source repair, storage denial, mobile layout and accessibility. It runs in the existing Chromium, Firefox and WebKit CI matrix. Visual baselines include intake desktop/mobile in both themes. Existing workbench, plugin, skill and release gates remain required.

## Transcript-driven sessions

Use [Transcript sessions](transcript-sessions.md) at `/sessions` for meeting
excerpts, explicit/keyword checkpoints and claim-level source review. The
separate session envelope preserves this version 1 process-bundle contract.
