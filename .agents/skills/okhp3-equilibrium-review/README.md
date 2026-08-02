# okhp3-equilibrium-review

**OverKill Hill P³** · Reusable evidence and decision-quality review

`okhp3-equilibrium-review` evaluates documents, reports, spreadsheets,
hypotheses, decision memos, and Agent Skills through independent reviewers,
conditional disruption, and evidence-based adjudication.

It is deliberately separate from the Skill Foundry. The Skill Foundry uses
this pattern to improve skills, while this package can review any artifact that
needs a defensible answer to “is this ready, supported, safe, and useful?”

## Package map

- `SKILL.md` is the portable agent contract.
- `references/review-protocol.md` defines the equilibrium-inspired control loop.
- `references/role-prompts.md` defines the five roles and structured result.
- `references/domain-adapters.md` maps the core protocol to common artifacts.
- `assets/equilibrium-review-record.json` is a machine-readable record template.
- `scripts/run_equilibrium_review.py` creates prompts and optionally runs five
  explicit subprocess-based agent roles without shell interpolation.
- `evals/evals.json` contains the initial evaluation design.
- `benchmarks/benchmark.json` records the current not-run evidence state.

## Quick start

Generate a review plan without invoking an agent provider:

```text
python scripts/run_equilibrium_review.py \
  --artifact path/to/artifact.md \
  --question "Is this artifact supported and ready for controlled use?" \
  --output-dir review-output \
  --mode five-way \
  --dry-run
```

To run an explicit local adapter, pass a JSON argument vector. The placeholders
`{role}`, `{prompt_file}`, `{output_file}`, `{artifact}`, `{question}`, and
`{review_dir}` are replaced by the orchestrator. No command is run when the
adapter is omitted.

```text
python scripts/run_equilibrium_review.py \
  --artifact path/to/artifact.md \
  --question "Is this report safe and decision-useful?" \
  --output-dir review-output \
  --agent-command-json '["python", "my_agent_adapter.py", "--role", "{role}", "--prompt-file", "{prompt_file}"]'
```

The default evidence posture is conservative. Missing or unstructured agent
results become `not-run` or `uncertain`; they do not become agreement.

## Decision model

The normal path is five role slots: evidence, outcome, safety-portability,
disruptor, and negotiator. The protocol remains conditional: when the first
three materially disagree, the negotiator resolves the disagreement and the
disruptor is skipped for release purposes. The explicit `five-way` mode runs
the disruptor anyway for exploratory comparison, but marks it non-authoritative
in that case.

This package does not publish, edit source systems, send messages, or claim
statistical significance. It creates a traceable review record that another
authorized workflow or human can use.

## License

MIT. Built by Jamie Hill and the OverKill Hill P³ skillz project.
