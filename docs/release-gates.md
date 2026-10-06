# Safety and Portability Release Gates

**Product:** BPMN for Mermaid  
**Report command:** `pnpm run check:release-gates -- --output release-gate-report.json`  
**Decision rule:** `NO-GO` blocks deployment and npm publication. `GO-WITH-LIMITS` is allowed only when all blocking gates pass and the browser/support boundaries remain visible.

This is a browser-first, static product. The boundaries under review are the React app, the published Mermaid plugin, generated BP-SKILL downloads, hand-written SVG output, and public static artifacts. Backend services, accounts, telemetry, BPMN execution, and BPMN XML interchange are not part of this gate.

## Gate matrix

| Gate | Owner | Named check / manual check | Pass/fail interpretation | Escalation |
|---|---|---|---|---|
| Dependency vulnerabilities | Release engineering | `pnpm audit --json`; `pnpm run check:release-gates` | Any critical or high finding is a fail. Moderate and low findings are reported and require a documented mitigation. | Upgrade/replace the dependency and rerun; do not publish while a critical/high finding remains. |
| License compatibility | Release engineering | `pnpm licenses list --json`; `pnpm run check:release-gates` | Every resolved license must be in the approved allowlist. Unknown licenses fail until manually identified or the dependency is removed. | Obtain authoritative SPDX metadata or replace the dependency. |
| Untrusted diagram input | Maintainers | `pnpm run check:release-gates` plus parser/renderer tests | No dynamic code execution or document writes in rendering paths; parser failures remain visible. | Treat a new unsafe sink as a security issue and add a regression test. |
| SVG safety | Renderer maintainers | `pnpm run check:release-gates` plus browser E2E | SVG is parsed as SVG, labels are XML-escaped, and browser output is tested under Mermaid strict security. | Block release and add a real-browser injection regression. |
| Accessibility | UI maintainers | Application tests, axe checks, and manual keyboard/assistive-technology review | Automated semantics and names must pass. Automated results do not establish complete screen-reader or keyboard support. | Narrow the public claim and schedule browser/AT verification. |
| Browser portability | Release engineering | Chromium/Firefox/WebKit Playwright matrix in CI; `RELEASE_BROWSER_EVIDENCE` records scope | Only engines actually run may be claimed. Linux/Chromium is not Windows, Firefox, WebKit, touch, or assistive-technology proof. | Install missing native libraries or update the compatibility record with the narrower boundary. |
| Comparison evidence | Documentation maintainers | `pnpm run check:comparison-evidence`; `pnpm run check:dfki-7699` | Every external notation and research claim on the public comparison page must retain an inspectable source link; DFKI issue drift is checked separately. | Restore the missing source link or remove the unsupported comparison claim before release. |
| Clean-install reproducibility | Release engineering | `pnpm install --frozen-lockfile && pnpm run build` | Lockfile, package-manager declaration, generated assets, and production build must reproduce from a clean checkout. | Regenerate and commit lockfile/generated artifacts, then rerun the gate. |

## Current report interpretation

The report is deliberately a release decision, not a claim that every check has universal evidence:

- The 2026-10-06 lockfile audit reports zero high/critical findings after patching the existing transitive overrides to `brace-expansion` 5.0.11 and `source-map-js` 1.2.2. Earlier override repairs remain in place. [Brace expansion advisory](https://github.com/advisories/GHSA-qhr7-859c-m2p7) and [source map advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) identify the patched versions.
- Three low and two moderate findings remain visible in DOMPurify, KaTeX, brace expansion, and the build-time PostCSS selector parser. Packaging uses repository-owned patterns; build-time selectors come from repository source. Sanitizer and math dependencies remain subject to the tested Mermaid compatibility pair and strict browser-host contract. This bounded mitigation is not a vulnerability-free claim; dependency changes require integration/browser/CDN review.
- The declared and locked Mermaid target is `11.17.2`. An older local install at `11.4.1` is an environment mismatch, not the canonical compatibility contract.
- Browser evidence must identify its actual host. Firefox and WebKit launch evidence comes from the CI matrix; no Windows or assistive-technology result is inferred from Linux checks.
- Unknown license metadata remains a blocking finding until each package is identified from authoritative package metadata or removed.

The machine-readable report includes the revision, Node/pnpm versions, observed advisories/licenses, each gate owner and escalation path, the browser evidence scope, and the final `NO-GO` or `GO-WITH-LIMITS` decision. CI uploads it when the gate fails so it can be attached to a release review and compared with later runs.

Run with the declared pnpm version. Missing commands, malformed audit JSON, and failed license lookups stop the gate; they cannot become empty successful results. Windows uses the pnpm command shim. Regression cases run with `node --test scripts/check-release-gates.test.mjs` and in CI.
