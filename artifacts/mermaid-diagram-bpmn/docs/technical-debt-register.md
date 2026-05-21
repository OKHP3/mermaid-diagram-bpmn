# Technical Debt Register — BPMN for Mermaid

**Project:** BPMN for Mermaid
**Last updated:** 2026-05-21
**Source:** Prototype-to-Product Retrospective (`docs/prototype-to-product-retrospective.md`)

Items are tracked here so future maintainers and AI agents do not re-create known issues.

---

| Debt ID | Area | Issue | Impact | Severity | Recommended Fix | Effort | Status |
|---|---|---|---|---|---|---|---|
| TD-001 | Dependency hygiene | 40+ unused Radix UI + other template packages declared in `package.json` but not imported in `src/` | Credibility hazard; inflated install footprint; confuses agents | **Critical** | Audit imports; remove all unused deps | Small | Open |
| TD-002 | Integration | No `registerExternalDiagrams()` end-to-end verification — `bpmn-plugin.ts` has never been tested against a live `mermaid.render()` call | "Mermaid-native" claim is theoretical, not verified | **High** | Wire against real Mermaid in a browser test; verify draw/parser/styles chain | Medium | Open |
| TD-003 | Architecture | Shape drawing logic is inline in `bpmn-renderer.tsx` AND duplicated in `bpmn-plugin.ts` draw function | Maintenance burden; shape changes require two-file sync | **High** | Extract to `src/lib/shapes/` — shared by both React component and draw function | Medium | Open |
| TD-004 | UX / Error handling | Parser errors surface as blank preview — no error message shown to user | Zero feedback for invalid syntax; developer experience gap | **High** | Wrap render call in try/catch; display error + line number in preview panel | Small | Open |
| TD-005 | Testing | No renderer snapshot tests | Visual regressions silently break SVG output | **High** | Add Vitest SVG snapshots for all 5 corpus examples | Medium | Open |
| TD-006 | Testing | No layout regression tests | Node positions and pool widths can regress silently | **High** | Assert layout dimensions for corpus examples | Medium | Open |
| TD-007 | Deployment | No test pre-gate in `.github/workflows/deploy.yml` | Broken code deploys to public URL | **High** | Add `pnpm test` step before build and deploy | Small | Open |
| TD-008 | Theming | `LIGHT_THEME` in `bpmn-styles.ts` uses CSS custom properties (`hsl(var(--foreground))`) that don't resolve in Mermaid's SVG context | Plugin always renders in static fallback theme, not user's active Mermaid theme | **High** | Use `buildMermaidTheme()` + `getConfig()` in plugin draw function (partially fixed — draw function already uses it; styles provider also uses it) | Small | **Partially resolved 2026-05-21** |
| TD-009 | Documentation | `docs/Roadmap.tsx` references Notion as canonical roadmap | OSS ground truth must be in repo; Notion is inaccessible to contributors | **High** | ~~Migrate to `docs/ROADMAP.md`; update `Roadmap.tsx` to remove Notion reference~~ | Small | **Resolved 2026-05-21** |
| TD-010 | Data integrity | Message-flow constraint enforcement (`~~>` must be at top level) added in parser but not enforced with a typed error type | Error messages are plain strings; tooling can't act on them | **Medium** | Define `ParseError` type with `line`, `column`, `message`, `code` fields | Small | Open |
| TD-011 | Testing | No accessibility tests | ARIA attributes on SVG output not automatically verified | **Medium** | Assert `role="img"`, `aria-labelledby`, `<title>`, `<desc>` in tests | Small | Open |
| TD-012 | Architecture | Shape logic duplicated between `bpmn-renderer.tsx` (React JSX) and `bpmn-plugin.ts` (SVG string) | Any shape change requires two edits; easy to drift | **Medium** | Resolve via TD-003 (extract shape library) | Medium | Open (blocked by TD-003) |
| TD-013 | Documentation | `About.tsx` decision summaries partially duplicate `docs/decisions.md` | Drift risk — one may be updated while the other isn't | **Medium** | Make `About.tsx` link to `docs/decisions.md` rather than embed summaries | Small | Open |
| TD-014 | Versioning | No GitHub releases or tags | No visible version history; no GitHub release notes | **Medium** | Create release tags matching CHANGELOG versions | Small | Open |
| TD-015 | Performance | `[...contextStack].reverse().find()` in parser inner loop | O(n²) for deeply nested pool/lane stacks | **Low** | Maintain separate `currentPool` and `currentLane` pointers | Small | Open |
| TD-016 | UX polish | Pan/zoom controls not discoverable on first visit | Users miss interaction on complex diagrams | **Low** | Add first-visit tooltip or hint overlay | Small | Open |
| TD-017 | Accessibility | Per-element `aria-label` on SVG node groups deferred | Screen readers cannot announce individual nodes | **Low** | Add `aria-label` to each shape group (`<g aria-label="task: Review Order">`) | Large | Open |

---

## How to use this register

- When a debt item is resolved, update its **Status** to `Resolved YYYY-MM-DD` and ~~strike through~~ the issue description.
- Before starting a refactor touching a file with open debt items, review this register first.
- When adding a new debt item: assign the next `TD-NNN` ID, fill all columns, set Status to `Open`.
- This file is updated as part of every release cycle.
- Severity levels: **Critical** → blocks npm publish; **High** → blocks v0.1.0; **Medium** → blocks v0.2.0; **Low** → tracked, no blocker.
