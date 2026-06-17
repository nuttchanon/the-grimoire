---
updated: 2026-05-31
status: canonical
description: 'The canonical code-quality standard: minimize complexity, with limits, type-safety, and performance rules.'
---

# Standards — clean code

The one goal: **minimize complexity** — the cognitive load to understand and safely change the code
(Ousterhout, *A Philosophy of Software Design*). Every rule below serves that goal; when two rules
seem to conflict, pick the option a reader understands faster. Supporting canon: KISS, YAGNI,
DRY-on-the-third-repetition, information hiding, SOLID.

> Language-agnostic core. TypeScript specifics: `standards/typescript.md`. Always-on summary:
> `rules/05-code-quality.md`. Mechanical enforcement: `templates/lint/`.

## When to read

Any change under `src/` (or the project's source root), and when reviewing another agent's output.

## Limits

Guardrails, not goals — a function at 49 lines is not "good" because it fits. Projects may override
in `local/`. Enforced by `templates/lint/` where the stack supports it.

| Constraint | Limit | Past it |
|---|---|---|
| Function length | ≤ 50 lines | extract a helper |
| Parameters | ≤ 4 | pass an options object |
| Nesting depth | ≤ 3 | guard clauses / extract |
| Cyclomatic complexity | ≤ 10 | split the branch logic |
| File length | soft 200 / hard 300 | split by responsibility |

## Readability

- Guard clauses and early returns over nested `if`/`else`.
- No dense one-liners that trade clarity for brevity.
- No magic numbers or strings — name them (`const MAX_RETRIES = 3`).
- Names come from the domain, not the implementation; match the surrounding code.
- Comments explain **why** (constraints, workarounds, invariants), never **what**. Delete comments
  that restate the code.

## The ladder (climb before you write)

YAGNI as a reflex, not a slogan. Before writing code, stop at the **first rung that holds**:

1. **Does this need to exist?** Speculative need → skip it, say so in one line.
2. **Stdlib does it?** Use it.
3. **Native platform feature covers it?** DB constraint over app code, CSS over JS, `<input type="date">` over a picker lib.
4. **Already-installed dependency solves it?** Use it — never add a new dep for what a few lines do.
5. **One line?** One line.
6. **Only then:** the minimum code that works.

Two rungs work → take the higher one and move on; the ladder is a reflex, not a research project.
No interface with one implementation, no factory for one product, no config for a value that never
changes, no scaffolding "for later". Deletion over addition; the shortest working diff wins.

**Never simplify away** (lazy, not negligent): input validation at trust boundaries, error handling
that prevents data loss, security measures, accessibility basics, or anything explicitly requested.
Picking the flimsier algorithm to save a line is not laziness — it's a bug.

## Function & module design

- One responsibility per function; extract when it grows a second.
- Command/query separation: a function either does something or returns something, not both.
- No boolean flag parameters — they hide two functions in one. Split, or pass an enum/options object.
- Prefer pure functions; isolate and minimize side effects.
- Default to immutability; do not mutate inputs.
- Deep modules: a simple interface over meaningful work. A wrapper that only forwards calls adds
  complexity without hiding any.

## Type safety (a quality gate, not decoration)

- No `any`. Use `unknown` and narrow, or a real type.
- Explicit return types on exported functions.
- No unjustified non-null assertions (`!`); narrow instead, or comment the invariant.
- Exhaustive `switch` over unions (compile-time `never` check).
- No floating promises — `await`, return, or explicitly `void`.

## Performance (measured, never premature)

Premature optimization is still banned (YAGNI). But do not ship known-quadratic or chatty code:

- No N+1 queries / calls — batch.
- Hoist invariant work out of loops.
- No synchronous I/O on a hot path or the UI thread.
- Stream or paginate large data; do not load it all into memory.
- Memoize only at a profiled hotspot, with the evidence noted.
- Avoid O(n²) on inputs that are large in production.

## Suppression policy

- `eslint-disable`, `@ts-ignore`/`@ts-expect-error`, and `any` require an inline comment naming the
  exact constraint and a follow-up. No silent suppression.
- Disabling a rule to make CI green **without an equivalent guard** is tech debt — record it; open an
  ADR (`codex/decisions/`) if it is structural.
- A **deliberate shortcut** (a ladder rung taken with a known ceiling — global lock, O(n²) scan, naive
  heuristic) gets a `ponytail:` comment naming the ceiling and the upgrade path:
  `// ponytail: global lock, per-account locks if throughput matters`. This reads the simplification as
  intent, not ignorance, and the marker is harvestable into a debt ledger (see `stack/README.md`).
- Never weaken a protection (CSP, a boundary/regression test) without an equal-or-stronger replacement.

## Cleanup

- No commented-out code — delete it; git remembers.
- No unused exports, variables, or imports.
- Remove one-off scripts (migrations, generators, debug harnesses) after use.

## Review checklist (the verifier refutes against this)

- [ ] Climbed the ladder — no code that stdlib/native/an existing dep already does; no speculative
      abstraction; deliberate shortcuts carry a `ponytail:` ceiling+upgrade comment; no guardrail
      (validation, data-loss, security, a11y) simplified away.
- [ ] Within limits (length, params, nesting, complexity, file size).
- [ ] Reads top-to-bottom; guard clauses; no magic values; why-comments only.
- [ ] One responsibility per unit; no boolean-flag params; side effects isolated.
- [ ] No `any`; exported return types; exhaustive switches; no floating promises.
- [ ] No N+1, no sync I/O on hot paths, no needless O(n²); memoization is evidence-backed.
- [ ] No unjustified suppression; no weakened guard.
- [ ] No commented-out or dead code; one-off scripts removed.
- [ ] `verify` green (typecheck + lint + test + build); nothing mislabeled PASS.
