# Mermaid compatibility

## September 20, 2026 compatibility refresh

The application and current source adapter target Mermaid 11.17.2. The exact
pin is in `app/package.json`; `MERMAID_VERSION_TARGET` in
`app/src/lib/bpmn-plugin.ts` must match it. The packed consumer fixture uses
the same Mermaid version. No Mermaid 12 compatibility claim is made.

The application suite passes 868 tests locally, including the real
`registerExternalDiagrams()` and `mermaid.render()` integration checks. Those
checks exercise flat and pool/lane corpus examples, live theme binding and
invalid-input diagnostics. The complete suite remains required in CI.

The source integration tests use happy-dom and `securityLevel: "loose"` because
its SVG parsing differs from a browser. This setting is limited to that test
harness. The real-browser host demo and standalone CDN example retain strict
security. CI tests Chromium, Firefox and WebKit and compares Linux visual
baselines. Their run results are the evidence for browser compatibility.

The standalone CDN example pins Mermaid 11.17.2 together with the already
published `@okhp3/mermaid-diagram-bpmn@0.1.1`. Updating the application and test
fixture does not publish new plugin bytes to npm. The CDN checker verifies
both exact URLs; Chromium E2E exercises the published pair in strict mode.

The packed smoke fixture tests the current source package separately. Its
results must not be presented as evidence that npm received a new release.

## Evidence locations

- `app/src/lib/__tests__/bpmn-plugin-integration.test.ts`: real Mermaid source integration.
- `fixtures/plugin-smoke/smoke.mjs`: clean installed package boundary.
- `app/e2e/host-demo.spec.ts`: real-browser host and standalone CDN rendering.
- `app/public/browser-cdn-example.html`: exact published CDN pair.
- `.github/workflows/ci.yml`: full tests, package smoke, three-browser E2E and visuals.
- `.github/workflows/deploy-gh-pages.yml`: validated Pages build and Chromium checks.

Historical August evidence used Mermaid 11.4.1. It is not evidence for this
new target. See current CI runs and the release manifest for the reviewed
source revision and retained limitations.
