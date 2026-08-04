import { describe, it, expect } from 'vitest';
import {
  getStyles,
  buildMermaidTheme,
  LIGHT_THEME,
  MERMAID_FALLBACK_THEME,
  type BpmnThemeOptions,
} from '../bpmn-styles';

// Concrete theme used across structural tests so changes to LIGHT_THEME
// (which uses CSS custom properties) don't break assertion matching.
const CONCRETE_THEME: BpmnThemeOptions = {
  lineColor:    '#aabbcc',
  mainBkg:      '#111111',
  nodeBorder:   '#222222',
  clusterBkg:   '#333333',
  textColor:    '#444444',
  primaryColor: '#555555',
};

// ── Class-name presence ───────────────────────────────────────────────────────

describe('getStyles — required class names', () => {
  const css = getStyles(CONCRETE_THEME);

  const REQUIRED_CLASSES = [
    '.bpmn-event',
    '.bpmn-event-end',
    '.bpmn-event-start-inner',
    '.bpmn-task',
    '.bpmn-task-hover',
    '.bpmn-task-ext',
    '.bpmn-task-marker',
    '.bpmn-task-text',
    '.bpmn-gateway',
    '.bpmn-gateway-marker',
    '.bpmn-gateway-or-marker',
    '.bpmn-pool',
    '.bpmn-pool-header',
    '.bpmn-lane',
    '.bpmn-lane-header',
    '.bpmn-flow-sequence',
    '.bpmn-flow-conditional',
    '.bpmn-flow-default',
    '.bpmn-flow-message',
    '.bpmn-flow-association',
    '.bpmn-arrow',
    '.bpmn-arrow-open',
    '.bpmn-slash',
    '.bpmn-text',
    '.bpmn-text-muted',
    '.bpmn-text-label',
  ];

  for (const cls of REQUIRED_CLASSES) {
    it(`contains ${cls}`, () => {
      expect(css).toContain(cls);
    });
  }
});

// ── Theme value interpolation ─────────────────────────────────────────────────

describe('getStyles — color values are applied', () => {
  const css = getStyles(CONCRETE_THEME);

  it('uses lineColor for flow strokes', () => {
    // .bpmn-flow-sequence { stroke: <lineColor> ... }
    expect(css).toContain(`stroke: ${CONCRETE_THEME.lineColor}`);
  });

  it('uses mainBkg for task and event fill', () => {
    // .bpmn-task { fill: <mainBkg> ... }
    expect(css).toContain(`fill: ${CONCRETE_THEME.mainBkg}`);
  });

  it('uses nodeBorder for task and pool stroke', () => {
    expect(css).toContain(`stroke: ${CONCRETE_THEME.nodeBorder}`);
  });

  it('uses clusterBkg for pool-header and lane-header fill', () => {
    expect(css).toContain(`fill: ${CONCRETE_THEME.clusterBkg}`);
  });

  it('uses textColor for text fill', () => {
    expect(css).toContain(`fill: ${CONCRETE_THEME.textColor}`);
  });

  it('uses primaryColor for end event and hover styles', () => {
    expect(css).toContain(`fill: ${CONCRETE_THEME.primaryColor}`);
  });
});

// ── Color isolation — one theme does not bleed into another ──────────────────

describe('getStyles — themes are independent', () => {
  it('distinct themes produce distinct output', () => {
    const a = getStyles({ ...CONCRETE_THEME, primaryColor: '#ff0000' });
    const b = getStyles({ ...CONCRETE_THEME, primaryColor: '#00ff00' });
    expect(a).not.toBe(b);
    expect(a).toContain('#ff0000');
    expect(a).not.toContain('#00ff00');
    expect(b).toContain('#00ff00');
    expect(b).not.toContain('#ff0000');
  });
});

// ── LIGHT_THEME — structural sanity ──────────────────────────────────────────

describe('getStyles with LIGHT_THEME', () => {
  const css = getStyles(LIGHT_THEME);

  it('returns a non-empty string', () => {
    expect(typeof css).toBe('string');
    expect(css.trim().length).toBeGreaterThan(0);
  });

  it('contains at least 20 CSS rules', () => {
    // Each rule has a { } block; count opening braces as a proxy.
    const ruleCount = (css.match(/\{/g) ?? []).length;
    expect(ruleCount).toBeGreaterThanOrEqual(20);
  });

  it('still includes .bpmn-task', () => {
    expect(css).toContain('.bpmn-task');
  });
});

// ── buildMermaidTheme ─────────────────────────────────────────────────────────

describe('buildMermaidTheme', () => {
  it('falls back to MERMAID_FALLBACK_THEME when called with no arguments', () => {
    const theme = buildMermaidTheme();
    expect(theme).toEqual(MERMAID_FALLBACK_THEME);
  });

  it('falls back to MERMAID_FALLBACK_THEME when called with empty object', () => {
    const theme = buildMermaidTheme({});
    expect(theme).toEqual(MERMAID_FALLBACK_THEME);
  });

  it('uses provided primaryColor', () => {
    const theme = buildMermaidTheme({ primaryColor: '#abcdef' });
    expect(theme.primaryColor).toBe('#abcdef');
  });

  it('uses provided lineColor', () => {
    const theme = buildMermaidTheme({ lineColor: '#112233' });
    expect(theme.lineColor).toBe('#112233');
  });

  it('uses provided mainBkg', () => {
    const theme = buildMermaidTheme({ mainBkg: '#aaaaaa' });
    expect(theme.mainBkg).toBe('#aaaaaa');
  });

  it('falls back mainBkg to primaryColor when mainBkg is absent', () => {
    const theme = buildMermaidTheme({ primaryColor: '#facade' });
    expect(theme.mainBkg).toBe('#facade');
  });

  it('falls back lineColor to edgeLabelBackground when lineColor is absent', () => {
    const theme = buildMermaidTheme({ edgeLabelBackground: '#ededed' });
    expect(theme.lineColor).toBe('#ededed');
  });

  it('falls back nodeBorder to lineColor when nodeBorder is absent', () => {
    const theme = buildMermaidTheme({ lineColor: '#778899' });
    expect(theme.nodeBorder).toBe('#778899');
  });

  it('falls back textColor to primaryTextColor when textColor is absent', () => {
    const theme = buildMermaidTheme({ primaryTextColor: '#ffffff' });
    expect(theme.textColor).toBe('#ffffff');
  });

  it('applies all provided values at once', () => {
    const vars = {
      primaryColor: '#111',
      lineColor:    '#222',
      mainBkg:      '#333',
      nodeBorder:   '#444',
      clusterBkg:   '#555',
      textColor:    '#666',
    };
    const theme = buildMermaidTheme(vars);
    expect(theme.primaryColor).toBe('#111');
    expect(theme.lineColor).toBe('#222');
    expect(theme.mainBkg).toBe('#333');
    expect(theme.nodeBorder).toBe('#444');
    expect(theme.clusterBkg).toBe('#555');
    expect(theme.textColor).toBe('#666');
  });
});
