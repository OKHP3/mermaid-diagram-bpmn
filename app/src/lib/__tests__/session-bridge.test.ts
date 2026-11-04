import { describe, it, expect } from "vitest";
import {
  bridgeHash,
  prepareNotionSnapshot,
  readProviderSnapshot,
  verifyExecution,
  type ProviderSource,
} from "../session-bridge";
import {
  addProviderSnapshot,
  addTranscript,
  emptySession,
  readSession,
  serializeSession,
  resultTemplate,
  importVerifiedResult,
  applyCandidate,
  sessionHandoff,
} from "../transcript-session";

const raw =
  "00:00:05 Alex: Purchase request review.\n00:00:18 Alex: process capture checkpoint";
const edited = "2026-11-04T06:31:55.677Z",
  fetched = "2026-11-04T06:32:00.000Z";
const page = {
  id: "00000000-0000-4000-8000-000000000001",
  url: "https://app.notion.com/p/00000000000040008000000000000001?pvs=204",
  title: "Synthetic workshop",
  page_last_edited_at: edited,
  text: `<page>\n<content>\n## Transcript\n\n\`\`\`txt\n${raw}\n\`\`\`\n\n## Notes\nA summary is not a transcript.\n</content>\n</page>`,
};
const snapshot = () => prepareNotionSnapshot(page, fetched, "synthetic");
async function candidateFixture() {
  const session = await addProviderSnapshot(
    emptySession(),
    JSON.stringify(await snapshot()),
    "ongoing",
  );
  const result = resultTemplate(session, session.activations[0]);
  result.bundle.pir.process_name = "Purchase request review";
  result.claims = [
    {
      path: "/pir/process_name",
      kind: "current",
      citations: ["seg-1"],
      analystAdded: false,
      conflicts: [],
    },
  ];
  result.execution = {
    agent: "Synthetic test agent",
    runId: "fixture-only",
    startedAt: fetched,
    completedAt: fetched,
    sourceHash: session.revisions[0].hash,
    resultHash: await bridgeHash(result),
  };
  return { session, result };
}
describe("bounded provider snapshot", () => {
  it("retains exact source text, page identity and revision metadata", async () => {
    const s = await snapshot();
    expect(s.raw).toBe(raw);
    expect(s.source).toMatchObject({
      kind: "synthetic",
      editedAt: edited,
      fetchedAt: fetched,
      transcriptHash: await bridgeHash(raw),
    });
    expect(await readProviderSnapshot(JSON.stringify(s))).toEqual(s);
  });
  it("reads only a transcript section from native meeting markup", async () => {
    const s = await prepareNotionSnapshot(
      {
        ...page,
        text: `<content>\n<meeting-notes><meeting-notes-section-notes>SUMMARY</meeting-notes-section-notes><meeting-notes-section-transcript>\n${raw}\n</meeting-notes-section-transcript></meeting-notes>\n</content>`,
      },
      fetched,
    );
    expect(s.raw).toBe(raw);
  });
  it.each([
    { truncated: true },
    { unknown_block_count: 1 },
    { unknown_block_ids: ["block"] },
    { text: "<content>\n## Summary\nAlex approved everything.\n</content>" },
    { text: page.text + page.text },
    { url: "https://attacker.example/00000000000040008000000000000001" },
    { page_last_edited_at: "2026-02-30T06:00:00Z" },
    { page_last_edited_at: "2027-01-01T00:00:00Z" },
  ])(
    "rejects incomplete, ambiguous, mismatched or invalid provider data %j",
    async (change) => {
      await expect(
        prepareNotionSnapshot({ ...page, ...change }, fetched, "synthetic"),
      ).rejects.toThrow();
    },
  );
  it("does not accept a plain transcript block as a native recorded meeting", async () => {
    await expect(prepareNotionSnapshot(page, fetched)).rejects.toThrow(
      "include_transcript",
    );
  });
  it("rejects modified bytes, unexpected fields and oversized snapshots", async () => {
    const s = await snapshot();
    await expect(
      readProviderSnapshot(JSON.stringify({ ...s, raw: raw + "changed" })),
    ).rejects.toThrow("hash");
    await expect(
      readProviderSnapshot(JSON.stringify({ ...s, execute: "anything" })),
    ).rejects.toThrow("fields");
    await expect(readProviderSnapshot(" ".repeat(1_000_001))).rejects.toThrow(
      "1 MB",
    );
  });
  it("keeps revision provenance through save, reopen and handoff; exact duplicates do not activate again", async () => {
    const { session } = await candidateFixture();
    expect(
      await addProviderSnapshot(
        session,
        JSON.stringify(await snapshot()),
        "final",
      ),
    ).toBe(session);
    expect(session.activations).toHaveLength(1);
    expect(session.activations[0].status).toBe("suggested");
    const reopened = await readSession(serializeSession(session));
    expect(reopened.revisions[0].source).toEqual((await snapshot()).source);
    expect(
      JSON.parse(
        sessionHandoff(reopened, reopened.activations[0])[
          "session-source.json"
        ],
      ).revision.source,
    ).toEqual((await snapshot()).source);
    reopened.revisions[0].source!.transcriptHash = "a".repeat(64);
    await expect(readSession(JSON.stringify(reopened))).rejects.toThrow(
      "provenance",
    );
  });
  it("preserves older version 1 sessions and strict unknown-field rejection", async () => {
    const session = await addTranscript(
      emptySession(),
      raw,
      "old.txt",
      "ongoing",
    );
    expect(await readSession(serializeSession(session))).toEqual(session);
    for (const key of ["source?", "futureField", "source"]) {
      const altered = structuredClone(session);
      Object.assign(altered.revisions[0], { [key]: null });
      await expect(readSession(JSON.stringify(altered))).rejects.toThrow();
    }
  });
});
describe("reported execution and review boundary", () => {
  it("binds the report to this source and complete candidate, without accepting changed facts", async () => {
    const { session, result } = await candidateFixture();
    const candidate = await importVerifiedResult(
      JSON.stringify(result),
      session,
    );
    expect(candidate.reviews).toEqual([]);
    session.activations[0].status = "result-received";
    session.candidates = [candidate];
    await expect(applyCandidate(session, candidate)).rejects.toThrow(
      "Review every",
    );
    expect(
      (await readSession(serializeSession(session))).candidates[0].result
        .execution,
    ).toEqual(result.execution);
    candidate.result.bundle.pir.process_name = "Changed after execution";
    await expect(applyCandidate(session, candidate)).rejects.toThrow(
      "receipt does not match",
    );
    await expect(readSession(serializeSession(session))).rejects.toThrow(
      "receipt does not match",
    );
  });
  it.each(["sourceHash", "resultHash"] as const)(
    "rejects an altered %s on result import",
    async (field) => {
      const { session, result } = await candidateFixture();
      result.execution![field] = "f".repeat(64);
      await expect(
        importVerifiedResult(JSON.stringify(result), session),
      ).rejects.toThrow("receipt does not match");
    },
  );
  it("retains manual results and rejects null receipts", async () => {
    const { session, result } = await candidateFixture();
    delete result.execution;
    expect(
      (await importVerifiedResult(JSON.stringify(result), session)).result
        .execution,
    ).toBeUndefined();
    await expect(
      importVerifiedResult(
        JSON.stringify({ ...result, execution: null }),
        session,
      ),
    ).rejects.toThrow();
  });
  it("checks execution ordering and rejects forged extra receipt fields", async () => {
    const { result } = await candidateFixture();
    result.execution!.startedAt = "2027-01-01T00:00:00Z";
    await expect(
      verifyExecution(result, result.execution!.sourceHash),
    ).rejects.toThrow("Invalid reported");
    result.execution!.startedAt = fetched;
    Object.assign(result.execution!, { verified: true });
    await expect(
      verifyExecution(result, result.execution!.sourceHash),
    ).rejects.toThrow("fields");
  });
  it("preserves stale-source protection even for a matching execution receipt", async () => {
    const { session, result } = await candidateFixture();
    const candidate = await importVerifiedResult(
      JSON.stringify(result),
      session,
    );
    session.activations[0].status = "result-received";
    candidate.reviews = [
      {
        path: "/pir/process_name",
        decision: "accepted",
        reviewer: "Automated fixture",
        note: "Synthetic test only",
      },
    ];
    const next = await addTranscript(
      session,
      raw + "\nPat: Correction.",
      "later.txt",
      "ongoing",
    );
    await expect(applyCandidate(next, candidate)).rejects.toThrow(
      "New source arrived",
    );
  });
});
