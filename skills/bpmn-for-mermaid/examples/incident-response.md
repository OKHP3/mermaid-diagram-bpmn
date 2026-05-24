# Example: IT Incident Response

> **Skill:** bpmn-for-mermaid  
> **Complexity:** Intermediate — single pool, three lanes, XOR gateway, AND gateway for parallel notification  
> **Purpose:** Demonstrates parallel gateway usage and a multi-outcome end state. Note: timer intermediate events are approximated with a service task (see Known Limitations).

---

## Business Context

An IT operations team handles service incidents. When an incident is reported, a triage analyst classifies its severity. High-severity incidents trigger parallel notification (alert the on-call engineer AND create a management escalation ticket simultaneously). Low-severity incidents go through standard resolution. All paths end with an incident closure task.

---

## Natural-Language Input

> "A user reports an incident. A triage analyst receives the report and assesses the severity. If the severity is high, the system simultaneously alerts the on-call engineer and creates an escalation ticket in the management tracker — both happen in parallel. After both complete, the on-call engineer resolves the incident. If severity is low, the analyst resolves it directly. In both cases, the system closes the incident ticket at the end."

---

## Step-by-Step Application of Generation Workflow

**Step 1 — Extract:**
- Actors: User (initiates only), Triage Analyst, On-Call Engineer → three lanes
- Start: incident reported
- End: incident closed (one shared end state)
- Tasks: log incident (user), assess severity (user), alert engineer (service), create escalation ticket (service), resolve incident (user), close ticket (service)
- Decisions: severity high vs. low → XOR gateway
- Parallel: alert + escalation → AND split → AND join

**Step 2 — Structural model:** Single pool, three lanes.

**Step 3 — IDs:**
- `s1` — start
- `t1` — log, `t2` — assess, `t3` — alert, `t4` — escalate, `t5` — resolve high, `t6` — resolve low, `t7` — close
- `g1` — severity XOR, `g2` — parallel split, `g3` — parallel join
- `e1` — closed

**Step 4 — Write DSL.**

**Note on timer events:** BPMN notation would normally use a timer intermediate event to model an SLA-triggered escalation. The v0.1 parser does not yet support `event:timer`. The parallel notification pattern is used here instead to demonstrate the AND gateway, which is a functionally valid alternative for this scenario.

---

## Generated bpmn-beta Output

```mermaid
bpmn-beta
accTitle: IT Incident Response
accDescr: Triage analyst classifies severity; high-severity incidents trigger parallel notification and escalation before resolution.

pool it "IT Operations" {

  lane user "Requester" {
    start s1 "Incident Reported"
    task:user t1 "Log Incident"
  }

  lane triage "Triage Analyst" {
    task:user t2 "Assess Severity"
    xor g1 "Severity?"
    task:user t6 "Resolve Low-Severity Incident"
  }

  lane oncall "On-Call Engineer" {
    and g2 "Parallel Notify"
    task:service t3 "Alert On-Call Engineer"
    task:service t4 "Create Escalation Ticket"
    and g3 "Notifications Sent"
    task:user t5 "Resolve High-Severity Incident"
    task:service t7 "Close Incident Ticket"
    end e1 "Incident Closed"
  }

  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 --> g2: "high"
  g1 --> t6: "low"
  g2 --> t3
  g2 --> t4
  t3 --> g3
  t4 --> g3
  g3 --> t5
  t5 --> t7
  t6 --> t7
  t7 --> e1
}
```

**Elements:** 7 tasks, 1 event, 3 gateways, 3 lanes, 1 pool  
**Flows:** 13 sequence flows

---

## Callouts

| Element | Why It Was Chosen |
|---|---|
| `and g2` | Parallel split — both notification tasks must be triggered |
| `and g3` | Parallel join — wait for both notification tasks to complete before proceeding |
| `g2 --> t3` (no label) | AND outgoing flows do not need condition labels — all paths are taken |
| `g1 --> g2: "high"` | XOR outgoing flow → AND split; condition on the XOR, not on the AND |
| `t6 --> t7` | Low-severity path bypasses the parallel block and goes directly to closure |
| Both paths converge at `t7` | Single end event after closure; avoids duplicating the end event |
| Lane placement of AND gateways | AND gateways placed in `oncall` lane since that lane owns the parallel work |
| Cross-lane flows in pool body | `s1 --> t1`, `t1 --> t2`, `t2 --> g1`, `g1 --> g2`, `g1 --> t6`, `t5 --> t7`, `t6 --> t7` all cross lanes and are declared in the pool body |

---

## Validation Self-Check

- [x] `bpmn-beta` on line 1
- [x] All IDs in flows exist as declared elements
- [x] XOR gateway (`g1`) has two outgoing flows with condition labels
- [x] AND split (`g2`) has matching AND join (`g3`)
- [x] No orphan elements
- [x] Pool and lane brackets properly nested and closed
- [x] All labels in double quotes
- [x] No `event:timer` or other unimplemented keywords
