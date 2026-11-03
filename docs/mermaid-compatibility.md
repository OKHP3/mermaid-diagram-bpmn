# Mermaid compatibility

## Current vendor pins

Current adapter target: `mermaid@12.2.0`.
Current CDN target: `mermaid@12.2.0` with the published plugin 0.1.1.

Verified November 3, 2026: [main CI run 41567449202](https://github.com/OKHP3/mermaid-diagram-bpmn/actions/runs/41567449202)
passed 868 unit tests, 12 packed-plugin assertions, 93 Chromium, 88 Firefox,
88 WebKit cases, and 62 visual comparisons. The browser matrix ran on Linux;
native Windows/macOS and assistive-technology coverage are not implied.
The published plugin remains 0.1.1; its original exported build target is
distinct from this repository's rebuilt source package and tested CDN pairing.

The app manifest is canonical. The source target, exact peer contract, standalone
fixture, browser example, and generated release manifest move together.
An update is a candidate until its full CI run passes. The daily updater opens
a review PR only after explicit CI, including three browsers and visual checks.
It does not publish new plugin bytes to npm or merge unreviewed candidates.

Mermaid 12 requires ES2024-capable browsers (including Safari 17.4+) and Node
22.12 or newer. Bundled consumers import the `mermaid` package. Production
browser examples keep strict security. The happy-dom source/packed tests use
loose security only for that DOM harness's SVG limitations.

## November 3, 2026 migration evidence

Replit Free tested Mermaid 12.2.0 with the existing `bpmn-beta` external diagram
registration. The integration suite, production build, packed-plugin smoke,
CDN asset check, and Chromium tests passed. Firefox and WebKit executables were
absent there; GitHub CI supplies the complete three-browser and visual checks.
The earlier records below remain evidence for their original versions only.
See the PR and CI results for the final reviewed source revision.

## Historical compatibility record

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
