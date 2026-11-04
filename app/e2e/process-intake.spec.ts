import { test, expect, type Download } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import axe from "axe-core";

const source =
  'bpmn-beta\naccTitle: Team purchase review\nstart s "Request"\ntask:user t "Review request"\nend e "Decision"\nflow s -> t\nflow t -> e';
async function downloadText(download: Download) {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}
test("purchase brief, focused handoff, imported source and workbench remain one process", async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto("intake");
  await page.getByRole("button", { name: "Use purchase starter" }).click();
  await expect(page.getByLabel("Process name", { exact: true })).toHaveValue(
    "Purchase approval",
  );
  await page
    .getByRole("button", { name: "People & steps", exact: true })
    .last()
    .click();
  await page
    .getByLabel("Step 1", { exact: true })
    .fill("Submit purchase request with quote");
  await page
    .getByRole("button", { name: "Agent handoff", exact: true })
    .last()
    .click();
  await page.getByLabel("Your agent environment").selectOption("claude");
  const packageDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download agent handoff" }).click();
  const files = unzipSync(await downloadText(await packageDownload));
  expect(
    Object.keys(files).filter((name) => name.endsWith("/SKILL.md")),
  ).toHaveLength(5);
  expect(strFromU8(files["HANDOFF.md"])).toContain(".claude/skills");
  expect(
    files[
      ".claude/skills/okhp3-process-intake-and-scope/scripts/validate-pir.mjs"
    ],
  ).toBeTruthy();
  const original = JSON.parse(strFromU8(files["process-bundle.json"]));
  if (browserName === "chromium") {
    const root = testInfo.outputPath("handoff-check");
    for (const [name, bytes] of Object.entries(files)) {
      expect(name).not.toMatch(/(^\/|\.\.|:|\\)/);
      const destination = join(root, name);
      mkdirSync(dirname(destination), { recursive: true });
      writeFileSync(destination, bytes);
    }
    const check = spawnSync(
      process.execPath,
      [join(root, "validate-intake.mjs")],
      { encoding: "utf8" },
    );
    expect(check.status).toBe(1); // The illustrative starter intentionally has gaps.
    const report = JSON.parse(check.stdout);
    expect(report.validation.errors.length).toBeGreaterThan(0);
    expect(
      report.validation.errors.some((error: string) =>
        error.includes("pir_version"),
      ),
    ).toBe(false);
    expect(typeof report.completeness.score).toBe("number");
  }
  await page
    .getByRole("button", { name: "Review result", exact: true })
    .last()
    .click();
  await page.getByLabel("Import process result").setInputFiles({
    name: "diagram.mmd",
    mimeType: "text/plain",
    buffer: Buffer.from(source),
  });
  await expect(
    page.getByRole("region", { name: "Import preview" }),
  ).toContainText("Review before applying");
  await expect(
    page.getByText("Awaiting source", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Apply imported copy" }).click();
  await expect(page.getByText("Parsed", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Open diagram workbench", exact: true })
    .click();
  await page.getByRole("tab", { name: "Split", exact: true }).click();
  await expect(page.getByTestId("select-example")).toHaveCount(0);
  await expect(page.getByTestId("textarea-bpmn-source")).toHaveValue(source);
  await expect(
    page.getByTestId("div-diagram-preview").locator("svg"),
  ).toBeVisible();
  await page
    .getByTestId("textarea-bpmn-source")
    .fill(source.replace("Team purchase review", "Reviewed by team"));
  expect(new URL(page.url()).pathname).toMatch(/\/intake$/);
  expect(new URL(page.url()).search).toBe("");
  const resultDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download this version" }).click();
  const result = JSON.parse(
    (await downloadText(await resultDownload)).toString(),
  );
  expect(result.pir).toEqual(original.pir);
  expect(result.diagram.source).toContain("Reviewed by team");
  expect(result.review.status).toBe("not-reviewed");
  await page.getByRole("button", { name: "01 Process brief" }).click();
  await expect(page.getByLabel("Process name", { exact: true })).toHaveValue(
    "Purchase approval",
  );
});

test("intake controls and labels pass accessibility checks in both themes", async ({
  page,
}) => {
  await page.goto("intake");
  await page.getByRole("button", { name: "Use purchase starter" }).click();
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }, theme);
    await page.addScriptTag({ content: axe.source });
    for (const label of [
      "01 Process brief",
      "02 People & steps",
      "03 Agent handoff",
      "04 Review result",
    ]) {
      await page.getByRole("button", { name: label }).click();
      const violations = await page.evaluate(
        async () =>
          (
            await (window as any).axe.run(".intake-page", {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            })
          ).violations,
      );
      expect(
        violations.map((v: any) => ({
          id: v.id,
          nodes: v.nodes.map((n: any) => n.target),
        })),
      ).toEqual([]);
    }
  }
});

test("separate browser tabs retain briefs and reload offers recovery without overwriting", async ({
  page,
  context,
}) => {
  await page.goto("intake");
  await page.getByLabel("Process name", { exact: true }).fill("First team");
  const other = await context.newPage();
  await other.goto("intake");
  await other.getByLabel("Process name", { exact: true }).fill("Second team");
  await expect(page.getByLabel("Process name", { exact: true })).toHaveValue(
    "First team",
  );
  await page.reload();
  await expect(page.getByLabel("Process name", { exact: true })).toHaveValue(
    "",
  );
  await page.getByText("Saved briefs (2)", { exact: true }).click();
  const first = page
    .locator(".intake-recovery > div")
    .filter({ hasText: "First team" });
  await first.getByRole("button", { name: "Open copy" }).click();
  await expect(page.getByLabel("Process name", { exact: true })).toHaveValue(
    "First team",
  );
  await expect(other.getByLabel("Process name", { exact: true })).toHaveValue(
    "Second team",
  );
  await other.close();
});

test("unsupported imports do not replace current work and recorded review resets on editing", async ({
  page,
}) => {
  await page.goto("intake");
  await page.getByRole("button", { name: "Use purchase starter" }).click();
  await page.getByRole("button", { name: "04 Review result" }).click();
  await page.getByLabel("Import process result").setInputFiles({
    name: "future.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"format":"bpmn-process-bundle","version":99}'),
  });
  await expect(page.getByRole("alert")).toContainText("only bundle version 1");
  await expect(
    page.getByRole("region", { name: "Import preview" }),
  ).toHaveCount(0);
  await page.getByLabel("Import process result").setInputFiles({
    name: "diagram.mmd",
    mimeType: "text/plain",
    buffer: Buffer.from(source),
  });
  await page.getByRole("button", { name: "Apply imported copy" }).click();
  await page.getByText("Record a stakeholder review", { exact: true }).click();
  await page.getByLabel("Reviewer (role or name)").fill("Process owner");
  await page
    .getByLabel("Review notes and evidence")
    .fill("Team review on 2026-11-03. Approval limits remain open.");
  await page
    .getByRole("button", { name: "Record review", exact: true })
    .click();
  await expect(
    page.getByText("Review recorded", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "01 Process brief" }).click();
  await page
    .getByLabel("Process name", { exact: true })
    .fill("Purchase approval revised");
  await expect(page.getByLabel("Process name", { exact: true })).toHaveValue("Purchase approval revised");
  await page.getByRole("button", { name: "04 Review result" }).click();
  await expect(page.getByText("Not recorded", { exact: true })).toBeVisible();
});

test("mobile intake, handoff and review have no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("intake");
  await page.getByRole("button", { name: "Use purchase starter" }).click();
  for (const label of [
    "01 Process brief",
    "02 People & steps",
    "03 Agent handoff",
    "04 Review result",
  ]) {
    await page.getByRole("button", { name: label }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("#intake-stage-title")).toBeFocused();
  }
});

test("storage denial keeps the brief usable and downloadable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Denied");
    };
  });
  await page.goto("intake");
  await page
    .getByLabel("Process name", { exact: true })
    .fill("Unsaved but recoverable by download");
  await expect(
    page.getByText("This brief is not saved in this browser.", {
      exact: false,
    }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Save process bundle", exact: true })
    .click();
  expect(
    JSON.parse((await downloadText(await download)).toString()).pir
      .process_name,
  ).toBe("Unsaved but recoverable by download");
});

test("clearing embedded source preserves the editor for repair", async ({
  page,
}) => {
  await page.goto("intake");
  await page.getByRole("button", { name: "04 Review result" }).click();
  await page.getByLabel("Import process result").setInputFiles({
    name: "diagram.mmd",
    mimeType: "text/plain",
    buffer: Buffer.from(source),
  });
  await page.getByRole("button", { name: "Apply imported copy" }).click();
  await page
    .getByRole("button", { name: "Open diagram workbench", exact: true })
    .click();
  await page.getByRole("tab", { name: "Source", exact: true }).click();
  await page.getByTestId("textarea-bpmn-source").fill("");
  await expect(page.getByTestId("textarea-bpmn-source")).toBeVisible();
  await page.getByTestId("textarea-bpmn-source").fill(source);
  await expect(page.getByText("Parsed", { exact: true })).toBeVisible();
});
