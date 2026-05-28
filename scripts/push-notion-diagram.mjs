#!/usr/bin/env node
/**
 * push-notion-diagram.mjs
 *
 * Reads the Mermaid dependency-flow diagram from
 * artifacts/mermaid-diagram-bpmn/public/skill-dependency-flow.md
 * and pushes it as a code block to the BP-SKILL Notion page.
 *
 * If a code block with the same marker heading already exists on the page
 * it is deleted first so the script is safely re-runnable.
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
const MARKER = "BP-SKILL v0.3 — Skill Dependency Flow";

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
 * Split a string into chunks and return an array of rich_text objects.
 */
function richTextChunks(content, maxLen = 2000) {
  const chunks = [];
  for (let i = 0; i < content.length; i += maxLen) {
    chunks.push({ type: "text", text: { content: content.slice(i, i + maxLen) } });
  }
  return chunks;
}

async function appendCodeBlock(pageId, language, content) {
  return notionFetch(`/blocks/${pageId}/children`, "PATCH", {
    children: [
      {
        type: "code",
        code: {
          language,
          rich_text: richTextChunks(content),
        },
      },
    ],
  });
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

// Extract the content of the first ```mermaid ... ``` block
const mermaidMatch = mdSource.match(/```mermaid\n([\s\S]*?)```/);
if (!mermaidMatch) {
  console.error("ERROR: No mermaid code block found in skill-dependency-flow.md");
  process.exit(1);
}

const mermaidCode = mermaidMatch[1].trimEnd();
console.log(`Extracted Mermaid diagram (${mermaidCode.split("\n").length} lines).`);

if (DRY_RUN) {
  console.log("\n--- DRY RUN: would push the following to Notion ---\n");
  console.log(mermaidCode);
  console.log("\n--- DRY RUN complete. No changes made. ---");
  process.exit(0);
}

// ── Find + delete any existing marker block ───────────────────────────────

console.log(`Fetching blocks from Notion page ${PAGE_ID} …`);
const blocks = await listPageBlocks(PAGE_ID);

const existing = blocks.find((b) => {
  if (b.type !== "code") return false;
  const texts = b.code?.rich_text ?? [];
  // Notion returns plain_text on read; fall back to text.content for safety
  const full = texts
    .map((t) => t.plain_text ?? t.text?.content ?? "")
    .join("");
  return full.includes("flowchart LR");
});

if (existing) {
  console.log(`Found existing diagram block ${existing.id} — deleting …`);
  await deleteBlock(existing.id);
  console.log("Deleted.");
} else {
  console.log("No existing diagram block found — will append fresh.");
}

// ── Append the new code block ─────────────────────────────────────────────

console.log("Appending Mermaid code block …");
await appendCodeBlock(PAGE_ID, "mermaid", mermaidCode);
console.log(
  `Done. Open https://www.notion.so/${PAGE_ID.replace(/-/g, "")} to verify.`
);
