# Mermaid Compatibility

**Status as of 2026-08-04:** Source-verified against `mermaid@11.4.1`.

---

## Verification

The `bpmn-beta` plugin adapter is verified against a real `mermaid.render()` call by
**`app/src/lib/__tests__/bpmn-plugin-integration.test.ts`**.

The test suite:

1. Imports `mermaid` at the exact version declared in `MERMAID_VERSION_TARGET` (`11.4.1`).
2. Calls `mermaid.registerExternalDiagrams([bpmnPlugin])`.
3. Calls `mermaid.render()` against two corpus examples:
   - `app/examples/01-linear-process.mmd` — flat diagram (no pools or lanes)
   - `app/examples/08-purchase-order-approval.mmd` — pool/lane diagram with conditional flows
4. Asserts the returned SVG contains the expected `bpmn-*` CSS class names and throws no error.
5. Exercises FR-018 live theme-variable binding: verifies the `styles()` provider caches and injects resolved `themeVariables` at render time.
6. Exercises TD-004 error handling: verifies that invalid DSL surfaces a diagnostic rather than silently producing a blank output.

This test runs as part of the standard application test suite (`pnpm --filter @workspace/mermaid-diagram-bpmn run test`) and is a merge-blocking check in `ci.yml`.

---

## Evidence tier

| Claim | Evidence tier | Test citation |
|---|---|---|
| Plugin detector identifies `bpmn-beta` source correctly | **confirmed** | `bpmn-detector.test.ts` |
| Parser produces correct `BpmnDb` from all 5 corpus fixtures | **confirmed** | `bpmn-parser-corpus.test.ts` |
| React renderer produces correct SVG classes from `BpmnDb` | **confirmed** | `bpmn-renderer.test.tsx` |
| Plugin adapter calls `mermaid.registerExternalDiagrams` and `mermaid.render()` successfully | **source-verified** | `bpmn-plugin-integration.test.ts` |
| SVG produced by adapter contains `bpmn-task`, `bpmn-event`, `bpmn-flow-sequence` classes | **source-verified** | `bpmn-plugin-integration.test.ts` |
| Pool/lane diagram produces `bpmn-pool`, `bpmn-lane`, `bpmn-flow-conditional`, `bpmn-gateway` classes | **source-verified** | `bpmn-plugin-integration.test.ts` |
| FR-018: `styles()` reads live `themeVariables` at render time, not a static fallback | **source-verified** | `bpmn-plugin-integration.test.ts` — "FR-018: live theme-variable binding" describe block |
| Plugin is externally consumable as an installable npm package | **packaged** | `lib/bpmn-plugin/` workspace package; `pnpm pack` produces 6-file tarball verified by `scripts/run-plugin-smoke.mjs` — 12/12 smoke assertions pass |
| `MermaidHostDemo` component does not pass `securityLevel:'loose'` to `mermaid.initialize()` | **confirmed** | `mermaid-host-demo.test.tsx` — mocked unit test asserts the component's init call omits `securityLevel:'loose'`; this is a component-behaviour assertion, not a real-browser render |
| Plugin renders in a real browser with default Mermaid security (automated E2E) | **not complete** | Live route `/mermaid-host-demo` confirms this manually; automated Playwright E2E deferred to follow-up task #185 |

---

## Definitions

| Tier | Meaning |
|---|---|
| **confirmed** | Verified by Vitest unit or corpus test against the application's own pipeline |
| **source-verified** | Verified by a test that calls real `mermaid.render()` in a happy-dom environment |
| **packaged** | Verified via a built `.tgz` artifact in a clean-install fixture |
| **browser-verified** | Verified in a real browser DOM without `securityLevel: "loose"` — not yet achieved; target for automated Playwright E2E (#185) |
| **not complete** | The claim cannot be made yet; work required is noted |

---

## Known test environment constraint

The integration test initializes Mermaid with `securityLevel: "loose"`. This is required in
`happy-dom` because its HTML parser drops SVG children after `<defs>` when parsing inside an
SVG context. DOMPurify (Mermaid's default sanitizer) re-parses the SVG through the same HTML
parser, which strips all `<g>` nodes. With `securityLevel: "loose"`, Mermaid skips DOMPurify
and returns the SVG string produced by `draw()` via `DOMParser(image/svg+xml)`, which
correctly preserves all elements.

This is **not** a security bypass in production. In a real browser, the HTML parser correctly
assigns SVG namespace to children of an SVG element, and DOMPurify works as expected. The
The Phase 3 `/mermaid-host-demo` route demonstrates this in a real browser. `app/src/__tests__/mermaid-host-demo.test.tsx` (mocked unit test) asserts the component does not pass `securityLevel: "loose"` to `mermaid.initialize()` — this is a **confirmed** component-behaviour claim. Automated real-browser E2E (Playwright) to upgrade this to **browser-verified** is a deferred follow-up (task #185).

---

## Mermaid version target

The plugin targets `mermaid@11.4.1`, declared as `MERMAID_VERSION_TARGET` in
`app/src/lib/bpmn-plugin.ts` and pinned as a `devDependency` in `app/package.json`.

The integration test asserts that the installed Mermaid version matches `MERMAID_VERSION_TARGET`
to prevent silent version drift between the declared target and the installed package.

---

## Running the integration test

```bash
pnpm --filter @workspace/mermaid-diagram-bpmn run test
```

The integration test file is `app/src/lib/__tests__/bpmn-plugin-integration.test.ts`. It is
included in the standard Vitest run and does not require a separate command.
