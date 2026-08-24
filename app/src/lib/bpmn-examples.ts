import example01 from '../../examples/01-linear-process.mmd?raw';
import example02 from '../../examples/02-gateway-decision.mmd?raw';
import example03 from '../../examples/03-pool-lane-collaboration.mmd?raw';
import example04 from '../../examples/04-multi-event.mmd?raw';
import example05 from '../../examples/05-parallel-split.mmd?raw';
import example07 from '../../examples/07-employee-onboarding.mmd?raw';
import example09 from '../../examples/09-quote-to-order.mmd?raw';
import example10 from '../../examples/10-support-ticket-triage.mmd?raw';
import example06 from '../../examples/06-cross-pool-collaboration.mmd?raw';

export interface BpmnExample {
  id: string;
  name: string;
  description: string;
  source: string;
  experimental?: boolean;
  supportedSemantics?: string[];
  deferredSemantics?: string[];
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
  {
    id: '07-employee-onboarding',
    name: 'Employee onboarding',
    description: 'HR, IT, and a hiring manager route a new hire through a failed check or parallel setup.',
    source: example07,
    experimental: true,
    supportedSemantics: ['pools and lanes', 'exclusive and parallel gateways', 'conditional sequence flows'],
    deferredSemantics: ['boundary events', 'timer events', 'executable onboarding automation'],
  },
  {
    id: '06-vendor-collaboration',
    name: 'Vendor collaboration',
    description: 'Procurement and vendor operations exchange a purchase order and route acceptance or rejection.',
    source: example06,
    experimental: true,
    supportedSemantics: ['multiple pools and lanes', 'cross-pool message flows', 'exclusive gateways'],
    deferredSemantics: ['choreography diagrams', 'message correlation', 'runtime vendor integration'],
  },
  {
    id: '09-quote-to-order',
    name: 'Quote to order',
    description: 'Sales, management, and finance collaborate from customer inquiry through accepted or declined quote.',
    source: example09,
    experimental: true,
    supportedSemantics: ['pools and lanes', 'exclusive gateways', 'conditional and default sequence flows'],
    deferredSemantics: ['data objects', 'boundary events', 'ERP or CRM execution semantics'],
  },
  {
    id: '10-support-ticket-triage',
    name: 'Support ticket triage',
    description: 'A support team prioritizes a ticket, handles escalation in parallel, and confirms resolution.',
    source: example10,
    experimental: true,
    supportedSemantics: ['pools and lanes', 'exclusive and parallel gateways', 'receive and service tasks'],
    deferredSemantics: ['SLA timers', 'interrupting events', 'runtime queue and escalation behavior'],
  },
];

export const DEFAULT_EXAMPLE_ID = '02-gateway';
