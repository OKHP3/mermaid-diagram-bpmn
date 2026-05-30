# BP-SKILL Adoption Blockers

A frank account of what makes BP-SKILL harder to adopt than a simple prompt template, and what BP-SKILL does about each blocker. Written for a technical evaluator or enterprise architect deciding whether to invest in BP-SKILL.

---

## Blocker 1 — Standards licensing

**Problem:** BABOK (IIBA), BPM CBOK (ABPMP), and APQC PCF are paywalled standards. Effective use of BP-SKILL at full depth requires access to these standards. BP-SKILL cannot reproduce their content.

**BP-SKILL's response:** All references to BABOK, BPM CBOK, and APQC are by section number and standard name only. No copyrighted text is embedded in any SKILL.md file or documentation. A build-time check (`check-standards-licensing.mjs`, roadmap) will enforce this constraint before any commit.

**What you need:** Practitioner access to the source standards. IIBA, ABPMP, and APQC all offer membership tiers that include standard access. The skills name the sections that apply; you bring the content.

---

## Blocker 2 — Tooling optimised for code, not discovery

**Problem:** Agent runtimes (Claude Code, Codex CLI, GitHub Copilot) are optimised for code execution and file manipulation. Long-running, multi-skill business process discovery engagements — stakeholder interviews, gap analysis, narrative authoring — are not their native mode. Sessions can time out, context windows fill, and multi-turn coherence degrades over complex processes.

**BP-SKILL's response:** All 15 skills are pure text transformations. No script execution is required. They work identically on every Agent Skills-compatible platform. PNS.md serves as a persistent external memory artifact that can be loaded at the start of any session, recovering context without relying on the agent's own context window.

**What you need:** Patience with multi-turn sessions for complex processes. Break large processes into sub-processes and run each through the pipeline independently. Merge at the SIPOC and RACI layers.

---

## Blocker 3 — Vocabulary fragmentation

**Problem:** BABOK, BPM CBOK, and APQC PCF use overlapping but incompatible terminology for the same concepts. "Activity" in BPM CBOK is not the same as "task" in BPMN 2.0.2 is not the same as "work step" in an internal SOP. Without alignment, agents produce outputs that are technically correct under one standard and non-compliant under another.

**BP-SKILL's response:** The Variable Layer (specifically `role-dictionary.md`, `process-taxonomy.md`, and `business-glossary-and-rulebook.md`) is the bridge. All skills read these files at session initialisation. Once populated, they normalise terminology across the pipeline. The APQC PCF dual-tagging rule (v7.4 and v8.0 IDs for every process element) prevents taxonomy drift as the APQC standard evolves.

**What you need:** Upfront effort to populate the variable layer correctly. The minimum viable configuration is `organization-profile.md` and `role-dictionary.md`. Add `business-glossary-and-rulebook.md` before any engagement where terminology precision is contractually required.

---

## Blocker 4 — No existing standard for typed artifact handoff

**Problem:** The Agent Skills ecosystem treats skills as independent units with unstructured text output. There is no community-accepted standard for a typed handoff artifact between skills in a pipeline. Each skill produces whatever format feels appropriate to the skill author, making pipeline composition fragile.

**BP-SKILL's response:** PNS.md is the proposed standard handoff artifact. Every skill in the pipeline either reads PNS.md (consuming prior work), enriches it (adding new sections), or validates it (running the V1-V9 traceability checks). The `metadata.consumes` and `metadata.produces` fields in each SKILL.md frontmatter declare the contract explicitly. `validate-pns.mjs` (roadmap) will enforce structural conformance at commit time.

**What you need:** To treat PNS.md as a first-class artifact, not just a document. Check it into version control alongside code. Review it in pull requests. The pipeline works because every skill can trust that the previous skill's output conforms to the schema.

---

## Blocker 5 — Variable layer configuration overhead

**Problem:** 9 context files is a non-trivial onboarding requirement. A practitioner starting a new engagement faces a configuration task before they can run a single skill. For one-off or exploratory use, this overhead is disproportionate.

**BP-SKILL's response:** Minimal viable defaults ship with every template in `context/`. The generic cross-industry APQC PCF taxonomy, default RACI patterns, and a boilerplate organisation profile are pre-populated. Variable files are read opportunistically: if a skill requires `sector-context.md` and it is absent, the skill proceeds with generic assumptions and flags the gap in its output rather than failing.

**What you need:** Start with `organization-profile.md` and `role-dictionary.md`. Those two files cover the majority of the vocabulary alignment work. Add the remaining 7 files only when the skills that explicitly consume them are triggered. See [docs/variable-layer-guide.md](./variable-layer-guide.md) for the recommended completion order.
