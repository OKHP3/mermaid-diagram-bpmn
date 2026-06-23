/**
 * normalize-mermaid.mjs
 * Strip Markdown code fences and prose wrappers from Mermaid code.
 * No external dependencies — runs with: node scripts/normalize-mermaid.mjs
 */

const FENCE_RE = /^```(?:mermaid)?\s*\n([\s\S]*?)```\s*$/;
const LOOSE_FENCE_RE = /```(?:mermaid)?\s*\n([\s\S]*?)```/;

/**
 * Normalize Mermaid input by stripping Markdown fences and prose wrappers.
 * Preserves %%{init}%% blocks.
 *
 * @param {string} input - Raw input (may be wrapped in code fences or prose)
 * @returns {string} Clean Mermaid code
 */
export function normalizeMermaid(input) {
  if (!input || typeof input !== "string") return "";

  let code = input.trim();

  const fenceMatch = code.match(FENCE_RE) || code.match(LOOSE_FENCE_RE);
  if (fenceMatch) {
    code = fenceMatch[1].trim();
    return code;
  }

  const lines = code.split("\n");
  const mermaidKeywords = [
    "flowchart", "graph ", "sequenceDiagram", "classDiagram",
    "stateDiagram", "erDiagram", "gantt", "pie", "gitGraph",
    "mindmap", "timeline", "journey", "quadrantChart", "requirementDiagram",
    "c4Context", "c4Container", "c4Component", "c4Dynamic", "c4Deployment",
    "block-beta", "sankey-beta", "xychart-beta", "zenuml",
    "architectureBeta", "kanban", "packet-beta", "%%{init",
  ];

  let startLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    if (mermaidKeywords.some((kw) => trimmed.toLowerCase().startsWith(kw.toLowerCase()))) {
      startLine = i;
      break;
    }
  }

  if (startLine > 0) {
    code = lines.slice(startLine).join("\n").trim();
  }

  return code;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const samples = [
    "```mermaid\nflowchart TD\n  A --> B\n```",
    "```\nsequenceDiagram\n  Alice->>Bob: Hi\n```",
    "Here is your diagram:\n\nflowchart LR\n  X --> Y",
    "flowchart TD\n  A --> B",
    "Some prose before.\n\nclassDiagram\n  A <|-- B\n\nSome prose after.",
  ];
  for (const s of samples) {
    console.log("---");
    console.log(normalizeMermaid(s));
  }
}
