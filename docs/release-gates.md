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
| Clean-install reproducibility | Release engineering | `pnpm install --frozen-lockfile && pnpm run build` | Lockfile, package-manager declaration, generated assets, and production build must reproduce from a clean checkout. | Regenerate and commit lockfile/generated artifacts, then rerun the gate. |

## Current report interpretation

The report is deliberately a release decision, not a claim that every check has universal evidence:

- Dependency high/critical findings are cleared by workspace overrides for transitive `brace-expansion`, `lodash-es`, and `uuid`.
- Mermaid `11.4.1` still has moderate/low advisories. It is the exact tested Mermaid target and the browser-CDN contract, so upgrading it is a compatibility change requiring a new integration/browser/CDN review. This is visible as a warning and is not silently described as vulnerability-free.
- The local environment provides Linux/Chromium evidence. Firefox and WebKit launch evidence must come from the CI matrix; no Windows or assistive-technology result is inferred.
- Unknown license metadata remains a blocking finding until each package is identified from authoritative package metadata or removed.

The machine-readable report includes the revision, Node/pnpm versions, observed advisories/licenses, each gate owner and escalation path, the browser evidence scope, and the final `NO-GO` or `GO-WITH-LIMITS` decision. CI uploads it when the gate fails so it can be attached to a release review and compared with later runs.