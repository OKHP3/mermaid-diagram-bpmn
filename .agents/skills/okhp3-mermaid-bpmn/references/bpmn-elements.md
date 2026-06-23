# BPMN Element Catalog → Mermaid Syntax

TOC for Phase 1 authoring. Each element needs: BPMN meaning, Mermaid node/edge syntax, `classDef` styling (from core's design-system.md), and a one-line example.

## Events
- [ ] Start event
- [ ] Intermediate event (generic)
- [ ] End event
- [ ] Timer event
- [ ] Message event (send/receive)
- [ ] Error event
- [ ] Signal event
- [ ] Terminate event

## Tasks
- [ ] User task
- [ ] Service task
- [ ] Script task
- [ ] Send task
- [ ] Receive task
- [ ] Manual task

## Annotations & Associations
- [ ] Text annotation
- [ ] Association (dashed, non-flow)

## Open questions for Phase 1
- Does each element get a distinct Mermaid node shape, or shape + classDef combination?
- How do timer/message/error events differ visually when all are "intermediate events"?
