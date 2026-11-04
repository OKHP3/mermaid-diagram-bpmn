import { zip } from "fflate";
import {
  AGENT_TARGETS,
  handoffFiles,
  type AgentTarget,
} from "./process-handoff";
import type { ProcessBundle } from "./process-bundle";
import standard from "../../standards/bpmn-beta-standard.md?raw";
import license from "../../../LICENSE?raw";

// Build from canonical skill sources. This module is loaded only on download;
// missing files fail the build instead of producing a partial handoff package.
const packages = import.meta.glob<string>(
  [
    "../../../skills/okhp3-process-intake-and-scope/**",
    "../../../skills/okhp3-elicitation-interviews/**",
    "../../../skills/okhp3-stakeholder-and-role-mapping/**",
    "../../../skills/okhp3-process-narrative-authoring/**",
    "../../../skills/okhp3-visual-process-modeling/**",
    "!../../../skills/**/node_modules/**",
    "!../../../skills/**/tests/**",
  ],
  { query: "?raw", import: "default", eager: true },
);

export function buildHandoffFiles(
  bundle: ProcessBundle,
  target: AgentTarget,
): Record<string, string> {
  const texts = handoffFiles(bundle, target);
  texts["references/bpmn-beta-standard.md"] = standard;
  texts["LICENSE"] = license;
  for (const [path, content] of Object.entries(packages)) {
    texts[path.replace("../../../skills", AGENT_TARGETS[target].directory)] =
      content;
  }
  return texts;
}

export function downloadHandoff(
  bundle: ProcessBundle,
  target: AgentTarget,
): Promise<void> {
  const texts = buildHandoffFiles(bundle, target);
  const files = Object.fromEntries(
    Object.entries(texts).map(([name, content]) => [
      name,
      new TextEncoder().encode(content),
    ]),
  );
  return new Promise((resolve, reject) =>
    zip(files, { level: 6 }, (error, bytes) => {
      if (error) {
        reject(error);
        return;
      }
      const href = URL.createObjectURL(
        new Blob([bytes], { type: "application/zip" }),
      );
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = "process-handoff.zip";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      resolve();
    }),
  );
}
