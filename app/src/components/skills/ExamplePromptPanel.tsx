import { useState, useRef, useEffect } from "react";
import { ChevronDown, Copy, Check, Download } from "lucide-react";
import { SKILLS } from "@/data/skills-registry";

interface StepInput {
  skillId: string;
  triggerUsed: string;
}

interface ExamplePromptPanelProps {
  steps: StepInput[];
  /**
   * When provided, a "Download .txt" button appears in the toolbar.
   * The value is used as the filename, e.g. "PROC-2024-042-prompts.txt".
   */
  downloadFilename?: string;
  /**
   * When provided, edited phrases are persisted to localStorage under this key
   * so they survive page refreshes. A "Reset to example" button appears
   * whenever any phrase differs from the default.
   */
  storageKey?: string;
}

export function ExamplePromptPanel({ steps, downloadFilename, storageKey }: ExamplePromptPanelProps) {
  const defaultPhrases = steps.map((s) => s.triggerUsed);

  const [isOpen, setIsOpen] = useState(false);
  const [phrases, setPhrases] = useState<string[]>(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as unknown;
          if (Array.isArray(parsed) && parsed.length === defaultPhrases.length) {
            return parsed as string[];
          }
        }
      } catch {
        // ignore corrupt storage
      }
    }
    return [...defaultPhrases];
  });
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const isDirty = storageKey
    ? phrases.some((p, i) => p !== defaultPhrases[i])
    : false;

  function updatePhrase(i: number, value: string) {
    setPhrases((prev) => {
      const next = [...prev];
      next[i] = value;
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // storage unavailable
        }
      }
      return next;
    });
  }

  function resetPhrases() {
    setPhrases([...defaultPhrases]);
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // storage unavailable
      }
    }
  }

  function buildText() {
    return phrases
      .map((phrase, i) => `${String(i + 1).padStart(2, "0")}. ${phrase}`)
      .join("\n\n");
  }

  async function copyAll() {
    const text = buildText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  function downloadTxt() {
    const blob = new Blob([buildText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadFilename ?? "prompts.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border border-border bg-card max-w-3xl mt-6 overflow-hidden">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <Copy size={14} className="text-primary shrink-0" />
          <span className="text-sm font-semibold text-foreground">Copy prompt sequence</span>
          <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground/60 border border-border rounded px-1.5 py-0.5">
            {steps.length} triggers
          </span>
        </div>
        <ChevronDown
          size={16}
          className="text-muted-foreground transition-transform duration-200 shrink-0"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="border-t border-border">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-muted/20 border-b border-border">
            <p className="text-[10px] text-muted-foreground leading-tight max-w-sm">
              Edit trigger phrases to match your process name, then copy the full sequence.
            </p>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              {isDirty && (
                <button
                  type="button"
                  onClick={resetPhrases}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  style={{
                    background: "hsl(var(--muted))",
                    color: "hsl(var(--muted-foreground))",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  Reset to example
                </button>
              )}
              {downloadFilename && (
                <button
                  type="button"
                  onClick={downloadTxt}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  style={{
                    background: "hsl(var(--muted))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                  }}
                >
                  <Download size={12} /> Download .txt
                </button>
              )}
              <button
                type="button"
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                style={{
                  background: copied
                    ? "hsl(var(--primary) / 0.12)"
                    : "hsl(var(--primary))",
                  color: copied ? "hsl(var(--primary))" : "#fff",
                  borderColor: copied ? "hsl(var(--primary) / 0.4)" : "transparent",
                  border: copied ? "1px solid" : "1px solid transparent",
                }}
              >
                {copied ? (
                  <><Check size={12} /> Copied!</>
                ) : (
                  <><Copy size={12} /> Copy all</>
                )}
              </button>
            </div>
          </div>

          {/* Phrase list */}
          <ol className="divide-y divide-border">
            {steps.map((step, i) => {
              const skill = SKILLS.find((s) => s.id === step.skillId);
              return (
                <li key={step.skillId} className="flex items-start gap-3 px-5 py-3">
                  <span
                    className="text-[10px] font-mono font-bold shrink-0 mt-2.5 w-5 text-right"
                    style={{ color: "hsl(var(--primary) / 0.7)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    {skill && (
                      <p className="text-[9px] font-mono text-muted-foreground/50 mb-1">
                        {skill.displayName}
                      </p>
                    )}
                    <textarea
                      value={phrases[i]}
                      onChange={(e) => updatePhrase(i, e.target.value)}
                      rows={2}
                      className="w-full text-xs font-mono text-foreground bg-muted/30 border border-border/60 rounded px-2.5 py-1.5 resize-none leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-colors"
                      aria-label={`Trigger phrase for skill ${i + 1}${skill ? `: ${skill.displayName}` : ""}`}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
