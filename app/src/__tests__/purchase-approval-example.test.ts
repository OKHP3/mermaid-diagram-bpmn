import { describe, it, expect } from "vitest";
import { PURCHASE_APPROVAL_STEPS } from "@/data/purchase-approval-steps";
import { EMPLOYEE_OFFBOARDING_STEPS } from "@/data/employee-offboarding-steps";
import { OFFBOARDING_NODE_LINKS } from "@/pages/EmployeeOffboardingExample";
import { PURCHASE_APPROVAL_NODE_LINKS } from "@/pages/PurchaseApprovalExample";
import { SKILLS } from "@/data/skills-registry";
import { PNS_TRANSITIONS } from "@/data/pns-transitions-auto";

const registryIds = new Set(SKILLS.map((s) => s.id));

describe("purchase-approval example", () => {
  it("every step skillId resolves to a known SKILLS entry", () => {
    const missing = PURCHASE_APPROVAL_STEPS.filter((s) => !registryIds.has(s.skillId));
    expect(
      missing.map((s) => s.skillId),
      "Skill IDs in PURCHASE_APPROVAL_STEPS not found in the registry",
    ).toHaveLength(0);
  });

  it("covers all 15 BP-SKILL pipeline skills", () => {
    expect(PURCHASE_APPROVAL_STEPS).toHaveLength(SKILLS.length);
  });

  it("each skill appears exactly once", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const step of PURCHASE_APPROVAL_STEPS) {
      if (seen.has(step.skillId)) duplicates.push(step.skillId);
      seen.add(step.skillId);
    }
    expect(duplicates, "Duplicate skill IDs in PURCHASE_APPROVAL_STEPS").toHaveLength(0);
  });

  it("steps are in pipeline order", () => {
    const orders = PURCHASE_APPROVAL_STEPS.map((s) => {
      const skill = SKILLS.find((sk) => sk.id === s.skillId);
      return skill?.pipelineOrder ?? -1;
    });
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);
  });
});

describe("employee-offboarding example", () => {
  it("every step skillId resolves to a known SKILLS entry", () => {
    const missing = EMPLOYEE_OFFBOARDING_STEPS.filter((s) => !registryIds.has(s.skillId));
    expect(
      missing.map((s) => s.skillId),
      "Skill IDs in EMPLOYEE_OFFBOARDING_STEPS not found in the registry",
    ).toHaveLength(0);
  });

  it("covers all 15 BP-SKILL pipeline skills", () => {
    expect(EMPLOYEE_OFFBOARDING_STEPS).toHaveLength(SKILLS.length);
  });

  it("each skill appears exactly once", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const step of EMPLOYEE_OFFBOARDING_STEPS) {
      if (seen.has(step.skillId)) duplicates.push(step.skillId);
      seen.add(step.skillId);
    }
    expect(duplicates, "Duplicate skill IDs in EMPLOYEE_OFFBOARDING_STEPS").toHaveLength(0);
  });

  it("steps are in pipeline order", () => {
    const orders = EMPLOYEE_OFFBOARDING_STEPS.map((s) => {
      const skill = SKILLS.find((sk) => sk.id === s.skillId);
      return skill?.pipelineOrder ?? -1;
    });
    const sorted = [...orders].sort((a, b) => a - b);
    expect(orders).toEqual(sorted);
  });
});

describe("pns-transitions registry", () => {
  it("every PNS_TRANSITIONS key resolves to a known SKILLS entry", () => {
    const missing = Object.keys(PNS_TRANSITIONS).filter((id) => !registryIds.has(id));
    expect(
      missing,
      "Keys in PNS_TRANSITIONS not found in the SKILLS registry",
    ).toHaveLength(0);
  });

  it("PNS_TRANSITIONS covers all 15 BP-SKILL pipeline skills", () => {
    expect(Object.keys(PNS_TRANSITIONS)).toHaveLength(SKILLS.length);
  });
});

describe("employee-offboarding node links", () => {
  it("every OFFBOARDING_NODE_LINKS route points to a real skill id", () => {
    const missing: string[] = [];
    for (const [node, route] of Object.entries(OFFBOARDING_NODE_LINKS)) {
      // Route format: "/skills/<skill-id>"
      const skillId = route.replace(/^\/skills\//, "");
      if (!registryIds.has(skillId)) {
        missing.push(`${node}: "${route}" (id "${skillId}" not in registry)`);
      }
    }
    expect(
      missing,
      "OFFBOARDING_NODE_LINKS routes that do not match a real skill id",
    ).toHaveLength(0);
  });

  it("OFFBOARDING_NODE_LINKS has exactly 11 entries", () => {
    expect(Object.keys(OFFBOARDING_NODE_LINKS)).toHaveLength(11);
  });

  it("every OFFBOARDING_NODE_LINKS route starts with /skills/", () => {
    const invalid = Object.entries(OFFBOARDING_NODE_LINKS)
      .filter(([, route]) => !route.startsWith("/skills/"))
      .map(([node, route]) => `${node}: "${route}"`);
    expect(
      invalid,
      "OFFBOARDING_NODE_LINKS routes not starting with /skills/",
    ).toHaveLength(0);
  });
});

describe("purchase-approval node links", () => {
  it("every PURCHASE_APPROVAL_NODE_LINKS route points to a real skill id", () => {
    const missing: string[] = [];
    for (const [node, route] of Object.entries(PURCHASE_APPROVAL_NODE_LINKS)) {
      // Route format: "/skills/<skill-id>"
      const skillId = route.replace(/^\/skills\//, "");
      if (!registryIds.has(skillId)) {
        missing.push(`${node}: "${route}" (id "${skillId}" not in registry)`);
      }
    }
    expect(
      missing,
      "PURCHASE_APPROVAL_NODE_LINKS routes that do not match a real skill id",
    ).toHaveLength(0);
  });

  it("every PURCHASE_APPROVAL_NODE_LINKS route starts with /skills/", () => {
    const invalid = Object.entries(PURCHASE_APPROVAL_NODE_LINKS)
      .filter(([, route]) => !route.startsWith("/skills/"))
      .map(([node, route]) => `${node}: "${route}"`);
    expect(
      invalid,
      "PURCHASE_APPROVAL_NODE_LINKS routes not starting with /skills/",
    ).toHaveLength(0);
  });
});
