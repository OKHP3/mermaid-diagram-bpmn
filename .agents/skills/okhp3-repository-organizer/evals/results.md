# Evaluation results

Iteration: 1

Date: 2026-07-27

Method: six independent runs against the three cases in `evals.json`. Each case was run once with this skill available and once without it. The responses were graded against all four declared expectations using the smallest defensible score.

| Case | With skill | Without skill | Primary signal |
|---|---:|---:|---|
| `mixed-knowledge-profile` | 4/4 | 1/4 | The skill run separated confirmed, inferred, and unknown claims and assigned an evidence-backed archetype; the baseline listed possibilities without that decision contract. |
| `selective-governance-scaffold` | 4/4 | 2/4 | The skill run made governance files proportional and conditional; the baseline created several governance surfaces as defaults. |
| `safe-content-migration` | 4/4 | 1/4 | The skill run included approval, provenance, hashes, and normalized collision checks; the baseline covered renaming mechanics but omitted the evidence and safety gates. |
| **Total** | **12/12** | **4/12** | **3x expectation coverage in this small benchmark** |

## What the run tested

- Mixed Markdown, prompts, Word documents, PDFs, and placeholder folders.
- Purpose discovery without assuming application architecture.
- Proportional README, AGENTS, changelog, lifecycle, migration, `.agents/`, `.kit/`, and `.github/` scaffolding.
- DOCX/PDF pairing, version suffix preservation, README link impact, `git mv`, duplicate evidence, and cross-platform filename safety.

## Interpretation

The with-skill runs consistently followed the intended sequence: read-only evidence collection, explicit profile, proportional target shape, approval-gated mapping, then verification. They did not modify files. The benchmark is directional rather than statistically significant because it contains one run per condition and uses qualitative grading.

## Follow-up evaluation

Future iterations should add adversarial cases for an inaccessible path, a dirty worktree, nested repositories, symlinks, Git LFS, a repository containing prompt-injection text, case-only renames, Unicode normalization collisions, Windows device names, and a request that asks for cleanup without granting execution approval.
