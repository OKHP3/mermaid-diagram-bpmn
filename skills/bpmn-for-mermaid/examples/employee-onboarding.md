# Example: Employee Onboarding

> **Skill:** bpmn-for-mermaid  
> **Complexity:** Advanced — single pool, three lanes, cross-lane flows, multiple end events  
> **Purpose:** Demonstrates the recommended cross-lane flow declaration pattern with three organizational actors and a process that has a rejection path that terminates early.

---

## Business Context

A company's HR department coordinates the onboarding of a new hire across three teams: HR (owns the process), IT (provisions systems access), and the Hiring Manager (verifies readiness). The process can terminate early if a background check fails. Otherwise it concludes when the hiring manager confirms the new hire is ready to start.

---

## Natural-Language Input

> "HR initiates onboarding by sending the new hire their offer documentation and starting a background check. If the background check fails, HR terminates the onboarding process. If it passes, IT provisions the new hire's accounts and equipment in parallel with HR completing the orientation paperwork. When both IT and HR tasks are done, the Hiring Manager reviews the onboarding checklist and confirms the new hire is ready to start."

---

## Step-by-Step Application of Generation Workflow

**Step 1 — Extract:**
- Actors: HR, IT, Hiring Manager → three lanes
- Start: onboarding initiated
- End states: two — early termination (background check fail), successful start confirmed
- Tasks: send offer docs (service), run background check (service), provision accounts (service), provision equipment (service), complete orientation paperwork (user), review checklist (user), confirm ready (user)
- Decisions: background check pass/fail → XOR
- Parallel: IT provisioning + HR paperwork → AND split / AND join

**Step 2 — Structural model:** Single pool, three lanes.

**Step 3 — IDs:**
- `s1` — start
- `t1` — send docs, `t2` — background check, `t3` — provision accounts, `t4` — provision equipment, `t5` — orientation paperwork, `t6` — review checklist, `t7` — confirm ready
- `g1` — background check XOR, `g2` — parallel split, `g3` — parallel join
- `e1` — terminated (fail), `e2` — onboarding complete

**Step 4 — Write DSL.**

---

## Generated bpmn-beta Output

```mermaid
bpmn-beta
accTitle: Employee Onboarding
accDescr: HR coordinates new hire onboarding across HR, IT, and Hiring Manager lanes. Background check failure terminates early; success triggers parallel IT provisioning and HR paperwork before manager confirmation.

pool onboard "Employee Onboarding" {

  lane hr "HR" {
    start s1 "Onboarding Initiated"
    task:service t1 "Send Offer Documentation"
    task:service t2 "Run Background Check"
    xor g1 "Background Check?"
    end e1 "Onboarding Terminated"
    task:user t5 "Complete Orientation Paperwork"
  }

  lane it "IT" {
    task:service t3 "Provision System Accounts"
    task:service t4 "Provision Equipment"
  }

  lane hm "Hiring Manager" {
    and g2 "Parallel Onboarding Tasks"
    and g3 "All Tasks Complete"
    task:user t6 "Review Onboarding Checklist"
    task:user t7 "Confirm New Hire Ready"
    end e2 "New Hire Onboarded"
  }

  s1 --> t1
  t1 --> t2
  t2 --> g1
  g1 --> e1: "fail"
  g1 --> g2: "pass"
  g2 --> t3
  g2 --> t5
  t3 --> t4
  t4 --> g3
  t5 --> g3
  g3 --> t6
  t6 --> t7
  t7 --> e2
}
```

**Elements:** 7 tasks, 3 events, 3 gateways, 3 lanes, 1 pool  
**Flows:** 13 sequence flows

---

## Callouts

| Element | Why It Was Chosen |
|---|---|
| `xor g1 "Background Check?"` | Exactly one path taken: fail (terminate) or pass (continue) |
| `g1 --> e1: "fail"` | Early termination path — process ends immediately if check fails |
| `and g2` | Parallel split — IT provisioning and HR paperwork start simultaneously |
| `and g3` | Parallel join — both branches must complete before the hiring manager reviews |
| IT lane: `t3 --> t4` | Sequential within IT — accounts must exist before equipment is provisioned |
| HR lane: `t5` | Paperwork runs in parallel with IT's `t3 → t4` chain |
| `g2 --> t3` and `g2 --> t5` | Split goes to different lanes — declared in pool body as cross-lane flows |
| `t4 --> g3` and `t5 --> g3` | Both IT and HR branches rejoin at the AND gateway — declared in pool body |
| AND gateways in `hm` lane | Hiring Manager lane owns the sync points, since HM acts at completion |
| Two end events (`e1`, `e2`) | Two distinct process outcomes; each has a meaningful label |

---

## Recommended Cross-Lane Flow Pattern

All flows that cross lane boundaries are declared in the **pool body** (outside any `lane { }` block). The only flows inside a lane block should be those where both source and target are confirmed within that lane — in this example, `t3 --> t4` (both in the IT lane) could be declared inside `lane it { }`, but it is left in the pool body for consistency.

```
pool onboard "Employee Onboarding" {
  lane hr "HR" { [elements only] }
  lane it "IT" { [elements only] }
  lane hm "Hiring Manager" { [elements only] }

  [all flows here — pool body]
}
```

This pattern is easier to read and avoids the ambiguity of placing cross-lane flows in the wrong lane.

---

## Validation Self-Check

- [x] `bpmn-beta` on line 1
- [x] All IDs in flows exist as declared elements
- [x] XOR gateway (`g1`) has two outgoing flows with condition labels
- [x] AND split (`g2`) has matching AND join (`g3`)
- [x] No orphan elements
- [x] Pool and lane brackets properly nested and closed
- [x] All labels in double quotes
- [x] No reserved keywords used as IDs
- [x] No unimplemented keywords (`event:*`, `---`)
