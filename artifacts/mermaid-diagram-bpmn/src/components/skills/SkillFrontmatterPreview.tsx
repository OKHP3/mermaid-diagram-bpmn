import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SkillFrontmatterPreviewProps {
  content: string;
  collapsedLines?: number;
}

type TokenType = "key" | "value" | "punctuation" | "comment" | "delimiter" | "string" | "plain";

interface Token {
  type: TokenType;
  text: string;
}

function tokeniseLine(line: string): Token[] {
  const tokens: Token[] = [];

  if (line.trim() === "---") {
    tokens.push({ type: "delimiter", text: line });
    return tokens;
  }

  if (line.trim().startsWith("#")) {
    tokens.push({ type: "comment", text: line });
    return tokens;
  }

  if (line.trim().startsWith("## ")) {
    tokens.push({ type: "key", text: line });
    return tokens;
  }

  const colonIdx = line.indexOf(":");
  if (colonIdx > 0 && line.slice(0, colonIdx).trim().match(/^[\w_-]+$/)) {
    const leading = line.match(/^(\s*)/)![1];
    const key = line.slice(leading.length, colonIdx);
    const rest = line.slice(colonIdx + 1);

    if (leading) tokens.push({ type: "plain", text: leading });
    tokens.push({ type: "key", text: key });
    tokens.push({ type: "punctuation", text: ":" });

    if (rest.trim()) {
      const val = rest;
      const innerCommentIdx = val.indexOf("  #");
      if (innerCommentIdx > 0) {
        tokens.push({ type: "value", text: val.slice(0, innerCommentIdx) });
        tokens.push({ type: "comment", text: val.slice(innerCommentIdx) });
      } else {
        tokens.push({ type: "value", text: val });
      }
    }
  } else if (line.trim().startsWith("- ")) {
    const leading = line.match(/^(\s*)/)![1];
    if (leading) tokens.push({ type: "plain", text: leading });
    tokens.push({ type: "punctuation", text: "- " });
    tokens.push({ type: "string", text: line.trim().slice(2) });
  } else {
    tokens.push({ type: "plain", text: line });
  }

  return tokens;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  key:        "hsl(var(--primary))",
  value:      "hsl(var(--accent-foreground))",
  punctuation:"hsl(var(--muted-foreground))",
  comment:    "hsl(var(--muted-foreground) / 0.55)",
  delimiter:  "hsl(var(--muted-foreground))",
  string:     "hsl(210 70% 65%)",
  plain:      "hsl(var(--foreground) / 0.8)",
};

export function SkillFrontmatterPreview({
  content,
  collapsedLines = 18,
}: SkillFrontmatterPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const lines = content.split("\n");
  const visibleLines = expanded ? lines : lines.slice(0, collapsedLines);
  const hasMore = lines.length > collapsedLines;

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      {/* Tab bar */}
      <div
        className="forge-code-panel-tab flex items-center gap-2 px-4 py-2 border-b"
        style={{ borderColor: "#2a3124" }}
      >
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <span className="text-xs font-mono text-white/40">SKILL.md</span>
      </div>

      {/* Code block */}
      <pre
        className="forge-code-panel p-4 text-xs leading-relaxed overflow-x-auto"
        style={{ margin: 0 }}
      >
        {visibleLines.map((line, i) => (
          <div key={i}>
            {tokeniseLine(line).map((tok, j) => (
              <span key={j} style={{ color: TOKEN_COLORS[tok.type] }}>
                {tok.text}
              </span>
            ))}
          </div>
        ))}
        {!expanded && hasMore && (
          <div style={{ color: "rgba(212,201,181,0.3)" }}>{"…"}</div>
        )}
      </pre>

      {/* Expand toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t border-border"
        >
          {expanded ? (
            <><ChevronUp size={12} /> Collapse SKILL.md</>
          ) : (
            <><ChevronDown size={12} /> Show full SKILL.md</>
          )}
        </button>
      )}
    </div>
  );
}
