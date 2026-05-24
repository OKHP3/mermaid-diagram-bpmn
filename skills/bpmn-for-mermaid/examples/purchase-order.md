# Example: Purchase Order Approval

> **Skill:** bpmn-for-mermaid  
> **Complexity:** Simple — single pool, two lanes, one XOR gateway  
> **Purpose:** The canonical "Hello World" reference for bpmn-beta. Use this as a baseline to verify the skill is working correctly.

---

## Business Context

A purchasing department handles internal purchase requests. A requester submits a PO request; a manager reviews it and either approves (triggering an automated PO issuance) or rejects it (notifying the requester). All actors are within the same organization.

---

## Natural-Language Input

> "A requester submits a purchase order request. A manager reviews the request. If approved, the system automatically issues the purchase order and the process ends. If rejected, the requester is notified and the process ends."

---

## Step-by-Step Application of Generation Workflow

**Step 1 — Extract:**
- Actors: Requester, Manager + System → two lanes
- Start: request submitted
- End: two end states (approved / rejected)
- Tasks: submit request (user), review request (user), issue PO (service), notify rejection (service)
- Decision: approved? → XOR gateway

**Step 2 — Structural model:** Single pool, two lanes (Requester and Manager).

**Step 3 — IDs:**
- `s1` — start
- `t1` — submit, `t2` — review, `t3` — issue PO, `t4` — notify rejection
- `g1` — approval gateway
- `e1` — approved end, `e2` — rejected end

**Step 4 — Write DSL.**

---

## Generated bpmn-beta Output

```mermaid
bpmn-beta
accTitle: Purchase Order Approval
accDescr: Requester submits a PO request; manager approves or rejects it.

pool proc "Purchasing" {

  lane req "Requester" {
    start s1 "PO Request Submitted"
    task:user t1 "Submit PO Request"
    end e2 "Notified of Rejection"
  }

  lane mgr "Manager" {
    task:user t2 "Review PO Request"
    xor g1 "Approved?"
    task:service t3 "Issue Purchase Order"
    task:service t4 "Send Rejection Notice"
    end e1 "PO Issued"
  }

  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 --> t3: "yes"
  g1 --> t4: "no"
  t3 --> e1
  t4 --> e2
}
```

**Elements:** 4 tasks, 2 events, 1 gateway, 2 lanes, 1 pool  
**Flows:** 7 sequence flows

---

## Callouts

| Element | Why It Was Chosen |
|---|---|
| `task:user t1` | Human-performed work — requester fills out a form |
| `task:user t2` | Human decision-making — manager reads and decides |
| `xor g1` | Exactly one path is taken (approved or rejected, not both) |
| `task:service t3` | Automated — ERP system generates the PO document |
| `task:service t4` | Automated — notification system sends the rejection email |
| Cross-lane flows declared in pool body | Flows between `req` lane and `mgr` lane are declared outside both lane blocks — this is the correct pattern for cross-lane sequence flows |
| `g1 --> t3: "yes"` | Condition label on XOR outgoing flow — required for XOR gateways |
| `t4 ==>` not used | No "default" flow here — both paths have explicit conditions |

---

## Validation Self-Check

- [x] `bpmn-beta` on line 1
- [x] All IDs in flows exist as declared elements
- [x] XOR gateway has exactly two outgoing flows, both with condition labels
- [x] No orphan elements
- [x] Pool and lane brackets properly nested and closed
- [x] All labels in double quotes
- [x] No reserved keywords used as IDs
