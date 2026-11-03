import { parse } from "./bpmn-parser";
import { lint } from "./bpmn-lint";
import { validate } from "./bpmn-validate";

/** PIR 0.1 uses the existing BP-SKILL contract. Empty values are discovery gaps,
 * not assertions. The envelope adds transport, scope and review context only. */
export interface ProcessIntakeRecord {
  pir_version: "0.1";
  process_id: string;
  process_name: string;
  process_owner: string;
  department: string;
  elicitation_method: string;
  elicitation_date: string;
  elicited_by: string;
  status: "draft" | "review" | "complete";
  trigger: { description: string; event_type: string };
  actors: {
    role_id: string;
    role_name: string;
    type: string;
    department?: string;
    interest?: string;
    influence?: string;
  }[];
  inputs: { id: string; name: string; source?: string; format?: string }[];
  outputs: { id: string; name: string; consumer?: string; format?: string }[];
  steps: {
    id: string;
    description: string;
    actor_role_id: string;
    system?: string;
  }[];
  exceptions: {
    id: string;
    description: string;
    trigger?: string;
    handling?: string;
  }[];
  business_rules: { id: string; description: string; source?: string }[];
  systems: { name: string; role?: string; integration_type?: string }[];
  controls: {
    id: string;
    type: string;
    description: string;
    enforced_by?: string;
  }[];
  open_questions: string[];
  validation: {
    completeness_score: number | null;
    ready_for_narrative: boolean | null;
  };
}

export interface ProcessBundle {
  format: "bpmn-process-bundle";
  version: 1;
  pir: ProcessIntakeRecord;
  scope: { purpose: string; exclusions: string; evidence: string };
  diagram: { source: string; provenance: string };
  review: {
    status: "not-reviewed" | "review-recorded";
    reviewer: string;
    notes: string;
  };
}

export const MAX_BUNDLE_BYTES = 1_000_000;
export const INTAKE_DRAFT_PREFIX = "bpmn-intake:draft:v1:";
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export function blankBundle(): ProcessBundle {
  return {
    format: "bpmn-process-bundle",
    version: 1,
    pir: {
      pir_version: "0.1",
      process_id: newId("proc"),
      process_name: "",
      process_owner: "",
      department: "",
      elicitation_method: "",
      elicitation_date: "",
      elicited_by: "",
      status: "draft",
      trigger: { description: "", event_type: "" },
      actors: [],
      inputs: [],
      outputs: [],
      steps: [],
      exceptions: [],
      business_rules: [],
      systems: [],
      controls: [],
      open_questions: [],
      validation: { completeness_score: null, ready_for_narrative: null },
    },
    scope: { purpose: "", exclusions: "", evidence: "" },
    diagram: { source: "", provenance: "No diagram supplied" },
    review: { status: "not-reviewed", reviewer: "", notes: "" },
  };
}

/** A deliberately incomplete example, not facts about the user's organization. */
export function purchaseBundle(): ProcessBundle {
  const bundle = blankBundle();
  Object.assign(bundle.pir, {
    process_name: "Purchase approval",
    process_owner: "Finance Manager",
    trigger: {
      description: "A requester submits a purchase request",
      event_type: "message",
    },
    actors: [
      { role_id: "role-requester", role_name: "Requester", type: "initiator" },
      { role_id: "role-manager", role_name: "Manager", type: "approver" },
    ],
    inputs: [{ id: "inp-request", name: "Purchase request" }],
    outputs: [
      { id: "out-decision", name: "Approved order or rejection notice" },
    ],
    steps: [
      {
        id: "step-submit",
        description: "Submit purchase request",
        actor_role_id: "role-requester",
      },
      {
        id: "step-review",
        description: "Review and decide on the request",
        actor_role_id: "role-manager",
      },
      {
        id: "step-notify",
        description: "Notify requester of the decision",
        actor_role_id: "role-manager",
      },
    ],
    open_questions: [
      "Who issues an approved order?",
      "What are the approval limits?",
      "What happens when information is missing?",
    ],
  });
  bundle.scope = {
    purpose: "Make purchase decisions clear and communicate the outcome",
    exclusions: "Payment and delivery",
    evidence:
      "Illustrative purchase approval starter. Confirm all details with your team.",
  };
  return bundle;
}

type Shape = string | { [key: string]: Shape } | [Shape];
// A transport validator, not the skill's completeness score. Unknown fields are
// rejected explicitly rather than silently dropped during a round trip.
const pirShape: Shape = {
  pir_version: "0.1",
  process_id: "id",
  process_name: "text",
  process_owner: "text",
  department: "text",
  elicitation_method:
    "|interview|workshop|observation|document-analysis|survey",
  elicitation_date: "date",
  elicited_by: "text",
  status: "draft|review|complete",
  trigger: {
    description: "text",
    event_type: "|manual|scheduled|message|system",
  },
  actors: [
    {
      role_id: "id",
      role_name: "text",
      type: "|initiator|performer|approver|reviewer|notified|system",
      "department?": "text",
      "interest?": "text",
      "influence?": "|high|medium|low",
    },
  ],
  inputs: [{ id: "id", name: "text", "source?": "text", "format?": "text" }],
  outputs: [{ id: "id", name: "text", "consumer?": "text", "format?": "text" }],
  steps: [
    { id: "id", description: "text", actor_role_id: "text", "system?": "text" },
  ],
  exceptions: [
    { id: "id", description: "text", "trigger?": "text", "handling?": "text" },
  ],
  business_rules: [
    {
      id: "id",
      description: "text",
      "source?": "|policy|regulation|contract|practice",
    },
  ],
  systems: [
    {
      name: "text",
      "role?": "|source|destination|processor|notification",
      "integration_type?": "|manual|api|batch|ui",
    },
  ],
  controls: [
    {
      id: "id",
      type: "|approval|audit|segregation|validation",
      description: "text",
      "enforced_by?": "text",
    },
  ],
  open_questions: ["text"],
  validation: { completeness_score: "score", ready_for_narrative: "readiness" },
};
const bundleShape: Shape = {
  format: "bpmn-process-bundle",
  version: "version",
  pir: pirShape,
  scope: { purpose: "text", exclusions: "text", evidence: "text" },
  diagram: { source: "source", provenance: "text" },
  review: {
    status: "not-reviewed|review-recorded",
    reviewer: "text",
    notes: "text",
  },
};

function checkShape(value: unknown, shape: Shape, path: string): void {
  const fail = (reason: string): never => {
    throw new Error(`${path}: ${reason}`);
  };
  if (Array.isArray(shape)) {
    if (!Array.isArray(value) || value.length > 200)
      fail("expected a list with at most 200 entries");
    const ids = new Set<string>();
    (value as unknown[]).forEach((item, index) => {
      checkShape(item, shape[0], `${path}[${index + 1}]`);
      if (item && typeof item === "object") {
        const id =
          (item as Record<string, unknown>).id ??
          (item as Record<string, unknown>).role_id;
        if (typeof id === "string") {
          if (ids.has(id)) fail(`duplicate identifier ${id}`);
          ids.add(id);
        }
      }
    });
  } else if (typeof shape === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      fail("expected an object");
    const record = value as Record<string, unknown>;
    const keys = Object.keys(shape).map((key) => key.replace(/\?$/, ""));
    for (const key of Object.keys(record))
      if (!keys.includes(key))
        fail(`unsupported field "${key}"; keep the original file`);
    for (const [rawKey, child] of Object.entries(shape)) {
      const key = rawKey.replace(/\?$/, "");
      if (!(key in record) && rawKey.endsWith("?")) continue;
      checkShape(record[key], child, `${path}.${key}`);
    }
  } else if (shape === "version") {
    if (value !== 1)
      fail("only bundle version 1 is supported; keep the original file");
  } else if (shape === "score") {
    if (
      value !== null &&
      (typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 0 ||
        value > 100)
    )
      fail("expected null or an integer from 0 to 100");
  } else if (shape === "readiness") {
    if (value !== null && typeof value !== "boolean")
      fail("expected null or a boolean");
  } else {
    if (
      typeof value !== "string" ||
      value.length > (shape === "source" ? 500_000 : 10_000)
    )
      fail("missing, invalid or oversized text");
    const text = value as string;
    if (shape === "id" && !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,119}$/.test(text))
      fail(
        "expected a stable identifier (letters, numbers, periods, hyphens or underscores)",
      );
    if (
      shape === "date" &&
      text &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(text) ||
        Number.isNaN(Date.parse(text)) ||
        new Date(text).toISOString().slice(0, 10) !== text)
    )
      fail("expected an ISO calendar date or an empty value");
    if (
      !["text", "source", "id", "date"].includes(shape) &&
      !shape.split("|").includes(text)
    )
      fail(`unsupported value "${text}"`);
  }
}

export function readBundle(text: string): ProcessBundle {
  if (new TextEncoder().encode(text).length > MAX_BUNDLE_BYTES)
    throw new Error("This file is too large. The limit is 1 MB.");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(
      "This is not valid JSON. Choose a process-bundle.json file, or a .mmd source file.",
    );
  }
  checkShape(value, bundleShape, "Bundle");
  const bundle = value as ProcessBundle;
  if (
    bundle.review.status === "review-recorded" &&
    (!bundle.review.reviewer.trim() || !bundle.review.notes.trim())
  )
    throw new Error("A recorded review needs a reviewer and review notes.");
  return bundle;
}

export function intakeQuestions(bundle: ProcessBundle): string[] {
  const p = bundle.pir;
  const gaps = [
    !p.process_name.trim() && "What is this process called?",
    !bundle.scope.purpose.trim() && "What should this process accomplish?",
    !p.trigger.description.trim() && "What starts the process?",
    !p.process_owner.trim() && "Which role owns the process?",
    !p.outputs.some((output) => output.name.trim()) &&
      "What outcome does the process produce?",
    !p.actors.some(
      (actor) => actor.type === "initiator" && actor.role_name.trim(),
    ) && "Who starts the process?",
    !p.actors.some(
      (actor) =>
        ["performer", "approver"].includes(actor.type) &&
        actor.role_name.trim(),
    ) && "Who performs or approves the work?",
    !p.steps.length && "What are the main steps?",
    ...p.steps
      .filter(
        (step) =>
          !step.description.trim() ||
          !p.actors.some((actor) => actor.role_id === step.actor_role_id),
      )
      .map((step) => `Confirm the action and owner for ${step.id}.`),
    !p.exceptions.length && "What exceptions should the team consider?",
    ...p.open_questions,
  ];
  return [
    ...new Set(
      gaps.filter(
        (gap): gap is string => typeof gap === "string" && !!gap.trim(),
      ),
    ),
  ];
}

export function diagramCheck(source: string): {
  error: string | null;
  warnings: string[];
} {
  if (!source.trim())
    return { error: "No diagram supplied yet.", warnings: [] };
  try {
    if (!/^\s*bpmn-beta(?:\s|$)/.test(source))
      throw new Error(
        "Expected bpmn-beta source. Other Mermaid diagrams and BPMN XML are not supported here.",
      );
    const db = parse(source);
    if (!db.getNodes().length)
      throw new Error("The diagram has no process nodes.");
    return {
      error: null,
      warnings: [...lint(db), ...validate(db)].map((issue) => issue.message),
    };
  } catch (error) {
    return { error: (error as Error).message, warnings: [] };
  }
}

export function importProcessFile(
  name: string,
  text: string,
  current: ProcessBundle,
): ProcessBundle {
  if (new TextEncoder().encode(text).length > MAX_BUNDLE_BYTES)
    throw new Error("This file is too large. The limit is 1 MB.");
  if (name.toLowerCase().endsWith(".json")) return readBundle(text);
  if (!name.toLowerCase().endsWith(".mmd"))
    throw new Error(
      "Choose a process bundle (.json) or bpmn-beta source (.mmd). Unzip handoff packages first. YAML, BPMN XML and other file types are not imported.",
    );
  if (text.length > 500_000 || !/^\s*bpmn-beta(?:\s|$)/.test(text))
    throw new Error(
      "Choose bpmn-beta source under 500,000 characters. Keep unsupported content in its original file.",
    );
  return {
    ...current,
    diagram: {
      source: text,
      provenance: `Imported source: ${name.slice(0, 200)}. Process mapping has not been verified.`,
    },
    review: { status: "not-reviewed", reviewer: "", notes: "" },
  };
}

/** Quoted scalar YAML preserves multiline strings and special characters. */
export function toYaml(value: unknown, indent = 0): string {
  const pad = " ".repeat(indent);
  if (Array.isArray(value))
    return value.length
      ? value
          .map((item) =>
            item !== null && typeof item === "object"
              ? `${pad}-\n${toYaml(item, indent + 2)}`
              : `${pad}- ${JSON.stringify(item)}`,
          )
          .join("\n")
      : `${pad}[]`;
  if (value !== null && typeof value === "object")
    return Object.entries(value)
      .map(([key, item]) => {
        const nested =
          item !== null &&
          typeof item === "object" &&
          !(Array.isArray(item) && !item.length);
        return `${pad}${key}:${nested ? `\n${toYaml(item, indent + 2)}` : ` ${JSON.stringify(item)}`}`;
      })
      .join("\n");
  return pad + JSON.stringify(value);
}

export function downloadText(
  name: string,
  content: string,
  type = "text/plain",
) {
  const href = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
