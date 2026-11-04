import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, useId } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowLeft,
  Download,
  Copy,
  Plus,
  X,
  FileCheck2,
  MessageSquareText,
} from "lucide-react";
import { StatusRibbon } from "@/components/StatusRibbon";
import { useWorkbenchDrafts } from "@/hooks/useWorkbenchDrafts";
import {
  blankBundle,
  purchaseBundle,
  newId,
  readBundle,
  serializeBundle,
  importProcessFile,
  intakeQuestions,
  diagramCheck,
  downloadText,
  INTAKE_DRAFT_PREFIX,
  MAX_BUNDLE_BYTES,
  type ProcessBundle,
  type ProcessIntakeRecord,
} from "@/lib/process-bundle";
import {
  AGENT_TARGETS,
  handoffPrompt,
  type AgentTarget,
} from "@/lib/process-handoff";

const Playground = lazy(() => import("./Playground"));
const STAGES = [
  "Process brief",
  "People & steps",
  "Agent handoff",
  "Review result",
];

function TextField({
  label,
  value,
  onChange,
  hint,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
}) {
  const fieldId = useId();
  return (
    <label className="intake-field">
      <span id={`${fieldId}-label`}>{label}</span>
      {hint && <small id={`${fieldId}-hint`}>{hint}</small>}
      {multiline ? (
        <textarea
          aria-labelledby={`${fieldId}-label`}
          aria-describedby={hint ? `${fieldId}-hint` : undefined}
          rows={3}
          value={value}
          maxLength={10_000}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          aria-labelledby={`${fieldId}-label`}
          aria-describedby={hint ? `${fieldId}-hint` : undefined}
          value={value}
          maxLength={10_000}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export default function ProcessIntake() {
  const [bundle, setBundle] = useState(blankBundle);
  const [stage, setStage] = useState(0);
  const [target, setTarget] = useState<AgentTarget>("codex");
  const [candidate, setCandidate] = useState<ProcessBundle | null>(null);
  const [message, setMessage] = useState("");
  const [importError, setImportError] = useState("");
  const [editError, setEditError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewer, setReviewer] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [diagramView, setDiagramView] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const importHeading = useRef<HTMLHeadingElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const focusStage = useRef(false);
  useEffect(() => {
    document.title = `${STAGES[stage]} | Guided intake | BPMN for Mermaid`;
  }, [stage]);
  useLayoutEffect(() => {
    if (focusStage.current) {
      focusStage.current = false;
      heading.current?.focus();
    }
  }, [stage, candidate]);
  useLayoutEffect(() => {
    if (!candidate || stage !== 3) return;
    importHeading.current?.focus();
  }, [candidate, stage]);
  const drafts = useWorkbenchDrafts({
    prefix: INTAKE_DRAFT_PREFIX,
    noun: "process brief",
  });
  const questions = useMemo(() => intakeQuestions(bundle), [bundle]);
  const sourceCheck = useMemo(
    () => diagramCheck(bundle.diagram.source),
    [bundle.diagram.source],
  );
  const recoverable = useMemo(
    () =>
      drafts.drafts.flatMap((draft) => {
        try {
          return [{ draft, bundle: readBundle(draft.source) }];
        } catch {
          return [];
        }
      }),
    [drafts.drafts],
  );

  function update(next: ProcessBundle, resetReview = true) {
    const changed = resetReview
      ? {
          ...next,
          pir: {
            ...next.pir,
            status: "draft" as const,
            validation: { completeness_score: null, ready_for_narrative: null },
          },
          review: { status: "not-reviewed" as const, reviewer: "", notes: "" },
        }
      : next;
    let serialized: string;
    try {
      serialized = serializeBundle(changed);
    } catch (error) {
      setEditError(
        `That change could not be applied: ${(error as Error).message} Your previous version is unchanged.`,
      );
      return false;
    }
    setEditError("");
    setBundle(changed);
    drafts.save(serialized);
    setMessage("");
    return true;
  }
  function updatePir(changes: Partial<ProcessIntakeRecord>) {
    update({ ...bundle, pir: { ...bundle.pir, ...changes } });
  }
  function replace(next: ProcessBundle) {
    // Retain the current record as a recovery input, even when it is incomplete.
    if (
      !drafts.save(JSON.stringify(bundle)) &&
      !window.confirm(
        "This brief could not be saved. Download a process bundle before replacing it. Replace it anyway?",
      )
    )
      return false;
    drafts.start();
    update(next, false);
    setCandidate(null);
    setDiagramView(false);
    setReviewer("");
    setReviewNotes("");
    setMessage("Opened a copy. Earlier briefs remain in saved briefs.");
    return true;
  }
  function navigate(next: number) {
    if (next === stage) heading.current?.focus();
    else focusStage.current = true;
    setStage(next);
    setMessage("");
  }
  async function chooseFile(file: File | undefined) {
    if (!file) return;
    setCandidate(null);
    setImportError("");
    if (file.size > MAX_BUNDLE_BYTES) {
      setImportError("This file is too large. The limit is 1 MB.");
      return;
    }
    try {
      setCandidate(importProcessFile(file.name, await file.text(), bundle));
    } catch (error) {
      setImportError((error as Error).message);
    }
  }
  async function downloadPackage() {
    setBusy(true);
    setMessage("");
    try {
      const { downloadHandoff } =
        await import("@/lib/process-handoff-download");
      await downloadHandoff(bundle, target);
      setMessage(
        "Handoff package downloaded. Unzip it and read HANDOFF.md in your agent workspace.",
      );
    } catch {
      setMessage(
        "The handoff package could not be created. Download the process bundle and retry the package download.",
      );
    } finally {
      setBusy(false);
    }
  }
  function downloadBundle() {
    downloadText(
      "process-bundle.json",
      serializeBundle(bundle),
      "application/json",
    );
    setMessage(
      "Process bundle downloaded with your brief, source, questions and review record.",
    );
  }

  return (
    <div className="intake-page">
      <StatusRibbon />
      <header className="intake-heading">
        <div>
          <p className="workbench-eyebrow">BPMN for Mermaid / Guided intake</p>
          <h1>Start with what you know.</h1>
          <p>
            Turn a process conversation into a brief, a focused agent handoff,
            and a diagram your team can review.
          </p>
          <Link href="/sessions" className="intake-text-link">Have a meeting transcript? Start a transcript session.</Link>
        </div>
        <button className="forge-btn-outline" onClick={downloadBundle}>
          <Download size={16} />
          Save process bundle
        </button>
      </header>
      <div className="intake-save-strip">
        <button
          className="intake-text-link"
          onClick={() => {
            if (replace(blankBundle())) navigate(0);
          }}
        >
          Start a new brief
        </button>
        <p role="status">
          {drafts.saveState === "saved"
            ? "Brief saved in this browser."
            : drafts.saveState === "idle"
              ? "Your brief stays in this browser. Download a bundle to keep it."
              : "This brief is not saved in this browser. Download a process bundle before leaving."}
        </p>
        <details>
          <summary>Saved briefs ({recoverable.length})</summary>
          <div className="intake-recovery">
            {recoverable.length === 0 && <p>No other saved briefs found.</p>}
            {recoverable.map((item) => (
              <div key={item.draft.id}>
                <span>
                  {item.bundle.pir.process_name || "Untitled process"}
                  <small>{new Date(item.draft.savedAt).toLocaleString()}</small>
                </span>
                <button
                  className="forge-btn-outline"
                  onClick={() => replace(item.bundle)}
                >
                  Open copy
                </button>
                <button
                  className="intake-text-link"
                  aria-label={`Remove saved brief ${item.bundle.pir.process_name || "Untitled process"}`}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove this saved brief from this browser? Download a process bundle first if you need to keep it.",
                      )
                    )
                      drafts.forget(item.draft);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </details>
      </div>
      {editError && (
        <p className="intake-error intake-save-strip" role="alert">
          {editError}
        </p>
      )}
      <div className="intake-layout">
        <aside className="intake-sidebar">
          <nav aria-label="Guided intake steps">
            <ol>
              {STAGES.map((label, index) => (
                <li key={label}>
                  <button
                    aria-current={stage === index ? "step" : undefined}
                    onClick={() => navigate(index)}
                  >
                    <span className="intake-step-number">0{index + 1}</span>
                    <span>{label}</span>
                    {stage === index && <ArrowRight size={15} />}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="intake-sidebar-note">
            <MessageSquareText size={20} />
            <h2>Unknown is a useful answer.</h2>
            <p>
              Leave a field blank when you need to ask someone. The handoff will
              carry those questions forward.
            </p>
          </div>
          <Link href="/playground" className="intake-text-link">
            Just open the workbench <ArrowRight size={14} />
          </Link>
        </aside>
        <section
          className="intake-content"
          aria-labelledby="intake-stage-title"
        >
          <p className="workbench-eyebrow">Step {stage + 1} of 4</p>
          <h2 id="intake-stage-title" ref={heading} tabIndex={-1}>
            {STAGES[stage]}
          </h2>
          {stage === 0 && (
            <>
              <p className="intake-lead">
                Describe the boundaries before the boxes and arrows. A few
                sentences are enough to begin.
              </p>
              <div className="intake-starter">
                <div>
                  <strong>Try a familiar process</strong>
                  <p>
                    Purchase approval includes a small example brief and real
                    questions to resolve.
                  </p>
                </div>
                <button
                  className="forge-btn-outline"
                  onClick={() => replace(purchaseBundle())}
                >
                  Use purchase starter
                </button>
              </div>
              <TextField
                label="Process name"
                value={bundle.pir.process_name}
                onChange={(value) => updatePir({ process_name: value })}
                hint="For example, purchase approval or employee onboarding."
              />
              <TextField
                label="What should this process accomplish?"
                value={bundle.scope.purpose}
                onChange={(purpose) =>
                  update({ ...bundle, scope: { ...bundle.scope, purpose } })
                }
                multiline
              />
              <div className="intake-field-grid">
                <TextField
                  label="What starts it?"
                  value={bundle.pir.trigger.description}
                  onChange={(description) =>
                    updatePir({
                      trigger: { ...bundle.pir.trigger, description },
                    })
                  }
                  multiline
                />
                <label className="intake-field">
                  <span>What kind of trigger?</span>
                  <select
                    value={bundle.pir.trigger.event_type}
                    onChange={(e) =>
                      updatePir({
                        trigger: {
                          ...bundle.pir.trigger,
                          event_type: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="">Not sure yet</option>
                    <option value="manual">Someone takes action</option>
                    <option value="message">
                      A request or message arrives
                    </option>
                    <option value="scheduled">A scheduled time</option>
                    <option value="system">A system condition</option>
                  </select>
                </label>
              </div>
              <TextField
                label="Who owns the process?"
                value={bundle.pir.process_owner}
                onChange={(value) => updatePir({ process_owner: value })}
                hint="Use a role, such as Finance Manager, rather than a person's name."
              />
              <fieldset className="intake-list">
                <legend>What does it produce?</legend>
                {bundle.pir.outputs.map((output, index) => (
                  <div className="intake-row" key={output.id}>
                    <TextField
                      label={`Outcome ${index + 1}`}
                      value={output.name}
                      onChange={(name) =>
                        updatePir({
                          outputs: bundle.pir.outputs.map((item) =>
                            item.id === output.id ? { ...item, name } : item,
                          ),
                        })
                      }
                    />
                    <button
                      aria-label={`Remove outcome ${index + 1}`}
                      onClick={() =>
                        updatePir({
                          outputs: bundle.pir.outputs.filter(
                            (item) => item.id !== output.id,
                          ),
                        })
                      }
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  className="intake-add"
                  disabled={bundle.pir.outputs.length >= 200}
                  onClick={() =>
                    updatePir({
                      outputs: [
                        ...bundle.pir.outputs,
                        { id: newId("out"), name: "" },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Add outcome
                </button>
              </fieldset>
              <TextField
                label="What is outside the scope?"
                value={bundle.scope.exclusions}
                onChange={(exclusions) =>
                  update({ ...bundle, scope: { ...bundle.scope, exclusions } })
                }
                multiline
              />
              <TextField
                label="What is this brief based on?"
                value={bundle.scope.evidence}
                onChange={(evidence) =>
                  update({ ...bundle, scope: { ...bundle.scope, evidence } })
                }
                hint="Note a conversation, document or observation. Include only context you intend to share with your agent."
                multiline
              />
              <details className="intake-details">
                <summary>More context (optional)</summary>
                <div className="intake-field-grid">
                  <TextField
                    label="Department"
                    value={bundle.pir.department}
                    onChange={(department) => updatePir({ department })}
                  />
                  <TextField
                    label="Captured by (role)"
                    value={bundle.pir.elicited_by}
                    onChange={(elicited_by) => updatePir({ elicited_by })}
                  />
                  <label className="intake-field">
                    <span>How was this information gathered?</span>
                    <select
                      value={bundle.pir.elicitation_method}
                      onChange={(e) =>
                        updatePir({ elicitation_method: e.target.value })
                      }
                    >
                      <option value="">Not recorded</option>
                      {[
                        "interview",
                        "workshop",
                        "observation",
                        "document-analysis",
                        "survey",
                      ].map((method) => (
                        <option key={method}>{method}</option>
                      ))}
                    </select>
                  </label>
                  <label className="intake-field">
                    <span>Date gathered</span>
                    <input
                      type="date"
                      value={bundle.pir.elicitation_date}
                      onChange={(e) =>
                        updatePir({ elicitation_date: e.target.value })
                      }
                    />
                  </label>
                </div>
                <fieldset className="intake-list">
                  <legend>Inputs needed to start</legend>
                  {bundle.pir.inputs.map((input, index) => (
                    <div className="intake-row" key={input.id}>
                      <TextField
                        label={`Input ${index + 1}`}
                        value={input.name}
                        onChange={(name) =>
                          updatePir({
                            inputs: bundle.pir.inputs.map((item) =>
                              item.id === input.id ? { ...item, name } : item,
                            ),
                          })
                        }
                      />
                      <button
                        aria-label={`Remove input ${index + 1}`}
                        onClick={() =>
                          updatePir({
                            inputs: bundle.pir.inputs.filter(
                              (item) => item.id !== input.id,
                            ),
                          })
                        }
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="intake-add"
                    disabled={bundle.pir.inputs.length >= 200}
                    onClick={() =>
                      updatePir({
                        inputs: [
                          ...bundle.pir.inputs,
                          { id: newId("inp"), name: "" },
                        ],
                      })
                    }
                  >
                    <Plus size={16} />
                    Add input
                  </button>
                </fieldset>
              </details>
            </>
          )}
          {stage === 1 && (
            <>
              <p className="intake-lead">
                Capture the ordinary path and the places where it can go
                differently. You can leave owners undecided.
              </p>
              <fieldset className="intake-list">
                <legend>People and roles</legend>
                {bundle.pir.actors.map((actor, index) => (
                  <div className="intake-row" key={actor.role_id}>
                    <TextField
                      label={`Role ${index + 1}`}
                      value={actor.role_name}
                      onChange={(role_name) =>
                        updatePir({
                          actors: bundle.pir.actors.map((item) =>
                            item.role_id === actor.role_id
                              ? { ...item, role_name }
                              : item,
                          ),
                        })
                      }
                    />
                    <label className="intake-field">
                      <span>Role {index + 1} responsibility</span>
                      <select
                        value={actor.type}
                        onChange={(e) =>
                          updatePir({
                            actors: bundle.pir.actors.map((item) =>
                              item.role_id === actor.role_id
                                ? { ...item, type: e.target.value }
                                : item,
                            ),
                          })
                        }
                      >
                        <option value="">Not sure yet</option>
                        {[
                          "initiator",
                          "performer",
                          "approver",
                          "reviewer",
                          "notified",
                          "system",
                        ].map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      aria-label={`Remove role ${index + 1}`}
                      onClick={() =>
                        updatePir({
                          actors: bundle.pir.actors.filter(
                            (item) => item.role_id !== actor.role_id,
                          ),
                          steps: bundle.pir.steps.map((step) =>
                            step.actor_role_id === actor.role_id
                              ? { ...step, actor_role_id: "" }
                              : step,
                          ),
                        })
                      }
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  className="intake-add"
                  disabled={bundle.pir.actors.length >= 200}
                  onClick={() =>
                    updatePir({
                      actors: [
                        ...bundle.pir.actors,
                        { role_id: newId("role"), role_name: "", type: "" },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Add role
                </button>
              </fieldset>
              <fieldset className="intake-list">
                <legend>Main steps, in order</legend>
                {bundle.pir.steps.map((step, index) => (
                  <div className="intake-row" key={step.id}>
                    <TextField
                      label={`Step ${index + 1}`}
                      value={step.description}
                      onChange={(description) =>
                        updatePir({
                          steps: bundle.pir.steps.map((item) =>
                            item.id === step.id
                              ? { ...item, description }
                              : item,
                          ),
                        })
                      }
                    />
                    <label className="intake-field">
                      <span>Step {index + 1} owner</span>
                      <select
                        value={step.actor_role_id}
                        onChange={(e) =>
                          updatePir({
                            steps: bundle.pir.steps.map((item) =>
                              item.id === step.id
                                ? { ...item, actor_role_id: e.target.value }
                                : item,
                            ),
                          })
                        }
                      >
                        <option value="">Not sure yet</option>
                        {step.actor_role_id &&
                          !bundle.pir.actors.some(
                            (actor) => actor.role_id === step.actor_role_id,
                          ) && (
                            <option value={step.actor_role_id}>
                              Unresolved: {step.actor_role_id}
                            </option>
                          )}
                        {bundle.pir.actors.map((actor) => (
                          <option key={actor.role_id} value={actor.role_id}>
                            {actor.role_name || "Unnamed role"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      aria-label={`Move step ${index + 1} up`}
                      disabled={index === 0}
                      onClick={() => {
                        const steps = [...bundle.pir.steps];
                        [steps[index - 1], steps[index]] = [
                          steps[index],
                          steps[index - 1],
                        ];
                        updatePir({ steps });
                      }}
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`Remove step ${index + 1}`}
                      onClick={() =>
                        updatePir({
                          steps: bundle.pir.steps.filter(
                            (item) => item.id !== step.id,
                          ),
                        })
                      }
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  className="intake-add"
                  disabled={bundle.pir.steps.length >= 200}
                  onClick={() =>
                    updatePir({
                      steps: [
                        ...bundle.pir.steps,
                        {
                          id: newId("step"),
                          description: "",
                          actor_role_id: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Add step
                </button>
              </fieldset>
              <fieldset className="intake-list">
                <legend>Known exceptions</legend>
                {bundle.pir.exceptions.map((exception, index) => (
                  <div className="intake-exception" key={exception.id}>
                    <div className="intake-row">
                      <TextField
                        label={`Exception ${index + 1}`}
                        value={exception.description}
                        onChange={(description) =>
                          updatePir({
                            exceptions: bundle.pir.exceptions.map((item) =>
                              item.id === exception.id
                                ? { ...item, description }
                                : item,
                            ),
                          })
                        }
                      />
                      <button
                        aria-label={`Remove exception ${index + 1}`}
                        onClick={() =>
                          updatePir({
                            exceptions: bundle.pir.exceptions.filter(
                              (item) => item.id !== exception.id,
                            ),
                          })
                        }
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="intake-field-grid">
                      <TextField
                        label={`Exception ${index + 1} trigger`}
                        value={exception.trigger || ""}
                        onChange={(trigger) =>
                          updatePir({
                            exceptions: bundle.pir.exceptions.map((item) =>
                              item.id === exception.id
                                ? { ...item, trigger }
                                : item,
                            ),
                          })
                        }
                      />
                      <TextField
                        label={`Exception ${index + 1} handling`}
                        value={exception.handling || ""}
                        onChange={(handling) =>
                          updatePir({
                            exceptions: bundle.pir.exceptions.map((item) =>
                              item.id === exception.id
                                ? { ...item, handling }
                                : item,
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="intake-add"
                  disabled={bundle.pir.exceptions.length >= 200}
                  onClick={() =>
                    updatePir({
                      exceptions: [
                        ...bundle.pir.exceptions,
                        {
                          id: newId("exc"),
                          description: "",
                          trigger: "",
                          handling: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Add exception
                </button>
              </fieldset>
              <TextField
                label="Questions to ask your team"
                hint="One question per line. Blank details will also be carried into the handoff as questions."
                value={bundle.pir.open_questions.join("\n")}
                onChange={(value) => {
                  if (value.split("\n").length > 200) {
                    setMessage(
                      "Keep up to 200 questions here. Preserve additional questions in your evidence files.",
                    );
                    return;
                  }
                  updatePir({ open_questions: value.split("\n") });
                }}
                multiline
              />
            </>
          )}
          {stage === 2 && (
            <>
              <p className="intake-lead">
                Give your agent a bounded task, the right skills, and the facts
                you have. Come back here with its result.
              </p>
              <label className="intake-field">
                <span>Your agent environment</span>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as AgentTarget)}
                >
                  {Object.entries(AGENT_TARGETS).map(([id, agent]) => (
                    <option key={id} value={id}>
                      {agent.label}
                    </option>
                  ))}
                </select>
              </label>
              <ol className="intake-handoff-steps">
                <li>
                  <strong>Download and unzip</strong>
                  <p>
                    The package includes your brief, editable process bundle,
                    five focused skill packages, and the browser's diagram
                    syntax reference.
                  </p>
                </li>
                <li>
                  <strong>Open it in your agent workspace</strong>
                  <p>{AGENT_TARGETS[target].instruction}</p>
                </li>
                <li>
                  <strong>Review the result here</strong>
                  <p>
                    Ask for an updated process-bundle.json and diagram.mmd.
                    Import either in Review result. Additional narratives and
                    evidence remain separate files.
                  </p>
                </li>
              </ol>
              <div className="intake-actions">
                <button
                  className="forge-btn-primary"
                  disabled={busy}
                  onClick={downloadPackage}
                >
                  <Download size={16} />
                  {busy ? "Preparing package..." : "Download agent handoff"}
                </button>
                <button
                  className="forge-btn-outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        handoffPrompt(bundle, target),
                      );
                      setMessage(
                        "Handoff instructions copied. Include the downloaded files with your agent task.",
                      );
                    } catch {
                      setMessage(
                        "Clipboard unavailable. Select the instructions below, or use HANDOFF.md in the download.",
                      );
                    }
                  }}
                >
                  <Copy size={16} />
                  Copy instructions
                </button>
              </div>
              <p className="intake-help">
                The app does not send your brief to an agent or run skills.
                Review the package before sharing it in your chosen environment.
              </p>
              <details className="intake-details">
                <summary>Read the handoff instructions</summary>
                <textarea
                  className="intake-prompt"
                  aria-label="Handoff instructions"
                  readOnly
                  value={handoffPrompt(bundle, target)}
                />
              </details>
              <details className="intake-details" open>
                <summary>
                  Questions carried forward ({questions.length})
                </summary>
                {questions.length ? (
                  <ul className="intake-questions">
                    {questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No intake gaps detected by this checklist. Your agent still
                    needs to validate the process record with the skill's
                    checks.
                  </p>
                )}
              </details>
            </>
          )}
          {stage === 3 && (
            <>
              <p className="intake-lead">
                Bring back the result. Check the diagram, resolve questions with
                your team, and keep the source and context together.
              </p>
              <label className="intake-file">
                <FileCheck2 size={24} />
                <span>
                  <strong>Import a result or saved bundle</strong>
                  <small>
                    A process bundle (.json) or bpmn-beta source (.mmd), up to 1
                    MB. Unzip packages first.
                  </small>
                </span>
                <input
                  ref={importInput}
                  aria-label="Import process result"
                  type="file"
                  accept=".json,.mmd"
                  onChange={(e) => {
                    void chooseFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
              {importError && (
                <p className="intake-error" role="alert">
                  {importError}
                </p>
              )}
              {candidate && (
                <section
                  className="intake-import-preview"
                  aria-label="Import preview"
                >
                  <h3 ref={importHeading} tabIndex={-1}>Review before applying</h3>
                  <p>
                    <strong>
                      {candidate.pir.process_name || "Untitled process"}
                    </strong>{" "}
                    · {candidate.pir.steps.length} steps ·{" "}
                    {intakeQuestions(candidate).length} open questions
                  </p>
                  <p>{candidate.scope.purpose || "Purpose not supplied"}</p>
                  <p>{candidate.diagram.provenance}</p>
                  <p>
                    Diagram:{" "}
                    {diagramCheck(candidate.diagram.source).error ||
                      "Syntax parsed. Review the process meaning and any warnings."}
                  </p>
                  <p>
                    Review record:{" "}
                    {candidate.review.status === "review-recorded"
                      ? `Reported by ${candidate.review.reviewer}; not independently verified.`
                      : "Not reviewed"}
                  </p>
                  <details>
                    <summary>Inspect all imported fields</summary>
                    <pre>{JSON.stringify(candidate, null, 2)}</pre>
                  </details>
                  <div className="intake-actions">
                    <button
                      className="forge-btn-primary"
                      onClick={() => {
                        if (replace(candidate)) focusStage.current = true;
                      }}
                    >
                      Apply imported copy
                    </button>
                    <button
                      className="forge-btn-outline"
                      onClick={() => {
                        setCandidate(null);
                        importInput.current?.focus();
                      }}
                    >
                      Cancel import
                    </button>
                  </div>
                  <p className="intake-help">
                    Your current brief will remain in saved briefs when browser
                    storage is available.
                  </p>
                </section>
              )}
              <div className="intake-checks">
                <div>
                  <span>Diagram syntax</span>
                  <strong>
                    {!bundle.diagram.source
                      ? "Awaiting source"
                      : sourceCheck.error
                        ? "Needs repair"
                        : "Parsed"}
                  </strong>
                  <p>
                    {sourceCheck.error ||
                      `${sourceCheck.warnings.length} advisory warnings. Rendering does not validate business facts.`}
                  </p>
                </div>
                <div>
                  <span>Open questions</span>
                  <strong>{questions.length} to resolve</strong>
                  <p>
                    Check the brief and handoff. Missing details stay explicit.
                  </p>
                </div>
                <div>
                  <span>Stakeholder review</span>
                  <strong>
                    {bundle.review.status === "review-recorded"
                      ? "Review recorded"
                      : "Not recorded"}
                  </strong>
                  <p>
                    {bundle.review.status === "review-recorded"
                      ? `Reported by ${bundle.review.reviewer}. This is a record, not independent approval verification.`
                      : "A person needs to confirm the process meaning."}
                  </p>
                </div>
              </div>
              {bundle.diagram.source ? (
                <>
                  <button
                    className="forge-btn-outline"
                    onClick={() => setDiagramView((value) => !value)}
                  >
                    {diagramView
                      ? "Close diagram workbench"
                      : "Open diagram workbench"}
                    <ArrowRight size={16} />
                  </button>
                  <p className="intake-help">
                    Edit source, inspect warnings, and export SVG in the
                    workbench below. Source edits reset the review record.
                    Shared links carry the diagram only.
                  </p>
                </>
              ) : (
                <p className="intake-help">
                  No diagram is generated automatically from your brief. Use the
                  handoff to clarify and model it with your agent, then import
                  the returned source.
                </p>
              )}
              <details className="intake-details">
                <summary>Record a stakeholder review</summary>
                <p>
                  Record who reviewed this version and what they confirmed or
                  left unresolved. Changing the brief or diagram resets this
                  record.
                </p>
                <TextField
                  label="Reviewer (role or name)"
                  value={reviewer}
                  onChange={setReviewer}
                />
                <TextField
                  label="Review notes and evidence"
                  value={reviewNotes}
                  onChange={setReviewNotes}
                  hint="Include the review date and any remaining concerns. This records the review; it does not certify approval."
                  multiline
                />
                <button
                  className="forge-btn-outline"
                  disabled={
                    !reviewer.trim() ||
                    !reviewNotes.trim() ||
                    !!sourceCheck.error
                  }
                  onClick={() => {
                    const recorded = update(
                      {
                        ...bundle,
                        review: {
                          status: "review-recorded",
                          reviewer,
                          notes: reviewNotes,
                        },
                      },
                      false,
                    );
                    if (recorded) setMessage(
                      "Review recorded for this version. Download a process bundle to keep the record.",
                    );
                  }}
                >
                  Record review
                </button>
              </details>
              {bundle.review.status === "review-recorded" && (
                <blockquote className="intake-review-note">
                  <strong>{bundle.review.reviewer}</strong>
                  <p>{bundle.review.notes}</p>
                </blockquote>
              )}
              <details className="intake-details">
                <summary>Process record and retained context</summary>
                <p>
                  Imported inputs, rules, systems, controls and metadata are
                  preserved even where this guided form has no dedicated field.
                  Use the agent handoff to refine them.
                </p>
                <pre>{JSON.stringify(bundle, null, 2)}</pre>
              </details>
            </>
          )}
          <p className="intake-message" role="status">
            {message}
          </p>
          <footer className="intake-step-footer">
            {stage > 0 && (
              <button
                className="forge-btn-outline"
                onClick={() => navigate(stage - 1)}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            {stage < 3 ? (
              <button
                className="forge-btn-primary"
                onClick={() => navigate(stage + 1)}
              >
                {STAGES[stage + 1]}
                <ArrowRight size={16} />
              </button>
            ) : (
              <button className="forge-btn-primary" onClick={downloadBundle}>
                <Download size={16} />
                Download this version
              </button>
            )}
          </footer>
        </section>
      </div>
      {stage === 3 && diagramView && (
        <section
          className="intake-workbench"
          aria-label="Process diagram workbench"
        >
          <Suspense fallback={<p>Loading workbench...</p>}>
            <Playground
              processSession={{
                source: bundle.diagram.source,
                onChange: (source) =>
                  update({
                    ...bundle,
                    diagram: {
                      source,
                      provenance:
                        "Edited in the browser workbench. Confirm alignment with the process brief.",
                    },
                  }),
              }}
            />
          </Suspense>
        </section>
      )}
    </div>
  );
}
