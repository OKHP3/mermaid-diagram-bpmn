#!/usr/bin/env node
/**
 * Parse `consumes` and `produces` arrays from skills-registry.ts and emit a
 * typed `PNS_TRANSITIONS` constant.  Skills that carry `PNS.md [status]` in
 * their consumes get a `before` value; skills that carry it in their produces
 * (or that are listed in PNS_LIFECYCLE) get an `after` value.
 *
 * Usage (from workspace root):
 *   node scripts/extract-pns-transitions.mjs
 *
 * Output:
 *   artifacts/mermaid-diagram-bpmn/src/data/pns-transitions-auto.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REGISTRY = path.join(
  ROOT,
  "artifacts/mermaid-diagram-bpmn/src/data/skills-registry.ts",
);
const OUT = path.join(
  ROOT,
  "artifacts/mermaid-diagram-bpmn/src/data/pns-transitions-auto.ts",
);

const BP_SKILL_IDS = [
  "process-intake-and-scope",
  "stakeholder-and-role-mapping",
  "elicitation-and-interview-facilitation",
  "as-is-process-capture",
  "process-narrative-authoring",
  "visual-process-modeling",
  "process-gap-and-exception-analysis",
  "future-state-and-change-strategy",
  "decision-model-authoring",
  "process-validation-and-quality-scoring",
  "process-measures-and-controls-definition",
  "sop-and-work-instruction-generation",
  "raci-and-governance-matrix-generation",
  "sipoc-generation",
  "publication-and-handoff-packaging",
];

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Find the body of a named array field (e.g. `consumes`) in a text block.
 * Uses a bracket-depth scanner so nested `[...]` inside string values
 * (like "PNS.md [draft-intake]") don't terminate the match early.
 * Returns the content between the outer `[` and its matching `]`, or null.
 */
function extractArrayBody(text, fieldName) {
  const prefix = `${fieldName}:`;
  const fieldIdx = text.indexOf(prefix);
  if (fieldIdx === -1) return null;

  const openIdx = text.indexOf("[", fieldIdx + prefix.length);
  if (openIdx === -1) return null;

  let depth = 0;
  let inStr = false;
  let strChar = "";
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (ch === "\\" && i + 1 < text.length) { i++; continue; } // escaped char
      if (ch === strChar) inStr = false;
    } else {
      if (ch === '"' || ch === "'") { inStr = true; strChar = ch; }
      else if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) return text.slice(openIdx + 1, i);
      }
    }
  }
  return null;
}

/**
 * Given the raw content of an array literal (between [ and ]) return every
 * string item, with outer quotes stripped.
 */
function parseStringItems(arrayBody) {
  const items = [];
  let inStr = false;
  let strChar = "";
  let current = "";
  for (let i = 0; i < arrayBody.length; i++) {
    const ch = arrayBody[i];
    if (inStr) {
      if (ch === "\\" && i + 1 < arrayBody.length) {
        current += arrayBody[++i];
      } else if (ch === strChar) {
        items.push(current);
        current = "";
        inStr = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"' || ch === "'") { inStr = true; strChar = ch; }
    }
  }
  return items;
}

/**
 * Search an array of string items for a `PNS.md [status]` entry.
 * Returns the first status token (handles "xxx or yyy" → "xxx").
 * Returns null if no bracketed PNS.md entry is found.
 */
function extractPnsStatus(items) {
  for (const item of items) {
    const m = item.match(/PNS\.md\s*\[([^\]]+)\]/);
    if (m) {
      // "modeled or analyzed" → "modeled"
      const first = m[1].split(/\s+or\s+/)[0].trim();
      return first;
    }
  }
  return null;
}

// ── read registry ─────────────────────────────────────────────────────────────

const src = fs.readFileSync(REGISTRY, "utf8");

// ── parse PNS_LIFECYCLE for after-backfill ────────────────────────────────────
// We want the *first* (lowest-order) entry per setBy.
const lifecycleAfter = {};
const lifecycleRe =
  /\{\s*status:\s*["']([^"']+)["'],\s*setBy:\s*["']([^"']+)["'],\s*order:\s*(\d+)\s*\}/g;
const lifecycleEntries = [];
let lm;
while ((lm = lifecycleRe.exec(src)) !== null) {
  lifecycleEntries.push({ status: lm[1], setBy: lm[2], order: parseInt(lm[3]) });
}
lifecycleEntries.sort((a, b) => a.order - b.order);
for (const entry of lifecycleEntries) {
  if (!(entry.setBy in lifecycleAfter)) {
    lifecycleAfter[entry.setBy] = entry.status;
  }
}

// ── parse per-skill consumes / produces ──────────────────────────────────────

const transitions = {};

for (const skillId of BP_SKILL_IDS) {
  // Anchor on `id: "skillId"` so that skill IDs appearing inside dependsOn
  // arrays of other skills don't produce false boundaries.
  const anchor = `id: "${skillId}"`;
  const startIdx = src.indexOf(anchor);
  if (startIdx === -1) {
    console.warn(`[extract-pns-transitions] WARNING: skill ID "${skillId}" not found in registry`);
    transitions[skillId] = { before: null, after: null };
    continue;
  }

  const nextIdxCandidates = BP_SKILL_IDS
    .filter((id) => id !== skillId)
    .map((id) => src.indexOf(`id: "${id}"`, startIdx + 1))
    .filter((i) => i > startIdx);
  const endIdx =
    nextIdxCandidates.length > 0 ? Math.min(...nextIdxCandidates) : src.length;

  const block = src.slice(startIdx, endIdx);

  // Extract consumes / produces array bodies using the bracket-depth scanner.
  const consumesBody = extractArrayBody(block, "consumes");
  const consumesItems = parseStringItems(consumesBody ?? "");

  const producesBody = extractArrayBody(block, "produces");
  const producesItems = parseStringItems(producesBody ?? "");

  const before = extractPnsStatus(consumesItems);
  // Prefer explicit bracket in produces; fall back to PNS_LIFECYCLE.
  const afterFromProduces = extractPnsStatus(producesItems);
  const after = afterFromProduces ?? lifecycleAfter[skillId] ?? null;

  transitions[skillId] = { before, after };
}

// ── emit TypeScript ───────────────────────────────────────────────────────────

const pad = Math.max(...Object.keys(transitions).map((k) => k.length));

const entries = BP_SKILL_IDS.map((id) => {
  const { before, after } = transitions[id];
  const b = before === null ? "null" : `"${before}"`;
  const a = after === null ? "null" : `"${after}"`;
  const key = `"${id}"`.padEnd(pad + 2);
  return `  ${key}: { before: ${b.padEnd(18)}, after: ${a} },`;
});

const lines = [
  "// AUTO-GENERATED by scripts/extract-pns-transitions.mjs — do not edit manually.",
  "// Source: artifacts/mermaid-diagram-bpmn/src/data/skills-registry.ts",
  "//   consumes fields  — PNS.md [status] pattern → before",
  "//   produces fields  — PNS.md [status] pattern → after  (backfilled from PNS_LIFECYCLE)",
  "// Re-run:  node scripts/extract-pns-transitions.mjs",
  "",
  "export interface PnsTransition {",
  "  before: string | null;",
  "  after:  string | null;",
  "}",
  "",
  "export const PNS_TRANSITIONS: Record<string, PnsTransition> = {",
  ...entries,
  "};",
  "",
];

fs.writeFileSync(OUT, lines.join("\n"), "utf8");
console.log(`[extract-pns-transitions] Generated ${path.relative(ROOT, OUT)}`);
for (const [id, t] of Object.entries(transitions)) {
  const b = t.before ?? "(none)";
  const a = t.after ?? "(none)";
  console.log(`  ${id}: ${b} → ${a}`);
}
