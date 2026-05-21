# Release Checklist — BPMN for Mermaid

Use this checklist before tagging and deploying any release.

---

## Pre-release: identity and brand

- [ ] Canonical disclaimer present in README and major docs
- [ ] No full BPMN 2.0 compliance claimed anywhere in UI or docs
- [ ] DSL keyword `bpmn-beta` used consistently — not `bpmn` (without beta)
- [ ] Public title is "BPMN for Mermaid" — not "bpmn-beta tool" in any user-facing copy
- [ ] Status ribbon present on Home page until npm package ships

---

## Pre-release: Mermaid compatibility

- [ ] `MERMAID_VERSION_TARGET` constant in `bpmn-plugin.ts` reflects the intended target version
- [ ] `ExternalDiagramDefinition` shape verified against Mermaid source for target version
- [ ] `docs/mermaid-compatibility.md` updated if any contract changed
- [ ] `bpmn-plugin.ts` loader, parser.yy, draw, and styles all present and typed correctly

---

## Pre-release: tests and typecheck

- [ ] `pnpm --filter @workspace/mermaid-diagram-bpmn run test` — all 58 tests pass
- [ ] `pnpm --filter @workspace/mermaid-diagram-bpmn run typecheck` — zero errors
- [ ] No `console.log` in any lib module (test files excepted)

---

## Pre-release: DSL coverage

- [ ] Every element type in the support matrix has at least one corpus example
- [ ] Every new element type added since last release has unit tests
- [ ] DSL Reference page (`DslReference.tsx`) matches `docs/dsl-spec.md`
- [ ] Support matrix on Home page is accurate (implemented / experimental / planned)
- [ ] Experimental examples carry visible badge in playground

---

## Pre-release: documentation

- [ ] `CHANGELOG.md` updated with all changes since last release
- [ ] `docs/ROADMAP.md` shows completed items as ✅ Shipped with date
- [ ] `docs/decisions.md` — any new decisions recorded
- [ ] `docs/technical-debt-register.md` — resolved items marked with ~~strikethrough~~ and date
- [ ] `docs/dsl-spec.md` is current

---

## Pre-release: dependencies

- [ ] `package.json` declares only packages actually imported in `src/` (TD-001)
- [ ] No known critical/high CVEs in direct or transitive deps
- [ ] `pnpm-workspace.yaml` overrides are current and documented

---

## Pre-release: playground functionality

### Test A — Simple flow
- [ ] Paste a simple `bpmn-beta` diagram with start, tasks, gateway, end
- [ ] SVG renders correctly with proper BPMN notation
- [ ] Pan and zoom work

### Test B — Pools and lanes (experimental)
- [ ] Load the pools/lanes example from the example selector
- [ ] Pool headers and lane labels render
- [ ] Experimental badge is visible

### Test C — Error handling
- [ ] Type invalid syntax into playground
- [ ] Error message displays (not a blank canvas) — *Note: this gap exists until BL-003 is fixed*

### Test D — All 5 examples
- [ ] Load each of the 5 examples from the selector
- [ ] All render without error

---

## Release steps

1. Update `CHANGELOG.md` — move [Unreleased] items to versioned section with date
2. Bump version in `package.json`
3. Run full checklist above
4. Tag: `git tag v0.X.Y && git push origin v0.X.Y`
5. Push to main → GitHub Actions deploys to GitHub Pages automatically
6. Create GitHub Release with CHANGELOG notes
7. If publishing npm package (v0.1.0+): `pnpm publish` from artifact root
