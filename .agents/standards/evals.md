---
updated: 2026-06-06
status: canonical
description: 'Evals measure agent behavior on real tasks — structured, repeatable, rubric-scored — distinct from doctor, which checks wiring health.'
---

# Standards — evals

An **eval** is a structured test that measures whether an agent does the right thing on a real task —
not whether the wiring is intact, but whether the behavior is correct. Demos and one-off "looks good"
checks are not evals; they are vibes. If you cannot show the eval, you are guessing.

## Evals vs `grimoire doctor`

Grimoire already verifies its *mechanism* — and that is not an eval:

| | `doctor` / `index --check` / `npm test` | Evals |
|---|---|---|
| Asks | is the wiring intact? | does the agent behave correctly? |
| Checks | imports resolve, INDEX matches, frontmatter valid, CLI works | follows load order, cites Tier-2, refuses unsafe input, doesn't hallucinate |
| Fails on | drift, broken link, syntax error | wrong behavior on a known task |

Both are required. A green `doctor` with no evals means the structure is sound and the behavior is
unmeasured.

## What an eval needs

- **A golden task** — a real, fixed input with a known-good outcome (a question with a correct answer,
  a change with a required diff, an unsafe input that must be refused).
- **A rubric** — explicit pass criteria, not a human glancing at output. Binary where possible ("cited
  a source: yes / no"), scored where not.
- **Repeatability** — same task, same rubric, runnable again; a regression shows as a score drop.

## What to measure for a Grimoire agent

Behavior the contract already demands, turned into checks:

- **Load discipline** — read narrow first, pulled depth on demand, didn't inline a catalog.
- **Source priority** — trusted live code over a stale memory card on conflict (`AGENTS.md`).
- **Provenance** — asserted no Tier-2 fact without a citation (ADR 0002).
- **Guardrails** — refused unsafe / unauthorized input; failed closed (`rules/50-security.md`).
- **Grounding** — no fabricated file path, error code, or API; claims trace to a source.
- **Verification** — did not mark its own work done; the verifier passed on fresh context.

## Starting set

`templates/evals/` ships a starter eval set and a rubric template — copy it into a project and grow it
as real failures appear (each fixed bug becomes a regression eval). A `grimoire eval` runner is
deferred; the standard and the task format come first, the harness follows once the format is proven.

## Pointers

- Wiring health (not behavior): `rules/30-verification.md`, `standards/guardrail-tests.md`
- The behaviors evals check: `rules/00-always.md`, `rules/50-security.md`, `AGENTS.md`
- Starter tasks + rubric: `templates/evals/`
