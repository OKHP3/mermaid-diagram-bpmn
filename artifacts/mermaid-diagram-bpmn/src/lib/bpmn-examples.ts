import example01 from '../../examples/01-linear-process.mmd?raw';
import example02 from '../../examples/02-gateway-decision.mmd?raw';
import example03 from '../../examples/03-pool-lane-collaboration.mmd?raw';
import example04 from '../../examples/04-multi-event.mmd?raw';
import example05 from '../../examples/05-parallel-split.mmd?raw';

export interface BpmnExample {
  id: string;
  name: string;
  description: string;
  source: string;
  experimental?: boolean;
}

export const BPMN_EXAMPLES: BpmnExample[] = [
  {
    id: '01-linear',
    name: 'Linear process',
    description: 'A single user task between a start event and an end event.',
    source: example01,
  },
  {
    id: '02-gateway',
    name: 'Gateway decision',
    description: 'Exclusive gateway branching an approval flow into two outcomes.',
    source: example02,
  },
  {
    id: '03-pool-lane',
    name: 'Pool & lanes',
    description: 'Two pools — Buyer and Supplier — exchanging a cross-pool message flow.',
    source: example03,
    experimental: true,
  },
  {
    id: '04-multi-event',
    name: 'Multi-event order',
    description: 'Order fulfillment with validation, inventory check, and multiple end events.',
    source: example04,
  },
  {
    id: '05-parallel',
    name: 'Parallel split',
    description: 'AND gateway splitting work across two parallel service tasks, then joining.',
    source: example05,
  },
];

export const DEFAULT_EXAMPLE_ID = '02-gateway';
