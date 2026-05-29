#!/usr/bin/env node
/**
 * push-notion-diagram.mjs
 *
 * Reads the Mermaid dependency-flow diagram from
 * app/public/skill-dependency-flow.md
 * and pushes it as a code block to the BP-SKILL Notion page.
 *
 * Default (safe) behaviour:
 *   - Detects any existing diagram block by a unique marker comment
 *     (%% BPSKILL-DEPENDENCY-FLOW) embedded in the code block body.
 *   - Deletes ONLY that one block — no other page content is touched.
 *   - Appends the fresh diagram block (Notion only supports appending;
 *     the public API has no prepend operation).
 *   - Result: diagram appears at the bottom (or in the same position
 *     if it was already the last block).
 *
 * --force-rebuild (destructive):
 *   Places the diagram at the TOP of the page by rebuilding page content.
 *   Safety checks before any deletion:
 *     1. All top-level blocks must be in RESTORABLE_TYPES.
 *     2. None of those blocks may have nested children (has_children: true),
 *        because the restore path only handles top-level content.
 *   If either check fails the script aborts with a clear error and no
 *   changes are made. Add --force-rebuild only when you have confirmed
 *   the page contains only simple, flat blocks.
 *
 * Required env var: NOTION_TOKEN
 * Target page:      36c812e0-ced4-81ef-816d-e1cd471fd1cd
 *
 * Usage:
 *   node scripts/push-notion-diagram.mjs [--dry-run] [--force-rebuild]
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const PAGE_ID = "36c812e0-ced4-81ef-816d-e1cd471fd1cd";
const NOTION_VERSION = "2022-06-28";

/**
 * Unique marker embedded as the first line of every pushed code block.
 * Detection matches only this exact marker, not generic Mermaid content.
 */
const MARKER_COMMENT = "%% BPSKILL-DEPENDENCY-FLOW";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── CLI flags ──────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const FORCE_REBUILD = process.argv.includes("--force-rebuild");

// ── Block types that can be safely round-tripped without nested children ──

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

// ── Token ─────────────────────────────────────────────────────────────────

const NOTION_TOKEN = process.env.NOTION_TOKEN;
if (!NOTION_TOKEN) {
  console.error(
    "ERROR: NOTION_TOKEN environment variable is not set.\n" +
      "Set it in the Replit Secrets panel and re-run."
  );
  process.exit(1);
}

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
 * Notion rich_text items have a 2000-char per-element limit.
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
 * Build the Notion block payload for the diagram code block.
 */
function buildDiagramBlockPayload(mermaidCode) {
  return {
    type: "code",
    code: {
      language: "mermaid",
      rich_text: richTextChunks(mermaidCode),
    },
  };
}

/**
 * Deep-strip null values from an object.
 * Notion rejects null fields (e.g. icon: null) when appending blocks.
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
 * Convert a fetched Notion block into an appendable payload.
 * Returns null for unrestorable types.
 */
function toAppendPayload(block) {
  const { type } = block;
  if (!RESTORABLE_TYPES.has(type)) return null;
  const content = block[type];
  if (!content) return null;
  return stripNulls({ type, [type]: content });
}

/**
 * Append up to 100 block payloads per request (Notion limit).
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
  "../app/public/skill-dependency-flow.md"
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

// ── Fetch current page blocks ─────────────────────────────────────────────

console.log(`Fetching blocks from Notion page ${PAGE_ID} …`);
const currentBlocks = await listPageBlocks(PAGE_ID);
console.log(`Found ${currentBlocks.length} existing block(s).`);

/** Returns true if a block is our pushed diagram (identified by marker). */
const isDiagramBlock = (b) => {
  if (b.type !== "code") return false;
  const texts = b.code?.rich_text ?? [];
  const full = texts.map((t) => t.plain_text ?? t.text?.content ?? "").join("");
  return full.includes(MARKER_COMMENT);
};

const existingDiagram = currentBlocks.find(isDiagramBlock);
const otherBlocks = currentBlocks.filter((b) => !isDiagramBlock(b));

// ── FORCE REBUILD: top-placement with full safety preflight ───────────────

if (FORCE_REBUILD) {
  console.log("\n[--force-rebuild] Running preflight checks …");

  const unrestorable = otherBlocks.filter((b) => !RESTORABLE_TYPES.has(b.type));
  if (unrestorable.length > 0) {
    console.error(
      `ERROR: Page contains ${unrestorable.length} block type(s) that cannot be safely restored:\n` +
        unrestorable.map((b) => `  ${b.type} (${b.id})`).join("\n") +
        "\nAbort — no changes made."
    );
    process.exit(1);
  }

  const withChildren = otherBlocks.filter((b) => b.has_children);
  if (withChildren.length > 0) {
    console.error(
      `ERROR: ${withChildren.length} block(s) have nested children that cannot be safely restored:\n` +
        withChildren.map((b) => `  ${b.type} (${b.id})`).join("\n") +
        "\nAbort — no changes made. Flatten nested content before using --force-rebuild."
    );
    process.exit(1);
  }

  console.log("Preflight passed — all blocks are flat and restorable.");
  console.log(
    `Rebuilding page: diagram first, then ${otherBlocks.length} original block(s) …`
  );

  const restorePayloads = otherBlocks.map(toAppendPayload).filter(Boolean);

  for (const b of currentBlocks) {
    await deleteBlock(b.id);
  }
  console.log(`Deleted ${currentBlocks.length} block(s).`);

  await appendBlocks(PAGE_ID, [buildDiagramBlockPayload(mermaidCode)]);
  if (restorePayloads.length > 0) {
    await appendBlocks(PAGE_ID, restorePayloads);
    console.log(`Restored ${restorePayloads.length} original block(s).`);
  }

  console.log(
    `\nDone (${existingDiagram ? "updated" : "created"} — placed at top). ` +
      `Open https://www.notion.so/${PAGE_ID.replace(/-/g, "")} to verify.`
  );
  process.exit(0);
}

// ── DEFAULT (safe): delete only the diagram block, append fresh ───────────

if (existingDiagram) {
  console.log(`Found existing diagram block ${existingDiagram.id} — deleting …`);
  await deleteBlock(existingDiagram.id);
  console.log("Deleted.");
} else {
  console.log("No existing diagram block found — will append fresh.");
}

await appendBlocks(PAGE_ID, [buildDiagramBlockPayload(mermaidCode)]);

console.log(
  `\nDone (${existingDiagram ? "updated" : "created"}). ` +
    `Open https://www.notion.so/${PAGE_ID.replace(/-/g, "")} to verify.\n` +
    `Note: diagram is placed at the bottom (Notion API limitation).\n` +
    `To place it at the top, run with --force-rebuild after confirming the page\n` +
    `contains only simple flat blocks (no toggles, tables, columns, etc.).`
);
