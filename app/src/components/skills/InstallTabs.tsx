import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface InstallTabsProps {
  skillId: string;
}

const GITHUB_RAW = "https://raw.githubusercontent.com/OKHP3/mermaid-diagram-bpmn/main/skills";

const PLATFORMS = [
  {
    id: "claude",
    label: "Claude Code",
    code: (id: string) =>
      `# In your agent's skills/ directory:\nmkdir -p skills/${id} && \\\ncurl -fsSL -o skills/${id}/SKILL.md \\\n  ${GITHUB_RAW}/${id}/SKILL.md`,
  },
  {
    id: "openai",
    label: "OpenAI Codex",
    code: (id: string) =>
      `# Place SKILL.md in your codex skills directory:\nmkdir -p skills/${id}\ncurl -fsSL -o skills/${id}/SKILL.md \\\n  ${GITHUB_RAW}/${id}/SKILL.md`,
  },
  {
    id: "copilot",
    label: "GitHub Copilot",
    code: (id: string) =>
      `# Add to your .github/copilot-instructions/ folder:\nmkdir -p .github/copilot-instructions/${id}\ncurl -fsSL -o .github/copilot-instructions/${id}/SKILL.md \\\n  ${GITHUB_RAW}/${id}/SKILL.md`,
  },
  {
    id: "gemini",
    label: "Gemini CLI",
    code: (id: string) =>
      `# Add to your GEMINI.md or skills directory:\nmkdir -p skills/${id} && \\\ncurl -fsSL -o skills/${id}/SKILL.md \\\n  ${GITHUB_RAW}/${id}/SKILL.md`,
  },
  {
    id: "manual",
    label: "Manual",
    code: (id: string) =>
      `# 1. Download SKILL.md from the button above\n# 2. Place it in your agent's skills directory:\n#    skills/${id}/SKILL.md\n#\n# For Cursor, VS Code, or any SKILL.md-compatible platform,\n# consult agentskills.io for platform-specific paths.`,
  },
];

export function InstallTabs({ skillId }: InstallTabsProps) {
  const [activeTab, setActiveTab] = useState("claude");
  const [copied, setCopied] = useState(false);

  const active = PLATFORMS.find((p) => p.id === activeTab) ?? PLATFORMS[0];
  const code = active.code(skillId);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveTab(p.id)}
            className="px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0"
            style={{
              background: activeTab === p.id ? "hsl(var(--primary) / 0.1)" : "transparent",
              color: activeTab === p.id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              borderBottom: activeTab === p.id ? "2px solid hsl(var(--primary))" : "2px solid transparent",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <div className="relative">
        <pre className="forge-code-panel p-4 text-xs leading-relaxed overflow-x-auto m-0">
          {code}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded transition-colors"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "rgba(230,223,201,0.6)",
          }}
          title="Copy"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>

      {/* Note */}
      <div
        className="px-4 py-2.5 text-[10px] text-muted-foreground border-t border-border bg-muted/20"
      >
        The agentskills.io open standard defines the SKILL.md format. Install paths vary by platform —{" "}
        <a
          href="https://agentskills.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-2 hover:underline"
        >
          see agentskills.io
        </a>{" "}
        for current guidance.
      </div>
    </div>
  );
}
