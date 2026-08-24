# Real-World Process Corpus Evidence

**Review date:** 2026-08-24  
**Evidence tier:** authored illustrative fixtures, parser- and
browser-rendered; not independent industry validation.

## Selection rationale

The existing purchase-approval example is useful for a flat decision path, but
does not exercise enough role, exception, and collaboration variation. Four
additional fixtures are surfaced in the Playground gallery and the Mermaid Host
Demo:

| Fixture | Why it adds evidence | Supported constructs | Deferred boundary |
| --- | --- | --- | --- |
| Employee onboarding | Failed background-check path and parallel HR/IT setup with a hiring-manager handoff | Pools/lanes, XOR and AND gateways, conditional sequence flows | Boundary/timer events and executable onboarding automation |
| Vendor collaboration | Procurement and vendor operations exchange messages across pool boundaries | Multiple pools/lanes, message flows, XOR gateways | Choreography, message correlation, runtime vendor integration |
| Quote to order | Sales, management, and finance coordinate discount, credit, and customer-acceptance decisions | Pools/lanes, XOR gateways, conditional/default sequence flows | Data objects, boundary events, ERP/CRM execution |
| Support ticket triage | Customer and support team route priority work and parallel escalation notifications | Pools/lanes, XOR and AND gateways, receive/service tasks | SLA timers, interrupting events, runtime queue behavior |

These fixtures were chosen because they remain expressible in the current
`bpmn-beta` descriptive subset without adding syntax solely for the examples.
The vendor collaboration fixture is the explicit message-flow boundary case;
the other three stress different exception and parallel-work shapes.

## Validation record

- All four source files are included in the auto-discovered parser corpus.
- Named parser invariants verify titles, lane structure, flow density, and the
  distinctive exception/collaboration patterns.
- React Playground metadata identifies each as illustrative evidence and lists
  supported and deferred semantics.
- Mermaid Host Demo renders the four fixtures as real SVG output in Chromium
  under Mermaid’s default strict security configuration.
- Host-demo Firefox and WebKit checks could not launch in this Linux
  environment because their native browser libraries are unavailable. This is
  an environment limitation, not a fixture-rendering failure.
- Existing accessibility/title parsing and SVG rendering checks remain in the
  application suite; no new conformance claim is inferred from authored
  examples.

## Public interpretation

The gallery and comparison page describe these examples as illustrative
evidence. They do not establish BPMN conformance, executable semantics,
universal process coverage, or independent user/industry adoption. The
capability ledger records the same evidence boundary and deferred semantics.
