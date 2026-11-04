import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link } from "wouter";
import "@/styles/transcript-session.css";
import { FileText, ArrowRight, Download } from "lucide-react";
import { StatusRibbon } from "@/components/StatusRibbon";
import {
  downloadText,
  readBundle,
  serializeBundle,
} from "@/lib/process-bundle";
import { AGENT_TARGETS, type AgentTarget } from "@/lib/process-handoff";
import {
  ACTIONS,
  MAX_SESSION_BYTES,
  MAX_TRANSCRIPT_BYTES,
  emptySession,
  addTranscript,
  activate,
  importVerifiedResult,
  addProviderSnapshot,
  readSession,
  serializeSession,
  applyCandidate,
  processChanges,
  type TranscriptSession as Session,
  type TranscriptRevision,
  type Activation,
  type Candidate,
  type ClaimReview,
} from "@/lib/transcript-session";
import {
  MAX_BRIDGE_BYTES,
  readProviderSnapshot,
  type ProviderSnapshot,
  type ExecutionReceipt,
  type ProviderSource,
} from "@/lib/session-bridge";

function SourceOrigin({ source }: { source: ProviderSource }) {
  return (
    <p className="intake-help">
      {source.kind === "synthetic"
        ? "Synthetic test dialogue"
        : source.kind === "meeting-transcript"
          ? "Meeting transcript"
          : "Transcript block"}
      {" · "}
      <a href={source.url} target="_blank" rel="noreferrer">
        {source.title}
      </a>
      {" · Notion revision "}
      {source.editedAt}
      {" · Fetched "}
      {source.fetchedAt}. This is a retained snapshot; later edits require a
      fresh import.
    </p>
  );
}
function ExecutionReport({ execution }: { execution?: ExecutionReceipt }) {
  return (
    <p className="intake-help">
      {execution ? (
        <>
          Reported execution: <strong>{execution.agent}</strong> ·{" "}
          {execution.runId} · {execution.completedAt}. Source and result hashes
          match. This report does not authenticate the agent or verify its
          conclusions.
        </>
      ) : (
        "Execution not reported. Review this manual result against its source."
      )}
    </p>
  );
}

const Playground = lazy(() => import("./Playground"));
const VIEWS = [
  "Sources",
  "Activations",
  "Evidence review",
  "Process & diagram",
];
// Retain the draft across client-side navigation, never in browser storage.
let memory:
  | {
      session: Session;
      text: string;
      dirty: boolean;
      sourceName: string;
      captureState: TranscriptRevision["state"];
    }
  | undefined;
const SAMPLE = `00:00:05 Alex: We are describing how purchase requests work today. I submit the request in the procurement portal.
00:00:18 Morgan: Finance reviews requests over $5,000.
00:00:29 Sam: I think it is $2,500 for our department. We should check the policy.
00:00:41 Alex: We want automatic approval next year. That is a proposal, not what happens today.
00:00:55 Speaker 4: [inaudible] handles rejected requests.
00:01:10 Alex: process capture checkpoint`;

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="intake-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          maxLength={500_000}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          value={value}
          maxLength={500}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
async function fileText(file: File, limit: number) {
  if (file.size > limit)
    throw new Error(
      `This file exceeds the ${limit / 1_000_000} MB limit. The current session is unchanged.`,
    );
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      await file.arrayBuffer(),
    );
  } catch {
    throw new Error(
      "Choose a UTF-8 text file. Binary files and invalid text are not imported.",
    );
  }
}

export default function TranscriptSession() {
  const [session, setSession] = useState(
    () => memory?.session ?? emptySession(),
  );
  const [view, setView] = useState(0),
    [text, setText] = useState(memory?.text ?? ""),
    [sourceName, setSourceName] = useState(
      memory?.sourceName ?? "workshop.txt",
    );
  const [captureState, setCaptureState] = useState<TranscriptRevision["state"]>(
    memory?.captureState ?? "ongoing",
  );
  const [selectedRevision, setSelectedRevision] = useState(""),
    [sourcePage, setSourcePage] = useState(0);
  const [filter, setFilter] = useState(""),
    [target, setTarget] = useState<AgentTarget>("codex");
  const [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(memory?.dirty ?? false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [incoming, setIncoming] = useState<Session | null>(null),
    [previous, setPrevious] = useState<Session | null>(null);
  const [resultPreview, setResultPreview] = useState<Candidate | null>(null),
    [reviewer, setReviewer] = useState("");
  const [providerPreview, setProviderPreview] =
    useState<ProviderSnapshot | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({}),
    [approvedSource, setApprovedSource] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null),
    preview = useRef<HTMLHeadingElement>(null),
    focusView = useRef(false);
  const currentRef = useRef(session);
  currentRef.current = session;
  useEffect(() => {
    memory = { session, text, dirty, sourceName, captureState };
  }, [session, text, dirty, sourceName, captureState]);
  useEffect(() => {
    document.title = `${VIEWS[view]} | Transcript session | BPMN for Mermaid`;
  }, [view]);
  useLayoutEffect(() => {
    if (focusView.current) {
      heading.current?.focus();
      focusView.current = false;
    }
  }, [view]);
  useLayoutEffect(() => {
    if (incoming || resultPreview || providerPreview) preview.current?.focus();
  }, [incoming, resultPreview, providerPreview]);
  useEffect(() => {
    if (
      !dirty &&
      !text.trim() &&
      !incoming &&
      !resultPreview &&
      !providerPreview
    )
      return;
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element)?.closest?.("a");
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        anchor.target === "_blank"
      )
        return;
      const url = new URL(anchor.href, location.href);
      if (url.pathname === location.pathname && url.search === location.search)
        return;
      if (
        !window.confirm(
          "This session is in memory. Download it to keep sources and reviews. Leave without downloading the latest changes?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigate, true);
    };
  }, [dirty, text, incoming, resultPreview, providerPreview]);
  function commit(next: Session) {
    serializeSession(next);
    setSession(next);
    currentRef.current = next;
    setDirty(true);
  }
  function run(work: () => Promise<void> | void) {
    setError("");
    setMessage("");
    const report = (e: unknown) =>
      setError(
        e instanceof Error
          ? e.message
          : "The action could not complete. Current work is retained.",
      );
    try {
      const pending = work();
      // Synchronous form edits must not disable the focused input on each key.
      if (pending instanceof Promise) {
        setBusy(true);
        void pending.catch(report).finally(() => setBusy(false));
      }
    } catch (e) {
      report(e);
    }
  }
  function changeView(next: number) {
    if (next === view) heading.current?.focus();
    else {
      focusView.current = true;
      setView(next);
    }
  }
  function save() {
    downloadText(
      "process-session.json",
      serializeSession(session),
      "application/json",
    );
    setDirty(false);
    setMessage(
      "Session download prepared. Keep this file to reopen sources, activations and reported reviews.",
    );
  }
  async function ingest(raw: string, name: string) {
    const next = await addTranscript(session, raw, name, captureState);
    if (next === session) {
      setMessage(
        "This exact transcript is already in the session. No activation was repeated.",
      );
      return;
    }
    commit(next);
    setSelectedRevision(next.revisions.at(-1)!.id);
    setSourcePage(0);
    setText("");
    setApprovedSource(null);
    setMessage(
      "Source revision retained. Check speaker labels and any keyword suggestions in Activations.",
    );
  }
  const revision =
    session.revisions.find((r) => r.id === selectedRevision) ??
    session.revisions.at(-1);
  const passages =
    revision?.segments.filter(
      (s) =>
        !filter ||
        `${s.speaker} ${s.text}`.toLowerCase().includes(filter.toLowerCase()),
    ) ?? [];
  const speakers = [
    ...new Set(
      session.revisions
        .flatMap((r) => r.segments.map((s) => s.speaker))
        .filter(Boolean),
    ),
  ];
  async function handoff(activation: Activation) {
    if (approvedSource !== activation.id)
      throw new Error(
        "Review and select the source-sharing checkbox for this activation first.",
      );
    const { downloadSessionHandoff } =
      await import("@/lib/session-handoff-download");
    await downloadSessionHandoff(session, activation, target);
    commit({
      ...session,
      activations: session.activations.map((a) =>
        a.id === activation.id ? { ...a, status: "handoff-ready" } : a,
      ),
    });
    setMessage(
      "Handoff downloaded. Run SESSION-TASK.md in your chosen agent environment, then return its session-result.json. No agent has run in this browser.",
    );
  }
  function review(
    candidate: Candidate,
    path: string,
    decision: ClaimReview["decision"],
  ) {
    const note = notes[`${candidate.result.activationId}:${path}`] ?? "";
    if (!reviewer.trim() || !note.trim())
      throw new Error(
        "Enter the reviewer and a note for this fact before recording a disposition.",
      );
    commit({
      ...session,
      candidates: session.candidates.map((c) =>
        c === candidate
          ? {
              ...c,
              reviews: [
                ...c.reviews.filter((r) => r.path !== path),
                { path, decision, reviewer, note },
              ],
            }
          : c,
      ),
    });
  }
  return (
    <div className="session-workspace">
      <StatusRibbon />
      <header className="session-heading">
        <div>
          <p className="workbench-eyebrow">
            BPMN for Mermaid / Conversation to process
          </p>
          <h1>Keep the conversation behind the process.</h1>
          <p>
            Bring transcript excerpts at any point. Prepare a focused agent
            task, then review its proposed changes against the source.
          </p>
        </div>
        <button
          className="forge-btn-primary"
          onClick={() => run(save)}
          disabled={busy}
        >
          <Download size={16} /> Save session
        </button>
      </header>
      <button
        className="forge-btn-outline mb-4"
        disabled={busy}
        onClick={() => setIncoming(emptySession())}
      >
        Start a new session
      </button>
      <div className="session-retention">
        <strong>{dirty ? "Changes in memory" : "Memory-only session"}</strong>
        <span>
          Download to retain this session. Transcripts are not automatically
          stored in this browser or sent to a provider.
        </span>
        <Link href="/intake">
          Typed process brief <ArrowRight size={14} />
        </Link>
      </div>
      <div role="status" className="session-message">
        {message}
      </div>
      {error && (
        <div role="alert" className="session-error">
          {error}
        </div>
      )}
      <fieldset disabled={busy} className="session-controls">
        <legend className="sr-only">Transcript session controls</legend>
        <div className="session-toolbar">
          <Field
            label="Session name"
            value={session.name}
            onChange={(name) => run(() => commit({ ...session, name }))}
          />
          <label className="intake-field">
            <span>Open saved session</span>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file)
                  run(async () =>
                    setIncoming(
                      await readSession(
                        await fileText(file, MAX_SESSION_BYTES),
                      ),
                    ),
                  );
              }}
            />
          </label>
          <label className="intake-field">
            <span>Start with an existing process bundle</span>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file)
                  run(async () =>
                    setIncoming({
                      ...emptySession(),
                      process: readBundle(await fileText(file, 1_000_000)),
                    }),
                  );
              }}
            />
          </label>
        </div>
        {incoming && (
          <section
            className="session-preview"
            aria-label="Session import preview"
          >
            <h2 tabIndex={-1} ref={preview}>
              Open an imported copy
            </h2>
            <p>
              {incoming.name || "Unnamed session"}: {incoming.revisions.length}{" "}
              sources, {incoming.activations.length} activations. Imported
              review records are reported, not independently verified. Keyword
              mode resets to suggestions.
            </p>
            <button
              className="forge-btn-primary"
              onClick={() =>
                run(() => {
                  if (text.trim() || providerPreview)
                    throw new Error(
                      "Add or clear the pasted transcript and finish any snapshot preview before opening another session. Your current work is retained.",
                    );
                  setPrevious(session);
                  commit({
                    ...incoming,
                    rules: { ...incoming.rules, mode: "suggest" },
                  });
                  setIncoming(null);
                  setResultPreview(null);
                  setNotes({});
                  setReviewer("");
                  setSelectedRevision("");
                  setApprovedSource(null);
                  heading.current?.focus();
                })
              }
            >
              Open imported copy
            </button>
            <button
              className="forge-btn-outline"
              onClick={() => {
                setIncoming(null);
                heading.current?.focus();
              }}
            >
              Keep current session
            </button>
          </section>
        )}
        {previous && (
          <button
            className="forge-btn-outline mb-4"
            onClick={() =>
              run(() => {
                if (text.trim() || providerPreview || resultPreview)
                  throw new Error(
                    "Finish the current transcript or import preview before switching sessions. Your current work is retained.",
                  );
                const current = session;
                commit(previous);
                setPrevious(current);
                setSelectedRevision("");
                setApprovedSource(null);
              })
            }
          >
            Return to previous in-memory session
          </button>
        )}
        <nav aria-label="Session views" className="session-nav">
          {VIEWS.map((label, index) => (
            <button
              key={label}
              aria-current={view === index ? "step" : undefined}
              onClick={() => changeView(index)}
            >
              <span>0{index + 1}</span>
              {label}
            </button>
          ))}
        </nav>
        <section
          aria-labelledby="session-view-heading"
          className="session-content"
        >
          <h2 id="session-view-heading" ref={heading} tabIndex={-1}>
            {VIEWS[view]}
          </h2>
          {view === 0 && (
            <>
              <p className="session-intro">
                Use a transcript, not only a meeting summary. Preserve uncertain
                speakers and missing audio. This page receives files or pasted
                text; it is not connected to a live meeting.
              </p>
              <div className="session-columns">
                <div>
                  <Field
                    label="Source filename"
                    value={sourceName}
                    onChange={setSourceName}
                  />
                  <label className="intake-field">
                    <span>Capture state</span>
                    <select
                      value={captureState}
                      onChange={(e) =>
                        setCaptureState(
                          e.target.value as TranscriptRevision["state"],
                        )
                      }
                    >
                      <option value="ongoing">Meeting ongoing / excerpt</option>
                      <option value="final">Final transcript</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </label>
                  <Field
                    label="Paste transcript"
                    value={text}
                    onChange={setText}
                    multiline
                  />
                  <div className="session-actions">
                    <button
                      className="forge-btn-primary"
                      disabled={!text.trim()}
                      onClick={() => run(() => ingest(text, sourceName))}
                    >
                      Add transcript revision
                    </button>
                    <button
                      className="forge-btn-outline"
                      onClick={() => {
                        setText(SAMPLE);
                        setSourceName("illustrative-workshop.txt");
                      }}
                    >
                      Try illustrative workshop
                    </button>
                  </div>
                  <label className="intake-field mt-5">
                    <span>Import transcript file</span>
                    <input
                      type="file"
                      accept=".txt,.md,.vtt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file)
                          run(async () =>
                            ingest(
                              await fileText(file, MAX_TRANSCRIPT_BYTES),
                              file.name,
                            ),
                          );
                      }}
                    />
                  </label>
                  <p className="intake-help">
                    500 KB per source, 12 revisions, 8 MB per complete saved
                    session. A repeated identical source is ignored. Corrected
                    sources remain separate revisions.
                  </p>
                  <details className="intake-details mt-6">
                    <summary>Notion snapshot pilot</summary>
                    <p>
                      Ask your connected agent to fetch one transcript from
                      Notion and prepare a provider snapshot using the session
                      bridge helper. Preview it here before adding evidence. The
                      browser does not connect to Notion or listen to meetings.
                    </p>
                    <p>
                      <a
                        href="https://github.com/OKHP3/mermaid-diagram-bpmn/blob/main/docs/session-bridge-pilot.md"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Snapshot preparation instructions
                      </a>
                    </p>
                    <label className="intake-field">
                      <span>Import provider snapshot</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          if (file)
                            run(async () =>
                              setProviderPreview(
                                await readProviderSnapshot(
                                  await fileText(file, MAX_BRIDGE_BYTES),
                                ),
                              ),
                            );
                        }}
                      />
                    </label>
                  </details>
                </div>
                <aside className="session-context">
                  <FileText size={24} />
                  <h3>Evidence before assumptions</h3>
                  <p>
                    Who spoke is different from who performs or approves the
                    work. Keep current practice, proposed changes and unresolved
                    disagreements distinct.
                  </p>
                  <h3>Speaker-to-role context</h3>
                  {!speakers.length && (
                    <p>Add a transcript to review its speaker labels.</p>
                  )}
                  {speakers.map((speaker) => (
                    <Field
                      key={speaker}
                      label={`Role or roles for ${speaker}`}
                      value={
                        session.roles.find((r) => r.speaker === speaker)
                          ?.role ?? ""
                      }
                      onChange={(role) =>
                        run(() =>
                          commit({
                            ...session,
                            roles: [
                              ...session.roles.filter(
                                (r) => r.speaker !== speaker,
                              ),
                              { speaker, role },
                            ],
                          }),
                        )
                      }
                    />
                  ))}
                  <p>
                    Leave blank when unknown. These mappings inform your agent;
                    they do not establish identity or approval authority.
                  </p>
                </aside>
              </div>
              {providerPreview && (
                <section className="session-preview">
                  <h3 ref={preview} tabIndex={-1}>
                    Preview Notion snapshot
                  </h3>
                  <SourceOrigin source={providerPreview.source} />
                  <details>
                    <summary>Read the complete retained transcript</summary>
                    <pre className="whitespace-pre-wrap break-words">
                      {providerPreview.raw}
                    </pre>
                  </details>
                  <p>
                    Capture state: {captureState}. Adding this source may
                    suggest or queue a task under your keyword settings. It
                    never runs an agent or changes the accepted process.
                  </p>
                  <div className="session-actions">
                    <button
                      className="forge-btn-primary"
                      onClick={() =>
                        run(async () => {
                          const current = currentRef.current;
                          const next = await addProviderSnapshot(
                            current,
                            JSON.stringify(providerPreview),
                            captureState,
                          );
                          if (next !== current) {
                            commit(next);
                            setSelectedRevision(next.revisions.at(-1)!.id);
                            setSourcePage(0);
                            setFilter("");
                          }
                          setMessage(
                            next === current
                              ? "This transcript is already retained. Original attribution and activations are unchanged."
                              : "Notion snapshot added. Review passages and activations next.",
                          );
                          setProviderPreview(null);
                          heading.current?.focus();
                        })
                      }
                    >
                      Add snapshot revision
                    </button>
                    <button
                      className="forge-btn-outline"
                      onClick={() => {
                        setProviderPreview(null);
                        heading.current?.focus();
                      }}
                    >
                      Cancel snapshot import
                    </button>
                  </div>
                </section>
              )}
              {revision && (
                <section className="session-source">
                  <h3>Retained source passages</h3>
                  {revision.source && <SourceOrigin source={revision.source} />}
                  <label className="intake-field">
                    <span>Source revision</span>
                    <select
                      value={revision.id}
                      onChange={(e) => {
                        setSelectedRevision(e.target.value);
                        setSourcePage(0);
                      }}
                    >
                      {session.revisions.map((r, i) => (
                        <option key={r.id} value={r.id}>
                          {i + 1}. {r.name} ({r.state})
                        </option>
                      ))}
                    </select>
                  </label>
                  <p>
                    {revision.segments.length} passages. Coverage:{" "}
                    {revision.segments.at(-1)?.timestamp ||
                      `through line ${revision.segments.at(-1)?.line}`}
                    . Source ID: <code>{revision.id}</code>. Later transcript
                    corrections may change attribution.
                  </p>
                  <Field
                    label="Find in this transcript"
                    value={filter}
                    onChange={(v) => {
                      setFilter(v);
                      setSourcePage(0);
                    }}
                  />
                  <ol>
                    {passages
                      .slice(sourcePage * 25, sourcePage * 25 + 25)
                      .map((s) => (
                        <li key={s.id}>
                          <header>
                            <strong>{s.speaker || "Unknown speaker"}</strong>
                            <span>
                              {s.timestamp || `Line ${s.line}`} · {s.id}
                            </span>
                          </header>
                          <p>{s.text}</p>
                        </li>
                      ))}
                  </ol>
                  <div className="session-actions">
                    <button
                      className="forge-btn-outline"
                      disabled={sourcePage === 0}
                      onClick={() => setSourcePage((v) => v - 1)}
                    >
                      Previous passages
                    </button>
                    <span>
                      Page {sourcePage + 1} of{" "}
                      {Math.max(1, Math.ceil(passages.length / 25))}
                    </span>
                    <button
                      className="forge-btn-outline"
                      disabled={(sourcePage + 1) * 25 >= passages.length}
                      onClick={() => setSourcePage((v) => v + 1)}
                    >
                      Next passages
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
          {view === 1 && (
            <>
              <p className="session-intro">
                Activate a task at any checkpoint using the latest source
                received. Queued tasks prepare an external-agent handoff. The
                browser does not run an agent.
              </p>
              <div className="session-actions">
                {ACTIONS.map((action) => (
                  <button
                    key={action}
                    className="forge-btn-primary"
                    disabled={!session.revisions.length}
                    onClick={() =>
                      run(async () =>
                        commit(
                          await activate(
                            session,
                            action,
                            session.revisions.at(-1)!.id,
                          ),
                        ),
                      )
                    }
                  >
                    {action}
                  </button>
                ))}
              </div>
              <details className="intake-details mt-6">
                <summary>Configure keyword activations</summary>
                <label className="intake-field">
                  <span>Activation mode</span>
                  <select
                    value={session.rules.mode}
                    onChange={(e) =>
                      run(() =>
                        commit({
                          ...session,
                          rules: {
                            ...session.rules,
                            mode: e.target.value as Session["rules"]["mode"],
                          },
                        }),
                      )
                    }
                  >
                    <option value="manual">Explicit controls only</option>
                    <option value="suggest">Suggest matching keywords</option>
                    <option value="auto-draft">
                      Automatically queue matching drafts
                    </option>
                  </select>
                </label>
                <Field
                  label="Standalone activation phrase"
                  value={session.rules.phrase}
                  onChange={(phrase) =>
                    run(() =>
                      commit({
                        ...session,
                        rules: { ...session.rules, phrase },
                      }),
                    )
                  }
                />
                <Field
                  label="Allowed speaker label for automatic queuing"
                  value={session.rules.speaker}
                  onChange={(speaker) =>
                    run(() =>
                      commit({
                        ...session,
                        rules: { ...session.rules, speaker },
                      }),
                    )
                  }
                />
                <label className="intake-field">
                  <span>Keyword action</span>
                  <select
                    value={session.rules.action}
                    onChange={(e) =>
                      run(() =>
                        commit({
                          ...session,
                          rules: {
                            ...session.rules,
                            action: e.target
                              .value as Session["rules"]["action"],
                          },
                        }),
                      )
                    }
                  >
                    {ACTIONS.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <p className="intake-help">
                  Applies to newly imported revisions. Only a complete
                  standalone phrase matches; quoted, negated or embedded phrases
                  do not. Unknown or nonmatching speakers produce suggestions.
                  Automatic mode queues a draft, never recording, spending,
                  publishing or accepting facts. Use explicit controls to retry
                  a canceled or completed checkpoint.
                </p>
              </details>
              <label className="intake-field">
                <span>Your agent environment</span>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as AgentTarget)}
                >
                  {Object.entries(AGENT_TARGETS).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              {!session.activations.length && (
                <p>No activations yet. Add a source and choose a task.</p>
              )}
              {[...session.activations].reverse().map((a) => (
                <article key={a.id} className="session-activation">
                  <h3>{a.action}</h3>
                  <p>
                    <strong>{a.status.replaceAll("-", " ")}</strong> ·{" "}
                    {session.revisions.find((r) => r.id === a.revisionId)?.name}{" "}
                    {a.segmentId && `· ${a.segmentId}`}
                  </p>
                  <small>{a.id}</small>
                  {a.status === "suggested" && (
                    <button
                      className="forge-btn-outline"
                      onClick={() =>
                        run(() =>
                          commit({
                            ...session,
                            activations: session.activations.map((item) =>
                              item.id === a.id
                                ? { ...item, status: "queued" }
                                : item,
                            ),
                          }),
                        )
                      }
                    >
                      Queue this suggestion
                    </button>
                  )}
                  {["queued", "handoff-ready"].includes(a.status) && (
                    <>
                      <label className="session-consent">
                        <input
                          type="checkbox"
                          checked={approvedSource === a.id}
                          onChange={(e) =>
                            setApprovedSource(e.target.checked ? a.id : null)
                          }
                        />
                        Include this activation's full source revision, speaker
                        mappings and process brief in the downloaded agent
                        package. Review or redact it before sharing with an
                        agent.
                      </label>
                      <button
                        className="forge-btn-primary"
                        disabled={approvedSource !== a.id}
                        onClick={() => run(() => handoff(a))}
                      >
                        Download session handoff
                      </button>
                    </>
                  )}
                  {!["applied", "canceled"].includes(a.status) && (
                    <button
                      className="forge-btn-outline"
                      onClick={() =>
                        run(() =>
                          commit({
                            ...session,
                            activations: session.activations.map((item) =>
                              item.id === a.id
                                ? { ...item, status: "canceled" }
                                : item,
                            ),
                          }),
                        )
                      }
                    >
                      Cancel activation
                    </button>
                  )}
                  {["canceled", "result-received", "applied"].includes(
                    a.status,
                  ) && (
                    <button
                      className="forge-btn-outline"
                      onClick={() =>
                        run(async () =>
                          commit(
                            await activate(
                              session,
                              a.action,
                              session.revisions.at(-1)!.id,
                            ),
                          ),
                        )
                      }
                    >
                      Create fresh retry
                    </button>
                  )}
                </article>
              ))}
            </>
          )}
          {view === 2 && (
            <>
              <p className="session-intro">
                Bring back the agent's session-result.json. Evidence references
                make a claim reviewable; they do not prove it is correct.
                Rejected, disputed or unreviewed changes remain outside the
                accepted process.
              </p>
              <label className="intake-field">
                <span>Import agent result</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file)
                      run(async () =>
                        setResultPreview(
                          await importVerifiedResult(
                            await fileText(file, MAX_SESSION_BYTES),
                            session,
                          ),
                        ),
                      );
                  }}
                />
              </label>
              {resultPreview && (
                <section className="session-preview">
                  <h3 tabIndex={-1} ref={preview}>
                    Review returned draft
                  </h3>
                  <p>
                    {resultPreview.result.claims.length} changed facts with
                    evidence records. The accepted process will remain unchanged
                    until review and apply.
                  </p>
                  <ExecutionReport execution={resultPreview.result.execution} />
                  <button
                    className="forge-btn-primary"
                    onClick={() =>
                      run(async () => {
                        await importVerifiedResult(
                          JSON.stringify(resultPreview.result),
                          session,
                        );
                        const id = resultPreview.result.activationId;
                        commit({
                          ...session,
                          candidates: [...session.candidates, resultPreview],
                          activations: session.activations.map((a) =>
                            a.id === id
                              ? { ...a, status: "result-received" }
                              : a,
                          ),
                        });
                        setResultPreview(null);
                        heading.current?.focus();
                      })
                    }
                  >
                    Keep candidate for review
                  </button>
                  <button
                    className="forge-btn-outline"
                    onClick={() => {
                      setResultPreview(null);
                      heading.current?.focus();
                    }}
                  >
                    Cancel result import
                  </button>
                </section>
              )}
              <Field
                label="Reviewer name or role"
                value={reviewer}
                onChange={setReviewer}
              />
              {session.candidates.map((candidate) => {
                const result = candidate.result,
                  activation = session.activations.find(
                    (a) => a.id === result.activationId,
                  )!;
                const changes = processChanges(activation.base, result.bundle),
                  source = session.revisions.find(
                    (r) => r.id === result.revisionId,
                  )!;
                return (
                  <article
                    className="session-candidate"
                    key={result.activationId}
                  >
                    <h3>
                      {activation.action}:{" "}
                      {activation.status.replaceAll("-", " ")}
                    </h3>
                    <p>
                      Every changed field is shown below. Review records are
                      reported by the named reviewer; imported records are not
                      independent approval verification.
                    </p>
                    <ExecutionReport execution={result.execution} />
                    {result.claims.map((claim) => {
                      const change = changes.find(
                        (c) => c.path === claim.path,
                      )!;
                      const recorded = candidate.reviews.find(
                        (r) => r.path === claim.path,
                      );
                      const key = `${result.activationId}:${claim.path}`;
                      return (
                        <section className="session-claim" key={claim.path}>
                          <h4>{claim.path}</h4>
                          <p>
                            <strong>{claim.kind}</strong>
                            {claim.analystAdded
                              ? " · Labeled analyst-added: verify that a person supplied this fact."
                              : " · Source-linked claim"}
                            {claim.conflicts.length
                              ? ` · Conflicts with ${claim.conflicts.join(", ")}`
                              : ""}
                          </p>
                          <div className="session-diff">
                            <div>
                              <span>Accepted</span>
                              <pre>{change.before}</pre>
                            </div>
                            <div>
                              <span>Proposed</span>
                              <pre>{change.after}</pre>
                            </div>
                          </div>
                          {claim.citations.map((id) => {
                            const passage = source.segments.find(
                              (s) => s.id === id,
                            )!;
                            return (
                              <blockquote key={id}>
                                <strong>
                                  {passage.speaker || "Unknown speaker"} ·{" "}
                                  {passage.timestamp || `line ${passage.line}`}{" "}
                                  · {id}
                                </strong>
                                <p>{passage.text}</p>
                              </blockquote>
                            );
                          })}
                          <p>
                            Disposition:{" "}
                            <strong>{recorded?.decision ?? "pending"}</strong>
                            {recorded &&
                              ` · ${recorded.reviewer}: ${recorded.note}`}
                          </p>
                          {activation.status === "result-received" && (
                            <>
                              <Field
                                label={`Review note for ${claim.path}`}
                                value={notes[key] ?? ""}
                                onChange={(note) =>
                                  setNotes((v) => ({ ...v, [key]: note }))
                                }
                                multiline
                              />
                              <div className="session-actions">
                                {(
                                  [
                                    "accepted",
                                    "rejected",
                                    "unresolved",
                                  ] as const
                                ).map((decision) => (
                                  <button
                                    key={decision}
                                    className="forge-btn-outline"
                                    onClick={() =>
                                      run(() =>
                                        review(candidate, claim.path, decision),
                                      )
                                    }
                                  >
                                    {decision === "accepted"
                                      ? "Accept fact"
                                      : decision === "rejected"
                                        ? "Reject fact"
                                        : "Keep unresolved"}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </section>
                      );
                    })}
                    <button
                      className="forge-btn-primary"
                      disabled={activation.status !== "result-received"}
                      onClick={() =>
                        run(async () => {
                          commit(await applyCandidate(session, candidate));
                          setMessage(
                            "Reviewed candidate applied as a new process revision. The prior process is retained in this session.",
                          );
                          changeView(3);
                        })
                      }
                    >
                      Apply reviewed candidate
                    </button>
                    <p className="intake-help">
                      All changed facts need an accepted disposition. Proposals
                      and disputed facts belong in open questions. For rejected
                      or stale results, create a fresh retry with your agent;
                      the original remains available.
                    </p>
                  </article>
                );
              })}
            </>
          )}
          {view === 3 && (
            <>
              <p className="session-intro">
                {session.process.pir.process_name ||
                  "No process name confirmed yet."}{" "}
                {session.needsReview
                  ? "New source or edits require review."
                  : "Review the accepted process with stakeholders."}
              </p>
              <div className="session-actions">
                <button
                  className="forge-btn-primary"
                  onClick={() =>
                    run(() => {
                      downloadText(
                        "process-bundle.json",
                        serializeBundle(session.process),
                        "application/json",
                      );
                      setMessage(
                        "Version 1 process bundle downloaded. It omits transcripts and claim reviews; Save session retains those.",
                      );
                    })
                  }
                >
                  Download compatible process bundle
                </button>
                <button className="forge-btn-outline" onClick={() => run(save)}>
                  Save complete session
                </button>
              </div>
              <p className="intake-help">
                The compatible bundle opens in Guided intake. It omits session
                evidence. Shared diagram links contain source only. Save the
                session to retain your evidence and decisions.
              </p>
              <details className="intake-details">
                <summary>Accepted process facts</summary>
                <pre className="session-json">
                  {JSON.stringify(session.process.pir, null, 2)}
                </pre>
              </details>
              <h3>Questions carried forward</h3>
              <ul>
                {session.process.pir.open_questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
              <details className="intake-details">
                <summary>
                  Prior process revisions ({session.history.length})
                </summary>
                {session.history.map((bundle, index) => (
                  <button
                    key={index}
                    className="forge-btn-outline"
                    onClick={() =>
                      run(() => {
                        downloadText(
                          `process-revision-${index + 1}.json`,
                          serializeBundle(bundle),
                          "application/json",
                        );
                      })
                    }
                  >
                    Download process revision {index + 1}
                  </button>
                ))}
              </details>
              <div className="intake-workbench">
                <Suspense fallback={<p>Loading diagram workbench...</p>}>
                  <Playground
                    processSession={{
                      source: session.process.diagram.source,
                      onChange: (source) => {
                        try {
                          const latest = currentRef.current;
                          commit({
                            ...latest,
                            needsReview: true,
                            process: {
                              ...latest.process,
                              diagram: {
                                ...latest.process.diagram,
                                source,
                                provenance:
                                  "Edited in the session workbench; evidence mapping needs review.",
                              },
                              review: {
                                status: "not-reviewed",
                                reviewer: "",
                                notes: "",
                              },
                            },
                          });
                        } catch (e) {
                          setError(String(e));
                        }
                      },
                    }}
                  />
                </Suspense>
              </div>
            </>
          )}
        </section>
      </fieldset>
    </div>
  );
}
