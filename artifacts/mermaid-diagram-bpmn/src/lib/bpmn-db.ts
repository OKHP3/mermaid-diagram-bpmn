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

export class BpmnDb {
  private _nodes: BpmnNode[] = [];
  private _flows: BpmnFlow[] = [];
  private _pools: BpmnPool[] = [];
  private _lanes: BpmnLane[] = [];
  private _accTitle?: string;
  private _accDescription?: string;

  addNode(node: BpmnNode): void {
    this._nodes.push(node);
  }

  addFlow(flow: BpmnFlow): void {
    this._flows.push(flow);
  }

  addPool(pool: BpmnPool): void {
    this._pools.push(pool);
  }

  addLane(lane: BpmnLane): void {
    this._lanes.push(lane);
  }

  setAccTitle(title: string): void {
    this._accTitle = title;
  }

  setAccDescription(desc: string): void {
    this._accDescription = desc;
  }

  getNodes(): BpmnNode[] {
    return this._nodes;
  }

  getFlows(): BpmnFlow[] {
    return this._flows;
  }

  getPools(): BpmnPool[] {
    return this._pools;
  }

  getLanes(): BpmnLane[] {
    return this._lanes;
  }

  getAccTitle(): string | undefined {
    return this._accTitle;
  }

  getAccDescription(): string | undefined {
    return this._accDescription;
  }

  clear(): void {
    this._nodes = [];
    this._flows = [];
    this._pools = [];
    this._lanes = [];
    this._accTitle = undefined;
    this._accDescription = undefined;
  }
}
