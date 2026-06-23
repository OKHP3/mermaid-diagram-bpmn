/**
 * detect-diagram.mjs
 * Detect diagram family from Mermaid code.
 * No external dependencies — runs with: node scripts/detect-diagram.mjs
 */

const FAMILY_TABLE = [
  { family: "flowchart",          keyword: "flowchart",           pattern: /^\s*(flowchart|graph)\s+(TD|TB|BT|LR|RL)\b/im },
  { family: "sequenceDiagram",    keyword: "sequenceDiagram",     pattern: /^\s*sequenceDiagram\b/im },
  { family: "classDiagram",       keyword: "classDiagram",        pattern: /^\s*classDiagram\b/im },
  { family: "stateDiagram",       keyword: "stateDiagram",        pattern: /^\s*stateDiagram(-v2)?\b/im },
  { family: "erDiagram",          keyword: "erDiagram",           pattern: /^\s*erDiagram\b/im },
  { family: "gantt",              keyword: "gantt",               pattern: /^\s*gantt\b/im },
  { family: "pie",                keyword: "pie",                 pattern: /^\s*pie\b/im },
  { family: "gitGraph",           keyword: "gitGraph",            pattern: /^\s*gitGraph\b/im },
  { family: "mindmap",            keyword: "mindmap",             pattern: /^\s*mindmap\b/im },
  { family: "timeline",           keyword: "timeline",            pattern: /^\s*timeline\b/im },
  { family: "journey",            keyword: "journey",             pattern: /^\s*journey\b/im },
  { family: "quadrantChart",      keyword: "quadrantChart",       pattern: /^\s*quadrantChart\b/im },
  { family: "requirementDiagram", keyword: "requirementDiagram",  pattern: /^\s*requirementDiagram\b/im },
  { family: "c4Diagram",          keyword: "c4Context",           pattern: /^\s*c4(Context|Container|Component|Dynamic|Deployment)\b/im },
  { family: "block",              keyword: "block-beta",          pattern: /^\s*block-beta\b/im },
  { family: "sankey",             keyword: "sankey-beta",         pattern: /^\s*sankey-beta\b/im },
  { family: "xychart",            keyword: "xychart-beta",        pattern: /^\s*xychart-beta\b/im },
  { family: "zenuml",             keyword: "zenuml",              pattern: /^\s*zenuml\b/im },
  { family: "architectureBeta",   keyword: "architecture-beta",   pattern: /^\s*architecture-beta\b/im },
  { family: "kanban",             keyword: "kanban",              pattern: /^\s*kanban\b/im },
  { family: "packet",             keyword: "packet",              pattern: /^\s*(packet-beta|packet)\b/im },
];

const INIT_BLOCK_RE = /%%\s*\{[\s\S]*?\}[\s\S]*?%%/g;

/**
 * Detect the diagram family from Mermaid code.
 *
 * @param {string} code - Raw Mermaid diagram code (may include %%{init}%% blocks)
 * @returns {{ family: string, keyword: string, confidence: 'high'|'low', warnings: string[] }}
 */
export function detectDiagramFamily(code) {
  if (!code || typeof code !== "string") {
    return { family: "unknown", keyword: "", confidence: "low", warnings: ["No code provided"] };
  }

  const warnings = [];

  const stripped = code
    .replace(INIT_BLOCK_RE, "")
    .replace(/^\s+/, "");

  for (const entry of FAMILY_TABLE) {
    if (entry.pattern.test(stripped)) {
      return {
        family: entry.family,
        keyword: entry.keyword,
        confidence: "high",
        warnings,
      };
    }
  }

  return {
    family: "unknown",
    keyword: "",
    confidence: "low",
    warnings: ["Could not detect diagram family — no recognized keyword found at start of code"],
  };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const samples = [
    "flowchart TD\n  A --> B",
    "sequenceDiagram\n  Alice->>Bob: Hi",
    "%%{init: {\"theme\": \"base\"}}%%\nclassDiagram\n  A <|-- B",
    "notADiagram at all",
    "gantt\n  title Test\n  dateFormat YYYY-MM-DD",
  ];
  for (const s of samples) {
    const result = detectDiagramFamily(s);
    console.log(JSON.stringify(result));
  }
}
