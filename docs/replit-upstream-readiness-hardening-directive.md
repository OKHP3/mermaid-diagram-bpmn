# Replit Directive: BPMN for Mermaid Upstream Readiness and Evidence Hardening

## Directive status

| Field | Value |
|---|---|
| Project | `OKHP3/mermaid-diagram-bpmn` |
| Public name | BPMN for Mermaid |
| DSL header | `bpmn-beta` |
| Execution target | Replit development environment and GitHub Pages deployment pipeline |
| Owner | Jamie Hill, OverKill Hill P³ |
| Prepared | 2026-08-21 |
| Revision | 2: full deployability, opportunity discovery, and community-contribution readiness |
| Purpose | Correct the weaknesses that could undermine technical review, upstream Mermaid discussion, package adoption, or public outreach |
| Publication status | Execution directive only. Do not post, publish, open a pull request, or send community messages as part of this directive unless separately authorized. |

## 1. Mission

Bring the repository to a state in which an informed Mermaid open-source maintainer can inspect the code, install the package, run the browser demo, understand the supported BPMN descriptive subset, and distinguish shipped evidence from future ambition without encountering contradictory claims.

The desired result is not a claim that BPMN for Mermaid is an official Mermaid diagram type. The desired result is a credible, independent companion project that can be discussed with the maintainers of the open-source Mermaid JavaScript project as one possible implementation, syntax, or prototype for the BPMN capability already being discussed in that project.

This directive has two separate deliverables:

1. A corrected, reproducible, technically defensible repository and deployment.
2. A review-ready outreach packet that may later support a respectful GitHub discussion, pull request, maintainer message, Discord conversation, or other Mermaid-community communication.

Do not merge these deliverables into one marketing exercise. Technical readiness comes first. Outreach material must be generated from the verified technical state after the implementation work is complete.

## 2. Important identity and relationship boundary

The outreach target is the open-source Mermaid JS project, its GitHub repository, its documented extension APIs, its maintainers, contributors, and community channels.

Mermaid also has a commercial company and hosted product ecosystem. Do not imply that BPMN for Mermaid is endorsed by, sponsored by, owned by, or integrated with Mermaid Chart, Mermaid.ai, or any other commercial Mermaid service. Do not make claims about commercial product compatibility unless that product's owner has explicitly documented and verified it.

Use wording such as:

> BPMN for Mermaid is an independent open-source companion project exploring a readable BPMN descriptive subset through Mermaid's external diagram API. It is not an official Mermaid diagram type, and it is not affiliated with or endorsed by Mermaid's commercial services.

This boundary must appear in the repository's project/about material and in every prepared outreach draft where affiliation could otherwise be misunderstood.

## 3. Current state to preserve

The following is the starting point for this directive. Replit must re-check these facts in the checkout before acting. They are not permission to skip verification.

### 3.1 Confirmed strengths

- The repository is a pnpm monorepo containing the React/Vite playground, parser, typed `BpmnDb`, layout engine, React SVG renderer, Mermaid adapter, BP-SKILL packages, context templates, examples, tests, and static deployment assets.
- The application is intentionally static and browser-only.
- `app/src/lib/bpmn-plugin.ts` implements a source-level adapter for Mermaid's external diagram API.
- `lib/bpmn-plugin/` is an installable package with ESM, CommonJS, and type exports. The checked-in package version is `0.1.1`.
- The repository has integration tests that exercise real `mermaid@11.4.1`, `registerExternalDiagrams()`, and `mermaid.render()`.
- The GitHub Actions CI and Pages workflows have recently passed their build, test, package, smoke, generated-file, and real-browser gates.
- The deployed Pages site exposes `/plugin`, `/release`, and `/mermaid-host-demo` routes. The browser host demo exercises flat diagrams, gateways, pools and lanes, cross-pool message flows, strict Mermaid security defaults, and an intentional invalid-source panel.
- Cross-pool message flow is implemented and browser-tested. It is represented by the `~~>` syntax at the top level.
- The current Mermaid documentation identifies the external diagram contract through `id`, `detector`, and `loader`, and the current Mermaid documentation shows Mermaid `11.17.0` as the current site version on the date of this directive.
- Mermaid's public issue tracker contains an open BPMN support request, issue [#2623](https://github.com/mermaid-js/mermaid/issues/2623), and an open native BPMN proposal, issue [#7699](https://github.com/mermaid-js/mermaid/issues/7699). These are opportunities for technical dialogue, not evidence that Mermaid has accepted this repository.

### 3.2 What is not established

- BPMN for Mermaid is not an official Mermaid core diagram type.
- The project is not a full BPMN 2.0 implementation.
- The project does not execute BPMN, validate executable process semantics, or import/export BPMN XML.
- No maintainer endorsement, adoption decision, or upstream merge commitment has been established.
- Compatibility with every Mermaid version in the package peer range has not been established merely because the peer range says `>=10.0.0`.
- A successful CI run is not, by itself, evidence that every claim on the deployed site is current.
- A community reaction, Discord reply, star, or issue comment is not evidence of technical acceptance.

## 4. Weaknesses that must be corrected

The work below is not a request for cosmetic polish. Each weakness could cause a maintainer, contributor, or early adopter to lose confidence in the project or misunderstand its scope.

### W1. The repository contains contradictory current-state documents

Several documents still describe an earlier state in which there was no package boundary, no browser host demo, no automated real-browser verification, or no published package. Those statements may have been accurate when written, but they now coexist with current source, CI, package, and deployed-site evidence that contradicts them.

Known examples include:

- `docs/mermaid-compatibility.md`, which still describes browser verification as incomplete and says the relevant E2E work is deferred.
- `docs/capability-ledger.md`, which contains an older 2026-08-04 baseline alongside later current-state entries without giving a reader one clear current summary.
- `app/docs/mermaid-compatibility.md` and older PRD, deployment, and review documents that retain pre-package or pre-demo statements.
- `AGENTS.md`, whose status section still says that a real package boundary and browser-host demo remain to be built even though those artifacts now exist.
- `docs/promotion-strategy.md`, whose current-state section still says the npm package is unpublished and returns 404, even though the package is now published as `0.1.1`.

Required correction:

1. Preserve historical records when they explain prior decisions or audits.
2. Mark historical sections with an explicit date and label such as `Historical snapshot - not current state`.
3. Add one current-state summary to each document that is intended to be read as an active guide.
4. Correct or retire statements that a normal reader could mistake for current facts.
5. Add a repository-wide stale-claim check for phrases associated with the old state, including `not yet wired`, `not published`, `404`, `E2E deferred`, `no package boundary`, and `no browser demo`. Each remaining match must either be current, quoted as history, or intentionally listed as a future limitation.
6. Update `AGENTS.md` after the implementation is complete so it describes the actual architecture, package, host demo, and evidence gates.

Do not mass-delete historical documentation. The fix is classification and reconciliation, not loss of provenance.

### W2. Public capability claims are not generated from one canonical capability authority

The parser, standard, renderer, integration tests, public pages, release manifest, and compatibility document do not currently provide one machine-checkable source from which all capability claims are derived. This has already produced false or stale claims.

For example, `app/src/pages/PluginInstallation.tsx` lists message flows between pools as unsupported even though the parser accepts the top-level `~~>` form, the adapter renders it, tests cover it, and the live host demo displays it. The same page contains wording that can overstate support for subprocesses, intermediate events, or task variants that the current parser does not actually accept.

Required correction:

1. Create a small canonical capability registry or equivalent typed data structure. It must describe, for each capability:

   - public name;
   - DSL syntax;
   - parser support;
   - model/database support;
   - layout support;
   - React renderer support;
   - Mermaid adapter support;
   - package smoke coverage;
   - browser coverage;
   - exact tests or fixtures;
   - evidence tier;
   - known limitations;
   - last verified commit or date.

2. Define an explicit evidence vocabulary. At minimum use:

   - `confirmed`: directly observed in source or a focused test;
   - `source-verified`: exercised through a real Mermaid API call in the repository test environment;
   - `packaged`: exercised from the packed npm artifact;
   - `browser-verified`: exercised in a real browser with the relevant security and DOM conditions;
   - `current-version-verified`: exercised against the current tested Mermaid version;
   - `proposal`: intended but not shipped;
   - `unknown`: not checked.

3. Generate the public capability table, release evidence summary, and compatibility page from the registry where practical. If a document must remain hand-authored, add a test that compares its claims against the registry.
4. Correct every overclaim. A capability that is rendered only by the React playground but not by the packaged Mermaid adapter must not be described as a plugin capability.
5. Add negative tests for unsupported constructs. An unsupported BPMN term must fail with a useful diagnostic, not be silently accepted or presented as partially working.

The registry is not a license to claim BPMN conformance. It is a transparent description of the project's intentionally limited descriptive subset.

### W3. Mermaid version support is narrower than the declared peer range

The package declares a broad peer range, while direct integration evidence has centered on `11.4.1`. The current Mermaid website shows `11.17.0`. A reader can reasonably interpret `>=10.0.0` as a tested compatibility guarantee, which the repository does not currently prove.

Required correction:

1. Keep `11.4.1` as a historical or baseline target only if it remains useful.
2. Add a compatibility matrix that tests at least:

   - the currently pinned baseline `11.4.1`;
   - the current Mermaid release identified from the official site or npm at execution time, currently `11.17.0`;
   - any intermediate or minimum version that the project intends to support.

3. For each version, test detector registration, parsing, `mermaid.render()`, theme binding, strict security defaults, accessibility metadata, error handling, and the package smoke fixture.
4. Do not advertise a range wider than the passing matrix. If the team wants to retain `>=10.0.0` as a package peer declaration, document it as an unverified compatibility intent or narrow it to the evidence-backed range.
5. Add a scheduled or manually invokable version-audit workflow that reports new Mermaid releases without silently changing the supported range.
6. Record the exact Mermaid versions, package lock state, Node version, browser versions, and commit in the compatibility artifact.

The goal is not to chase every release immediately. The goal is to ensure the package declaration, test evidence, and public wording agree.

### W4. The DSL contract is underspecified in public-facing material

The parser is a deliberate descriptive subset, but several public pages blur the line between currently supported syntax and BPMN concepts that remain deferred. A maintainer needs to see the exact boundary quickly.

Required correction:

1. Produce a single supported-syntax table tied to the parser and tests.
2. At minimum, verify and document the actual current behavior for:

   - `start` and `end` events;
   - task forms actually accepted by the parser and rendered by the adapter;
   - XOR, OR, and AND gateways;
   - sequence flows;
   - conditional flows;
   - default flows;
   - top-level message flows between participants;
   - pools and lanes;
   - `accTitle` and `accDescr` accessibility metadata;
   - the `bpmn-beta` detector header.

3. Explicitly list current limitations, including as applicable:

   - no BPMN XML import or export;
   - no executable semantics or token simulation;
   - no nested pools or lanes;
   - message flows are top-level participant relationships, not lane-internal flows;
   - no data objects unless actually implemented and tested;
   - no annotations unless actually implemented and tested;
   - no subprocess, call activity, boundary event, intermediate event, or event-definition support unless actually implemented and tested;
   - no claim of full BPMN 2.0 conformance.

4. Ensure that unsupported constructs produce a stable, documented error.
5. Add corpus examples for every publicly advertised capability and at least one fixture for every important unsupported boundary.
6. Update `app/docs/dsl-spec.md`, the standards documents, the Playground help, the plugin page, the README, and the release page from the same capability language.

### W5. The source and React rendering paths can drift

The repository intentionally has two output paths over the same model pipeline: the React renderer and the imperative Mermaid adapter. That is a sound architecture, but duplicated shape and styling logic creates a risk that a capability works in the Playground and fails in the package, or that the two renderers disagree on notation, accessibility, theming, or geometry.

Required correction:

1. Inventory duplicated shape, label, marker, color, and flow logic in `bpmn-renderer.tsx` and `bpmn-plugin.ts`.
2. Extract only genuinely shared contracts into a small internal module. Keep output-specific concerns in their respective renderers.
3. Do not introduce a framework dependency into the package merely to share React code.
4. Add parity tests that parse each canonical example once, then verify equivalent semantic elements and flow types in both renderers.
5. Add focused layout regression tests and SVG snapshot or structural assertions for flat, gateway, pool/lane, message-flow, accessibility, and error cases.
6. Keep the Mermaid adapter's real integration tests and packaged smoke tests as merge-blocking gates.

This phase is complete only when the shared model contract is clearer, not merely when files have been rearranged.

### W6. Local Windows reproducibility is currently unreliable

The deployed Linux CI is healthy, but the local Windows checkout has exhibited case-only path materialization problems. Tracked PascalCase files such as `DslReference.tsx`, `DownloadButton.tsx`, `SkillCard.tsx`, and related components can appear on disk with lowercase names while `core.ignorecase=true`. TypeScript then reports `TS1261` duplicate-file or casing errors even though the Git tree is correct.

This is a repository-operability weakness. A future contributor on Windows can be blocked before reaching the actual application tests.

Required correction:

1. Inventory the exact tracked names using `git ls-files` and the exact materialized names using the filesystem. Do not assume a case-only collision is harmless.
2. Repair case-only names with deliberate temporary names and version-control-aware renames. Do not use a broad reset, checkout, or destructive cleanup.
3. Add a documented Windows case-sensitivity check or a CI check that detects case-colliding tracked paths before TypeScript does.
4. Document the supported Node and pnpm activation path. The repository declares `pnpm@10.26.1`, while an unwrapped local command may resolve another pnpm version.
5. Make child-process scripts resolve the declared package manager reliably. The plugin smoke script must not fail only because a bare `pnpm` executable is unavailable to a spawned process.
6. Run a clean frozen install in Replit/Linux and a clean supported install on Windows if Windows remains in the support promise.

### W7. Cross-platform tests are sensitive to line endings and stale dependencies

The local checkout has shown that the core skill validator can pass while the skill test suite fails because frontmatter parsing assumes `\n` and encounters CRLF. The local accessibility suite also failed because `axe-core` was absent from a stale or incomplete dependency tree. These failures make it difficult to distinguish product defects from environment defects.

Required correction:

1. Make frontmatter and text parsing accept both LF and CRLF where line endings are not semantically significant.
2. Add a test fixture for both line endings.
3. Ensure the lockfile and package manifests include every test dependency used by CI and local test commands.
4. Run tests from a clean install, not only an existing `node_modules` directory.
5. Report failures by category: product failure, dependency/install failure, platform failure, or stale generated artifact.
6. Add a contributor troubleshooting section with the exact commands for `corepack`, frozen pnpm installation, generated-file regeneration, and clean test execution.

### W8. Generated artifacts can drift from the canonical sources

The repository has generated skill files, context files, generated PNS transitions, dependency data, release manifests, and build output. The local review found generated-check failures even though the deployed build regenerated some artifacts successfully. A committed generated date also differed from the date in the deployed artifact because the deployment workflow regenerates it during build.

Required correction:

1. Inventory every generated artifact and record its generator, source inputs, expected commit policy, and whether it belongs in Git.
2. Make `check:generated` deterministic and cross-platform.
3. Decide explicitly whether `app/public/release-manifest.json` is a committed source artifact or a build-time artifact. Do not let a date field create a false impression that the checked-in artifact is the deployed artifact.
4. If generated files are committed, regenerate them in the same change as source updates and test their diff.
5. If generated files are build-only, remove them from the source-of-truth narrative and verify the deployed artifact instead.
6. Add a manifest consistency check that connects package version, release version, source commit, deployment commit, and generated date.

### W9. Accessibility evidence is unevenly scoped

The project has diagram-level accessibility metadata and browser evidence, but the repository must not imply that this equals a complete WCAG or per-element accessibility audit. Mermaid maintainers will reasonably ask whether generated SVG is keyboard-readable, labeled, themed, and safe under the host's accessibility expectations.

Required correction:

1. Define the accessibility promise for this release.
2. Verify `accTitle` and `accDescr` in the React renderer, packaged adapter, and real browser host.
3. Decide whether every meaningful rendered node group receives an accessible label. If not, state that as a limitation and create a tracked follow-up.
4. Run an automated accessibility check where technically valid, and supplement it with browser inspection of the actual SVG and DOM tree.
5. Test dark/light or representative Mermaid theme variables without hard-coded assumptions.
6. Do not claim WCAG 2.1 AA conformance unless a complete audit supports that claim.

### W10. The upstream contribution shape is not yet sufficiently prepared

The repository demonstrates an external plugin, but an upstream Mermaid maintainer may need a different contribution boundary, syntax convention, test organization, package ownership model, or build integration. A working external adapter is evidence of feasibility, not evidence that the code is ready to merge into Mermaid core.

Required correction:

1. Create a maintainer-facing architecture note that maps:

   - `bpmn-beta` detector to Mermaid's external diagram contract;
   - parser and database responsibilities;
   - layout responsibilities;
   - SVG rendering responsibilities;
   - tests that would need to move or be adapted for Mermaid core;
   - dependencies that would be unacceptable or unnecessary in Mermaid core;
   - what remains independent package code.

2. Provide a small syntax rationale explaining why the current syntax is readable, versionable, and appropriate for a descriptive subset.
3. Compare the syntax with the syntax and scope visible in the existing BPMN discussions without attacking or dismissing other proposals.
4. Decide whether to retain the explicit `bpmn-beta` syntax or propose an additional Mermaid-like shorthand. Do not silently introduce a second syntax. A shorthand would require a decision record, parser tests, examples, error behavior, and a clear migration policy.
5. Identify the smallest maintainer-reviewable contribution. It may be a prototype, an external integration, a syntax discussion, a focused PR, or a request for guidance. Do not assume that the largest possible feature set is the best upstream contribution.

### W11. The promotion plan is ahead of the evidence unless staged

The project has a reasonable opportunity to explain its work to people discussing BPMN in Mermaid. However, broad promotion before documentation and compatibility are corrected can turn a useful prototype into a credibility problem. The project should not manufacture urgency, coordinate artificial hype, or present an open-source companion as an official extension.

Required correction:

1. Convert promotion into a staged readiness gate.
2. Prepare drafts, but do not send them, until the technical acceptance criteria in Section 9 pass.
3. Prefer one technically relevant issue comment or discussion contribution over repeated promotional messages.
4. Ask maintainers what they need and what contribution shape they prefer.
5. Disclose that the author maintains BPMN for Mermaid.
6. Use a calm, factual tone: capability, evidence, limitations, invitation for feedback.
7. Never ask community members to pretend to be independent supporters, mass-react, repeat identical text, or pressure maintainers.

## 5. Execution sequence

Replit should execute the following phases in order. Each phase must produce a short evidence record before the next phase begins.

### Phase 0: Intake and evidence freeze

Before modifying anything:

1. Run `git status --short --branch`, inspect the current branch and remote, and record the exact HEAD.
2. Inventory uncommitted changes, untracked files, generated files, and local environment versions.
3. Preserve unrelated owner work. Do not stash, reset, delete, rebase, force-push, or overwrite without explicit authorization.
4. Read `AGENTS.md`, the current active PRD, the package manifests, the deployment workflow, and the relevant standards documents.
5. Write a baseline report containing command, result, timestamp, and evidence tier.

### Phase 1: Reproducible toolchain and checkout

Repair the environment issues in W6, W7, and W8. Use a clean frozen install. Repair case-only paths deliberately. Fix line-ending-sensitive tests, missing test dependencies, generated checks, and package-manager child-process resolution where the repository is responsible for the failure.

Do not hide a failure by weakening a test or excluding a package. If a check is not supported on a platform, document that decision and keep a Linux/Replit CI proof path.

Exit gate:

- the declared Node and pnpm versions are unambiguous;
- clean install succeeds;
- typecheck succeeds;
- generated checks succeed;
- app, skill, validation, and evaluation tests produce a categorized report;
- plugin build and package smoke can run from the documented command path.

### Phase 2: Canonical capability and evidence registry

Implement W2 and W4 before editing public copy. Use the parser and tests as the initial authority. Add the capability matrix, evidence tiers, negative cases, and a generated or checked public summary.

Exit gate:

- every advertised feature has a source path and test or fixture;
- every known limitation has a source path or explicit product decision;
- message flows between pools are described as supported where the tested top-level form is intended;
- unsupported constructs are not described as working;
- no claim of full BPMN 2.0 conformance or executable semantics appears in current copy.

### Phase 3: Mermaid compatibility and host proof

Implement W3 and validate W5 and W9. Extend the integration and smoke matrix to the current Mermaid release. Keep strict security in the browser host. Confirm the external diagram API contract against official Mermaid documentation and source.

Exit gate:

- each advertised Mermaid version passes the agreed matrix;
- the package peer range agrees with that matrix;
- browser host demo passes with default strict security;
- all representative diagram cases render;
- invalid syntax produces an intentional diagnostic;
- browser console has no unexplained errors or warnings;
- accessibility claims are scoped to observed evidence.

### Phase 4: Documentation and release reconciliation

Implement W1 and W8. Update current documents, label history, update `AGENTS.md`, and regenerate committed artifacts according to the decided policy. Correct the package and deployment pages.

At minimum review:

- `README.md`;
- `AGENTS.md`;
- `docs/mermaid-compatibility.md`;
- `docs/capability-ledger.md`;
- `docs/promotion-strategy.md`;
- `app/docs/mermaid-compatibility.md`;
- `app/docs/dsl-spec.md`;
- `app/src/pages/PluginInstallation.tsx`;
- `app/src/pages/About.tsx`;
- `app/src/pages/ReleasePage.tsx`;
- release and compatibility manifests;
- historical PRDs and deployment notes that could be mistaken for current instructions.

Exit gate:

- a new reader can find one current state summary;
- historical snapshots remain identifiable;
- package version, deployed version, source commit, and compatibility data agree;
- stale-claim search is reviewed and exceptions are documented.

### Phase 5: Upstream-readiness review packet

Implement W10. Produce a maintainer packet containing:

- one-page project summary;
- supported subset and explicit non-goals;
- architecture mapping to Mermaid external diagrams;
- install and browser proof;
- compatibility matrix;
- test and CI evidence;
- syntax examples and rationale;
- limitations and open design decisions;
- proposed contribution shapes, ordered from smallest to largest;
- questions for Mermaid maintainers.

Do not present this packet as a pull request unless a separate owner decision selects a contribution shape and approves its scope.

### Phase 6: Outreach preparation only

Prepare, but do not send, the following drafts:

1. A concise technical comment for Mermaid issue #2623.
2. A carefully scoped follow-up for #7699 only if the current issue state and existing comments make a new comment useful rather than repetitive.
3. One Discord message for a relevant Mermaid channel, subject to channel rules and owner approval.
4. A maintainer direct-message draft only if direct messages are appropriate and permitted. Prefer public, searchable context.
5. A possible pull request description or issue proposal, clearly marked `draft`.

Every draft must include the current repository URL, live demo URL, package URL if still current, version and commit evidence, limitations, disclosure of ownership, and a specific question or invitation for technical feedback.

No draft may say or imply that Mermaid maintainers requested BPMN for Mermaid, endorsed it, or accepted it unless a primary source explicitly says so.

## 6. Required verification commands

Run the repository's declared commands from a clean environment and record exact results. At minimum include:

```text
corepack pnpm --version
node --version
corepack pnpm install --frozen-lockfile
corepack pnpm run typecheck
corepack pnpm run build
corepack pnpm run check:generated
corepack pnpm run skill:validate
corepack pnpm run skill:test
corepack pnpm run eval:run
corepack pnpm --filter @workspace/mermaid-diagram-bpmn run test
corepack pnpm run plugin:build
corepack pnpm run plugin:smoke
git diff --check
```

Add the compatibility matrix commands, browser E2E commands, manifest check, package dry-run, and any Windows-specific validation required by the repaired scripts.

The report must distinguish:

- checks run in Replit/Linux;
- checks run locally on Windows;
- checks run in GitHub Actions;
- checks observed on the deployed Pages site;
- checks not run and why.

## 7. Acceptance criteria

The work is ready for owner review only when all of the following are true.

### Technical acceptance

- Clean install and declared toolchain work from the documented commands.
- Typecheck passes without case-only path collisions.
- Application tests, plugin integration tests, skill tests, validators, generated checks, evaluations, build, package build, and package smoke pass.
- The package can be installed from a packed artifact in a clean consumer fixture.
- The package has no accidental React, application, or development-only runtime dependency.
- The Mermaid compatibility matrix is current, versioned, and narrower than or equal to the evidence.
- The browser host demo renders without `securityLevel: "loose"` and without unexplained console failures.
- Parser, model, layout, React renderer, and Mermaid adapter behavior is covered for every advertised feature.
- Negative cases and error messages are stable enough to document.

### Documentation acceptance

- Current and historical documentation are visibly separated.
- `PluginInstallation.tsx` no longer claims that tested cross-pool message flows are unsupported.
- No page advertises parser constructs that the parser does not accept.
- The public subset and non-goals are consistent across README, docs, app routes, manifests, and release material.
- The distinction between open-source Mermaid JS and Mermaid's commercial services is stated wherever affiliation could be misunderstood.
- `AGENTS.md` reflects the final architecture and evidence state.
- Generated artifacts are either synchronized and committed or clearly build-only according to a documented policy.

### Upstream-readiness acceptance

- The maintainer packet is understandable without reading the entire repository.
- It explains what is new, what is deliberately excluded, and what feedback is requested.
- It does not claim official status, BPMN 2.0 completeness, execution semantics, or maintainer endorsement.
- It identifies at least one small contribution shape that Mermaid could evaluate without accepting the entire project.
- It leaves syntax expansion, upstream integration boundaries, and broader conformance as explicit decisions rather than hidden assumptions.

### Outreach acceptance

- Draft messages are technically accurate against the final commit and live deployment.
- Each draft discloses ownership and independent-project status.
- Messages are relevant to the channel and do not repeat identical promotional copy across channels.
- No message is sent, no GitHub comment is posted, no PR is opened, and no Discord campaign begins without a separate explicit authorization.

## 8. Non-goals and prohibited scope expansion

Do not add any of the following as a side effect of this directive:

- backend routes, databases, authentication, accounts, payment, or cloud storage;
- AI API calls or LLM inference inside the application;
- BPMN XML import or export;
- `bpmn-js`, `bpmn-moddle`, or a BPMN execution/runtime dependency;
- executable BPMN semantics, token simulation, or a claim of full BPMN conformance;
- unpinned production CDN dependencies;
- a forced rewrite to Langium or another parser framework without an approved decision;
- a second DSL syntax without a decision record and migration plan;
- changes to Mermaid core or a claim that this repository is already an official Mermaid contribution;
- automated Discord posting, mass issue commenting, artificial engagement, or undisclosed promotion;
- changes to unrelated repositories or corporate branding.

## 9. Handoff artifacts Replit must return

Return a handoff bundle containing:

1. A changed-file map with a reason for every changed file.
2. A baseline-to-final evidence matrix using `confirmed`, `inferred`, `proposal`, and `unknown` tiers.
3. The capability registry and the generated or checked public capability summary.
4. The Mermaid version compatibility matrix.
5. The complete command report, including failures that were repaired.
6. The deployed URL report, exact source commit, package version, and release-manifest state.
7. The list of remaining limitations and open decisions.
8. The upstream maintainer packet.
9. Draft GitHub, Discord, and maintainer messages marked `DO NOT SEND`.
10. A short recommendation for the next owner decision: continue hardening, request maintainer feedback, prepare a PR, or defer outreach.

Do not push or open a pull request as part of this Replit handoff unless the owner separately authorizes that action after reviewing the evidence bundle.

## 10. Outreach drafts to prepare after technical completion

### 10.1 Issue #2623 draft shape

The draft should acknowledge the long-running BPMN support request, state that BPMN for Mermaid is an independent prototype, link the working demo and package, summarize the intentionally descriptive subset, identify the current Mermaid version evidence, and ask maintainers whether the syntax and external-diagram boundary are useful for upstream discussion.

It should not say that the project solves all BPMN requirements. It should not ask maintainers to endorse it merely because it exists. It should make it easy for a maintainer to answer with technical guidance.

### 10.2 Issue #7699 draft shape

Only prepare this after reviewing the current issue body and recent comments. The draft should avoid presenting BPMN for Mermaid as a competing claim to ownership. It should say that an independently maintained readable subset exists and ask whether the maintainers would prefer a comparison, a focused prototype, an external integration, or another contribution boundary.

If an existing comment already communicates the same information, do not post a duplicate merely to increase visibility.

### 10.3 Discord draft shape

The Discord draft should be one concise, relevant message in a channel whose rules permit project sharing. It should identify the author, say that the project is independent, link one technical artifact and one demo, state one limitation, and ask a genuine question. It must not be cross-posted repeatedly or framed as an official Mermaid announcement.

### 10.4 Pull request draft shape

Do not draft a large PR by default. Prepare a PR outline only after maintainer feedback or an owner decision selects a contribution boundary. The outline should include scope, tests, compatibility, accessibility, security, documentation, migration, non-goals, and why the proposed change belongs in Mermaid rather than only in the companion package.

## 11. Evidence ledger for this directive

The following sources informed the directive. Replit must refresh them before using their current-state claims in outreach.

| Source | Publisher or location | Retrieved or observed | Claim supported |
|---|---|---:|---|
| `AGENTS.md` | Repository | 2026-08-21 | Project identity, architecture, scope boundaries, commands, and generated-file policy |
| `app/src/lib/bpmn-parser.ts` | Repository | 2026-08-21 | Parser syntax and current grammar boundary |
| `app/src/lib/bpmn-plugin.ts` | Repository | 2026-08-21 | Mermaid adapter and message-flow rendering path |
| `app/e2e/host-demo.spec.ts` | Repository | 2026-08-21 | Browser coverage for flat, gateway, pool/lane, message-flow, invalid-source, and strict-security cases |
| `.github/workflows/ci.yml` and `.github/workflows/deploy-gh-pages.yml` | Repository | 2026-08-21 | CI and Pages gates |
| `lib/bpmn-plugin/package.json` | Repository | 2026-08-21 | Package version, exports, peer declaration, and build boundary |
| `https://mermaid.js.org/` | Mermaid official documentation | 2026-08-21 | Current official site version shown as Mermaid 11.17.0 and open-source/community positioning |
| `https://mermaid.js.org/syntax/swimlanes` | Mermaid official documentation | 2026-08-21 | Current swimlane-beta status and Mermaid's documented responsibility-oriented process-diagram direction |
| `https://mermaid.js.org/config/setup/mermaid/interfaces/ExternalDiagramDefinition.html` | Mermaid official API documentation | 2026-08-21 | External diagram contract properties: `id`, `detector`, and `loader` |
| `https://mermaid.js.org/community/intro` | Mermaid official community documentation | 2026-08-21 | Contribution pathways and Discord as a closer community contact channel |
| `https://mermaid.js.org/community/contributing.html` | Mermaid official contribution documentation | 2026-08-21 | Contribution workflow and expectations for code, docs, testing, and feature work |
| `https://github.com/mermaid-js/mermaid/issues/2623` | Mermaid GitHub repository | 2026-08-21 | Open BPMN support issue and its current labels/status |
| `https://github.com/mermaid-js/mermaid/issues/7699` | Mermaid GitHub repository | 2026-08-21 | Open native BPMN proposal and the need to verify current discussion state before engaging |
| `https://github.com/mermaid-js/mermaid/issues/2028` | Mermaid GitHub repository | 2026-08-21 | Historical and current swimlane demand, with substantial community engagement |
| `https://github.com/mermaid-js/mermaid/issues/6608` | Mermaid GitHub repository | 2026-08-21 | Swimlane proposal and responsibility-aware process use cases |
| `https://github.com/mermaid-js/mermaid/issues/7967` | Mermaid GitHub repository | 2026-08-21 | Current swimlane readability signal to verify before using as an opportunity |

## 12. Community signal discovery and opportunity ledger

The technical work must be connected to real public needs, but Replit must not invent demand. After the repository is technically reconciled, create a living opportunity ledger at `docs/mermaid-community-opportunity-ledger.md`.

The ledger is a research and routing artifact, not a list of targets to pressure. It must record public signals from the following source classes:

- Mermaid's official documentation, contribution guide, release notes, and documented extension APIs;
- the `mermaid-js/mermaid` GitHub issues, pull requests, discussions, labels, and project announcements;
- Mermaid's official Discord, only through publicly visible content or an explicitly authorized logged-in session and only in accordance with channel rules;
- public Mermaid-related discussions on Reddit, Stack Overflow, Hacker News, Mastodon, Bluesky, and other forums where current rules permit participation;
- npm package and integration context where users report installation, compatibility, or extension needs;
- public examples, blog posts, and issue threads from tools that use Mermaid and demonstrate process-modeling needs.

Do not treat search-result snippets, unverified reposts, private conversations, or anonymous claims as confirmed requirements. Do not scrape or monitor private channels. Do not collect personal data beyond what is necessary to cite a public source and understand the technical request.

### 12.1 Signal search protocol

At each research pass:

1. Record the retrieval date, source URL, platform, source type, and whether the source is official, community, or third-party.
2. Search for more than `BPMN`. Include terms such as `process diagram`, `business process`, `swimlane`, `pool`, `lane`, `actor`, `team`, `system`, `handoff`, `message flow`, `workflow`, `data object`, `process modeling`, `BPMN XML`, `readability`, `long title`, and `cross-functional process`.
3. Read the full issue or discussion context before classifying a signal. Capture the user's actual need in a short paraphrase, not a sensationalized quote.
4. Record current status, labels, maintainers' responses, related issues, and whether a competing or overlapping implementation already exists.
5. Map the signal to the repository's capability registry. Mark the relationship as `directly addressed`, `partially addressed`, `adjacent`, `not addressed`, or `unknown`.
6. Cite the exact implementation, test, demo, or documentation evidence that supports the mapping.
7. Record the limitation or risk that must be disclosed in any response.
8. Recommend exactly one next action: observe, improve the product, ask a technical question, prepare a response, request maintainer guidance, or do not engage.

### 12.2 Initial signal seeds to refresh

These are starting points for the ledger, not permanent claims. Refresh their status and discussion content before using them in outreach:

| Signal | Current relevance to investigate | Required posture |
|---|---|---|
| [Mermaid #2623](https://github.com/mermaid-js/mermaid/issues/2623) | Long-running BPMN support request | Offer the working descriptive prototype as evidence and ask what contribution shape would help |
| [Mermaid #7699](https://github.com/mermaid-js/mermaid/issues/7699) | Native BPMN proposal and upstream design discussion | Treat as an existing proposal to understand and complement, not a rival to attack |
| [Mermaid #2028](https://github.com/mermaid-js/mermaid/issues/2028) | Strong historical demand for swimlanes and responsibility-aware process diagrams | Compare the project's pool/lane model with current Mermaid swimlane direction and disclose differences |
| [Mermaid #6608](https://github.com/mermaid-js/mermaid/issues/6608) | Proposal for swimlanes in flowcharts | Determine whether the request is now resolved, superseded, or still useful as evidence of user need |
| [Mermaid #7967](https://github.com/mermaid-js/mermaid/issues/7967) | Readability problem involving long swimlane titles and many connections | Use as a layout-stress signal only if current status and wording still support that interpretation |

The official Mermaid contribution guide says contributors can help through code, documentation, new features, bug confirmation, and community interaction, and points people toward Discord for closer contact. Record that guidance as context, not as an invitation to bypass maintainer review. See [Getting Started](https://mermaid.js.org/community/intro) and the [contribution guide](https://mermaid.js.org/community/contributing.html).

### 12.3 Required opportunity-ledger fields

Every ledger row must contain:

- signal ID;
- platform and URL;
- retrieval date;
- source authority;
- short user-need paraphrase;
- direct quote only when necessary and within applicable copyright limits;
- current status and last maintainer or community response;
- related Mermaid feature or issue;
- BPMN for Mermaid relationship;
- evidence tier;
- exact supporting repository path, test, package, or live route;
- material limitation or counterexample;
- proposed response value;
- audience and suitable channel;
- risk of appearing repetitive, competitive, or promotional;
- owner decision required;
- disposition and next review date.

No signal becomes a campaign target merely because it has many reactions. Reactions indicate attention, not authorization or technical fit.

## 13. Value communication and contributor identity guardrails

The purpose of outreach is to make the project useful to the Mermaid community and to earn credible participation status through service. It is not to manufacture the appearance that Jamie is already a primary, core, official, or leading Mermaid contributor.

### 13.1 Value proposition format

For each public need, use this five-part structure:

1. **Observed need:** what a public user or maintainer actually requested.
2. **Relevant project capability:** the smallest shipped feature that may help.
3. **Evidence:** test, package, browser demo, or source link.
4. **Boundary:** what the project does not solve.
5. **Invitation:** one precise question or offer to collaborate.

Example:

> Mermaid users have repeatedly asked about responsibility-aware process diagrams. BPMN for Mermaid provides an independent `bpmn-beta` prototype with pools, lanes, sequence flows, conditional flows, and tested top-level message flows. The package is not an official Mermaid diagram type and does not implement full BPMN 2.0 or BPMN XML. Would a maintainer prefer a syntax comparison, an external-plugin evaluation, or a smaller upstream prototype?

Do not use “Mermaid is deficient” as the lead. Use “this public need remains difficult,” then show how the prototype may reduce uncertainty. Do not imply that the existence of a prototype proves that Mermaid should accept it.

### 13.2 Contributor-status ladder

Create `docs/community-contribution-evidence.md` and maintain an evidence-backed status ladder:

| Status | Evidence required | Permitted wording |
|---|---|---|
| Observer | Publicly follows and researches the project | Mermaid community observer or participant in public discussions |
| Participant | Substantive, disclosed questions, examples, bug reports, or documentation feedback | Active participant in the Mermaid community |
| Contributor | Accepted code, documentation, test, triage, or other contribution in the Mermaid project or an explicitly recognized community effort | Mermaid contributor, only when the accepted contribution is linked |
| Recurring contributor | Multiple accepted contributions or a sustained maintainer-recognized role | Recurring community contributor, with evidence |
| Maintainer or core member | Explicit project-granted role or repository permission | Use only the exact role granted by Mermaid |

“Primary member of the community,” “core contributor,” “official partner,” “Mermaid maintainer,” and similar claims are prohibited unless a primary Mermaid source grants or uses that title. Owning BPMN for Mermaid, posting messages, receiving reactions, or opening a pull request is not sufficient evidence by itself.

The project may accurately say that Jamie maintains BPMN for Mermaid and is seeking to contribute to the Mermaid ecosystem. It may not convert aspiration into status.

### 13.3 Evidence of service to the community

Prioritize contribution actions that are independently useful even if Mermaid never adopts BPMN for Mermaid:

- reproduce and clarify existing Mermaid issues;
- improve documentation or examples where permitted;
- provide a small isolated test case;
- answer questions without hijacking unrelated threads;
- share a limitation or workaround transparently;
- offer a focused prototype only when maintainers indicate it is useful;
- respond to feedback and correct public claims quickly;
- maintain compatibility and package documentation for people trying the companion project.

Track accepted contributions, maintainer feedback, and corrections in the evidence file. Do not count impressions, stars, reactions, follower growth, or message volume as contribution proof.

## 14. Outreach, monitoring, and response control plane

Create `docs/mermaid-community-engagement-runbook.md` with the following gates. Replit may prepare artifacts and collect publicly available signals, but it must stop before external communication unless the owner authorizes the specific channel and action.

### Gate C0: Evidence ready

The technical acceptance criteria in Section 7 pass. The live deployment, package, compatibility matrix, capability registry, and limitation language agree. No outreach may start while a stranger can encounter a broken install, contradictory feature claim, or unexplained browser failure.

### Gate C1: Opportunity fit

The opportunity ledger row shows a real public need, a direct or clearly labeled partial fit, and a specific value to the audience. If the fit is merely adjacent, say so. If the fit is unknown, ask a question rather than promoting the product.

### Gate C2: Channel and identity check

Before drafting or sending:

- confirm the channel's current rules;
- confirm whether project sharing, links, self-promotion, or direct messages are allowed;
- use the correct official account or user identity;
- disclose that Jamie maintains the companion project;
- ensure the message is addressed to a technical audience rather than a commercial marketing list;
- check whether the same information was recently posted;
- avoid private or sensitive data.

### Gate C3: Draft review

Prepare one channel-specific draft. It must contain one value proposition, one evidence link, one limitation, and one question. Mark drafts `DO NOT SEND` until owner approval. Do not copy a GitHub comment into Discord without adapting it to the channel.

### Gate C4: Single authorized action

The owner authorizes the exact action, destination, text, and timing. A general instruction to promote the project is not permission to message every platform, contact maintainers privately, open a PR, or automate posting.

For GitHub actions, inspect existing comments and PRs first, use the repository's GitHub workflow, and avoid duplicate comments. If a PR is authorized, create a feature branch, preserve mixed-worktree changes, stage only confirmed paths, and default to a draft PR unless the owner explicitly requests otherwise.

For Discord, send only where channel rules permit it. Do not use bots, automation, repeated cross-posting, unsolicited mass direct messages, or artificial reactions. If the user is already a member of a private channel, that does not make the channel public or authorize disclosure of its contents.

For Reddit, Stack Overflow, Hacker News, Mastodon, Bluesky, or other services, use the platform's current rules and answer the underlying question first. Do not place a promotional link in an unrelated thread. If no relevant public request exists, do not manufacture one.

### Gate C5: Response and correction

After an authorized message:

- record URL, timestamp, exact text, and destination;
- monitor only the public response context that is needed;
- answer factual questions with evidence;
- acknowledge limitations;
- correct errors visibly and promptly;
- do not argue with maintainers or users about adoption;
- stop if a maintainer requests no further promotion or if a channel moderator removes the message.

### Gate C6: Outcome review

Classify the result as `technical feedback`, `maintainer guidance`, `contributor opportunity`, `user interest`, `no signal`, `moderation concern`, or `unknown`. Do not classify silence as rejection or acceptance. Use the result to update the opportunity ledger and the next-action recommendation.

## 15. Outreach asset package

After Gates C0 through C2 pass, Replit should prepare the following assets without sending them:

1. A two-sentence project description.
2. A technical README excerpt with install and browser-demo links.
3. A one-page capability and limitation sheet.
4. A maintainer-facing architecture summary.
5. A GitHub issue response for #2623.
6. A non-duplicate, conditional response for #7699.
7. A response template for a relevant swimlane or readability signal.
8. A concise Discord message for a channel that permits project sharing.
9. A question-first reply template for Reddit, Stack Overflow, Hacker News, Mastodon, or Bluesky when a genuine relevant request is found.
10. A pull-request outline that remains a draft until Mermaid maintainers or the owner select its scope.
11. A contributor evidence statement that uses only earned status language.
12. A source ledger with retrieval dates and uncertainty notes.

Each asset must have a `last verified against` commit and a list of links that need refreshing before publication. No asset may contain a hard-coded claim that the project is official, accepted, primary, core, endorsed, or commercially integrated.

## 16. Revised final instruction to Replit

Execute the hardening work in small, reviewable changes. Resolve every confirmed deployability, documentation, compatibility, test, packaging, accessibility, and evidence weakness that prevents a stranger from successfully evaluating the project. Then research public Mermaid-community signals and map only genuine needs to verified project capabilities.

Communicate the value as a service to the open-source Mermaid ecosystem. Do not attack Mermaid, its maintainers, competing proposals, or Mermaid's commercial company. Do not manufacture the appearance that Jamie is already a primary or official Mermaid contributor. Earn stronger contributor language through independently verifiable accepted work.

When the acceptance criteria and community-signal ledger are complete, stop and return the full handoff bundle. The next action is an owner decision about the exact GitHub, Discord, or other channel action. No automatic campaign, mass outreach, private message, pull request, or publication is permitted under this directive alone.
