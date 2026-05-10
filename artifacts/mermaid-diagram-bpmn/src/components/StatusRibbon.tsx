import { FlaskConical } from "lucide-react";

export function StatusRibbon() {
  return (
    <div
      className="w-full flex items-center gap-2.5 px-4 sm:px-6 py-2"
      style={{
        background: "rgba(196,106,44,0.09)",
        borderBottom: "1px solid rgba(196,106,44,0.22)",
      }}
    >
      <FlaskConical size={13} className="text-primary shrink-0" />
      <p className="text-xs text-foreground/80 leading-relaxed">
        <span className="font-semibold text-foreground">Prototype.</span>
        {" "}DSL unstable · Not full BPMN 2.0 · No BPMN XML import/export · No bpmn-js runtime ·{" "}
        <a
          href="https://github.com/OKHP3/mermaid-diagram-bpmn"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline font-medium"
        >
          OKHP3/mermaid-diagram-bpmn
        </a>
      </p>
    </div>
  );
}
