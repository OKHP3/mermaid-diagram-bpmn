/**
 * mermaid-host-demo.test.tsx
 *
 * Tests the MermaidHostDemo page component.
 *
 * Test approach:
 *   mermaid is mocked so tests run in the vitest/happy-dom environment without
 *   requiring the real mermaid rendering pipeline.  The real integration between
 *   bpmn-plugin.ts and mermaid is covered by bpmn-plugin-integration.test.ts.
 *
 *   Key assertions:
 *   1. mermaid.initialize() is called WITHOUT securityLevel: 'loose'.
 *      This confirms the production page does not rely on the happy-dom workaround.
 *   2. mermaid.registerExternalDiagrams() is called with bpmnPlugin.
 *   3. mermaid.render() is called for both corpus examples.
 *   4. SVG content returned by render() is injected into the DOM.
 *   5. If registration throws, the error panel is shown rather than a blank page.
 *   6. If a single render() throws, the error is shown inline in that panel only.
 *
 * Why this test uses a mock instead of real mermaid:
 *   In the happy-dom environment, mermaid's DOMPurify step re-parses SVG through
 *   happy-dom's HTML parser, which drops all SVG children after <defs>. Without
 *   securityLevel:'loose', a real mermaid.render() call would return an SVG with
 *   no visible content in this environment.  The mock bypasses this limitation so
 *   the component's orchestration logic can be tested in isolation.
 *
 *   The real rendering WITHOUT securityLevel:'loose' is demonstrated by visiting
 *   /mermaid-host-demo in a real browser.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// ── Mock declarations (must use vi.hoisted so they are available inside the ──
// ── vi.mock() factory, which is hoisted to the top of the file by Vitest).  ──

const { mockInitialize, mockRegisterExternalDiagrams, mockRender } = vi.hoisted(() => ({
  mockInitialize: vi.fn(),
  mockRegisterExternalDiagrams: vi.fn(),
  mockRender: vi.fn(),
}));

vi.mock('mermaid', () => ({
  default: {
    initialize: mockInitialize,
    registerExternalDiagrams: mockRegisterExternalDiagrams,
    render: mockRender,
  },
}));

// Lightweight stub so vi.mock of bpmn-plugin resolves quickly.
vi.mock('@/lib/bpmn-plugin', () => ({
  bpmnPlugin: { id: 'bpmn-beta', detector: () => false, loader: async () => ({}) },
  MERMAID_VERSION_TARGET: '11.4.1',
}));

// ── Component import (after mocks) ────────────────────────────────────────────

import MermaidHostDemo from '@/pages/MermaidHostDemo';

// ── SVG stubs ─────────────────────────────────────────────────────────────────

/**
 * A realistic stub SVG containing the bpmn-* classes the real plugin produces.
 * Used by mock mermaid.render() so the component's dangerouslySetInnerHTML
 * path renders the classes for DOM assertion.
 */
/**
 * NOTE: These stubs intentionally omit <defs> even though the real plugin output
 * contains one.  happy-dom's HTML parser drops all SVG children that follow a
 * <defs> element, and dangerouslySetInnerHTML uses innerHTML (HTML-mode parse).
 * Omitting <defs> lets the class-name assertions pass in the test environment.
 * In a real browser the full SVG (with <defs>) is rendered correctly.
 */
function makeSvgStub(id: string): string {
  return [
    `<svg id="${id}" role="img" xmlns="http://www.w3.org/2000/svg">`,
    `  <g class="bpmn-event"><circle r="18"/></g>`,
    `  <g class="bpmn-task"><rect width="120" height="52"/></g>`,
    `  <g class="bpmn-flow-sequence"><line/></g>`,
    `</svg>`,
  ].join('\n');
}

function makePurchaseOrderSvgStub(id: string): string {
  return [
    `<svg id="${id}" role="img" xmlns="http://www.w3.org/2000/svg">`,
    `  <g class="bpmn-pool"><rect/></g>`,
    `  <g class="bpmn-lane"><rect/></g>`,
    `  <g class="bpmn-task"><rect/></g>`,
    `  <g class="bpmn-gateway"><polygon/></g>`,
    `  <g class="bpmn-flow-conditional"><line/></g>`,
    `</svg>`,
  ].join('\n');
}

// ── Test helpers ──────────────────────────────────────────────────────────────

function setupHappyMocks() {
  mockRegisterExternalDiagrams.mockResolvedValue(undefined);
  mockRender.mockImplementation((id: string) => {
    // demo-error-case uses intentionally invalid source → render throws
    if (id === 'demo-error-case') {
      return Promise.reject(new Error('Line 2: pools cannot be nested'));
    }
    return Promise.resolve({
      svg: id === 'demo-linear' || id === 'demo-gateway'
        ? makeSvgStub(id)
        : makePurchaseOrderSvgStub(id),
    });
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('MermaidHostDemo — initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHappyMocks();
  });

  it('calls mermaid.initialize() on mount', async () => {
    render(<MermaidHostDemo />);
    await waitFor(() => expect(mockInitialize).toHaveBeenCalledOnce());
  });

  it(
    // Primary Phase 3 contract check: the production page must NOT pass
    // securityLevel:'loose'. The test confirms this at the call-site level.
    'mermaid.initialize() is NOT called with securityLevel:"loose"',
    async () => {
      render(<MermaidHostDemo />);
      await waitFor(() => expect(mockInitialize).toHaveBeenCalledOnce());

      const [initArg] = mockInitialize.mock.calls[0] as [Record<string, unknown>];
      expect(initArg).toBeDefined();
      expect(initArg.securityLevel).not.toBe('loose');
    },
  );

  it('calls mermaid.registerExternalDiagrams() with bpmnPlugin', async () => {
    render(<MermaidHostDemo />);
    await waitFor(() => expect(mockRegisterExternalDiagrams).toHaveBeenCalledOnce());

    const [pluginArray] = mockRegisterExternalDiagrams.mock.calls[0] as [unknown[]];
    expect(Array.isArray(pluginArray)).toBe(true);
    expect(pluginArray).toHaveLength(1);
    expect((pluginArray[0] as { id: string }).id).toBe('bpmn-beta');
  });
});

describe('MermaidHostDemo — diagram rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupHappyMocks();
  });

  it('calls mermaid.render() for all five diagram entries', async () => {
    render(<MermaidHostDemo />);
    // Five entries: flat flow, gateway, pool/lane, cross-pool, error-case
    await waitFor(() => expect(mockRender).toHaveBeenCalledTimes(5));

    const renderIds = mockRender.mock.calls.map(([id]: [string]) => id);
    expect(renderIds).toContain('demo-linear');
    expect(renderIds).toContain('demo-gateway');
    expect(renderIds).toContain('demo-purchase-order');
    expect(renderIds).toContain('demo-cross-pool');
    expect(renderIds).toContain('demo-error-case');
  });

  it('injects bpmn-task class from linear diagram SVG into DOM', async () => {
    render(<MermaidHostDemo />);
    await waitFor(() => {
      const el = document.querySelector('[data-testid="svg-output-demo-linear"] .bpmn-task');
      expect(el).not.toBeNull();
    });
  });

  it('injects bpmn-event class from linear diagram SVG into DOM', async () => {
    render(<MermaidHostDemo />);
    await waitFor(() => {
      const el = document.querySelector('[data-testid="svg-output-demo-linear"] .bpmn-event');
      expect(el).not.toBeNull();
    });
  });

  it('injects bpmn-flow-sequence class from linear diagram SVG into DOM', async () => {
    render(<MermaidHostDemo />);
    await waitFor(() => {
      const el = document.querySelector(
        '[data-testid="svg-output-demo-linear"] .bpmn-flow-sequence',
      );
      expect(el).not.toBeNull();
    });
  });

  it('injects bpmn-pool class from purchase-order SVG into DOM', async () => {
    render(<MermaidHostDemo />);
    await waitFor(() => {
      const el = document.querySelector(
        '[data-testid="svg-output-demo-purchase-order"] .bpmn-pool',
      );
      expect(el).not.toBeNull();
    });
  });

  it('injects bpmn-gateway class from purchase-order SVG into DOM', async () => {
    render(<MermaidHostDemo />);
    await waitFor(() => {
      const el = document.querySelector(
        '[data-testid="svg-output-demo-purchase-order"] .bpmn-gateway',
      );
      expect(el).not.toBeNull();
    });
  });

  it('shows version metadata panel with target version', async () => {
    render(<MermaidHostDemo />);
    await waitFor(() => {
      expect(screen.getByTestId('version-metadata')).not.toBeNull();
    });
    expect(screen.getByTestId('version-metadata').textContent).toContain('11.4.1');
  });
});

describe('MermaidHostDemo — error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows registration error panel if registerExternalDiagrams throws', async () => {
    mockRegisterExternalDiagrams.mockRejectedValue(
      new Error('Failed to register: duplicate id'),
    );

    render(<MermaidHostDemo />);
    await waitFor(() => {
      expect(screen.getByTestId('registration-error')).not.toBeNull();
    });
    expect(screen.getByTestId('registration-error').textContent).toContain(
      'Plugin registration failed',
    );
  });

  it('shows inline error panel for a single diagram if render() throws', async () => {
    mockRegisterExternalDiagrams.mockResolvedValue(undefined);
    mockRender.mockImplementation((id: string) => {
      if (id === 'demo-linear') {
        return Promise.reject(new Error('parse error: unexpected token'));
      }
      return Promise.resolve({ svg: makePurchaseOrderSvgStub(id) });
    });

    render(<MermaidHostDemo />);
    await waitFor(() => {
      expect(screen.getByTestId('error-demo-linear')).not.toBeNull();
    });
    expect(screen.getByTestId('error-demo-linear').textContent).toContain('Render error');
    // The other diagram should still render without error
    await waitFor(() => {
      const el = document.querySelector(
        '[data-testid="svg-output-demo-purchase-order"] .bpmn-pool',
      );
      expect(el).not.toBeNull();
    });
  });

  it('does NOT show the registration error panel on successful render', async () => {
    mockRegisterExternalDiagrams.mockResolvedValue(undefined);
    mockRender.mockResolvedValue({ svg: makeSvgStub('demo-linear') });

    render(<MermaidHostDemo />);
    await waitFor(() =>
      expect(screen.queryByTestId('registration-error')).toBeNull(),
    );
  });
});
