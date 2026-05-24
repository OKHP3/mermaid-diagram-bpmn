# Pool, Lane, and Message Flow Rules

> Detailed containment, placement, and routing rules for pool/lane/message-flow constructs in bpmn-beta v0.1.

---

## 1. Pool Containment Rules

A pool is the outermost organizational unit. It represents a single process participant.

**Rules:**
- Pools are declared at the top level (outside any other pool).
- A pool may contain zero or more lanes.
- A pool may contain elements and flows in its body (outside any lane block) — these are pool-level elements.
- Pools **cannot** be nested inside other pools. The parser throws `pools cannot be nested`.
- Elements inside a pool that are also inside a lane are owned by that lane. Elements inside a pool but outside any lane are pool-level elements.

**Correct (flat pool, no lanes):**
```
pool vendor "Vendor" {
  start s1 "PO Received"
  task:user t1 "Process PO"
  end e1 "PO Complete"

  s1 --> t1
  t1 --> e1
}
```

**Incorrect (nested pool — parse error):**
```
pool outer "Outer" {
  pool inner "Inner" {   %% ERROR: pools cannot be nested
    ...
  }
}
```

---

## 2. Lane Containment Rules

A lane subdivides a pool. It represents a role, department, or system within the pool's organization.

**Rules:**
- Lanes must be declared inside a pool block. A top-level lane throws `lane must be inside a pool block`.
- Lanes cannot be nested inside other lanes. The parser throws `nested lanes are not supported`.
- Lanes are one level deep only. Pool → Lane is the maximum nesting depth.
- Elements declared inside a lane block are assigned to that lane in the `BpmnDb`.
- Flows declared inside a lane block are also recorded as belonging to that lane.

**Correct (two lanes inside one pool):**
```
pool hr_process "HR Process" {

  lane requester "Requester" {
    start s1 "Request Submitted"
    task:user t1 "Fill Out Form"
  }

  lane manager "Manager" {
    task:user t2 "Review Request"
    end e1 "Approved"
  }

  s1 --> t1
  t1 --> t2
  t2 --> e1
}
```

**Incorrect (lane outside pool — parse error):**
```
lane hr "HR" {       %% ERROR: lane must be inside a pool block
  start s1 "Start"
}
```

**Incorrect (nested lanes — parse error):**
```
pool p1 "Company" {
  lane dept "Department" {
    lane team "Team" {   %% ERROR: nested lanes are not supported
      ...
    }
  }
}
```

---

## 3. Cross-Lane Flow Placement

Flows can appear in three locations. Correct placement prevents layout ambiguity.

| Location | When to use | Validation |
|---|---|---|
| **Pool body** (inside pool `{ }`, outside any lane `{ }`) | **Preferred for all cross-lane flows** | Both source and target can be in different lanes |
| **Lane body** (inside a lane `{ }`) | Only when both source and target are confirmed in that lane | Permissible but should be used sparingly |
| **Top level** (outside all pool blocks) | Flat diagrams; message flows (always) | Valid for flat diagrams only |

**Correct — cross-lane flows in pool body (recommended pattern):**
```
pool onboard "Onboarding" {

  lane hr "HR" {
    start s1 "Onboarding Initiated"
    task:user t1 "Send Offer Docs"
  }

  lane it "IT" {
    task:service t2 "Provision Accounts"
    end e1 "Complete"
  }

  %% Cross-lane flows — declared in pool body, not inside any lane
  s1 --> t1
  t1 --> t2
  t2 --> e1
}
```

**Also valid — intra-lane flow inside lane body:**
```
pool proc "Process" {

  lane finance "Finance" {
    task:service t1 "Generate Invoice"
    task:service t2 "Send Invoice"

    %% Both t1 and t2 are in this lane — intra-lane flow inside lane body is fine
    t1 --> t2
  }

  lane manager "Manager" {
    task:user t3 "Approve Invoice"
    end e1 "Invoice Sent"
  }

  %% Cross-lane flows in pool body
  t2 --> t3
  t3 --> e1
}
```

**Avoid — cross-lane flow inside a lane block:**
```
pool p1 "Process" {

  lane requester "Requester" {
    start s1 "Request"
    task:user t1 "Submit"
    t1 --> t2   %% t2 is in the manager lane, not this lane — declare this in pool body instead
  }

  lane manager "Manager" {
    task:user t2 "Review"
    end e1 "Done"
  }
}
```

---

## 4. Message Flow Rules

Message flows connect elements in different pools. They represent inter-organizational communication.

**Syntax:**
```
[source-id] ~~> [target-id]
```

Optional label:
```
[source-id] ~~> [target-id]: "[Message label]"
```

**Rules:**
- Message flows **must** be declared at the top level, outside all pool and lane blocks.
- Declaring `~~>` inside a pool or lane block throws: `message flows (~~>) must be declared at the top level`.
- Message flows connect elements from different pools. Source and target must be in separate pool blocks.
- Sequence flows (`-->`) must not cross pool boundaries — use `~~>` for cross-pool connections.

**Correct — message flows at top level:**
```
pool buyer "Buyer" {
  lane proc "Procurement" {
    start s1 "Need Identified"
    task:user t1 "Create PO"
    task:receive t4 "Receive Acknowledgement"
    end e1 "PO Sent"
  }

  s1 --> t1
  t1 --> e1
  e1 --> t4
}

pool vendor "Vendor" {
  task:receive t2 "Receive PO"
  task:user t3 "Acknowledge PO"
  end e2 "Acknowledged"

  t2 --> t3
  t3 --> e2
}

%% Message flows — top level, outside both pool blocks
t1 ~~> t2
t3 ~~> t4
```

**Incorrect — message flow inside pool block (parse error):**
```
pool buyer "Buyer" {
  task:user t1 "Create PO"
  t1 ~~> t2   %% ERROR: message flows must be declared at the top level
}
```

**Incorrect — sequence flow crossing pool boundary:**
```
pool buyer "Buyer" {
  task:user t1 "Submit PO"
}

pool vendor "Vendor" {
  task:receive t2 "Receive PO"
}

t1 --> t2   %% WRONG: use ~~> for cross-pool flows, not -->
```

---

## 5. Common Errors and Corrections

| Error | Cause | Correction |
|---|---|---|
| `pools cannot be nested` | A `pool` declaration appears inside another pool's `{ }` block | Close the outer pool with `}` before declaring the new pool |
| `lane must be inside a pool block` | A `lane` declaration appears at the top level | Wrap the lane inside a `pool { ... }` block |
| `nested lanes are not supported` | A `lane` declaration appears inside another lane's `{ }` block | Close the outer lane with `}` before declaring the inner lane |
| `message flows (~~>) must be declared at the top level` | A `~~>` flow appears inside a pool or lane block | Move the `~~>` declaration to after all pool blocks |
| `unexpected } — no open block` | A closing `}` appears with no matching open pool or lane | Remove the extra `}` or add the matching open block |
| Orphan element (not a parse error — semantic) | An element is declared but appears in no flow | Connect the element to the flow with a `-->` declaration |
| Cross-pool `-->` (not a parse error — semantic) | A sequence flow connects elements in different pools | Replace `-->` with `~~>` and move it to the top level |
