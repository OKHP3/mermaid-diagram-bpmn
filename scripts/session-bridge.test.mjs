import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { join, resolve, relative, isAbsolute } from "node:path";
import { tmpdir } from "node:os";
import { main } from "./session-bridge.mjs";
import { bridgeHash } from "../app/src/lib/session-bridge.ts";

test("bridge CLI binds actual inputs, preserves fetch time and refuses replacement", async () => {
  const parent = resolve(tmpdir());
  const dir = await mkdtemp(join(parent, "bpmn-session-bridge-"));
  try {
    const raw = "Alex: Synthetic CLI fixture.";
    const source = {
      sessionId: "session-fixture",
      revision: { id: "rev-fixture", raw, hash: await bridgeHash(raw) },
    };
    const result = {
      format: "bpmn-session-result",
      version: 1,
      sessionId: source.sessionId,
      revisionId: source.revision.id,
    };
    await writeFile(join(dir, "source.json"), JSON.stringify(source));
    await writeFile(join(dir, "result.json"), JSON.stringify(result));
    const args = [
      "receipt",
      "--input",
      join(dir, "result.json"),
      "--source",
      join(dir, "source.json"),
      "--agent",
      "Automated fixture only",
      "--run-id",
      "cli-test",
      "--started-at",
      "2026-01-01T00:00:00Z",
      "--output",
      join(dir, "output.json"),
    ];
    await main(args);
    const saved = JSON.parse(await readFile(join(dir, "output.json"), "utf8"));
    assert.equal(saved.execution.resultHash, await bridgeHash(result));
    assert.equal(saved.execution.sourceHash, source.revision.hash);
    await assert.rejects(main(args), /EEXIST/);
    await assert.rejects(
      main([...args.slice(0, -1), "relative.json"]),
      /absolute output/,
    );
    await writeFile(
      join(dir, "source.json"),
      JSON.stringify({ ...source, sessionId: "other" }),
    );
    await assert.rejects(main(args), /do not match/);
    const fetchedAt = "2026-11-04T06:31:55.694Z";
    const response = {
      id: "40e812e0ced481c586ecd49051a601a2",
      url: "https://app.notion.com/p/40e812e0ced481c586ecd49051a601a2",
      title: "Synthetic CLI fixture",
      page_last_edited_at: "2026-11-04T06:31:55.677Z",
      text: `Here is the result of "fetch" for the Page as of ${fetchedAt}:\n<content>\n## Transcript\n\n\`\`\`txt\n${raw}\n\`\`\`\n</content>`,
    };
    const fetchPath = join(dir, "fetch.json"),
      snapshotPath = join(dir, "snapshot.json");
    await writeFile(fetchPath, JSON.stringify(response));
    const snapshotArgs = [
      "notion",
      "--input",
      fetchPath,
      "--kind",
      "synthetic",
      "--output",
      snapshotPath,
    ];
    await main(snapshotArgs);
    assert.equal(
      JSON.parse(await readFile(snapshotPath, "utf8")).source.fetchedAt,
      fetchedAt,
    );
    response.text = response.text.slice(response.text.indexOf("<content>"));
    await writeFile(fetchPath, JSON.stringify(response));
    await assert.rejects(main(snapshotArgs), /observed connector fetch time/);
  } finally {
    const child = relative(parent, dir);
    assert.ok(child && !child.startsWith("..") && !isAbsolute(child));
    await rm(dir, { recursive: true });
  }
});
test("CLI rejects unknown commands and malformed options before touching output", async () => {
  await assert.rejects(main(["run-agent"]), /Commands/);
  await assert.rejects(main(["notion", "--input"]), /named options/);
  await assert.rejects(
    main(["notion", "--input", "a", "--input", "b"]),
    /named options/,
  );
});
