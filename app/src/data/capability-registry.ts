/**
 * capability-registry.ts
 *
 * Single source of truth for every public BPMN element and plugin integration
 * claim made by this project.
 *
 * Evidence tiers (in ascending order of verification strength):
 *   packaged        — built .tgz artifact verified in a clean-install smoke test
 *   source-verified — verified via real mermaid.render() in happy-dom integration tests
 *   implemented     — implemented in the React playground (BpmnRenderer); not integration-tested
 *   experimental    — works in playground; stability caveats apply
 *   deferred        — on the roadmap; work not yet started
 *   out-of-scope    — explicitly excluded from v1
 *
 * Authoring rules:
 *   - Only promote a claim when backing evidence from a named test or fixture exists.
 *   - Do not use 'source-verified' unless a specific Vitest integration test
 *     (bpmn-plugin-integration.test.ts) or smoke test (fixtures/plugin-smoke/smoke.mjs)
 *     makes an explicit assertion that covers the claim.
 *   - 'packaged' applies to the plugin adapter as a whole, not to individual BPMN elements.
 *
 * Backing evidence files:
 *   app/src/lib/__tests__/bpmn-plugin-integration.test.ts  — Mermaid integration test
 *   app/src/__tests__/mermaid-host-demo.test.tsx           — browser host test (no loose)
 *   fixtures/plugin-smoke/smoke.mjs                        — clean-install smoke (12 assertions)
 *   app/examples/01-linear-process.mmd                     — flat diagram corpus
 *   app/examples/08-purchase-order-approval.mmd            — pool/lane corpus
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Evidence tier for a single capability claim. */
export type EvidenceTier =
  | 'packaged'         // built artifact, clean-install smoke test
  | 'source-verified'  // mermaid.render() integration test
  | 'implemented'      // React playground (BpmnRenderer) only
  | 'experimental'     // playground only; stability caveats
  | 'deferred'         // on roadmap; not yet started
  | 'out-of-scope';    // explicitly excluded from v1

/** A single BPMN element or feature capability claim. */
export interface BpmnCapability {
  id: string;
  label: string;
  tier: EvidenceTier;
  /** Test file or corpus fixture that provides the backing assertion */
  evidence?: string;
}

/** A plugin integration capability (adapter-level, not element-level). */
export interface PluginCapability {
  id: string;
  label: string;
  tier: EvidenceTier;
  evidence?: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// BPMN element capability registry
// ---------------------------------------------------------------------------

/**
 * Every BPMN element or feature that this project makes a public claim about.
 *
 * 'source-verified' items are those where bpmn-plugin-integration.test.ts
 * makes an explicit SVG class assertion (e.g. `expect(svg).toContain('bpmn-task')`).
 *
 * 'implemented' items work in the React playground (BpmnRenderer) and have unit
 * test coverage, but are not exercised by the Mermaid integration test.
 */
export const BPMN_CAPABILITIES: BpmnCapability[] = [
  // ── source-verified: asserted by bpmn-plugin-integration.test.ts ──────────
  {
    id: 'start-events',
    label: 'Start events',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — bpmn-event class assertion (01-linear-process.mmd)',
  },
  {
    id: 'end-events',
    label: 'End events',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — bpmn-event class assertion',
  },
  {
    id: 'task-generic',
    label: 'Generic tasks',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — bpmn-task class assertion',
  },
  {
    id: 'task-user',
    label: 'User tasks (person marker)',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — 01-linear-process.mmd uses task:user',
  },
  {
    id: 'task-service',
    label: 'Service tasks (gear marker)',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — 08-purchase-order-approval.mmd uses task:service',
  },
  {
    id: 'gateway-xor',
    label: 'XOR gateways',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — bpmn-gateway class assertion (08-purchase-order)',
  },
  {
    id: 'flow-sequence',
    label: 'Sequence flows (-->)',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — bpmn-flow-sequence class assertion',
  },
  {
    id: 'flow-conditional-label',
    label: 'Conditional flow labels',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — bpmn-flow-conditional class (08-purchase-order "yes"/"no")',
  },
  {
    id: 'theme-styling',
    label: 'Theme-aware SVG styling',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — FR-018 live theme-variable binding describe block',
  },
  {
    id: 'pools',
    label: 'Pools (headers, containers)',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — bpmn-pool class assertion (08-purchase-order)',
  },
  {
    id: 'lanes',
    label: 'Lanes (one level deep)',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — bpmn-lane class assertion (08-purchase-order)',
  },
  {
    id: 'pool-lane-layout',
    label: 'Pool/lane-aware layout',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — 08-purchase-order renders without throwing',
  },

  // ── implemented: React playground only (unit-tested; not in Mermaid integration test) ─
  {
    id: 'task-script',
    label: 'Script tasks (script marker)',
    tier: 'implemented',
    evidence: 'bpmn-parser.test.ts, bpmn-renderer.test.tsx',
  },
  {
    id: 'task-receive',
    label: 'Receive tasks (envelope marker)',
    tier: 'implemented',
    evidence: 'bpmn-parser.test.ts, bpmn-renderer.test.tsx',
  },
  {
    id: 'task-send',
    label: 'Send tasks (filled envelope)',
    tier: 'implemented',
    evidence: 'bpmn-parser.test.ts, bpmn-renderer.test.tsx',
  },
  {
    id: 'gateway-and',
    label: 'AND gateways',
    tier: 'implemented',
    evidence: 'bpmn-parser.test.ts, bpmn-renderer.test.tsx',
  },
  {
    id: 'gateway-or',
    label: 'OR gateways',
    tier: 'implemented',
    evidence: 'bpmn-parser.test.ts, bpmn-renderer.test.tsx',
  },
  {
    id: 'flow-default',
    label: 'Default flow marker (==>)',
    tier: 'implemented',
    evidence: 'bpmn-parser.test.ts',
  },
  {
    id: 'acc-title-descr',
    label: 'accTitle / accDescr directives',
    tier: 'implemented',
    evidence: 'bpmn-parser.test.ts — acc directives; corpus files include accTitle/accDescr',
  },
  {
    id: 'auto-layout',
    label: 'Auto left-to-right layout',
    tier: 'implemented',
    evidence: 'bpmn-layout.test.ts',
  },

  // ── experimental ──────────────────────────────────────────────────────────
  {
    id: 'message-flows',
    label: 'Message flows (~~>)',
    tier: 'experimental',
  },
  {
    id: 'cross-pool-routing',
    label: 'Cross-pool flow routing',
    tier: 'experimental',
  },

  // ── deferred ──────────────────────────────────────────────────────────────
  {
    id: 'langium-grammar',
    label: 'Formal Langium grammar',
    tier: 'deferred',
  },
  {
    id: 'intermediate-events',
    label: 'Intermediate events',
    tier: 'deferred',
  },
  {
    id: 'event-markers',
    label: 'Timer / message / error markers',
    tier: 'deferred',
  },
  {
    id: 'deterministic-layout',
    label: 'Deterministic pool/lane layout',
    tier: 'deferred',
  },
  {
    id: 'parser-domain-rules',
    label: 'Parser-enforced BPMN domain rules',
    tier: 'deferred',
  },
  {
    id: 'shape-extraction',
    label: 'Shape extraction from renderer',
    tier: 'deferred',
  },

  // ── out of scope ──────────────────────────────────────────────────────────
  { id: 'xml-import-export',    label: 'BPMN XML import / export',        tier: 'out-of-scope' },
  { id: 'execution-semantics',  label: 'Full BPMN 2.0 execution semantics', tier: 'out-of-scope' },
  { id: 'bpmnjs-runtime',       label: 'bpmn-js runtime dependency',      tier: 'out-of-scope' },
  { id: 'choreography',         label: 'Choreography diagrams',            tier: 'out-of-scope' },
  { id: 'conversation',         label: 'Conversation diagrams',            tier: 'out-of-scope' },
  { id: 'event-subprocesses',   label: 'Event subprocesses',               tier: 'out-of-scope' },
  { id: 'complex-gateways',     label: 'Complex gateways',                 tier: 'out-of-scope' },
];

// ---------------------------------------------------------------------------
// Plugin integration capability registry
// ---------------------------------------------------------------------------

/**
 * Adapter-level (plugin) capabilities — distinct from individual BPMN elements.
 * These cover the integration path (Mermaid host, package artifact, browser).
 */
export const PLUGIN_CAPABILITIES: PluginCapability[] = [
  {
    id: 'plugin-package',
    label: '@okhp3/mermaid-diagram-bpmn package',
    tier: 'packaged',
    evidence: 'fixtures/plugin-smoke/smoke.mjs — 12/12 smoke assertions pass on clean install',
    note: 'npm pack produces dist/index.mjs, dist/index.cjs, dist/index.d.ts, dist/index.d.cts',
  },
  {
    id: 'register-external-diagrams',
    label: 'mermaid.registerExternalDiagrams() API',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — registerExternalDiagrams + mermaid.render() called',
  },
  {
    id: 'real-browser-default-security',
    label: 'Component does not pass securityLevel:"loose" to mermaid.initialize()',
    tier: 'implemented',
    evidence: 'mermaid-host-demo.test.tsx — mocked unit test asserts init call omits securityLevel:"loose". Live route /mermaid-host-demo confirms real-browser rendering manually. Automated Playwright E2E is deferred (task #185).',
    note: 'Tier is "implemented" (mocked unit test, not real mermaid.render()). Automated real-browser E2E would upgrade this to browser-verified.',
  },
  {
    id: 'theme-variable-binding',
    label: 'Live theme-variable binding (FR-018)',
    tier: 'source-verified',
    evidence: 'bpmn-plugin-integration.test.ts — "FR-018: live theme-variable binding" describe block',
  },
];

// ---------------------------------------------------------------------------
// Convenience groupings (used by support matrix on Home page)
// ---------------------------------------------------------------------------

/** Items that work in a real Mermaid host (source-verified or packaged). */
export const BPMN_MERMAID_VERIFIED = BPMN_CAPABILITIES.filter(
  c => c.tier === 'source-verified' || c.tier === 'packaged',
);

/** Items implemented in the React playground only (not Mermaid integration-tested). */
export const BPMN_PLAYGROUND_ONLY = BPMN_CAPABILITIES.filter(
  c => c.tier === 'implemented',
);

/** Experimental items. */
export const BPMN_EXPERIMENTAL = BPMN_CAPABILITIES.filter(c => c.tier === 'experimental');

/** Deferred items. */
export const BPMN_DEFERRED = BPMN_CAPABILITIES.filter(c => c.tier === 'deferred');

/** Out-of-scope items. */
export const BPMN_OUT_OF_SCOPE = BPMN_CAPABILITIES.filter(c => c.tier === 'out-of-scope');
