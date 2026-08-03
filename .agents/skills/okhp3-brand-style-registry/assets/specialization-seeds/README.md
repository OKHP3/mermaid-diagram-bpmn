# Repository specialization seeds

Each directory is a narrow skill intended for the repository that owns its profile. These packages do not replace the public `okhp3-brand-style-registry` skill; they prevent a repository-local agent from selecting a sibling brand by mistake.

To seed one repository:

1. Copy the relevant specialization directory to `.agents/skills/<skill-name>/`, then rename `SKILL.md.template` to `SKILL.md`.
2. Copy its matching profile seed to `references/<style-id>.yaml` inside that skill directory.
3. Adjust source locations to local authoritative files where possible.
4. Keep the bundled profile and `SKILL.md` version aligned when the profile changes.
5. Run that repository’s skill validation and catalog process.

The wrapper is intentionally application-focused. Use the public registry for capture, profile revision, CSS signal extraction, and multi-profile composition. A wrapper may still be used alone for a bounded application task because it contains the complete target preflight, preservation, verification, and handoff contract.

| Repository specialization | Matching profile seed |
|---|---|
| `okhp3-overkill-hill-brand` | `../profile-seeds/overkill-hill.yaml` |
| `okhp3-glee-fully-brand` | `../profile-seeds/glee-fully.yaml` |
| `okhp3-askjamie-brand` | `../profile-seeds/askjamie.yaml` |
