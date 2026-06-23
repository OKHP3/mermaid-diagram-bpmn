/**
 * skill-integrity.test.mjs
 * Validates the SKILL.md file: frontmatter parseable, required fields present,
 * referenced files exist, no stale version references remain.
 * Run with: node --test tests/skill-integrity.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillRoot = join(__dirname, "..");
const skillMdPath = join(skillRoot, "SKILL.md");

function parseSkillFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return match[1];
}

function extractYamlField(frontmatter, key) {
  const patterns = [
    new RegExp(`^${key}:\\s*"([^"]+)"`, "m"),
    new RegExp(`^${key}:\\s*'([^']+)'`, "m"),
    new RegExp(`^${key}:\\s*(.+)$`, "m"),
  ];
  for (const re of patterns) {
    const m = frontmatter.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

const skillContent = readFileSync(skillMdPath, "utf8");
const frontmatter = parseSkillFrontmatter(skillContent);

// ── Frontmatter structure — flat Agent Skills format ──────────────────────

test("SKILL.md contains a frontmatter block", () => {
  assert.ok(frontmatter !== null, "Expected --- frontmatter --- block at top of SKILL.md");
});

test("frontmatter contains name field", () => {
  const name = extractYamlField(frontmatter, "name");
  assert.ok(name && name.length > 0, "Missing 'name' in frontmatter");
});

test("frontmatter name is correct", () => {
  const name = extractYamlField(frontmatter, "name");
  assert.equal(name, "okhp3-mermaid-theme-builder");
});

test("frontmatter contains top-level version field", () => {
  assert.ok(frontmatter.match(/^version:/m), "Missing top-level 'version:' in frontmatter — must be flat, not nested under metadata:");
});

test("frontmatter contains top-level author field", () => {
  assert.ok(frontmatter.match(/^author:/m), "Missing top-level 'author:' in frontmatter");
});

test("frontmatter contains license field", () => {
  assert.ok(frontmatter.match(/^license:/m), "Missing 'license' in frontmatter");
});

test("frontmatter contains top-level homepage field", () => {
  assert.ok(frontmatter.match(/^homepage:/m), "Missing top-level 'homepage:' in frontmatter");
});

test("frontmatter contains top-level repository field", () => {
  assert.ok(frontmatter.match(/^repository:/m), "Missing top-level 'repository:' in frontmatter");
});

test("frontmatter contains top-level category field", () => {
  assert.ok(frontmatter.match(/^category:/m), "Missing top-level 'category:' in frontmatter");
});

test("frontmatter contains top-level tags field", () => {
  assert.ok(frontmatter.match(/^tags:/m), "Missing top-level 'tags:' in frontmatter");
});

test("frontmatter contains top-level tools field", () => {
  assert.ok(frontmatter.match(/^tools:/m), "Missing top-level 'tools:' in frontmatter — required by Agent Skills standard");
});

test("frontmatter does NOT use deprecated nested metadata block", () => {
  assert.ok(
    !frontmatter.includes("metadata:"),
    "Frontmatter must not contain a nested 'metadata:' block — all fields must be top-level (Agent Skills standard)"
  );
});

// ── Version alignment ──────────────────────────────────────────────────────

test("skill version is not stale 0.3.0", () => {
  assert.ok(
    !skillContent.includes('"0.3.0"') && !skillContent.includes("'0.3.0'") && !skillContent.includes("version: 0.3.0"),
    "Stale version '0.3.0' found in SKILL.md — update to current version"
  );
});

test("skill version is 0.5.0", () => {
  assert.ok(
    skillContent.includes('"0.5.0"') || skillContent.includes("version: 0.5.0"),
    "Expected version '0.5.0' in SKILL.md frontmatter"
  );
});

// ── Required content sections ─────────────────────────────────────────────

test("SKILL.md contains 'When to use' section", () => {
  assert.ok(skillContent.includes("## When to use"), "Missing '## When to use' section");
});

test("SKILL.md contains 'When NOT to use' section", () => {
  assert.ok(skillContent.includes("## When NOT to use"), "Missing '## When NOT to use' section");
});

test("SKILL.md contains workflow section", () => {
  assert.ok(
    skillContent.includes("## 7-Step Workflow") || skillContent.includes("## 6-Step Workflow"),
    "Missing workflow section"
  );
});

test("SKILL.md contains Output Modes section", () => {
  assert.ok(skillContent.includes("## Output Modes"), "Missing '## Output Modes' section");
});

test("SKILL.md contains Support Taxonomy section", () => {
  assert.ok(skillContent.includes("## Support Taxonomy"), "Missing '## Support Taxonomy' section");
});

test("SKILL.md contains Security and Privacy section", () => {
  assert.ok(
    skillContent.includes("## Security and Privacy"),
    "Missing '## Security and Privacy' section"
  );
});

test("SKILL.md contains Worked Examples section", () => {
  assert.ok(skillContent.includes("## Worked Examples"), "Missing '## Worked Examples' section");
});

test("SKILL.md documents Format A output mode", () => {
  assert.ok(skillContent.includes("Format A"), "Missing Format A in Output Modes");
});

test("SKILL.md documents Format B output mode", () => {
  assert.ok(skillContent.includes("Format B"), "Missing Format B in Output Modes");
});

test("SKILL.md documents Format C output mode", () => {
  assert.ok(skillContent.includes("Format C"), "Missing Format C in Output Modes");
});

test("SKILL.md documents Format F (renderer compatibility notes)", () => {
  assert.ok(
    skillContent.includes("Format F"),
    "Missing Format F (Renderer Compatibility Notes) in Output Modes"
  );
});

// ── look API (Mermaid v11.15.0+) ──────────────────────────────────────────

test("SKILL.md documents the look parameter", () => {
  assert.ok(
    skillContent.includes("look parameter") || skillContent.includes('"look"'),
    "Missing look parameter documentation in SKILL.md"
  );
});

test("SKILL.md documents neo look value", () => {
  assert.ok(skillContent.includes('"look": "neo"') || skillContent.includes("neo"), "Missing 'neo' look value");
});

test("SKILL.md documents handDrawn look value", () => {
  assert.ok(
    skillContent.includes("handDrawn") || skillContent.includes("Hand-Drawn"),
    "Missing 'handDrawn' look value documentation"
  );
});

test("SKILL.md renderer table includes Look support column", () => {
  assert.ok(
    skillContent.includes("Look support"),
    "Renderer compatibility table is missing the 'Look support' column"
  );
});

test("SKILL.md Output Rules includes look validation rule", () => {
  assert.ok(
    skillContent.includes("look parameter is requested") || skillContent.includes("look.*renderer"),
    "Output Rules must include look parameter renderer validation rule"
  );
});

// ── References ─────────────────────────────────────────────────────────────

test("references/palette-registry.md exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "references/palette-registry.md")),
    "references/palette-registry.md not found"
  );
});

test("references/mermaid-theme-variables.md exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "references/mermaid-theme-variables.md")),
    "references/mermaid-theme-variables.md not found"
  );
});

test("references/renderer-profiles.md exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "references/renderer-profiles.md")),
    "references/renderer-profiles.md not found"
  );
});

test("references/output-format-contract.md exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "references/output-format-contract.md")),
    "references/output-format-contract.md not found"
  );
});

test("references/prompt-scaffold-patterns.md exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "references/prompt-scaffold-patterns.md")),
    "references/prompt-scaffold-patterns.md not found"
  );
});

test("references/scope-firewall.md exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "references/scope-firewall.md")),
    "references/scope-firewall.md not found"
  );
});

test("assets/palettes.json exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "assets/palettes.json")),
    "assets/palettes.json not found"
  );
});

test("assets/renderer-profiles.json exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "assets/renderer-profiles.json")),
    "assets/renderer-profiles.json not found"
  );
});

test("assets/theme-variable-map.json exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "assets/theme-variable-map.json")),
    "assets/theme-variable-map.json not found"
  );
});

test("assets/fixtures/er-basic.mmd exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "assets/fixtures/er-basic.mmd")),
    "assets/fixtures/er-basic.mmd not found — required fixture file"
  );
});

test("assets/fixtures/flowchart-basic.mmd exists", () => {
  assert.ok(
    existsSync(join(skillRoot, "assets/fixtures/flowchart-basic.mmd")),
    "assets/fixtures/flowchart-basic.mmd not found"
  );
});

// ── Asset validity ─────────────────────────────────────────────────────────

test("assets/palettes.json is valid JSON", () => {
  const raw = readFileSync(join(skillRoot, "assets/palettes.json"), "utf8");
  assert.doesNotThrow(() => JSON.parse(raw), "assets/palettes.json is not valid JSON");
});

test("assets/palettes.json contains all 7 canonical palette IDs", () => {
  const palettes = JSON.parse(readFileSync(join(skillRoot, "assets/palettes.json"), "utf8"));
  const paletteIds = Array.isArray(palettes)
    ? palettes.map((p) => p.id)
    : Object.keys(palettes);
  const expected = [
    "overkill-hill", "askjamie", "glee-fully",
    "ocean-depth", "forest-sage", "slate-ember", "violet-mist",
  ];
  for (const id of expected) {
    assert.ok(paletteIds.includes(id), `Palette '${id}' missing from assets/palettes.json`);
  }
});

test("assets/renderer-profiles.json is valid JSON", () => {
  const raw = readFileSync(join(skillRoot, "assets/renderer-profiles.json"), "utf8");
  assert.doesNotThrow(() => JSON.parse(raw), "assets/renderer-profiles.json is not valid JSON");
});

test("assets/renderer-profiles.json every renderer has lookSupport field", () => {
  const profiles = JSON.parse(
    readFileSync(join(skillRoot, "assets/renderer-profiles.json"), "utf8")
  );
  const list = Array.isArray(profiles) ? profiles : Object.values(profiles);
  for (const profile of list) {
    assert.ok(
      Array.isArray(profile.lookSupport),
      `Renderer '${profile.id}' is missing lookSupport array in renderer-profiles.json`
    );
  }
});

test("assets/renderer-profiles.json contains all 7 renderer IDs", () => {
  const profiles = JSON.parse(
    readFileSync(join(skillRoot, "assets/renderer-profiles.json"), "utf8")
  );
  const ids = Array.isArray(profiles) ? profiles.map((r) => r.id) : Object.keys(profiles);
  const expected = ["mermaid-live", "github", "gitlab", "notion", "obsidian", "confluence", "cli"];
  for (const id of expected) {
    assert.ok(ids.includes(id), `Renderer '${id}' missing from assets/renderer-profiles.json`);
  }
});

// ── Output rules completeness ─────────────────────────────────────────────

test("SKILL.md Output Rules includes theme:base rule", () => {
  assert.ok(
    skillContent.includes('"theme": "base"') || skillContent.includes("theme.*base.*required"),
    "Output Rules must enforce theme:base"
  );
});

test("SKILL.md Output Rules forbids hallucinated themeVariable names", () => {
  assert.ok(
    skillContent.includes("Never invent themeVariable") ||
      skillContent.includes("hallucinated"),
    "Output Rules must forbid hallucinated themeVariable names"
  );
});

// ── Scope firewall ─────────────────────────────────────────────────────────

test("SKILL.md references scope-firewall.md", () => {
  assert.ok(
    skillContent.includes("scope-firewall.md"),
    "SKILL.md must reference references/scope-firewall.md"
  );
});

// ── Renderer caveat language ───────────────────────────────────────────────

test("SKILL.md mentions GitHub renderer by name", () => {
  assert.ok(skillContent.includes("GitHub"), "Missing GitHub renderer reference");
});

test("SKILL.md mentions Notion renderer by name", () => {
  assert.ok(skillContent.includes("Notion"), "Missing Notion renderer reference");
});

test("SKILL.md mentions Confluence renderer by name", () => {
  assert.ok(skillContent.includes("Confluence"), "Missing Confluence renderer reference");
});

test("SKILL.md includes privacy/local-only statement", () => {
  assert.ok(
    skillContent.includes("no external network") ||
      skillContent.includes("No external network") ||
      skillContent.includes("local"),
    "Missing local/no-external-network privacy statement"
  );
});
