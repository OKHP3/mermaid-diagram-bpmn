# Audience Profiles

Three profiles. Every diagram declares one before generation starts. This is Gate 3 of the validation framework — the diagram must match its declared profile or it fails regardless of syntax/semantic correctness.

## Executive

- **Node count**: 5-7 maximum
- **Detail level**: high-level boxes, no attribute details
- **Edge labels**: 3 words or fewer, or unlabeled
- **Vocabulary**: outcomes and decisions, not implementation
- **Typical types**: flowchart (simple), C4 context level, timeline

## Analyst

- **Node count**: 10-20
- **Detail level**: gateway labels, swim lanes, subprocess references visible
- **Edge labels**: condition labels on branches (e.g., "approved", "rejected, >$10k")
- **Vocabulary**: process terminology, role names, decision criteria
- **Typical types**: BPMN-style flowcharts with swim lanes, sequence diagrams, state diagrams

## Technical

- **Node count**: 15-20 before splitting into multiple diagrams (per core's splitting guidance)
- **Detail level**: full annotation — attribute details, real API/event names, companion `.md` files for large payloads (notes, JSON examples)
- **Edge labels**: precise, including data types/formats where relevant
- **Vocabulary**: implementation-accurate (real endpoint names, real schema fields)
- **Typical types**: C4 component/code level, ER diagrams, class diagrams, sequence diagrams with notes

## Determining audience

If the user states it, use it. If not, ask one question: "Who's this diagram for — a quick exec overview, an analyst working the process, or technical detail?" Do not guess silently; a wrong guess fails Gate 3 after the work is already done.

## Multi-audience requests

If the same system/process needs multiple audiences, produce separate diagrams (per naming convention's `[view]-[audience]` slots), not one diagram trying to serve all three. Register each separately in `DIAGRAMS.md` with cross-references.
