import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parse } from '../bpmn-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const EXAMPLES_DIR = join(__dirname, '../../../examples');

function loadExample(filename: string): string {
  return readFileSync(join(EXAMPLES_DIR, filename), 'utf-8');
}

/**
 * Corpus snapshots cover semantic diagram state used by rendering. Source
 * coordinates are editor diagnostics and have their own focused parser tests.
 */
function omitSourceLines<T extends { sourceLine?: number }>(records: T[]) {
  return records.map(({ sourceLine: _sourceLine, ...record }) => record);
}

// ---------------------------------------------------------------------------
// Snapshot tests — auto-discover every .mmd in examples/.
// To add a new corpus fixture: drop a .mmd into examples/ and run:
//   pnpm --filter @workspace/mermaid-diagram-bpmn run test -- -u
// The snapshot is created on first run and checked on subsequent runs.
// ---------------------------------------------------------------------------

const mmdFiles = readdirSync(EXAMPLES_DIR)
  .filter(f => f.endsWith('.mmd'))
  .sort();

for (const file of mmdFiles) {
  describe(`snapshot: ${file}`, () => {
    it('parses to a stable DB state', () => {
      const db = parse(loadExample(file));
      expect({
        nodes: omitSourceLines(db.getNodes()),
        flows: db.getFlows(),
        pools: omitSourceLines(db.getPools()),
        lanes: db.getLanes(),
        accTitle: db.getAccTitle(),
        accDescription: db.getAccDescription(),
      }).toMatchSnapshot();
    });
  });
}

// ---------------------------------------------------------------------------
// Invariant tests — named structural assertions per example.
// These capture the human-readable intent behind each fixture.
// ---------------------------------------------------------------------------

describe('corpus: 01-linear-process.mmd', () => {
  it('parses without error', () => {
    const db = parse(loadExample('01-linear-process.mmd'));
    expect(db.getNodes().length).toBeGreaterThan(0);
    expect(db.getFlows().length).toBeGreaterThan(0);
  });

  it('has an accTitle', () => {
    const db = parse(loadExample('01-linear-process.mmd'));
    expect(db.getAccTitle()).toBeDefined();
  });

  it('has exactly one start event and one end event', () => {
    const db = parse(loadExample('01-linear-process.mmd'));
    const starts = db.getNodes().filter(n => n.kind === 'event' && n.position === 'start');
    const ends = db.getNodes().filter(n => n.kind === 'event' && n.position === 'end');
    expect(starts).toHaveLength(1);
    expect(ends).toHaveLength(1);
  });
});

describe('corpus: 02-gateway-decision.mmd', () => {
  it('parses without error', () => {
    const db = parse(loadExample('02-gateway-decision.mmd'));
    expect(db.getNodes().length).toBeGreaterThan(0);
  });

  it('has at least one xor gateway', () => {
    const db = parse(loadExample('02-gateway-decision.mmd'));
    const xors = db.getNodes().filter(n => n.kind === 'gateway' && n.subtype === 'xor');
    expect(xors.length).toBeGreaterThan(0);
  });

  it('has at least one conditional flow', () => {
    const db = parse(loadExample('02-gateway-decision.mmd'));
    const cond = db.getFlows().filter(f => f.kind === 'conditional');
    expect(cond.length).toBeGreaterThan(0);
  });

  it('has at least one default flow', () => {
    const db = parse(loadExample('02-gateway-decision.mmd'));
    const def = db.getFlows().filter(f => f.kind === 'default');
    expect(def.length).toBeGreaterThan(0);
  });
});

describe('corpus: 03-pool-lane-collaboration.mmd', () => {
  it('parses without error', () => {
    const db = parse(loadExample('03-pool-lane-collaboration.mmd'));
    expect(db.getNodes().length).toBeGreaterThan(0);
  });

  it('has exactly 2 pools', () => {
    const db = parse(loadExample('03-pool-lane-collaboration.mmd'));
    expect(db.getPools()).toHaveLength(2);
  });

  it('has at least 2 lanes (in the buyer pool)', () => {
    const db = parse(loadExample('03-pool-lane-collaboration.mmd'));
    expect(db.getLanes().length).toBeGreaterThanOrEqual(2);
  });

  it('has exactly 1 message flow', () => {
    const db = parse(loadExample('03-pool-lane-collaboration.mmd'));
    const msgFlows = db.getFlows().filter(f => f.kind === 'message');
    expect(msgFlows).toHaveLength(1);
  });

  it('assigns poolId and laneId to nodes inside lanes', () => {
    const db = parse(loadExample('03-pool-lane-collaboration.mmd'));
    const laneNodes = db.getNodes().filter(n => n.laneId != null);
    expect(laneNodes.length).toBeGreaterThan(0);
    laneNodes.forEach(n => {
      expect(n.poolId).toBeDefined();
    });
  });
});

describe('corpus: 04-multi-event.mmd', () => {
  it('parses without error', () => {
    const db = parse(loadExample('04-multi-event.mmd'));
    expect(db.getNodes().length).toBeGreaterThan(0);
  });

  it('has multiple end events', () => {
    const db = parse(loadExample('04-multi-event.mmd'));
    const ends = db.getNodes().filter(n => n.kind === 'event' && n.position === 'end');
    expect(ends.length).toBeGreaterThan(1);
  });

  it('has multiple gateways', () => {
    const db = parse(loadExample('04-multi-event.mmd'));
    const gateways = db.getNodes().filter(n => n.kind === 'gateway');
    expect(gateways.length).toBeGreaterThan(1);
  });
});

describe('corpus: 05-parallel-split.mmd', () => {
  it('parses without error', () => {
    const db = parse(loadExample('05-parallel-split.mmd'));
    expect(db.getNodes().length).toBeGreaterThan(0);
  });

  it('has exactly 2 AND gateways (split and join)', () => {
    const db = parse(loadExample('05-parallel-split.mmd'));
    const ands = db.getNodes().filter(n => n.kind === 'gateway' && n.subtype === 'and');
    expect(ands).toHaveLength(2);
  });

  it('has no pools or lanes', () => {
    const db = parse(loadExample('05-parallel-split.mmd'));
    expect(db.getPools()).toHaveLength(0);
    expect(db.getLanes()).toHaveLength(0);
  });
});
