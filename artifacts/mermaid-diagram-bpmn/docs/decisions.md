# Decision Log: bpmn-beta

Durable governance log. Decisions are numbered in the order they were captured.  
Statuses: **Accepted** · **Proposed** · **Pending** · **Resolved** · **Superseded**

---

## DEC-001: Layout engine = coordinate-hint hybrid

**Status:** Proposed (pending PoC validation)

Default to row-major auto-placement within lanes; allow optional `@[row,col]` annotation per node to override placement.

**Rationale:** Pure auto-layout produces acceptable results for simple linear and gateway flows. Pool/lane diagrams with cross-lane dependencies benefit from hint-driven placement. A hybrid avoids forcing authors to specify coordinates for every node.

---

## DEC-002: bpmn-js = hard no for v1 runtime

**Status:** Accepted

Implement BPMN shapes from scratch as hand-written SVG. No bpmn-js runtime dependency in v1.

**Rationale:** bpmn-js is a full BPMN editor runtime, not a shape renderer. It brings ~1.5 MB of JavaScript, a different license stack, and design goals (interactive editing, BPMN XML) that conflict with the read-only SVG rendering target. Bundle size, license friction, and the divergent design goals all point to a clean hand-written renderer.

---

## DEC-003: Header keyword = `bpmn-beta`

**Status:** Accepted

The DSL detection keyword is `bpmn-beta`. The word `beta` belongs only in the first line of a diagram source file, and nowhere else in the project name, URLs, or documentation.

**Rationale:** Calling the project "BPMN for Mermaid beta" would couple the public project name to a stability qualifier that may become stale. The `bpmn-beta` header is a Mermaid convention (cf. `%%{init}%%` directives) and signals experimental status to tooling without marking the project name permanently.

---

## DEC-004: aria-roledescription key = `BPMNDiagram`

**Status:** Accepted

`DETECTOR_KEY = 'BPMNDiagram'` is used as both the Mermaid detector key and the ARIA `aria-roledescription` value on the SVG root element.

---

## DEC-005: GitHub issue #7699 verification

**Status:** Resolved (2026-05-05)

Issue #7699 is real, filed 2026-05-02 by Andreas Emrich (DFKI), status Triage, no PR yet. Related forthcoming paper: Emrich, A., Hollax, J. (2025). "Domain-Specific Languages for Business Process Modeling: Mermaid Diagrams for BPMN", DFKI. Author has stated intent to implement.

**Strategic implication:** See DEC-012.

---

## DEC-011: Project slug = `mermaid-diagram-bpmn`

**Status:** Accepted

`mermaid-diagram-bpmn` is the durable Replit and GitHub project slug. This partially resolves earlier naming debates (DEC-006 and DEC-007).

---

## DEC-012: Engagement strategy for Mermaid issue #7699

**Status:** Proposed

Engage on #7699 publicly within 7 days of prototype stabilization. Frame `bpmn-beta` as a complementary readable alternative to the Emrich proposal, not a competing fork. Offer the prototype URL, the DSL spec, and the comparison framing. Do not adopt the Emrich syntax. Do not propose merging the two efforts before syntax disagreements are surfaced.

**Rationale:** The prototype is the differentiator. Emrich has academic weight but not running code. Public, generous, direct: "I built a different DSL approach because I prioritize readability; here it is, what do you think?" Mermaid maintainers and the community get to weigh in on syntax tradeoffs before either implementation is locked.

---

## DEC-013: Parser strategy = hand-written prototype → Langium plugin

**Status:** Proposed

Keep the hand-written line parser as the prototype/playground engine for DSL iteration. Port to Langium when packaging for npm publication. Add a parity test corpus asserting both parsers produce equivalent ASTs for the canonical example set.

**Rationale:** The hand-written parser is faster to iterate during DSL design. Langium is required only for upstream PR acceptance (JISON is deprecated in Mermaid). Treating them as serial rather than parallel concerns avoids paying Langium tax during the volatile DSL phase.

---

## DEC-014: Pools/lanes implementation timing

**Status:** Pending (target: 2026-05-19)

**Question:** Ship pools/lanes before LinkedIn announce, or announce v0.1 as linear-only with pools/lanes on roadmap?

**Recommendation:** Ship pools/lanes first if achievable in 2–4 weeks of evening hours. Without them, the prototype cannot honestly claim Descriptive Conformance subset coverage and the Mermaid community will flag it within a day.

---

## DEC-018: GitHub Pages as canonical public playground URL

**Status:** Accepted (2026-05-07)

Deploy the React playground from `artifacts/mermaid-diagram-bpmn` to GitHub Pages at `https://okhp3.github.io/mermaid-diagram-bpmn/`. The Replit app is the development/authoring environment. GitHub Pages is the shareable public demo URL.

**Rationale:** GitHub Pages is free, fast, and trusted by the open-source community. It also anchors the project visibly in the GitHub ecosystem, which is the primary target audience for a Mermaid contribution proposal.

---

## DEC-019: No inline `style` props on SVG shapes

**Status:** Accepted

All colors, stroke widths, and fills are expressed via `bpmn-*` CSS class names. The `getStyles(BpmnThemeOptions)` function emits a single `<style>` block injected into SVG `<defs>`. Theme changes require only changing the options object, not the renderer.

---

## DEC-020: `experimental` flag on BpmnExample entries

**Status:** Accepted

The `BpmnExample` interface carries an optional `experimental?: boolean` field. Examples marked experimental display a flask badge in the Playground tab selector and a warning callout explaining known layout limitations. This lets pool/lane examples live in the live selector without misleading users about rendering quality.
