export interface BpmnNode {
  id: string;
  kind: 'event' | 'task' | 'gateway' | 'subprocess' | 'call' | 'note';
  subtype?: string;
  position?: 'start' | 'end' | 'intermediate';
  label?: string;
  laneId?: string;
  poolId?: string;
}

export interface BpmnFlow {
  id: string;
  source: string;
  target: string;
  kind: 'sequence' | 'conditional' | 'default' | 'message' | 'association';
  label?: string;
}

export interface BpmnPool {
  id: string;
  label: string;
  laneIds: string[];
}

export interface BpmnLane {
  id: string;
  label: string;
  poolId: string;
}

/**
 * Typed diagram store for bpmn-beta diagrams.
 *
 * Implements the Mermaid DiagramDB interface so the class can be used
 * directly as the `db` field in a DiagramDefinition (registerExternalDiagrams).
 *
 * Required DiagramDB methods (from mermaid/src/diagram-api/types.ts):
 *   clear, setAccTitle, getAccTitle, setAccDescription, getAccDescription,
 *   setDiagramTitle, getDiagramTitle, setDiagramId, bindFunctions, getConfig
 */
export class BpmnDb {
  private _nodes: BpmnNode[] = [];
  private _flows: BpmnFlow[] = [];
  private _pools: BpmnPool[] = [];
  private _lanes: BpmnLane[] = [];
  private _accTitle?: string;
  private _accDescription?: string;
  private _diagramTitle?: string;
  private _diagramId?: string;

  // ---- BPMN-specific mutators ------------------------------------------------

  addNode(node: BpmnNode): void { this._nodes.push(node); }
  addFlow(flow: BpmnFlow): void { this._flows.push(flow); }
  addPool(pool: BpmnPool): void { this._pools.push(pool); }
  addLane(lane: BpmnLane): void { this._lanes.push(lane); }

  // ---- BPMN-specific accessors -----------------------------------------------

  getNodes(): BpmnNode[] { return this._nodes; }
  getFlows(): BpmnFlow[] { return this._flows; }
  getPools(): BpmnPool[] { return this._pools; }
  getLanes(): BpmnLane[] { return this._lanes; }

  // ---- Mermaid DiagramDB interface -------------------------------------------
  // These match the optional fields of DiagramDB in mermaid/src/diagram-api/types.ts.

  /** Accessibility title — emitted as <title> in SVG. */
  setAccTitle(title: string): void { this._accTitle = title; }
  getAccTitle(): string | undefined { return this._accTitle; }

  /** Accessibility description — emitted as <desc> in SVG. */
  setAccDescription(desc: string): void { this._accDescription = desc; }
  getAccDescription(): string | undefined { return this._accDescription; }

  /** Human-readable diagram title (separate from accessibility title). */
  setDiagramTitle(title: string): void { this._diagramTitle = title; }
  getDiagramTitle(): string { return this._diagramTitle ?? ''; }

  /** Called by Mermaid to inject the SVG element id so the db can store it. */
  setDiagramId(id: string): void { this._diagramId = id; }
  getDiagramId(): string | undefined { return this._diagramId; }

  /**
   * Called by Mermaid after rendering to bind interactive event handlers.
   * No-op for bpmn-beta (read-only SVG; no interactive bindings in v1).
   */
  bindFunctions(_element: Element): void { /* no-op */ }

  /**
   * Returns the diagram config subset.
   * bpmn-beta has no per-diagram config overrides in v1.
   */
  getConfig(): undefined { return undefined; }

  /** Reset all state. Called by the parser before each new parse. */
  clear(): void {
    this._nodes = [];
    this._flows = [];
    this._pools = [];
    this._lanes = [];
    this._accTitle = undefined;
    this._accDescription = undefined;
    this._diagramTitle = undefined;
    this._diagramId = undefined;
  }
}
