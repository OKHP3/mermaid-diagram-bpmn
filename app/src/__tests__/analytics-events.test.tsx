/**
 * UI wiring tests for anonymous analytics events.
 *
 * These tests keep the real `trackEvent` implementation in place. They configure
 * its endpoint and intercept `navigator.sendBeacon`, then exercise each page's
 * successful user action to prove the expected event reaches the analytics edge.
 *
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/bpmn-renderer", () => ({
  BpmnRenderer: () => (
    <svg xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="4" />
    </svg>
  ),
}));

vi.mock("@/components/StatusRibbon", () => ({
  StatusRibbon: () => null,
}));

vi.mock("fflate", () => ({
  zip: (
    _files: Record<string, Uint8Array>,
    _options: unknown,
    callback: (error: Error | null, data: Uint8Array) => void,
  ) => callback(null, new Uint8Array([0x50, 0x4b])),
}));

vi.mock("@/components/skills/DependencyFlowDiagram", () => ({
  DependencyFlowDiagram: () => <div />,
}));
vi.mock("@/components/skills/DownloadButton", () => ({
  DownloadButton: () => <button>Download</button>,
}));
vi.mock("@/components/ExternalLinkAnchor", () => ({
  ExternalLinkAnchor: ({ children }: { children: React.ReactNode }) => <a href="#">{children}</a>,
}));
vi.mock("@/components/skills/PipelineDiagram", () => ({
  PipelineDiagram: () => <div />,
}));
vi.mock("@/components/skills/PnsLifecycleTracker", () => ({
  PnsLifecycleTracker: () => <div />,
}));
vi.mock("@/components/skills/SkillCard", () => ({
  SkillCard: () => <div />,
}));
vi.mock("@/components/skills/SkillFrontmatterPreview", () => ({
  SkillFrontmatterPreview: () => <div />,
}));
vi.mock("@/components/skills/StartHerePanel", () => ({
  StartHerePanel: () => <div />,
}));
vi.mock("@/components/skills/VariableFileCard", () => ({
  VariableFileCard: () => <div />,
}));

import Playground from "@/pages/Playground";
import PluginInstallation from "@/pages/PluginInstallation";
import AgentSkills from "@/pages/AgentSkills";

const TEST_ENDPOINT = "https://analytics.example.test/count";
let sendBeaconSpy: ReturnType<typeof vi.fn>;

function configureAnalytics(endpoint = TEST_ENDPOINT) {
  sendBeaconSpy = vi.fn();
  vi.stubGlobal("navigator", {
    sendBeacon: sendBeaconSpy,
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
  vi.stubEnv("VITE_ANALYTICS_ENDPOINT", endpoint);
}

async function expectBeaconEvent(eventName: string) {
  await waitFor(() => expect(sendBeaconSpy).toHaveBeenCalledOnce());

  const [endpoint, body] = sendBeaconSpy.mock.calls[0] as [string, Blob];
  expect(endpoint).toBe(TEST_ENDPOINT);
  expect(JSON.parse(await body.text())).toMatchObject({ e: eventName });
}

beforeEach(() => {
  configureAnalytics();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(1),
    }),
  );
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:analytics-test");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("analytics event wiring", () => {
  it("records SVG exports from the Playground", async () => {
    render(<Playground />);

    fireEvent.click(screen.getByTestId("button-export-svg"));

    await expectBeaconEvent("playground-export-svg");
  });

  it("records a successful plugin install-command copy", async () => {
    render(<PluginInstallation />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("code-install-copy-btn"));
    });

    await expectBeaconEvent("plugin-copy");
  });

  it("records successful BP-SKILL suite downloads", async () => {
    render(<AgentSkills />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Download the Suite" }));
    });

    await expectBeaconEvent("suite-download");
  });

  it("records successful context starter-pack downloads", async () => {
    render(<AgentSkills />);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "Download context/ Template Pack" }),
      );
    });

    await expectBeaconEvent("starter-pack-download");
  });

  it("keeps UI actions local when analytics has no configured endpoint", async () => {
    vi.unstubAllEnvs();
    configureAnalytics("");
    render(<PluginInstallation />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("code-install-copy-btn"));
    });

    await waitFor(() => expect(sendBeaconSpy).not.toHaveBeenCalled());
  });
});