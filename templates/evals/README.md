# Eval templates

Starter evals for a Grimoire project. An eval measures whether the agent *behaves* correctly on a real
task — distinct from `grimoire doctor`, which checks wiring. See `standards/evals.md`.

## Use

1. Copy this folder into your project (e.g. `local/evals/` or a repo `evals/`).
2. Write one file per golden task, following `example-eval.md`.
3. Run each task against the agent and score it against its rubric.
4. When a real bug escapes, add a task that would have caught it — every fix becomes a regression eval.

A `grimoire eval` runner is not built yet; today an eval is a task file plus a rubric you apply by hand
or with your own harness. The format is the contract the future runner will read.

## Anatomy

- **Task** — fixed input with a known-good outcome.
- **Rubric** — explicit pass criteria, binary where possible.
- **Expected** — the known-good outcome or the must-hold properties.
