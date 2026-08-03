# Promotion Manifest

The promotion manifest records why a package is being shared, which copy was
selected, what was verified, and what remains outside the evidence. It is not a
publication authorization and it must not contain secrets or private source
material.

## Required fields

| Field | Meaning |
|---|---|
| `schema_version` | Manifest schema version |
| `skill` | Name, version, maturity, and evidence status |
| `source` | Origin repository and package path |
| `mirrors` | Local publication and other authorized copy paths |
| `canonical_target` | Proposed or accepted `skillz` family path |
| `inventory` | Relative files and SHA-256 hashes |
| `decision` | Selection rationale, alternatives, and disposition |
| `safety` | Public-safety, license, and dependency findings |
| `authorization` | Requested, granted, or withheld actions |
| `verification` | Checks run, timestamps, and limitations |
| `recovery` | How to undo or inspect the handoff without data loss |

## Evidence rules

- Use `live` only for a fresh run whose package version and configuration are
  recorded.
- Use `analytical` for structural or manual review without a live executor.
- Use `historical` for evidence generated against an earlier package version.
- Use `not-run` when a required executor, external source, or holdout was not
  available.
- A current hash comparison proves present equality only. It does not prove
  prior authorization, canonical selection, or an unrecorded pre-sync state.

## Minimal decision vocabulary

- `candidate`: local package is being explored.
- `shareable`: public-safety and portability review passed within stated scope.
- `promotion-ready`: validation and review gates passed, but canonical
  acceptance is still external.
- `canonical`: accepted in the distribution repository with a recorded commit
  or package hash.
- `blocked`: a safety, license, authorization, or integrity issue prevents
  sharing.
