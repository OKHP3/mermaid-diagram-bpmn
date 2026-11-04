import { readFile, writeFile, stat } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  prepareNotionSnapshot,
  bridgeHash,
  validateExecutionShape,
} from "../app/src/lib/session-bridge.ts";

export async function main(args) {
  const [command, ...rest] = args;
  const options = Object.create(null);
  for (let i = 0; i < rest.length; i += 2) {
    if (
      !/^--[a-z-]+$/.test(rest[i]) ||
      !rest[i + 1] ||
      rest[i + 1].startsWith("--") ||
      options[rest[i]]
    )
      throw new Error("Use named options with one value each.");
    options[rest[i]] = rest[i + 1];
  }
  const allowed =
    command === "notion"
      ? ["--input", "--output", "--kind", "--fetched-at"]
      : [
          "--input",
          "--output",
          "--source",
          "--agent",
          "--run-id",
          "--started-at",
        ];
  if (
    !["notion", "receipt"].includes(command) ||
    Object.keys(options).some((k) => !allowed.includes(k))
  )
    throw new Error(
      "Commands: notion --input fetch.json --output ABSOLUTE.json [--kind meeting-transcript|transcript-block|synthetic]; receipt --input result.json --source session-source.json --agent NAME --run-id ID --started-at UTC --output ABSOLUTE.json",
    );
  if (
    !options["--input"] ||
    !options["--output"] ||
    !isAbsolute(options["--output"])
  )
    throw new Error(
      "Provide an input and an explicit absolute output path in the approved artifact home.",
    );
  async function readBounded(path) {
    if (!path || (await stat(path)).size > 8_000_000)
      throw new Error("Supply a source file no larger than 8 MB.");
    return new TextDecoder("utf-8", { fatal: true }).decode(
      await readFile(path),
    );
  }
  const input = await readBounded(options["--input"]);
  let output;
  if (command === "notion") {
    const kind = options["--kind"] ?? "meeting-transcript";
    if (!["meeting-transcript", "transcript-block", "synthetic"].includes(kind))
      throw new Error("Unsupported source kind.");
    const response = JSON.parse(input);
    const fetchedAt =
      options["--fetched-at"] ??
      response.text?.match(
        /^Here is the result of "fetch"[^\n]* as of ([\dT:.Z-]+):/u,
      )?.[1];
    if (!fetchedAt)
      throw new Error(
        "Provide --fetched-at with the observed connector fetch time in UTC. Preparation time is not fetch time.",
      );
    output = await prepareNotionSnapshot(response, fetchedAt, kind);
  } else {
    const result = JSON.parse(input);
    if (result.format !== "bpmn-session-result" || result.version !== 1)
      throw new Error("Use a version 1 session result.");
    if (Object.hasOwn(result, "execution"))
      throw new Error(
        "A receipt already exists. Preserve it; do not overwrite history.",
      );
    const source = JSON.parse(await readBounded(options["--source"]));
    if (typeof source.revision?.raw !== "string")
      throw new Error("Source transcript is missing.");
    if (
      result.sessionId !== source.sessionId ||
      result.revisionId !== source.revision?.id ||
      (await bridgeHash(source.revision?.raw)) !== source.revision?.hash
    )
      throw new Error("Result and source revision do not match.");
    const execution = {
      agent: options["--agent"],
      runId: options["--run-id"],
      startedAt: options["--started-at"],
      completedAt: new Date().toISOString(),
      sourceHash: source.revision.hash,
      resultHash: await bridgeHash(result),
    };
    validateExecutionShape(execution);
    output = { ...result, execution };
  }
  await writeFile(options["--output"], JSON.stringify(output, null, 2) + "\n", {
    flag: "wx",
  });
  console.log(
    `Saved ${command === "notion" ? "provider snapshot" : "reported execution receipt"} to ${options["--output"]}. No agent or provider was invoked by this command.`,
  );
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
