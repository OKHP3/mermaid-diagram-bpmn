import { describe, expect, it } from "vitest";
import {
  blankBundle,
  purchaseBundle,
  readBundle,
  importProcessFile,
  intakeQuestions,
  diagramCheck,
  toYaml,
} from "@/lib/process-bundle";
import {
  handoffFiles,
  handoffPrompt,
  AGENT_TARGETS,
} from "@/lib/process-handoff";
import { buildHandoffFiles } from "@/lib/process-handoff-download";
import { validatePir } from "../../../skills/okhp3-process-intake-and-scope/scripts/validate-pir.mjs";

const validSource = 'bpmn-beta\nstart s "Start"\nend e "End"\nflow s -> e';
describe("process bundle contract", () => {
  it("keeps unknown facts empty and provides questions without inventing validation or approval", () => {
    const bundle = blankBundle();
    expect(bundle.pir.validation).toEqual({
      completeness_score: null,
      ready_for_narrative: null,
    });
    expect(bundle.pir.elicitation_date).toBe("");
    expect(bundle.review.status).toBe("not-reviewed");
    expect(intakeQuestions(bundle)).toContain("Which role owns the process?");
    expect(readBundle(JSON.stringify(bundle))).toEqual(bundle);
  });
  it("preserves IDs, optional PIR sections, source and evidence in a JSON round trip", () => {
    const bundle = purchaseBundle();
    bundle.pir.business_rules = [
      { id: "rule-1", description: "Keep provided evidence", source: "policy" },
    ];
    bundle.pir.systems = [
      { name: "Request portal", role: "source", integration_type: "ui" },
    ];
    bundle.pir.controls = [
      { id: "control-1", type: "audit", description: "Retain review" },
    ];
    bundle.diagram.source = validSource;
    bundle.scope.evidence =
      'Unicode: café\n"Quoted" evidence <script> is text.';
    expect(
      readBundle(handoffFiles(bundle, "codex")["process-bundle.json"]),
    ).toEqual(bundle);
  });
  it("matches the canonical PIR validator when the required facts are supplied", () => {
    const bundle = purchaseBundle();
    Object.assign(bundle.pir, {
      department: "Finance",
      elicitation_method: "workshop",
      elicitation_date: "2026-11-03",
      elicited_by: "Analyst",
    });
    expect(validatePir(bundle.pir).errors).toEqual([]);
    expect(bundle.pir.pir_version).toBe("0.1");
  });
  it.each([
    (b: any) => {
      b.version = 2;
    },
    (b: any) => {
      b.pir.pir_version = "2";
    },
    (b: any) => {
      b.pir.steps = [null];
    },
    (b: any) => {
      b.pir.trigger.event_type = "imaginary";
    },
    (b: any) => {
      b.pir.actors.push(b.pir.actors[0]);
    },
    (b: any) => {
      b.scope.cloud = "unhandled";
    },
    (b: any) => {
      delete b.pir.open_questions;
    },
    (b: any) => {
      b.pir.elicitation_date = "2026-02-31";
    },
    (b: any) => {
      b.pir.process_id = "../../unsafe";
    },
    (b: any) => {
      b.review.status = "review-recorded";
    },
  ])("rejects malformed or unsupported data instead of losing it", (mutate) => {
    const bundle = purchaseBundle();
    mutate(bundle);
    expect(() => readBundle(JSON.stringify(bundle))).toThrow();
  });
  it("rejects unknown prototype keys and oversized content", () => {
    expect(() => readBundle('{"__proto__":{}}')).toThrow(/unsupported/);
    expect(() => readBundle(" ".repeat(1_000_001))).toThrow(/too large/);
    const bundle = blankBundle();
    bundle.diagram.source = "x".repeat(500_001);
    expect(() => readBundle(JSON.stringify(bundle))).toThrow(/oversized/);
  });
  it("retains unresolved actor references as visible questions", () => {
    const bundle = purchaseBundle();
    bundle.pir.steps[0].actor_role_id = "missing-role";
    const imported = readBundle(JSON.stringify(bundle));
    expect(imported.pir.steps[0].actor_role_id).toBe("missing-role");
    expect(
      intakeQuestions(imported).some((question) =>
        question.includes("step-submit"),
      ),
    ).toBe(true);
  });
  it("imports source without replacing the brief and resets any previous review", () => {
    const bundle = purchaseBundle();
    bundle.review = {
      status: "review-recorded",
      reviewer: "Owner",
      notes: "Reviewed earlier",
    };
    const result = importProcessFile("returned.mmd", validSource, bundle);
    expect(result.pir).toEqual(bundle.pir);
    expect(result.diagram.source).toBe(validSource);
    expect(result.review.status).toBe("not-reviewed");
    expect(bundle.review.status).toBe("review-recorded");
  });
  it("allows repairable bpmn-beta source but rejects other formats", () => {
    const result = importProcessFile(
      "broken.mmd",
      "bpmn-beta\nnot a valid node",
      blankBundle(),
    );
    expect(diagramCheck(result.diagram.source).error).toBeTruthy();
    expect(() =>
      importProcessFile("wrong.mmd", "flowchart LR\nA-->B", blankBundle()),
    ).toThrow(/bpmn-beta/);
    expect(() =>
      importProcessFile("process.bpmn", "<xml/>", blankBundle()),
    ).toThrow(/not imported/);
  });
  it("keeps syntax diagnostics separate from stakeholder review", () => {
    expect(diagramCheck(validSource).error).toBeNull();
    expect(diagramCheck("bpmn-beta").error).toMatch(/no process nodes/);
    expect(purchaseBundle().review.status).toBe("not-reviewed");
  });
  it("writes quoted YAML scalars without interpreting user text as structure", () => {
    const yaml = toYaml({
      pir_version: "0.1",
      open_questions: ['Who: "owns" this?'],
      trigger: { description: "line one\nline two" },
    });
    expect(yaml).toContain('pir_version: "0.1"');
    expect(yaml).toContain("- " + JSON.stringify('Who: "owns" this?'));
    expect(yaml).toContain('description: "line one\\nline two"');
  });
  it.each(Object.keys(AGENT_TARGETS) as (keyof typeof AGENT_TARGETS)[])(
    "provides a complete return path for %s",
    (target) => {
      const prompt = handoffPrompt(purchaseBundle(), target);
      expect(prompt).toContain(AGENT_TARGETS[target].directory);
      expect(prompt).toContain(
        "references/bpmn-beta-standard.md is authoritative",
      );
      expect(prompt).toContain("process-bundle.json");
      expect(prompt).toContain("What are the approval limits?");
      expect(prompt).toContain("This web app does not run agent skills");
    },
  );
  it("bounds the raw skill bundle to the five intended packages", () => {
    const files = buildHandoffFiles(purchaseBundle(), "claude");
    expect(
      Object.keys(files).filter((path) => path.endsWith("/SKILL.md")),
    ).toHaveLength(5);
    expect(
      files[
        ".claude/skills/okhp3-process-intake-and-scope/scripts/validate-pir.mjs"
      ],
    ).toContain("export function validatePir");
    expect(files["references/bpmn-beta-standard.md"]).toContain("task:user");
    expect(
      Object.keys(files).some(
        (path) =>
          path.includes("../") ||
          path.includes("node_modules") ||
          path.includes("/tests/"),
      ),
    ).toBe(false);
  });
});
