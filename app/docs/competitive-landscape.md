# BPMN for Mermaid (bpmn-beta): Competitive Landscape, Market Validation, and Strategic Positioning

## TL;DR

- **No existing tool today lets you author BPMN-semantic diagrams in a readable, Mermaid-native text DSL without either BPMN XML or a heavyweight bpmn-js/modeler runtime.** That is the genuine, defensible whitespace bpmn-beta occupies — but the competing DFKI proposal (Mermaid issue #7699, filed 2026-05-02 by Andreas Emrich) targets the same gap with a more metadata-heavy syntax, so positioning must be sharp on *readability and conciseness*, not just on "BPMN in Mermaid."
- **Market-size claims in the source document need correction.** There is no credible "$300 billion BPM industry" figure: the BPM *software* market is roughly USD 21.51B in 2025 per Fortune Business Insights (growing at 17.2% CAGR to USD 91.87B by 2034), while the much larger Business Process *Outsourcing* (BPO) market is ~USD 300–415B in 2025. These are entirely different markets and the source document conflates them. BPMN being "the de facto standard for process modeling" is well-supported in the literature; that one stands.
- **The realistic path is the external plugin first, with patient upstream advocacy second.** Mermaid Chart (the commercial entity behind core Mermaid) has raised USD 7.5M and is targeting ServiceNow-class workflow automation as its long-term vision — BPMN is strategically adjacent to that vision, which is a tailwind. But the parallel DFKI proposal #7699 already has the maintainers' attention (with a forthcoming academic paper as backing), so a community contributor proposing bpmn-beta must differentiate on syntax quality, working prototype evidence, and LLM-friendliness rather than novelty alone.

---

## 1. Competitive Landscape

### 1.1 The core question

*Does any tool today let you author BPMN-semantic diagrams as readable text the way Mermaid does for flowcharts, without XML and without a heavyweight modeler?*

**Short answer: No — but with caveats.** Existing options fall into four buckets:

1. **BPMN with XML + a graphical/JS modeler** (bpmn-js, Camunda Modeler, Signavio, Bizagi, Visio, Lucidchart, draw.io). Authoritative but heavy; no readable text DSL.
2. **Text-first diagram tools that don't really do BPMN** (Mermaid flowchart, D2, Graphviz/DOT, Structurizr DSL, Eraser). Some can approximate a process with flowchart syntax, but they do not render BPMN-shaped artifacts (event circles, gateway diamonds with markers, pools/lanes as BPMN pools).
3. **PlantUML + BPMN add-ons** (PlantUML activity-beta with "BPMN flavour", the community PlantBPMN converter, and stdlib BPMN sprites). The closest existing match — but they are either frozen, third-party, or render via the activity-diagram engine rather than as native BPMN.
4. **Aggregator services** (Kroki). Kroki renders BPMN via bpmn-js — so its "BPMN" support is actually XML rendered by the Camunda toolkit, not a readable text DSL.

### 1.2 Feature/capability matrix

| Tool | Text DSL? | BPMN-native shapes (events/gateways/pools)? | License / commercial model | Strengths | Weakness vs. a readable Mermaid-native BPMN DSL |
|---|---|---|---|---|---|
| **Mermaid (flowchart)** | Yes (Markdown-like) | No — only generic rectangles/diamonds/circles | MIT, open source | Native GitHub/GitLab/Notion/Obsidian rendering; ~77.6k GitHub stars (per Issue #6432 UI snapshot, Mar 2025) | Cannot express BPMN event subtypes, gateway markers, message flows, or pools/lanes as BPMN |
| **Mermaid Chart (commercial)** | Same Mermaid DSL + visual editor + AI generator | No | Open-core; USD 7.5M seed (M12/Sequoia/OCV, Mar 2024) | Enterprise features, AI prompt-to-diagram, JetBrains/VS Code plugins | Same DSL surface as core Mermaid — no BPMN |
| **PlantUML** | Yes (@startuml DSL) | Partial via activity-beta "BPMN flavour"; pools/lanes via partitions/swimlanes | GPL/LGPL family, open source | Mature, ~13,013 GitHub stars (github.com/plantuml organization page, accessed May 2026), broad UML coverage; community BPMN sprites in stdlib | BPMN support is "frozen" per the maintainers; rendered as activity diagrams, not true BPMN; layout requires Graphviz |
| **PlantBPMN** (community converter) | PlantUML in → BPMN 2.0 XML out | Yes (target output) | Open source (codeberg) | Bridges PlantUML and Flowable | Generates XML; not a Mermaid-style render-in-browser story |
| **bpmn-js / diagram-js (Camunda/bpmn.io)** | No — BPMN 2.0 XML | Yes (canonical) | bpmn.io license (free for non-commercial use; commercial license required for some uses) | The reference implementation; full BPMN 2.0; extensible; widely embedded in modeling products | XML-only authoring; heavy bundle; not human-writable |
| **Camunda Modeler (desktop)** | No — graphical + XML | Yes | Apache-2.0 | Production-grade modeler; deploys to Camunda 7/8 engines | Heavyweight desktop app; not text-first |
| **SAP Signavio** | No — graphical | Yes | Commercial SaaS | Enterprise process intelligence, mining, governance | Heavy enterprise tool; XML interchange; not for developer docs |
| **Bizagi Modeler** | No — graphical | Yes | Freemium / commercial | Free desktop modeler, large user base | Windows-centric; no DSL |
| **Microsoft Visio** | No — graphical | Yes (BPMN stencil) | Commercial (M365) | Ubiquitous in enterprises | Proprietary, no text DSL, version-control unfriendly |
| **Lucidchart** | No — graphical | Yes (BPMN shape library) | Commercial SaaS | Strong collaboration; BPMN templates | Not text-first; vendor-locked |
| **draw.io / diagrams.net** | No — graphical (XML behind the scenes) | Yes (BPMN 2.0 shape library) | Apache-2.0 / freemium SaaS | Free, embeds in Confluence, GitHub, GitLab; BPMN templates | XML format; not a human-writable DSL |
| **Kroki** | Aggregator | BPMN via bpmn-js (= BPMN XML) | MIT | Single API for ~25 diagram formats including Mermaid, PlantUML, D2, BPMN | "BPMN" path is XML rendered by bpmn-js — no readable BPMN DSL |
| **D2 (Terrastruct, open-sourced November 2022)** | Yes (declarative) | No BPMN-native shapes | MPL-2.0 | Modern declarative syntax, animations, grid layout, fast-growing | General-purpose diagrams; no BPMN semantics |
| **Structurizr DSL (Simon Brown)** | Yes (DSL) | No (it's for C4 architecture) | Apache-2.0 + commercial cloud | Strong "models as code" community for C4 | Not a process-modeling tool |
| **Graphviz / DOT** | Yes (DOT) | No | EPL-1.0 | Foundational; used by PlantUML, D2 internals | No BPMN shapes; layout-only |
| **Eraser.io** | Yes (proprietary DSL + AI) | Has a "BPMN diagram" type in DiagramGPT (one of five available types) | Commercial SaaS | AI-first; Mermaid import; multiple diagram types | Proprietary DSL and SaaS-locked; "BPMN" appears template-driven, not full BPMN 2.0 semantics |
| **GitHub/GitLab native rendering** | Renders Mermaid (since Feb 2022) and PlantUML (GitLab) | Whatever the embedded DSL supports | n/a | Frictionless dev-doc rendering of Mermaid | Inherits Mermaid's lack of BPMN |
| **`benjamen/mermaid-bpmn-plugin`** (existing community plugin) | Yes (Mermaid plugin) | Partial | MIT (GitHub) | Demonstrates feasibility — there is already a community attempt | Low activity; not a maintained, fleshed-out DSL |
| **`signavio/bpmn2constraints`** | No — BPMN XML/JSON in, Mermaid flowchart out (one-way) | Renders to flowchart, not BPMN-native | Open source | Useful for ETL of existing BPMN | One-way export; flowchart-style output, not BPMN-shaped |
| **DFKI proposal — Mermaid issue #7699** | Yes — proposed | Targets full BPMN 2.0 element set | Would be MIT (Mermaid core) | Academic backing (Emrich & Hollax 2025, in prep at DFKI); proposer says "I will try and implement it myself" | Syntax is metadata-heavy and verbose (see §1.3 below); not as readable as Mermaid idiom |

### 1.3 The DFKI competing proposal (Mermaid issue #7699) — what it actually proposes

The competing proposal, filed by Andreas Emrich (senior researcher at DFKI's Institute for Information Systems, Saarbrücken, under Prof. Peter Loos / Prof. Peter Fettke; not a professor himself) on 2026-05-02 as **"Add Native BPMN 2.0 Support to Mermaid.js"**, advocates a DSL that is *not* XML-flavored but is **metadata-bracketed and verbose**. Verbatim example from the issue:

```
bpmn
  startEvent[type:event,subtype:none,behaviour:start,label:,lane:,pool:]
  task[type:task,subtype:,label:Review Request,lane:,pool:]
  exclusiveGateway[type:gateway,subtype:exclusive,markers:(),label:Approved?,lane:,pool:]
  endEvent1[type:event,subtype:none,behaviour:end,label:Approved,lane:,pool:]
  startEvent --> task --> exclusiveGateway
  exclusiveGateway -[type:control,labelLabel:Yes]-> endEvent1
```

Key facts about the proposal:

- **Title:** "Add Native BPMN 2.0 Support to Mermaid.js"
- **Filed by:** GitHub user `andreas-emrich` (DFKI IWi group, Saarland Informatics Campus)
- **Backing paper:** Emrich, A., Hollax, J. (2025), "Domain-Specific Languages for Business Process Modeling: Mermaid Diagrams for BPMN", DFKI — **described in the issue text as in preparation; no DOI, arXiv ID, or preprint URL exists publicly as of May 2026**
- **Maintainer engagement:** None as of the snapshot — the issue sits in "Status: Triage" with no comments from Knut Sveidqvist (knsv) or Sidharth Vinod (sidharthv96)
- **Element ambition:** start/end events with all subtypes, tasks (send/receive/user/manual/service/script/business rule), all gateways (exclusive/parallel/inclusive/event-based/complex), intermediate events, sequence/message flows, subprocesses (expanded/collapsed), call activities, pools, lanes, boundary events
- **Implementation commitment:** "I will try and implement it myself."

**Honest comparative read:** The DFKI syntax is closer to a flattened XML attribute dump (`type:event,subtype:none,behaviour:start,label:,lane:,pool:` on every element) than to the terse Markdown-inspired idiom that has made Mermaid popular. This is the genuine differentiation lane for bpmn-beta — a syntax that *feels like Mermaid* (concise, defaults-first, infer-from-shape) rather than one that *encodes BPMN attribute dictionaries*.

### 1.4 Implications for bpmn-beta

- The competitive whitespace is real: no tool combines (a) text-first DSL, (b) BPMN-shaped rendering, (c) no XML, (d) no bpmn-js dependency, and (e) Mermaid-idiom readability.
- The DFKI proposal already occupies (a)–(d) but arguably misses (e). bpmn-beta should lead with side-by-side syntax comparisons.
- "PlantUML already does BPMN" is a common objection — the truthful response is that PlantUML's BPMN support is frozen/third-party and renders activity-diagram approximations, not BPMN-native artifacts.

---

## 2. The "Diagrams as Code" and "AI-Generated Diagrams" Trends

### 2.1 How widely adopted is Mermaid?

- **GitHub native rendering since February 2022** — fenced ` ```mermaid ` code blocks render to SVG via an iframe to GitHub's "Viewscreen" service; the rollout was a joint engineering effort between GitHub and Knut Sveidqvist (Mermaid's creator). This is the single biggest distribution event in Mermaid's history.
- **Repository scale:** the mermaid-js/mermaid repository is at ~77.6k stars and ~7.3k forks (per the GitHub UI quoted in issue #6432, March 2025); a second source cites ~74k stars and 6.8k forks in early 2025, with Wikipedia citing ~65k at the time of the Mermaid Chart funding announcement.
- **User base:** Mermaid Chart's own press release (TechCrunch, 20 March 2024) cites the open-source project as having "over 8 million users in 2023."
- **Native rendering elsewhere:** Notion, Obsidian, GitLab, VS Code (multiple extensions), JetBrains IDEs (Writerside, Mermaid Studio plugin), Mintlify, ReadMe, Docusaurus, Miro (via app), Confluence (via marketplace add-ons).
- **Commercial parent:** Mermaid Chart Inc. (San Francisco, founded 2022 by Sveidqvist; CEO Andrew Firestone) raised USD 7.5M seed in March 2024 from Microsoft's M12, Sequoia, Open Core Ventures, and others. Per TechCrunch the company's stated long-term ambition is "to go after ServiceNow and similar workflow automation services" — directly adjacent to BPM/BPMN.

### 2.2 The diagrams-as-code movement

The pattern is now well-established and well-documented: PlantUML (2009), Mermaid (2014), Structurizr (Simon Brown, for C4), D2 (Terrastruct, open-sourced November 2022), Diagrams (the Python library), and Kroki (aggregator). The shared value proposition is version control, PR review, and diff-ability of architectural artifacts. C4 + diagrams-as-code is now widely cited as the de facto pattern for technical architecture documentation in 2024–2026 industry writing.

### 2.3 LLMs and structured diagram generation — what the research actually says

This is the most important — and most under-cited — block of evidence for bpmn-beta's positioning. Two academic results are directly relevant:

**(a) Brissard, Cuppens, and Zouaq (Polytechnique Montréal — LabCys / LAMA-WeST Lab), "What is the Best Process Model Representation? A Comparative Analysis for Process Modeling with Large Language Models", arXiv 2507.11356 (2025).**

The first empirical comparison of nine Process Model Representations (PMRs) for LLM-based Process Modeling, introducing the publicly named "PMo Dataset" of 55 process descriptions paired with models in nine PMRs (BPMN XML, BPMN-text, Mermaid, Graphviz/DOT, and five additional custom DSL representations). Key verbatim finding (from the abstract): *"Mermaid achieves the highest overall score across six PMo criteria, whereas BPMN text delivers the best PMG results in terms of process element similarity."*

Interpretation:
- For *human-LLM-collaborative* process modeling (Token compactness, Expressivity, Human readability, Visualization, Usability, Extensibility), **Mermaid won the head-to-head against eight other representations including raw BPMN, BPMN-text simplifications, Graphviz/DOT, and several custom DSLs**.
- For *raw process model generation accuracy from text* (graph-edit-distance to ground truth), a custom "BPMN text" representation won.
- **The strategic implication for bpmn-beta is direct:** a Mermaid-flavoured BPMN DSL is positioned at the intersection of the *two* representations that won the two head-to-head comparisons. It is, in principle, the best candidate yet for LLM-generated process diagrams.

**(b) Shbita, Ahmed, and DeLuca (all IBM-affiliated at time of publication, per research.ibm.com), "MermaidSeqBench: An Evaluation Benchmark for NL-to-Mermaid Sequence Diagram Generation", arXiv 2511.14967, presented at the NeurIPS 2025 workshop "Evaluating the Evolving LLM Lifecycle: Benchmarks, Emergent Abilities, and Scaling."**

A 132-sample human-verified benchmark with LLM-as-a-judge evaluation across Syntax, Mermaid-only fidelity, Logic, Completeness, Activation Handling, and Error & Status Tracking. Demonstrates that frontier LLMs do generate Mermaid reliably but with measurable, capability-specific gaps — confirming Mermaid is a serious target for LLM tool-chaining and validating dedicated per-diagram-type benchmarking as a research direction (where bpmn-beta could eventually contribute a BPMN-specific benchmark).

**(c) Kampik et al. (SAP, with co-authors from TU Berlin, University of Vienna, University of Melbourne, and others), "Large Process Models: A Vision for Business Process Management in the Age of Generative AI", arXiv 2309.00900 (published in Springer KI - Künstliche Intelligenz, 2024).**

The seminal SAP/academic vision paper coining "Large Process Models" (LPMs) — LLMs fused with symbolic process knowledge and reasoning. Co-authored by SAP, Signavio (Gero Decker), and several academic groups. Relevant because it positions process modeling as a first-class LLM application domain. bpmn-beta's text-first BPMN DSL is exactly the kind of representation an LPM would emit or consume.

**(d) Companion industry evidence:** Eraser's DiagramGPT, Mermaid Chart's "Mermaid AI" prompt-to-diagram feature, the Mermaid MCP server, and an emerging cluster of "LLM + Mermaid" tutorials confirm that LLM-generated diagram code (with Mermaid as the dominant target) is a real, growing workflow.

### 2.4 Implications for bpmn-beta

- "AI-friendly BPMN DSL" is a defensible positioning angle, anchored in arXiv 2507.11356 (Brissard, Cuppens, Zouaq, Polytechnique Montréal).
- The honest claim is **not** "BPMN for Mermaid is the best LLM target for process modeling" (no benchmark exists yet for it) but rather "Mermaid is empirically the best LLM target for process modeling among nine evaluated representations in the PMo Dataset; bpmn-beta extends that strength into native BPMN semantics."
- A future contribution could be a BPMN-flavoured analogue of MermaidSeqBench.

---

## 3. Market-Claim Verification

### 3.1 The "$300 billion BPM industry" claim — corrected

The source document's "third-party BPM industry valued over $300 billion" claim **conflates two completely different markets**. The correct picture, sourced from named market-research firms (which are themselves vendor-funded sources and should be treated as directional, not authoritative):

| Market measured | 2024 / 2025 figure | Source | What's actually being measured |
|---|---|---|---|
| **BPM software market (the relevant one for BPMN tooling)** | USD 21.51B (2025) → USD 25.88B (2026), CAGR 17.2% to USD 91.87B by 2034 | **Fortune Business Insights, "Business Process Management Market Size, Share & Industry Analysis," 2025** | Software platforms for designing, automating, monitoring business processes (Appian, IBM, Pega, SAP, Oracle, OpenText, Bizagi, etc.) |
| **BPM software market** (alternate) | USD 18.89B (2024) → USD 20.6B (2025), CAGR ~11.3% to USD 75.97B by 2037 | Research Nester (May 2025) | Same definition |
| **BPM software market** (alternate) | USD 14.4B by 2025 from USD 8.8B (2020), CAGR 10.5% | MarketsandMarkets | Same definition (older, lower estimate) |
| **Business Process Outsourcing (BPO) — services, NOT software** | USD 298.6B (2024) → USD 643B (2033), CAGR 8.9% | ResearchAndMarkets / GlobeNewswire (Sept 2025) | Companies outsourcing customer service, finance, HR, IT support to Accenture, Genpact, TCS, Cognizant, Concentrix, etc. |
| **BPO market** (alternate) | USD 347.95B (2025) → USD 906.27B (2035), CAGR 10.05% | Precedence Research | Same definition |
| **BPO market** (alternate) | USD 415.73B (2025) → USD 491.15B (2030), CAGR 3.39% | Passive Secrets aggregation | Same definition |
| **BPO market** (alternate) | USD 370B (2024) → USD 560B (2033), CAGR 4.69% | SkyQuest | Same definition |

**Verdict on the source document:** The "$300 billion" figure roughly matches the **BPO** market (people-and-services outsourcing), **not** the BPM software market. BPMN tooling is relevant to the BPM software market (USD ~21B in 2025), not to BPO. **Using the BPO number to size the addressable market for a diagramming DSL is misleading and should be removed from public-facing documentation.** A defensible alternative framing: "BPM software is a USD 21.5B market in 2025 growing at a 17.2% CAGR to USD 91.87B by 2034 per Fortune Business Insights, and BPMN is its dominant modeling notation."

**One additional caveat:** All of these figures come from for-profit market-research firms whose primary product is selling reports to vendors in the market they're measuring. Gartner produces a "Market Guide for Business Process Automation Tools" (most recent dated 23 October 2023) but does not publish a single dollar TAM figure publicly. Numbers should be cited with the firm name and date attached, and ranges acknowledged.

### 3.2 BPMN as "the de facto standard"

This claim is **well-supported**. Multiple independent sources frame BPMN as the de facto standard:

- Trisotech: *"Over the last few years, BPMN rapidly became the de facto standard for process modeling."*
- BPMN 2.0 Handbook (white papers via conradbock.org): *"BPMN is already acknowledged as a de facto standard for business process modeling."*
- Ritter (SAP, arXiv 1403.4053): describes BPMN as *"a 'de-facto' standard for modeling business process semantics and their runtime behavior."*
- DEMO-BPMN paper (arXiv 2012.09557): *"The Business Process Model and Notation (BPMN) is the de facto standard used by industry and researchers for business process modeling and execution."*
- It is also a formal **ISO/IEC 19510:2013** standard maintained by OMG, with the current spec being BPMN 2.0.2.

**Defensible language:** "BPMN 2.0 is the OMG-maintained, ISO/IEC 19510 standard for business process modeling notation and is widely cited in industry and academic literature as the de facto standard for process diagrams." Avoid "the standard" without qualification — there are legitimate alternatives (EPC, UML Activity, ArchiMate, Petri nets, DEMO, BPM+Health, CMMN/DMN companions) in specific niches.

### 3.3 Mermaid's current diagram-type catalog — confirming BPMN is not a native type

Per the mermaid-js DeepWiki (indexed 16 May 2026) and the mermaid.js.org diagram-syntax reference, the native diagram types are: **flowchart, sequenceDiagram, classDiagram, stateDiagram(-v2), erDiagram, gantt, journey, pie, requirementDiagram, gitGraph, C4 (C4Context et al.), mindmap, timeline, sankey, xychart-beta, block, quadrantChart, packet, kanban, architecture-beta, treemap, radar, and Ishikawa (added 2024–2025)**.

**BPMN is absent from this list.** Issue #2623 (BPMN support, opened in the issue tracker because "Mermaid is now supported in Notion") and issue #660 (the earlier 2018 BPMN attempt) confirm that BPMN has been requested multiple times over many years and never landed. The competing proposal #7699 (May 2026) is the most recent attempt and is still in Triage.

### 3.4 Mermaid adoption claims

Defensible statements:
- ~77.6k GitHub stars on mermaid-js/mermaid (Issue #6432 UI snapshot, March 2025).
- "Over 8 million users in 2023" per Mermaid Chart's PR (TechCrunch 20 March 2024) — a vendor claim, so cite as a vendor claim.
- Native rendering in GitHub since February 2022 (GitHub blog).
- Native or first-party rendering also in: GitLab, Notion, Obsidian, VS Code, JetBrains IDEs, Mintlify, ReadMe, Docusaurus.

Avoid: precise market-share claims for Mermaid vs. PlantUML vs. D2 (no reliable numbers exist).

---

## 4. The Mermaid Contribution / Ecosystem Angle

### 4.1 How Mermaid actually accepts new diagram types

From the official "Adding a New Diagram/Chart" guide:

1. Define a JISON grammar (or use the newer Langium-based pattern) for the new diagram type, with a clear opening keyword (e.g., `bpmn`, `bpmn-beta`).
2. Add detection in `diagram-api/detectType.ts` returning a key used as the SVG's `aria-roledescription` (so the keyword should be a real word, not an abbreviation).
3. Implement a parser that populates a `db` data store.
4. Implement a renderer (dagre-based recommended; flowchart-v2 is the template; ELK is the newer alternative for complex layouts).
5. Implement accessibility (accTitle/accDescr), themes (integrated theming engine), and at least one example file in `packages/examples/`.
6. Submit a PR; expect a maintainer review covering grammar, renderer, themes, accessibility, and visual-regression tests (Applitools/Argos in CI).

This pipeline is well-documented and the architecture is registry-based (`addDiagrams` in `diagram-orchestration.ts`) — meaning external plugins can also register diagram types without forking core.

### 4.2 Recent diagram-type additions — who, how long?

| Diagram type | Released around | Contributor pattern | Notes |
|---|---|---|---|
| **architecture-beta** | Mermaid 11.1 (mid 2024) | Cloud-architecture proposal (Issue #5367) by community contributor; significant maintainer review on the SVG-icon infrastructure | The `-beta` suffix has become Mermaid's convention for evolving diagram types — a defensible naming precedent for `bpmn-beta` |
| **Ishikawa (fishbone)** | 2024–2025 (per Mermaid Studio docs) | Community contributor | Listed as native type |
| **radar, treemap, packet, kanban, block** | 2024–2025 | Mix of core team + community | All are recent additions |
| **xychart-beta, quadrantChart** | 2023–2024 | Community contributors | Both retain the `-beta` suffix |
| **timeline, mindmap** | 2022–2023 | Knut Sveidqvist's roadmap (the README explicitly mentions "Adding more types of diagrams like mindmaps, ert diagrams, etc." as community-contributable) | |
| **C4 (multiple subtypes)** | 2021–2022 | Community contribution (PlantUML-C4 inspired) | Demonstrates Mermaid does accept large, externally-defined notations |
| **Sankey, journey, gitGraph** | Various years | Community + core | |

**Realistic time-to-merge for a new diagram type:** measured in months to a year, including grammar review, renderer iteration, visual-regression test setup, documentation, and at least one minor release cycle. The `-beta` naming is essentially a release-with-caveats mechanism that lets the team ship faster.

### 4.3 Mermaid Chart's interest in BPMN

No public statement from Mermaid Chart explicitly mentions BPMN. However:

- The CEO Andrew Firestone told TechCrunch that the long-term vision is to "go after ServiceNow and similar workflow automation services" — workflow automation is the commercial home of BPM/BPMN.
- The company's roadmap commitments are "automated documentation tools for software engineers, advanced AI-driven diagramming features, and comprehensive workflow management solutions" — BPMN is the canonical workflow-management notation.

**Strategic read:** BPMN is plausibly on Mermaid Chart's medium-term roadmap, but not visibly committed. A community contribution that lands in core Mermaid first would be a *complement* to the company's stated direction, not a competitor.

### 4.4 How a community contributor's BPMN proposal is likely to be received given DFKI #7699

Honest assessment:

- The maintainers have **not yet engaged** with #7699 as of the snapshot — the issue sits in Status: Triage with no comments. This is normal for a new proposal in a popular repo and does not signal endorsement or rejection.
- Two competing proposals for the same diagram type *can* be merged or chosen between by the maintainers. Mermaid has historically chosen syntaxes that *feel like Mermaid*; the DFKI syntax does not (metadata-bracket-heavy).
- The DFKI proposer has stated "I will try and implement it myself" — meaning a draft PR may be forthcoming.
- Academic backing (the forthcoming Emrich & Hollax 2025 DFKI paper) gives the DFKI proposal credibility weight, but the paper is **not yet published** and cannot be cited as peer-reviewed support today.
- A community contributor who arrives with (a) a working prototype rendering BPMN SVG in-browser, (b) no bpmn-js dependency, (c) a syntax that is demonstrably more concise and Mermaid-idiomatic than #7699, and (d) the explicit `bpmn-beta` naming aligned with Mermaid's existing convention, has a credible path. The realistic outcomes are:
  - (i) bpmn-beta lands as the external plugin and is referenced from #7699 as prior art;
  - (ii) the two proposals are synthesized — likely DFKI's element coverage with a more Mermaid-idiomatic surface syntax;
  - (iii) the DFKI proposal wins on academic-reference weight.

The defensible strategic move is to ship the external plugin, document the syntax-design rationale publicly (a blog post comparing the two syntaxes side-by-side is concrete leverage), and engage constructively on #7699 with code rather than opinion.

---

## 5. Defensible Positioning for bpmn-beta

### 5.1 Where bpmn-beta genuinely differentiates

| Differentiator | Defensible? | Notes |
|---|---|---|
| "First text-first BPMN DSL that renders BPMN-native shapes in browser without bpmn-js" | **Yes — as of May 2026.** Existing options either use XML+bpmn-js (Camunda, Kroki, bpmn.io ecosystem) or are not BPMN-shaped (PlantUML activity-beta, flowchart approximations). | DFKI #7699 is conceptually the same lane but has no working prototype yet (proposer stated "I will try"). bpmn-beta has a working prototype. |
| "Mermaid-idiomatic syntax — concise, defaults-first" | **Yes if demonstrated.** The DFKI alternative is explicitly metadata-heavy. Side-by-side syntax comparison is the strongest single piece of marketing collateral. | This is the most important point of differentiation. |
| "LLM-friendly text format for BPMN" | **Yes, with the right citation.** Anchor in arXiv 2507.11356 (Brissard, Cuppens, Zouaq, Polytechnique Montréal — Mermaid wins 6/6 PMo criteria across the 9-PMR PMo Dataset) and MermaidSeqBench (Shbita et al., IBM Research, arXiv 2511.14967) as evidence that Mermaid-shaped DSLs are the empirically best LLM target for structured diagram generation. | Do NOT claim "best for LLM BPMN generation" until a BPMN-specific benchmark exists. |
| "Targets Descriptive Conformance subset, not full BPMN execution" | **Honest and correct.** OMG's Descriptive Conformance Sub-Class is the lightweight set: events, tasks, gateways, sequence/message flows, pools/lanes, annotations — exactly the documentation-grade subset, not the executable subset. This is also what 80%+ of real-world BPMN diagrams use. | This framing makes the project's scope defensible against "but you don't do BPMN execution" critiques. |
| "Ecosystem fit: ships natively where Mermaid renders" | **Yes.** GitHub native rendering (since Feb 2022), GitLab, Notion, Obsidian, VS Code, Mintlify, ReadMe all render Mermaid. An external Mermaid plugin inherits much of this surface; an upstream-merged diagram type inherits all of it. | Single biggest distribution lever. |
| "Reputation/credibility wedge for OverKill Hill P³" | **Yes, contingent.** Shipping a well-designed BPMN diagram type into Mermaid would be a meaningful open-source contribution credit for the author and brand. | This is a reputation play, not a revenue play, at this stage. |

### 5.2 Realistic addressable user segments

| Segment | Why bpmn-beta is relevant | Sizing intuition |
|---|---|---|
| **Developers writing technical documentation** | Already use Mermaid; want to document workflows in PR-reviewable text without leaving the repo | Large — every team that uses Mermaid for sequence/flowchart diagrams is a candidate |
| **Technical writers and platform-engineering docs teams** | Mintlify, ReadMe, Docusaurus, GitBook all support Mermaid; BPMN is requested in those communities (cf. Issue #2623) | Medium — the docs-as-code crowd |
| **Process analysts who already work in Notion / Obsidian** | Issue #2623 was literally filed because Mermaid renders in Notion and the requester wanted BPMN there. This is the canonical use case. | Niche but well-defined — the "lightweight BPMN" crowd |
| **AI tool builders (MCP servers, agentic frameworks)** | Need a structured text format LLMs can reliably emit/consume for process diagrams; arXiv 2507.11356 identifies Mermaid as the empirically best target across six PMo criteria | Growing fast — likely the most strategic segment for the next 12–24 months |
| **Enterprise architects (Visio/Signavio/Lucidchart users)** | Probably not — they need the heavy modelers' governance and execution features | Out of scope |
| **BPM execution engine developers (Camunda, Flowable, Zeebe users)** | Probably not — they need executable BPMN XML | Out of scope |

### 5.3 Honest limitations

These should appear in public documentation rather than be hidden:

- **Early-stage prototype with no adoption metrics.** No npm downloads, no production references, no public benchmark scores yet.
- **Descriptive Conformance subset only.** Does not aim for full BPMN 2.0 execution semantics (no expressions, no service task implementations, no error event payloads, no boundary-event compensation semantics in execution form).
- **Not authoritative BPMN.** For governance, audit, or hand-off to BPM execution engines, the BPMN 2.0 XML round-trip (via bpmn-js, Signavio, Camunda) remains the canonical artifact.
- **No bpmn-js round-trip.** A BPMN XML import/export is not (yet) part of the project; this is a meaningful gap for users who need interchange.
- **A parallel proposal (DFKI #7699) exists.** It has academic backing (a paper in preparation). The eventual upstream decision is the Mermaid maintainers' to make, and the outcome is not under bpmn-beta's control.
- **Single maintainer / personal project.** "Bus factor" of one. Solo open-source projects have higher attrition risk than corporate-backed ones.

### 5.4 Claims that are NOT defensible (and should be removed or rewritten)

| Overstated claim | Honest rewrite |
|---|---|
| "The third-party BPM industry is valued at over $300 billion" | Remove. Per Fortune Business Insights (2025), the BPM *software* market is USD 21.51B in 2025 (CAGR 17.2% to USD 91.87B by 2034); the BPO services market is the ~USD 300–400B figure but is unrelated to diagramming. |
| "BPMN for Mermaid is the AI-native BPMN format" | "Mermaid was the highest-scoring of nine process model representations evaluated for LLM-based process modeling (Brissard, Cuppens, Zouaq, Polytechnique Montréal, arXiv 2507.11356, 2025). bpmn-beta extends that strength into BPMN semantics." |
| "First and only Mermaid-native BPMN solution" | "First working prototype of a Mermaid-native BPMN DSL that renders BPMN-shaped SVG without an XML or bpmn-js dependency. A parallel academic proposal (Mermaid issue #7699, May 2026) targets the same problem with a more metadata-heavy syntax." |
| "BPMN is *the* standard" | "BPMN 2.0 is the OMG-maintained ISO/IEC 19510 standard and the most widely cited de facto standard for process modeling." |

### 5.5 The narrow commercial wedge

A pure open-source plugin is unlikely to be a revenue product on its own. The plausible commercial pathways, in increasing speculativeness:

1. **Consulting / authorship credibility** for the OverKill Hill P³ brand — reputation translating to contract work. Highest near-term probability.
2. **A BPMN-specific extension on top of Mermaid Chart** if Mermaid Chart elects to sell it as an enterprise add-on — speculative, depends on a Mermaid Chart partnership.
3. **An LLM-evaluation benchmark for BPMN-DSL generation** (a "BPMNSeqBench" analogue to MermaidSeqBench) — academic-credibility play, not direct revenue.
4. **A round-trip converter between bpmn-beta DSL and BPMN 2.0 XML** — would open a real commercial wedge by bridging the diagramming-as-code crowd with the bpmn-js/Camunda ecosystem; this is genuinely valuable and not currently filled by any vendor.

---

## Recommendations

**Stage 1 — Ship now (next 0–60 days):**
- Publish the external Mermaid plugin at npm with the `bpmn-beta` keyword, MIT license, working prototype, ≥10 representative diagrams in the README, and a `mermaid-bpmn-plugin` comparison note.
- Publish a side-by-side syntax comparison blog post (bpmn-beta vs. DFKI #7699 vs. PlantUML BPMN vs. Mermaid flowchart approximation). This is the single highest-leverage piece of collateral.
- Cite arXiv 2507.11356 (Brissard, Cuppens, Zouaq, Polytechnique Montréal) prominently and accurately (do NOT overclaim).
- Update the project documentation to remove the "$300 billion BPM industry" framing and replace with the corrected BPM-software figure (USD 21.51B in 2025, Fortune Business Insights).
- File a comment on Mermaid issue #7699 introducing bpmn-beta as prior art, professionally and without confrontation.

**Stage 2 — Engage with maintainers (60–180 days):**
- Open a parallel Mermaid issue specifically for `bpmn-beta` if #7699 has not progressed, framed as a complementary lightweight alternative, with a working PR or working external plugin as evidence.
- Reach out to Mermaid Chart (Knut Sveidqvist directly via the open-source repo) and the DFKI authors (Emrich, IWi/DFKI Saarbrücken) to explore syntax-convergence — open-source norms favor collaboration over forking.
- Build out the LLM-evaluation evidence: publish a small benchmark of GPT-5/Claude/Gemini generating bpmn-beta vs. BPMN XML vs. DFKI syntax for the same 20 process descriptions.

**Stage 3 — Decide the commercial wedge (180+ days):**
- Decide whether to invest in the BPMN-XML round-trip (highest commercial value, highest cost) or remain a pure-documentation tool (lowest cost, strongest open-source credibility).
- Benchmark to revisit: if bpmn-beta has ≥1,000 weekly npm downloads, ≥3 third-party integrations (GitHub Action, VS Code extension, etc.), or a public adoption by a recognized docs platform, prioritize the round-trip converter; otherwise hold.

**Benchmarks that should change the strategy:**
- If Mermaid maintainers merge or actively endorse #7699: pivot to a "compatibility wrapper" that emits #7699's syntax from a more concise surface DSL, rather than competing head-on.
- If Mermaid Chart announces BPMN: pivot to deep integration with Mermaid Chart (the open-source plugin remains; commercial differentiation moves to round-trip and AI-generation tooling).
- If the Emrich & Hollax 2025 DFKI paper publishes with strong empirical results: cite it, do not dismiss it; co-author a comparison response if the data allow.
- If arXiv 2507.11356 is followed by a BPMN-specific representational study from the Polytechnique Montréal group: ensure bpmn-beta is included in the comparison set.

---

## Caveats

- **All market-research figures are vendor-funded.** Research Nester, Fortune Business Insights, Precedence Research, Grand View Research, MarketsandMarkets, and Straits Research are commercial firms whose primary product is selling reports to vendors in the markets they size. Treat all dollar figures as directional ranges, not as authoritative.
- **Mermaid Chart's "8 million users" claim** is a company press-release figure (TechCrunch, 20 March 2024) with no independent verification; treat as a vendor claim.
- **The Emrich & Hollax 2025 DFKI paper is not publicly available** as of the research date — it is explicitly described in issue #7699 as in preparation. No DOI or preprint URL was found via Google Scholar, arXiv, DFKI's publication index, or ResearchGate. Do not cite it as published peer-reviewed work.
- **Maintainer engagement on #7699 is zero as of the snapshot.** This may change at any time and the strategic landscape would shift if a maintainer endorses or rejects #7699.
- **Mermaid star/user counts** vary across sources (~65k–78k stars; 8M users) and reflect different snapshot dates between 2024 and 2026.
- **The BPMN "de facto standard" framing is consensus in academic and industry literature** but BPMN is not without critics; some communities (DEMO, Petri-net formalism, ArchiMate at enterprise-architecture level) treat BPMN as one notation among several.
- **bpmn-beta has no public adoption metrics yet.** Avoid any framing that implies traction the project does not yet have.
- **Source-quality flags:** Wikipedia, Grokipedia, Medium posts, and LinkedIn posts in the source list have been used only where the underlying primary source is also cited; treat them as starting points, not authorities.