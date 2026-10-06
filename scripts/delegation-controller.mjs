import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = process.argv.slice(2);
const registryOption = cli.indexOf("--registry");
const registryRelative =
  registryOption < 0
    ? ".local/delegation-2026-10-05/program.json"
    : cli[registryOption + 1];
if (registryOption >= 0) cli.splice(registryOption, 2);
const [command = "status", taskId, ...args] = cli;
const registryPath = path.resolve(repo, registryRelative ?? "");
const localRoot = path.join(repo, ".local");
const registryWithinLocal = path.relative(localRoot, registryPath);
if (
  !registryRelative ||
  registryWithinLocal === "" ||
  registryWithinLocal === ".." ||
  registryWithinLocal.startsWith(".." + path.sep) ||
  path.isAbsolute(registryWithinLocal)
) {
  console.error("Runtime registry must be a file under .local/");
  process.exit(1);
}
if (command === "init") {
  if (fs.existsSync(registryPath)) {
    console.error("Registry already exists; refusing to overwrite");
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.copyFileSync(
    path.join(repo, "docs/delegation/program.json"),
    registryPath,
  );
}
const program = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const fail = (message) => {
  throw new Error(message);
};
const task = () =>
  program.tasks.find((t) => t.id === taskId) ?? fail("Unknown task: " + taskId);
const fullPath = (relative) => {
  const absolute = path.resolve(repo, relative);
  if (!absolute.startsWith(repo + path.sep))
    fail("Path outside workspace: " + relative);
  return absolute;
};
const owns = (t, candidate) =>
  t.writePaths.some((owner) => {
    const absolute = fullPath(candidate);
    const ownerAbsolute = fullPath(owner);
    const relative = path.relative(ownerAbsolute, absolute);
    return owner.endsWith("/")
      ? relative === "" ||
          (!relative.startsWith(".." + path.sep) &&
            relative !== ".." &&
            !path.isAbsolute(relative))
      : relative === "";
  });
const ready = (t) =>
  ["ready", "queued"].includes(t.status) &&
  t.dependencies.every(
    (id) => program.tasks.find((x) => x.id === id)?.status === "accepted",
  ) &&
  (t.phase === "preparation" ||
    program.sourceSelection.implementationAuthorized);
const save = () =>
  fs.writeFileSync(registryPath, JSON.stringify(program, null, 2) + "\n");
const event = (type, detail) =>
  program.events.push({ at: new Date().toISOString(), type, ...detail });
const validate = () => {
  const ids = new Set();
  for (const t of program.tasks) {
    if (ids.has(t.id)) fail("Duplicate task ID: " + t.id);
    ids.add(t.id);
    if (!(
      t.goalBudgetTokens > 0 &&
      t.goalBudgetTokens <= t.authorizedCeilingTokens &&
      t.authorizedCeilingTokens <= program.limits.perDelegateTokens
    ))
      fail("Invalid budget: " + t.id);
    if (!t.steps.length || !t.acceptance.length || !t.findings.length)
      fail("Incomplete task: " + t.id);
    t.writePaths.forEach(fullPath);
    if (t.phase === "candidate-execution" && !t.scopeGate)
      fail("Missing scope gate: " + t.id);
  }
  const visit = (id, chain = []) => {
    if (chain.includes(id))
      fail("Dependency cycle: " + [...chain, id].join(" -> "));
    const t = program.tasks.find((x) => x.id === id);
    if (!t) fail("Missing dependency: " + id);
    t.dependencies.forEach((dep) => visit(dep, [...chain, id]));
  };
  program.tasks.forEach((t) => visit(t.id));
  const plannedSlots =
    program.preparationAgents.length +
    program.tasks.reduce((sum, t) => sum + Math.max(1, t.attempt), 0);
  const reserved =
    program.limits.superintendentTokens +
    program.preparationAgents.reduce((s, a) => s + a.reservedTokens, 0) +
    program.tasks.reduce(
      (s, t) => s + t.reservedTokens * Math.max(1, t.attempt),
      0,
    );
  if (plannedSlots > program.limits.delegates)
    fail("Delegate roster ceiling exceeded");
  if (reserved > program.limits.aggregateTokens)
    fail("Aggregate declared exposure exceeded");
  const active = program.tasks.filter((t) => t.status === "running");
  if (active.length > program.limits.activeDelegates)
    fail("Concurrent delegate ceiling exceeded");
  for (let i = 0; i < active.length; i++)
    for (let j = i + 1; j < active.length; j++) {
      if (
        active[i].writePaths.some((a) =>
          active[j].writePaths.some(
            (b) => owns({ writePaths: [a] }, b) || owns({ writePaths: [b] }, a),
          ),
        )
      )
        fail("Concurrent write ownership collision");
    }
  return {
    valid: true,
    tasks: program.tasks.length,
    plannedLaunchSlots: plannedSlots,
    spawnedDelegates:
      program.preparationAgents.length +
      program.tasks.filter((t) => t.thread).length,
    launchAttempts:
      program.preparationAgents.length +
      program.tasks.reduce((s, t) => s + t.attempt, 0),
    visibleThreads: program.tasks.filter((t) => t.thread).length,
    reservedTokens: reserved,
    remainingLaunchSlots: program.limits.delegates - plannedSlots,
    activeDelegates: active.length,
    budgetEnforcement: "soft accounting; provider aggregate unknown",
  };
};
const readReceipt = (t) => {
  const receiptPath = path.join(fullPath(t.outputDirectory), "receipt.json");
  if (!fs.existsSync(receiptPath)) fail("Missing receipt: " + receiptPath);
  const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
  if (
    receipt.taskId !== t.id ||
    receipt.attempt !== t.attempt ||
    receipt.threadId !== t.thread?.threadId
  )
    fail("Stale or wrong-thread receipt");
  if (receipt.outcome !== "completed") fail("Receipt outcome is not completed");
  if (
    !Array.isArray(receipt.changedPaths) ||
    !receipt.changedPaths.every((p) => owns(t, p))
  )
    fail("Changed paths exceed approved ownership");
  receipt.changedPaths.forEach((p) => {
    if (!fs.existsSync(fullPath(p))) fail("Missing changed artifact: " + p);
  });
  for (const criterion of t.acceptance) {
    const check = receipt.checks?.find((c) => c.criterion === criterion);
    if (
      check?.result !== "pass" ||
      !check.evidence ||
      !owns(t, check.evidence) ||
      !fs.existsSync(fullPath(check.evidence))
    )
      fail("Missing acceptance evidence: " + criterion);
  }
  if (
    receipt.tokensUsed !== null &&
    !(Number.isFinite(receipt.tokensUsed) && receipt.tokensUsed >= 0)
  )
    fail("Invalid token accounting");
  if (!["local-goal", "provider", "unknown"].includes(receipt.tokenSource))
    fail("Invalid token source");
  if (receipt.tokenSource === "unknown" && receipt.tokensUsed !== null)
    fail("Unknown usage must be null");
  if (receipt.tokensUsed > t.authorizedCeilingTokens)
    fail("Reported per-delegate ceiling exceeded");
  return receipt;
};
const prompt = (t) =>
  [
    "You are an individually spawned delegate for BPMN for Mermaid.",
    "The human authorized this bounded duty and a goal budget of " +
      t.goalBudgetTokens +
      " tokens, within the 2,000,000-token maximum.",
    "Use the configured " +
      t.model +
      " model and " +
      t.reasoningEffort +
      " reasoning. Read AGENTS.md first.",
    "Read the task record " +
      registryPath +
      " for " +
      t.id +
      "; do not scan the whole repository.",
    "Create a goal for exactly this duty with token_budget " +
      t.goalBudgetTokens +
      " if no goal exists. Never replace an active goal.",
    "Write a preliminary report and receipt before further investigation. Use short outputs, at most four substantive tool groups, and finish promptly.",
    "At a goal checkpoint near 75% of budget, wrap up. Goal accounting can overshoot; no provider hard cap is promised.",
    "Objective: " + t.title,
    "Inputs: " + t.inputs.join(", "),
    "Steps:\n" + t.steps.map((s, i) => i + 1 + ". " + s).join("\n"),
    "Acceptance:\n" + t.acceptance.map((c) => "- " + c).join("\n"),
    "Owned write paths: " + t.writePaths.join(", "),
    "Canonical source/Git/dependency/global config changes, commits, deployments, publications, messages to others, and additional agents are outside this assignment.",
    "Run only the scoped checks explicitly listed in this duty. Preparation duties forbid installs/builds/broad tests. Candidate duties prepare reviewable patches under their output owner; canonical writes require a superintendent-approved ownership update. For T03 use local app/node_modules/.bin/vitest.cmd with --config vitest.config.ts and the two named tests, from app.",
    "Write report.md, compact logs as needed, and receipt.json under the owned task directory. Do not edit program.json.",
    "Receipt JSON fields: taskId, attempt, threadId, outcome(completed|partial|blocked|failed), changedPaths(repository-relative), checks([{criterion:EXACT acceptance string,result:pass|fail|not-run,evidence:repository-relative existing artifact}]), findings, tokensUsed(number|null), tokenSource(local-goal|provider|unknown), budgetGoalResult, nextAction.",
    "Get threadId and goal usage from get_goal. Set attempt=1 unless the task registry says otherwise.",
    "Independent product checks may fail while this triage duty completes if failures and logs are recorded accurately; do not call them passing.",
    "Do not mark your goal complete until artifacts meet your duty. If completed, capture its final accounting and update receipt. Final <=250 words with artifacts, failures and usage.",
  ].join("\n\n");

try {
  validate();
  if (command === "init" || command === "validate")
    console.log(JSON.stringify(validate(), null, 2));
  else if (command === "status")
    console.log(
      JSON.stringify(
        {
          limits: program.limits,
          sourceSelection: program.sourceSelection,
          tasks: program.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            thread: t.thread,
            goalBudgetTokens: t.goalBudgetTokens,
          })),
          metrics: validate(),
        },
        null,
        2,
      ),
    );
  else if (command === "ready")
    console.log(
      JSON.stringify(
        program.tasks
          .filter(ready)
          .map((t) => ({
            id: t.id,
            title: t.title,
            goalBudgetTokens: t.goalBudgetTokens,
            writePaths: t.writePaths,
          }))
          .slice(
            0,
            program.limits.activeDelegates -
              program.tasks.filter((t) => t.status === "running").length,
          ),
        null,
        2,
      ),
    );
  else if (command === "prompt") console.log(prompt(task()));
  else if (command === "attach") {
    const t = task();
    if (!ready(t)) fail("Dependency/source gate not satisfied");
    const [threadId, hostId = "local"] = args;
    if (!threadId) fail("Thread ID required");
    if (program.tasks.some((x) => x.thread?.threadId === threadId))
      fail("Thread already assigned");
    t.attempt++;
    t.thread = { threadId, hostId };
    t.status = "running";
    event("attached", { taskId: t.id, threadId, attempt: t.attempt });
    validate();
    save();
    console.log("Attached " + t.id + " to " + threadId);
  } else if (command === "accept") {
    const t = task();
    if (!["running", "review"].includes(t.status))
      fail("Task is not awaiting acceptance");
    if (!args.includes("--reviewed"))
      fail("Superintendent artifact review required: --reviewed");
    const receipt = readReceipt(t);
    t.status = "accepted";
    t.usage = {
      tokensUsed: receipt.tokensUsed,
      tokenSource: receipt.tokenSource,
    };
    event("accepted", { taskId: t.id, attempt: t.attempt });
    save();
    console.log("Accepted " + t.id);
  } else if (command === "propose") {
    const proposal = JSON.parse(fs.readFileSync(args[0] ?? taskId, "utf8"));
    if (
      !proposal.id ||
      !proposal.title ||
      !proposal.evidence ||
      !proposal.acceptance?.length ||
      !proposal.ownerPaths?.length ||
      !(
        proposal.goalBudgetTokens > 0 &&
        proposal.goalBudgetTokens <= program.limits.perDelegateTokens
      )
    )
      fail("Incomplete new-task proposal");
    if (
      program.tasks.some((t) => t.id === proposal.id) ||
      program.newTaskIntake.some((t) => t.id === proposal.id)
    )
      fail("Duplicate proposal ID");
    const metrics = validate();
    if (
      program.newTaskIntake.filter((p) => p.status === "proposed").length >=
      metrics.remainingLaunchSlots
    )
      fail("No unreserved roster capacity");
    program.newTaskIntake.push({
      ...proposal,
      status: "proposed",
      admitted: false,
    });
    event("proposed", { taskId: proposal.id });
    save();
    console.log("Queued for superintendent review; no delegate spawned");
  } else
    fail(
      "Commands: init, validate, status, ready, prompt TASK, attach TASK THREAD [HOST], accept TASK --reviewed, propose FILE",
    );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
