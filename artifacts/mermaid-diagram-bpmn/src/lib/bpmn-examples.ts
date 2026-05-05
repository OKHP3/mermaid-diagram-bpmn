export interface BpmnExample {
  id: string;
  name: string;
  description: string;
  source: string;
}

export const BPMN_EXAMPLES: BpmnExample[] = [
  {
    id: 'simple-linear',
    name: 'Simple Linear Process',
    description: 'A minimal start-to-end process with one user task.',
    source: `bpmn-beta
accTitle: Simple Linear Process
accDescr: A single user task between a start event and an end event.

start s1 "Start"
task:user t1 "Submit Request"
end e1 "Done"

s1 --> t1
t1 --> e1`
  },
  {
    id: 'approval-gateway',
    name: 'Approval Gateway',
    description: 'A review process with an exclusive gateway branching on approval outcome.',
    source: `bpmn-beta
accTitle: Purchase Request Approval
accDescr: A manager reviews a request and either approves or rejects it via an exclusive gateway.

start s1 "Request Raised"
task:user t1 "Review Request"
xor g1 "Approved?"
task:service t2 "Issue Purchase Order"
task:user t3 "Notify Rejection"
end e1 "Order Issued"
end e2 "Rejected"

s1 --> t1
t1 --> g1
g1 --> t2: "yes"
g1 --> t3: "no"
t2 --> e1
t3 ==> e2`
  },
  {
    id: 'parallel-split',
    name: 'Parallel Split',
    description: 'An AND gateway splits work into two parallel tasks before joining.',
    source: `bpmn-beta
accTitle: Parallel Task Processing
accDescr: Work is split in parallel across two service tasks and then joined before completion.

start s1 "Trigger"
and g1 "Split"
task:service t1 "Run Background Job"
task:service t2 "Send Notification"
and g2 "Join"
end e1 "Complete"

s1 --> g1
g1 --> t1
g1 --> t2
t1 --> g2
t2 --> g2
g2 --> e1`
  },
  {
    id: 'order-fulfillment',
    name: 'Order Fulfillment',
    description: 'A richer process covering order placement, validation, inventory check, and shipping.',
    source: `bpmn-beta
accTitle: Order Fulfillment Process
accDescr: Customer places an order. The system validates it, checks inventory, and either fulfills or cancels.

start s1 "Order Placed"
task:user t1 "Validate Order"
xor g1 "Valid?"
task:service t2 "Check Inventory"
xor g2 "In Stock?"
task:service t3 "Pick and Pack"
task:user t4 "Notify Customer"
task:user t5 "Cancel Order"
end e1 "Order Shipped"
end e2 "Order Cancelled"

s1 --> t1
t1 --> g1
g1 --> t2: "valid"
g1 --> t5: "invalid"
t2 --> g2
g2 --> t3: "yes"
g2 --> t4: "no"
t3 --> e1
t4 ==> e2
t5 --> e2`
  }
];

export const DEFAULT_EXAMPLE_ID = 'approval-gateway';
