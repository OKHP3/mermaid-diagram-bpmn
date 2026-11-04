/** External-agent transport only. This module never connects to a provider. */
export interface ProviderSource {
  provider: "notion";
  pageId: string;
  url: string;
  title: string;
  editedAt: string;
  fetchedAt: string;
  kind: "meeting-transcript" | "transcript-block" | "synthetic";
  transcriptHash: string;
}
export interface ProviderSnapshot {
  format: "bpmn-provider-snapshot";
  version: 1;
  source: ProviderSource;
  raw: string;
}
export interface ExecutionReceipt {
  agent: string;
  runId: string;
  startedAt: string;
  completedAt: string;
  sourceHash: string;
  resultHash: string;
}
export const MAX_BRIDGE_BYTES = 1_000_000;
function fail(message: string): never {
  throw new Error(message);
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map(
        (k) =>
          `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`,
      )
      .join(",")}}`;
  return JSON.stringify(value);
}
export async function bridgeHash(value: unknown) {
  const bytes = new TextEncoder().encode(
    typeof value === "string" ? value : canonical(value),
  );
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail("Expected a bridge record.");
  const data = value as Record<string, unknown>;
  if (
    Object.keys(data).some((k) => !keys.includes(k)) ||
    keys.some((k) => !Object.hasOwn(data, k))
  )
    fail("Unsupported or missing bridge fields.");
  return data;
}
function date(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  )
    return false;
  return new Date(value).toISOString().slice(0, 19) === value.slice(0, 19);
}
function text(value: unknown, max = 500): value is string {
  return (
    typeof value === "string" &&
    !!value.trim() &&
    value.length <= max &&
    !value.includes("\0")
  );
}
export function validateProviderSource(
  value: unknown,
): asserts value is ProviderSource {
  const s = record(value, [
    "provider",
    "pageId",
    "url",
    "title",
    "editedAt",
    "fetchedAt",
    "kind",
    "transcriptHash",
  ]);
  if (
    s.provider !== "notion" ||
    !text(s.pageId, 36) ||
    !/^[\da-f]{32}$/i.test(s.pageId.replaceAll("-", "")) ||
    s.url !== `https://www.notion.so/${s.pageId.replaceAll("-", "")}` ||
    !text(s.title) ||
    !date(s.editedAt) ||
    !date(s.fetchedAt) ||
    Date.parse(s.editedAt) > Date.parse(s.fetchedAt) ||
    !["meeting-transcript", "transcript-block", "synthetic"].includes(
      String(s.kind),
    ) ||
    typeof s.transcriptHash !== "string" ||
    !/^[a-f0-9]{64}$/.test(s.transcriptHash)
  )
    fail("Invalid Notion source identity, timestamp, or transcript hash.");
}
export async function readProviderSnapshot(
  input: string,
): Promise<ProviderSnapshot> {
  if (new TextEncoder().encode(input).length > MAX_BRIDGE_BYTES)
    fail("Provider snapshot exceeds 1 MB.");
  const data = record(JSON.parse(input), [
    "format",
    "version",
    "source",
    "raw",
  ]);
  validateProviderSource(data.source);
  if (
    data.format !== "bpmn-provider-snapshot" ||
    data.version !== 1 ||
    !text(data.raw, 500_000) ||
    new TextEncoder().encode(data.raw).length > 500_000
  )
    fail("Unsupported or oversized transcript snapshot.");
  if ((await bridgeHash(data.raw)) !== data.source.transcriptHash)
    fail("Provider transcript hash does not match. Fetch a fresh snapshot.");
  return data as unknown as ProviderSnapshot;
}

/** Accept the complete structured result of the user's authenticated Notion fetch. */
export async function prepareNotionSnapshot(
  input: unknown,
  fetchedAt: string,
  kind: ProviderSource["kind"] = "meeting-transcript",
): Promise<ProviderSnapshot> {
  if (!input || typeof input !== "object")
    fail("Supply the complete Notion fetch result.");
  const data = input as Record<string, unknown>;
  if (
    data.truncated === true ||
    Number(data.unknown_block_count ?? 0) > 0 ||
    (Array.isArray(data.unknown_block_ids) && data.unknown_block_ids.length) ||
    data.isError === true
  )
    fail(
      "Notion returned incomplete content. Fetch the missing transcript before continuing.",
    );
  if (
    !text(data.id, 36) ||
    !text(data.url, 2048) ||
    !text(data.title) ||
    !text(data.text, MAX_BRIDGE_BYTES) ||
    !date(data.page_last_edited_at)
  )
    fail(
      "Notion fetch is missing page identity, complete text, or revision time.",
    );
  const url = new URL(data.url);
  const id = data.id.replaceAll("-", "").toLowerCase();
  if (
    !["app.notion.com", "www.notion.so", "notion.so"].includes(url.hostname) ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !url.pathname.replaceAll("-", "").toLowerCase().endsWith(id)
  )
    fail("The Notion page URL and ID do not match.");
  const bodies = [...data.text.matchAll(/<content>\n([\s\S]*?)\n<\/content>/g)];
  if (bodies.length !== 1) fail("Expected one complete Notion page body.");
  const body = bodies[0][1];
  let raw: string;
  if (kind === "meeting-transcript") {
    const transcripts = [
      ...body.matchAll(
        /<meeting-notes-section-transcript>([\s\S]*?)<\/meeting-notes-section-transcript>/g,
      ),
    ];
    if (
      transcripts.length !== 1 ||
      /transcript omitted/i.test(transcripts[0][1])
    )
      fail(
        "Fetch exactly one meeting transcript with include_transcript enabled. Notes and summaries are not transcripts.",
      );
    raw = transcripts[0][1].replace(/^\n|\n$/g, "");
    if (/<\/?(?:meeting-notes|unknown|truncated)\b/i.test(raw))
      fail("Incomplete or unsupported transcript markup.");
  } else {
    const blocks = [
      ...body.matchAll(
        /^## Transcript\r?\n\r?\n```(?:text|txt)\r?\n([\s\S]*?)\r?\n```(?=\r?\n|$)/gm,
      ),
    ];
    if (blocks.length !== 1)
      fail(
        "Select one plain text code block under the exact heading Transcript.",
      );
    raw = blocks[0][1];
  }
  const snapshot: ProviderSnapshot = {
    format: "bpmn-provider-snapshot",
    version: 1,
    raw,
    source: {
      provider: "notion",
      pageId: id,
      url: `https://www.notion.so/${id}`,
      title: data.title,
      editedAt: data.page_last_edited_at,
      fetchedAt,
      kind,
      transcriptHash: await bridgeHash(raw),
    },
  };
  return readProviderSnapshot(JSON.stringify(snapshot));
}
export function validateExecutionShape(
  value: unknown,
): asserts value is ExecutionReceipt {
  const e = record(value, [
    "agent",
    "runId",
    "startedAt",
    "completedAt",
    "sourceHash",
    "resultHash",
  ]);
  if (
    !text(e.agent, 120) ||
    !text(e.runId, 200) ||
    !date(e.startedAt) ||
    !date(e.completedAt) ||
    Date.parse(e.startedAt) > Date.parse(e.completedAt) ||
    ![e.sourceHash, e.resultHash].every(
      (h) => typeof h === "string" && /^[a-f0-9]{64}$/.test(h),
    )
  )
    fail("Invalid reported agent execution receipt.");
}
export async function verifyExecution(
  result: { execution?: ExecutionReceipt },
  sourceHash: string,
) {
  if (!result.execution) return; // Older manual results remain supported.
  validateExecutionShape(result.execution);
  const { execution, ...candidate } = result;
  if (
    execution.sourceHash !== sourceHash ||
    execution.resultHash !== (await bridgeHash(candidate))
  )
    fail(
      "Execution receipt does not match this source and candidate. Return the original result or run a fresh task.",
    );
}
