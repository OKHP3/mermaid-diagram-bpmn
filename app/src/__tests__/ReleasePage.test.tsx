/**
 * ReleasePage manifest rendering coverage.
 *
 * Confirms the static release manifest import remains visible to plugin adopters
 * without loading data over the network or reading files at test runtime.
 *
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ReleasePage from "@/pages/ReleasePage";
import releaseManifest from "../../public/release-manifest.json";

const TIER_LABELS: Record<string, string> = {
  supported: "Supported",
  provisional: "Provisional",
  disputed: "Disputed",
  blocked: "Blocked",
  confirmed: "Confirmed",
  "source-verified": "Source-verified",
  "ci-gated": "CI-gated",
  "browser-verified": "Browser-verified",
  "not-complete": "Not complete",
};

function setup() {
  return render(<ReleasePage />);
}

describe("ReleasePage", () => {
  it("renders the release manifest heading", () => {
    setup();

    expect(screen.getByTestId("heading-release").textContent).toContain("Release Manifest");
  });

  it("renders the manifest package and version in the identity card", () => {
    setup();

    const identity = screen.getByTestId("section-identity");
    expect(identity.textContent).toContain(releaseManifest.pluginPackage);
    expect(identity.textContent).toContain(releaseManifest.pluginVersion);
  });

  it("renders the targeted Mermaid version in the identity card", () => {
    setup();

    expect(screen.getByTestId("section-identity").textContent).toContain(
      `mermaid@${releaseManifest.mermaidVersionTarget}`,
    );
  });

  it("renders every manifest evidence entry with its evidence-tier badge", () => {
    setup();

    for (const entry of releaseManifest.evidenceTiers) {
      const evidenceRow = screen.getByTestId(`evidence-${entry.id}`);

      expect(evidenceRow.textContent).toContain(entry.claim);
      expect(evidenceRow.textContent).toContain(entry.evidence);
      expect(within(evidenceRow).getByText(TIER_LABELS[entry.tier])).toBeTruthy();
    }
  });

  it("links to the raw static release manifest JSON", () => {
    setup();

    const manifestLink = screen.getByTestId("link-manifest-json");
    expect(manifestLink.getAttribute("href")).toContain("release-manifest.json");
    expect(manifestLink.textContent).toContain("release-manifest.json");
  });
});