#!/usr/bin/env node
/**
 * push-notion-diagram.mjs
 *
 * Reads the Mermaid dependency-flow diagram from
 * artifacts/mermaid-diagram-bpmn/public/skill-dependency-flow.md
 * and ensures it appears as the FIRST block on the BP-SKILL Notion page.
 *
 * Strategy for top-placement:
 *   The Notion Blocks API only supports appending children (no prepend).
 *   To place the diagram first, the script:
 *     1. Snapshots all current top-level page blocks
 *     2. Deletes them all
 *     3. Appends the diagram code block first
 *     4. Re-appends all original non-diagram blocks in their original order
 *   This is safe on pages with only simple blocks (paragraph, heading,
 *   code, callout, bulleted_list_item, numbered_list_item, quote, divider).
 *   Nested/complex blocks (tables, synced_blocks, columns) are skipped with
 *   a warning — they survive deletion only if none exist on the page.
 *
 * Idempotency:
 *   A unique marker comment is embedded as the first line of the pushed
 *   code block: %% BPSKILL-DEPENDENCY-FLOW
 *   Re-runs detect and skip carrying the old diagram forward, replacing it
 *   with the freshly generated one at the top.
 *
 * Required env var: NOTION_TOKEN
 * Target page:      36c812e0-ced4-81ef-816d-e1cd471fd1cd
 *
 * Usage:
 *   node scripts/push-notion-diagram.mjs [--dry-run]
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const PAGE_ID = "36c812e0-ced4-81ef-816d-e1cd471fd1cd";
const NOTION_VERSION = "2022-06-28";
const MARKER_COMMENT = "%% BPSKILL-DEPENDENCY-FLOW";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI flags ──────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");

// ── Token ─────────────────────────────────────────────────────────────────

const NOTION_TOKEN = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN) {
  console.error(
    "ERROR: NOTION_TOKEN environment variable is not set.\n" +
      "Set it in the Replit Secrets panel and re-run."
  );
  process.exit(1);
}

// ── Supported leaf block types that can be round-tripped safely ──────────

const RESTORABLE_TYPES = new Set([
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list_item",
  "numbered_list_item",
  "quote",
  "callout",
  "code",
  "divider",
  "to_do",
]);

// ── Notion helpers ────────────────────────────────────────────────────────

async function notionFetch(path, method = "GET", body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function listPageBlocks(pageId) {
  const blocks = [];
  let cursor;
  do {
    const params = cursor ? `?start_cursor=${cursor}` : "";
    const data = await notionFetch(`/blocks/${pageId}/children${params}`);
    blocks.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return blocks;
}

async function deleteBlock(blockId) {
  return notionFetch(`/blocks/${blockId}`, "DELETE");
}

/**
 * Notion's rich_text items have a 2000-char limit per element.
 * Split content into chunks and return an array of rich_text objects.
 */
function richTextChunks(content, maxLen = 2000) {
  const chunks = [];
  for (let i = 0; i < content.length; i += maxLen) {
    chunks.push({
      type: "text",
      text: { content: content.slice(i, i + maxLen) },
    });
  }
  return chunks;
}

/**
 * Build the Notion block object for the diagram, ready to append.
 */
function buildDiagramBlock(mermaidCode) {
  return {
    type: "code",
    code: {
      language: "mermaid",
      rich_text: richTextChunks(mermaidCode),
    },
  };
}

/**
 * Deep-strip null values from an object so Notion's append API doesn't
 * reject fields that are null in fetched block payloads (e.g. icon: null).
 */
function stripNulls(obj) {
  if (Array.isArray(obj)) return obj.map(stripNulls);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, stripNulls(v)])
    );
  }
  return obj;
}

/**
 * Reconstruct a plain Notion block payload from a fetched block object.
 * Only handles types listed in RESTORABLE_TYPES.
 * Returns null if the block type cannot be safely round-tripped.
 */
function toAppendPayload(block) {
  const { type } = block;
  if (!RESTORABLE_TYPES.has(type)) return null;
  const content = block[type];
  if (!content) return null;
  return stripNulls({ type, [type]: content });
}

/**
 * Append a batch of block payloads as children of pageId.
 * Notion allows up to 100 children per request.
 */
async function appendBlocks(pageId, children) {
  if (children.length === 0) return;
  for (let i = 0; i < children.length; i += 100) {
    const batch = children.slice(i, i + 100);
    await notionFetch(`/blocks/${pageId}/children`, "PATCH", { children: batch });
  }
}

// ── Read source ───────────────────────────────────────────────────────────

const mdPath = join(
  __dirname,
  "../artifacts/mermaid-diagram-bpmn/public/skill-dependency-flow.md"
);

let mdSource;
try {
  mdSource = readFileSync(mdPath, "utf-8");
} catch {
  console.error(`ERROR: Cannot read ${mdPath}`);
  process.exit(1);
}

const mermaidMatch = mdSource.match(/```mermaid\n([\s\S]*?)```/);
if (!mermaidMatch) {
  console.error("ERROR: No mermaid code block found in skill-dependency-flow.md");
  process.exit(1);
}

const rawCode = mermaidMatch[1].trimEnd();
const mermaidCode = `${MARKER_COMMENT}\n${rawCode}`;

console.log(`Extracted Mermaid diagram (${rawCode.split("\n").length} lines).`);

if (DRY_RUN) {
  console.log("\n--- DRY RUN: would push the following to Notion ---\n");
  console.log(mermaidCode);
  console.log("\n--- DRY RUN complete. No changes made. ---");
  process.exit(0);
}

// ── Snapshot current page blocks ──────────────────────────────────────────

console.log(`Fetching blocks from Notion page ${PAGE_ID} …`);
const currentBlocks = await listPageBlocks(PAGE_ID);
console.log(`Found ${currentBlocks.length} existing block(s).`);

// Separate diagram block(s) from the rest
const isDiagramBlock = (b) => {
  if (b.type !== "code") return false;
  const texts = b.code?.rich_text ?? [];
  const full = texts.map((t) => t.plain_text ?? t.text?.content ?? "").join("");
  return full.includes(MARKER_COMMENT);
};

const diagramBlocks = currentBlocks.filter(isDiagramBlock);
const otherBlocks = currentBlocks.filter((b) => !isDiagramBlock(b));

// Check that all other blocks are restorable
const unrestorable = otherBlocks.filter((b) => !RESTORABLE_TYPES.has(b.type));
if (unrestorable.length > 0) {
  console.error(
    `ERROR: Page contains ${unrestorable.length} block type(s) that cannot be safely moved:\n` +
      unrestorable.map((b) => `  ${b.type} (${b.id})`).join("\n") +
      "\nAbort — no changes made. Remove or simplify those blocks and re-run."
  );
  process.exit(1);
}

const restorePayloads = otherBlocks.map(toAppendPayload).filter(Boolean);

// ── Delete all current blocks ─────────────────────────────────────────────

const wasUpdate = diagramBlocks.length > 0;
console.log(
  wasUpdate
    ? `Removing ${diagramBlocks.length} old diagram block(s) and reordering page …`
    : "No existing diagram block — rebuilding page with diagram at top …"
);

for (const b of currentBlocks) {
  await deleteBlock(b.id);
}
console.log(`Deleted ${currentBlocks.length} block(s).`);

// ── Re-append: diagram first, then original blocks ────────────────────────

console.log("Appending diagram at top …");
await appendBlocks(PAGE_ID, [buildDiagramBlock(mermaidCode)]);

if (restorePayloads.length > 0) {
  console.log(`Re-appending ${restorePayloads.length} original block(s) …`);
  await appendBlocks(PAGE_ID, restorePayloads);
}

console.log(
  `\nDone (${wasUpdate ? "updated" : "created"}). ` +
    `Open https://www.notion.so/${PAGE_ID.replace(/-/g, "")} to verify.`
);
