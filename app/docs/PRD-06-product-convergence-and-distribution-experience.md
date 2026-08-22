# PRD-06: Product Convergence and Distribution Experience

**Status:** Historical build directive based on a product and implementation review completed 2026-08-06. Superseded for current evidence by `docs/maturity-evidence-baseline-2026-08-22.md`.

**Decision:** Continue productization, but do not treat the current release as a complete functional hub. The project is a credible prototype and distribution site. The next release should make its existing capabilities easier to enter, finish, export, and adopt.

## 1. Evidence and review boundary

This document is a product decision artifact, not a replacement for the DSL standard, parser source, capability ledger, or Mermaid compatibility evidence. It reflects a review completed on 2026-08-06. For current test results, evidence tiers, and blockers, use the dated 2026-08-22 maturity baseline; the observations below are retained as historical product evidence.

The review also ran the available local validation commands. Skill tests, skill validation, and generated-file checks passed. Application typecheck and application test runs were blocked by an incomplete local dependency tree: the declared `mermaid` package was absent, and test-local storage was unavailable. The plugin package build was also blocked because that package's local executable dependencies were absent. These findings do not prove application defects. They do prove that a clean, frozen installation must be part of the next release gate.

## 2. Reconstructed product vision

### Core purpose

BPMN for Mermaid makes a documented, readable BPMN descriptive subset practical in Mermaid-oriented workflows. Users author `bpmn-beta` text, parse it in the browser, lay it out, and render it as SVG. The repository also distributes a complementary BP-SKILL suite for structured process work.

The intended product is not a general BPMN suite, executable process engine, hosted collaboration service, or generic AI application. Its natural product shape is a static, browser-first **process modeling and workflow distribution hub** with two connected offers:

1. A text-first BPMN for Mermaid diagram authoring and integration path.
2. A portable BP-SKILL workflow system that helps users move from process intake through analysis, future-state design, and handoff.

### Target users

- Process analysts and business analysts who want diagrams that review well in text and source control.
- Technical contributors using Mermaid-oriented documentation and delivery workflows.
- Practitioners who need a guided, reusable method for process analysis and documentation.
- Evaluators and prospective Mermaid contributors who need concrete compatibility proof.

### Primary jobs to be done

- Create and revise a readable process diagram without a heavyweight BPMN editor.
- Turn a diagram into a reusable project asset or Mermaid-hosted output.
- Find, understand, download, and apply a BP-SKILL workflow without guessing the sequence.
- Assess the project honestly: supported today, in progress, and deliberately out of scope.

### Expected experience

The product should feel precise, calm, credible, and immediately useful. Users should reach a meaningful outcome inside one visit, then know exactly what to do next. The Forge visual system already establishes a strong visual language; the next phase must add product orientation and completion loops rather than another visual redesign.

## 3. Current application assessment

### What is implemented and aligned

| Area | Evidence-based assessment |
| --- | --- |
| Core diagram pipeline | The browser implementation has a real detector, parser, typed database, layout engine, and SVG renderer. The live playground accepts source, switches examples, renders valid diagrams, and returns visible parse feedback for invalid source. |
| Mermaid compatibility path | The repository has a source-level external-diagram adapter, package workspace, integration tests, compatibility documentation, and a live Mermaid Host Demo that rendered both corpus examples under strict security during the review. |
| BP-SKILL distribution | The Skills route exposes a populated catalog of 15 core skills, descriptions, dependencies, templates, and downloads. Generated static copies are validated by repository tooling. |
| Public product surface | The home, playground, skills, documentation, and host-demo routes form a visually coherent public application. The 390 px mobile layout collapses navigation and retains a usable single-column structure. |
| Product honesty in core docs | The repository generally avoids claims of full BPMN 2.0 conformance, execution semantics, backend persistence, and a published production plugin. |

### Partially implemented

| Area | Current state | Why it is incomplete |
| --- | --- | --- |
| Product entry | The home page explains both offers and links to routes. | It does not establish intent or guide a visitor to a first successful outcome. Diagram users, integration users, and workflow users all receive the same dense entry point. |
| Diagram completion loop | Users can edit, render, zoom, pan with a mouse, and select examples. | There is no direct copy-source action, `.mmd` download, SVG download, persisted draft, source URL, or clear next step after a successful render. |
| Workflow adoption loop | Individual skills, templates, and dependencies are accessible. | A new visitor does not receive a clear minimum viable sequence, starter bundle, or outcome-focused Start Here experience. |
| Accessibility and input coverage | Semantic controls, explicit zoom controls, visible errors, and responsive structure are present. | Canvas panning appears mouse-event based; touch and keyboard panning were not proven. Canvas wheel capture can compete with normal page scrolling. |
| Product observability | The site has basic page-view tracking. | It does not measure completion actions such as render success, source copy, download, starter-path selection, or host-demo use. |

### Present but misaligned or at risk of drift

| Area | Finding | Product consequence |
| --- | --- | --- |
| Route and capability copy | The capability registry is useful, but some individual pages and historical documents still carry older counts, architecture descriptions, or lifecycle language. | A prospect cannot easily distinguish current proof from historical roadmap material. |
| Product narrative | The two deliverables are presented alongside one another without a clear relationship. | The site can read as a collection of credible pieces instead of a deliberate product system. |
| Performance posture | Application routes are statically imported from the primary app entry. | The Mermaid host path and other non-primary experiences may be included earlier than necessary. There is no explicit performance budget. |
| Market claims | Terms such as "first," broad compatibility statements, and ecosystem scale claims need sources, dates, or narrower wording. | Strong but unverified claims reduce trust more than they increase conversion. |

### Deliberately missing and still out of scope

Accounts, cloud storage, backend services, databases, payment flows, BPMN XML interchange, bpmn-js, executable semantics, and in-app LLM calls remain outside the product contract. Their absence is not a gap. Adding them would dilute the project and contradict its static, browser-only architecture.

## 4. Vision-to-execution gap analysis

### The central gap

The product has working building blocks and credible evidence, but not yet a coherent completion system. It currently proves that users can render a diagram and inspect or download individual skills. It does not consistently take them from an expressed intent to a portable finished artifact or an adopted workflow.

### Candid verdict

**On track as a technical prototype and static distribution experience. Not yet on track as a fully realized functional hub.**

The strongest work is the actual diagram pipeline, the Mermaid host proof, and the disciplined BP-SKILL package structure. The weakest work is the connective tissue: intent selection, onboarding, completion actions, fresh source-of-truth content, and release reproducibility. The application feels like a polished set of well-made product surfaces rather than a single guided product experience.

Preserve the static architecture, existing visual language, diagram pipeline, source-first positioning, and skill distribution model. Rework the entry and completion paths. Do not add a server or invent a broader platform. Simplify older duplicate claims and pages once a canonical capability and lifecycle source is established.

## 5. Product direction

Position the product as:

> A text-first process modeling and workflow distribution hub for people who need to create, integrate, and apply process knowledge in Mermaid-oriented environments.

The home page and navigation must route visitors into one of three explicit paths:

1. **Create a diagram**: open the playground with an appropriate starter example, produce a diagram, then copy or download it.
2. **Use with Mermaid**: see current integration status, run the host proof, and obtain the package or source instructions appropriate to the release state.
3. **Start a process workflow**: understand the smallest useful BP-SKILL sequence, obtain a starter pack, and move to the first skill or context template.

The system should be outcome-oriented while remaining static and privacy-respecting.

## 6. Product requirements

### 6.1 Product goals

1. Let a first-time diagram user produce and take away a usable artifact in under five minutes.
2. Let a prospective Mermaid adopter verify current compatibility status and find the correct integration path without reading the whole documentation set.
3. Let a first-time workflow user identify a minimum BP-SKILL path and obtain the required templates in under three minutes.
4. Keep public claims synchronized with evidence and release status.
5. Preserve a zero-account, browser-only, static deployment model.

### 6.2 Non-goals

- No authentication, user accounts, personal cloud storage, backend API, database, or payment system.
- No BPMN XML import or export, full BPMN 2.0 claim, executable BPMN semantics, or bpmn-js dependency.
- No in-app LLM service or collection of pasted diagram content for analytics.
- No claim that the external diagram adapter is a published production package until packaging and release evidence support that statement.

### 6.3 Information architecture

| Navigation item | Purpose | Primary completion action |
| --- | --- | --- |
| Home | Select an intent and explain product boundaries. | Choose Create, Use with Mermaid, or Start workflow. |
| Playground | Author, preview, diagnose, and take away bpmn-beta source and SVG. | Copy source, download `.mmd`, or download SVG. |
| Mermaid integration | Show evidence-tiered compatibility status, host proof, and integration instructions. | Open host demo or follow version-appropriate integration guidance. |
| Skills | Browse and download individual BP-SKILL packages. | Open a skill or dependency path. |
| Start Here | Explain the minimal workflow sequence, required context, and starter pack. | Download starter pack or begin the first skill. |
| Documentation | Provide reference material and evidence records. | Return to the applicable task path. |

### 6.4 Functional requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | The home page shall present the three primary user paths above, each with a concrete outcome and direct CTA. | P0 |
| FR-02 | The playground shall provide visible controls to copy current source, download current source as a `.mmd` file, and download the rendered SVG. | P0 |
| FR-03 | The playground shall keep parse errors adjacent to the source editor, retain valid preview behavior, and explain the fastest recovery action. | P0 |
| FR-04 | A Start Here route shall identify the recommended minimum BP-SKILL sequence, its expected outcome, prerequisites, and direct links to needed templates and skills. | P0 |
| FR-05 | A starter-pack download shall contain only validated, versioned, human-readable assets required for the first workflow path. | P0 |
| FR-06 | The Mermaid integration route shall state the exact evidence tier: source adapter, tested host behavior, package availability, and remaining release limitations. | P0 |
| FR-07 | A canonical capability and lifecycle data source shall drive current-state badges and common counts used by product pages. | P0 |
| FR-08 | The site shall record privacy-safe aggregate interaction events for intent selection, successful render, copy, download, host-demo view, and Start Here selection, if analytics is enabled. No diagram source or personal content may be collected. | P0 |
| FR-09 | The playground shall support an accessible alternative to mouse panning and must not trap ordinary page scrolling unexpectedly. | P1 |
| FR-10 | The playground may encode starter example or source state in a shareable URL only when the URL length and privacy behavior are clear. | P1 |
| FR-11 | Non-primary routes and heavy integration code shall be evaluated for route-level loading so the initial experience stays within an explicit budget. | P1 |
| FR-12 | The product may provide advisory, non-authoritative diagram quality warnings that do not change parser or renderer semantics. | P1 |

### 6.5 Content requirements

- State `bpmn-beta` as a documented BPMN descriptive subset, not formal BPMN conformance.
- Pair all capability claims with status: Supported, Demonstrated, In progress, or Out of scope.
- Give source and retrieval date for consequential market and scale claims, or remove them.
- Replace stale page counts, workflow names, and architecture references with data-driven content or explicitly historical context.
- Keep a concise explanation of why static, client-side delivery is intentional.

### 6.6 UX and UI requirements

- Preserve the Forge theme, typography hierarchy, and responsive navigation.
- The first screen must answer: what can I do here, which path is for me, and what will I leave with?
- Every primary route must have a clear action above the fold and a visible next step after success.
- Do not make a visitor infer the relation between diagram authoring, Mermaid integration, and BP-SKILL use.
- Provide keyboard-accessible controls, visible focus treatment, readable error messages, and tested small-screen behavior.
- Treat the rendered diagram as a work surface. Export and copy actions must describe exactly what they produce.

### 6.7 Technical and state-management requirements

- Maintain the existing pipeline: `bpmn-beta text -> detector -> parser -> BpmnDb -> layout -> renderer -> SVG`.
- Maintain separate React and Mermaid-adapter output paths over shared model contracts.
- Keep the app static and browser-only.
- Store draft state locally only if introduced. Clearly label local-only retention and offer explicit reset.
- Keep generated skill/context assets generated from canonical sources. Do not hand-edit derived files.
- Define a release environment that starts with `pnpm install --frozen-lockfile`, then passes typecheck, application tests, skill tests, generated checks, skill validation, evals, build, and a browser-level host-demo check.
- Establish an initial performance budget before adding route-level loading. Example targets: documented baseline, no unexplained initial-bundle regression, and a checked production build report.

### 6.8 Distribution workflow

The distribution flow is static and versioned:

1. Validate canonical skills and contexts.
2. Generate public distribution assets.
3. Generate a release manifest containing version, asset list, checksums where appropriate, and source revision.
4. Verify all public download links against actual HTTP responses.
5. Deploy only the validated static output.

There is no administrative user workflow in this phase. Repository maintainers own release validation and public content updates.

### 6.9 Success criteria

| Outcome | Measure |
| --- | --- |
| Intent clarity | At least 90% of moderated first-time evaluators can identify their correct starting path without assistance. |
| Diagram completion | At least 80% of moderated first-time evaluators render and export or copy a starter diagram within five minutes. |
| Workflow onboarding | At least 80% of moderated first-time evaluators can identify the first BP-SKILL step and download the starter pack within three minutes. |
| Claim accuracy | All public product claims sampled in release review are traceable to source, tests, or clearly labeled future work. |
| Release reliability | Clean-install validation and public download link checks pass for each release. |
| Accessibility | Keyboard and small-screen acceptance checks pass for primary path actions. |

## 7. Prioritized roadmap

### MVP: convergence release

1. Establish the canonical capability/lifecycle model and reconcile high-traffic page copy.
2. Introduce three intent-led home-page paths.
3. Add playground copy source, `.mmd` download, SVG download, and recovery-oriented error handling.
4. Add Start Here with a documented minimum BP-SKILL route and validated starter pack.
5. Make integration status evidence-tiered and link directly to the host proof.
6. Restore a clean frozen install and make the full validation sequence reproducible.
7. Add release-time public download-link verification.

### V1: usability and trust hardening

1. Improve touch, keyboard, and scroll behavior in the diagram work surface.
2. Add privacy-safe event measurement and a simple funnel report.
3. Add route-level loading where production measurements support it.
4. Add a versioned release manifest and download integrity data.
5. Add optional shareable starter or source URLs with clear limits.

### Future phases

1. Add non-authoritative quality guidance based on structural heuristics.
2. Add more curated starter packs for common process-analysis situations.
3. Consider packaging and publishing only after the existing adapter and release contracts have a deliberately approved external distribution plan.

## 8. Acceptance criteria

### Intent-led home

- A new visitor can select Create a diagram, Use with Mermaid, or Start a process workflow from the initial page view.
- Each selection reaches its task route in one activation and names the expected outcome.
- No route claims a capability that is not represented by the current capability model.

### Playground completion

- A valid rendered diagram can be copied as source, downloaded as `.mmd`, and downloaded as SVG using visible controls.
- The downloaded SVG opens as a valid SVG and corresponds to the current rendered diagram.
- An invalid source state shows an actionable error without destroying the user's entered source.
- Primary actions work by keyboard and on the supported small-screen layout.

### Start Here workflow

- The route states one recommended minimum sequence, a concrete completion outcome, and the prerequisites for each step.
- Every listed skill/template link resolves to a current validated public artifact.
- The starter pack contains the declared files and no dead links.

### Integration evidence

- The integration route distinguishes tested source adapter behavior from published package availability.
- The host demo can be reached from the integration route in one activation.
- Compatibility claims link to the supporting evidence record.

### Release gate

- A fresh dependency install using the committed lockfile succeeds in the supported environment.
- Typecheck, application tests, skill tests, generated checks, skill validation, evals, build, and browser host-demo smoke checks are recorded for the release.
- All public downloads return the declared artifact type and successful HTTP status.

## 9. Replit build directive

Build the convergence release in the following order. Preserve the existing static React/Vite architecture, Forge styling system, parser-to-renderer pipeline, Mermaid host adapter, and canonical skill-generation workflow. Do not add authentication, storage, database, backend routes, BPMN XML support, bpmn-js, or AI APIs.

1. Audit existing page copy against the current capability ledger and create one canonical data source for supported, demonstrated, in-progress, and out-of-scope capability statements. Use it for home-page status, integration status, core counts, and common release language.
2. Refactor the home page around three task cards: Create a diagram, Use with Mermaid, and Start a process workflow. Each card must include intended audience, outcome, and one direct CTA.
3. Extend the playground with copy-source, download-source, and download-SVG actions. Preserve current editor, examples, parser feedback, zoom, and renderer behavior. Add focused tests for the generated download content and error recovery.
4. Create a Start Here route. It must guide a new workflow user through the smallest validated BP-SKILL sequence, required templates, expected outcome, and a starter-pack download. Generate the pack from canonical assets and test its manifest.
5. Update the Mermaid integration route and host-demo entry points. State current proof and known release limits accurately, and link directly to the live host proof.
6. Improve the diagram work surface for keyboard and touch use after preserving the existing desktop interaction. Do not prevent normal page scrolling without an obvious active work-surface intent.
7. Add privacy-safe action events only if the existing analytics configuration supports them without collecting content. Document event names and prohibited data.
8. Measure the production build, establish a baseline, then use route-level loading only where it improves the primary path without weakening testability.
9. Restore a clean dependency installation and record a release gate that includes all repository validators plus a browser smoke test of the host demo and all public downloads.

Do not redesign the visual system as part of this work. Do not turn documentation into marketing copy. Replace unsupported superlatives with evidence-backed, scoped statements.

## 10. Decision record

The next phase should be judged by whether it converts existing technical proof into a clear, finishable user experience. It should not be judged by the number of new platform features. A successful convergence release will make the project easier to understand, easier to adopt, and more trustworthy while keeping its intentionally static product boundary intact.
