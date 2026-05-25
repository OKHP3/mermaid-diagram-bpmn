# Intake Question Framework

Conditional branching elicitation logic for the `okhp3-process-discovery` skill.
Follow this framework when conducting structured process intake. Do not present this as a flat checklist — branch based on answers.

---

## Stage 0 — Orientation

Ask first to frame the session:

> "Before we start, can you give me one sentence: what does this process produce or accomplish?"

**If the answer is vague** (e.g., "it just happens," "it's how we do things"):
→ Probe with: "Who benefits when this process runs correctly? What do they get?"

**If the answer is clear:**
→ Record as `process_name` and proceed to Stage 1.

---

## Stage 1 — Trigger Identification

> "What causes this process to start? Is it a person doing something, a date or schedule, an incoming message, or a system event?"

| Answer type | Follow-up | Record as |
|---|---|---|
| A person initiates it | "Who specifically? What do they do to kick it off?" | `trigger.event_type: manual` |
| A date or schedule | "How often? Is it calendar-based or elapsed-time-based?" | `trigger.event_type: scheduled` |
| Incoming message/request | "What form does the message take? Email, form, system event?" | `trigger.event_type: message` |
| System condition | "What state or threshold triggers it?" | `trigger.event_type: system` |

**If ambiguous:** Ask "Is there a specific thing that would make you say 'the process has started'?"

---

## Stage 2 — Actor Identification

> "Who is involved in this process? Let's list everyone who does work, makes decisions, or needs to know the outcome."

For each actor named, ask:

1. **What is their role in the process?** → classify as `initiator`, `performer`, `approver`, `reviewer`, `notified`, or `system`
2. **What do they care most about in terms of how this process runs?** → record as `interest`
3. **How much control do they have over how the process works?** → record as `influence`: `high` / `medium` / `low`

**If roles span multiple departments:**
→ Probe: "When the process crosses from [Dept A] to [Dept B], how does the handoff work? Is there a formal handoff or does it just happen?"
→ Record handoff points as step boundaries.

**If a system is named as an actor (e.g., "the ERP does this"):**
→ Record as `type: system`, add to `systems` array
→ Ask: "Does a person trigger the system, or does it run automatically?"

**Minimum requirement:** At least one `initiator` and at least one `performer` or `approver`.

---

## Stage 3 — Input/Output Identification

> "What does this process need to begin — information, documents, materials, or approvals?"

For each input:
- What is it called?
- Where does it come from?
- What format is it in?

> "What does this process produce when it's complete?"

For each output:
- What is it called?
- Who receives or uses it?
- What format?

**If the process crosses systems:**
→ Ask: "When data moves from [System A] to [System B], is that automatic or does someone do it manually?"
→ Add the transfer as a step with `system` identified.

---

## Stage 4 — Step Elicitation

> "Walk me through what happens, step by step, from the trigger to the end."

Capture each step as a single imperative sentence: "Requester submits the purchase request form."

**After the happy path is captured:**
> "Is there anything I missed? Are there steps that only sometimes happen?"

**Common omissions to probe for:**
- Notification steps ("Does anyone get an email or alert?")
- Logging or recording steps ("Is anything written down or saved?")
- Waiting steps ("Is there a period where the process pauses, waiting for something?")

---

## Stage 5 — Decision Points and Business Rules

> "Are there any points in this process where a decision is made — where it could go one way or another?"

For each decision point:
- "Who makes this decision?"
- "What information do they use?"
- "What are the possible outcomes?"
- "Is there a rule that governs this decision, or is it judgment-based?"

**If a rule is mentioned** (e.g., "anything over $5,000 needs VP approval"):
→ Record as a `business_rules` entry with `source: policy` unless otherwise stated.

**If the decision is described as judgment-based:**
→ Record it as a decision point with an open question about documenting criteria.

---

## Stage 6 — Exception Paths

> "What can go wrong in this process? What happens when it does?"

For each exception:
- "How does the process detect this problem?"
- "What does someone do about it — do they fix it, escalate it, or abandon the process?"
- "Does the exception ever stop the process entirely?"

**If the user says "it never goes wrong":**
→ Probe: "Has there ever been a time when the process didn't complete normally? What happened?"
→ Record any example as an exception with the caveat that it is rare.

---

## Stage 7 — Systems and Controls

> "Which systems or tools are used in this process?"

For each system:
- "What does this system do in the process — store data, process it, send notifications?"
- "Does someone interact with it manually, or does it run automatically?"

> "Are there any checkpoints, approvals, or audits built into this process?"

For each control:
- "Who performs or reviews this check?"
- "Is it mandatory or discretionary?"

---

## Stage 8 — Open Questions and Gaps

Before closing:
> "Is there anything about this process we haven't covered that you think is important?"

Record any gaps as `open_questions` entries. Do not assume answers — leave them explicitly open.

---

## Branching Summary

```
Trigger ambiguous? → ask for the observable "start" event
Roles span departments? → probe handoff mechanics
System named as actor? → classify as system, add to systems array
Cross-system data transfer? → capture as explicit step
Decision present? → probe for governing rules
Exception: "never goes wrong"? → probe for historical exceptions
Missing inputs/outputs? → cross-check against steps (every step has inputs and outputs)
```
