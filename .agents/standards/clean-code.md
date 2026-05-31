---
updated: 2026-05-31
status: canonical
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
  ADR (`docs/adr/`) if it is structural.
- Never weaken a protection (CSP, a boundary/regression test) without an equal-or-stronger replacement.

## Cleanup

- No commented-out code — delete it; git remembers.
- No unused exports, variables, or imports.
- Remove one-off scripts (migrations, generators, debug harnesses) after use.

## Review checklist (the verifier refutes against this)

- [ ] Within limits (length, params, nesting, complexity, file size).
- [ ] Reads top-to-bottom; guard clauses; no magic values; why-comments only.
- [ ] One responsibility per unit; no boolean-flag params; side effects isolated.
- [ ] No `any`; exported return types; exhaustive switches; no floating promises.
- [ ] No N+1, no sync I/O on hot paths, no needless O(n²); memoization is evidence-backed.
- [ ] No unjustified suppression; no weakened guard.
- [ ] No commented-out or dead code; one-off scripts removed.
- [ ] `verify` green (typecheck + lint + test + build); nothing mislabeled PASS.
