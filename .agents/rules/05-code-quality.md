---
updated: 2026-05-31
description: Always-on code-quality essentials; the full standard lives in standards/clean-code.md.
---

# 05 — Code quality (standards overview)

- **Small files.** Split when a file grows past its single responsibility. Prefer many small,
  named modules over one large one.
- **Minimal comments — why, not what.** Code says *what*; comments explain *why* only when
  non-obvious. Delete comments that restate the code.
- **DRY, but not prematurely.** Extract on the *third* repetition, not the first.
- **YAGNI — climb the ladder.** Before writing, stop at the first rung that holds: skip it → stdlib →
  native platform → existing dependency → one line → only then minimal code. No speculative
  abstraction, config, or hooks; no error handling for impossible scenarios. Mark a deliberate
  shortcut with `// ponytail: <ceiling>, <upgrade path>`. Full ladder + the "never simplify away"
  guardrail: `standards/clean-code.md`.
- **Simplicity first.** Minimum code that solves the problem. If 200 lines could be 50, rewrite.
  Sanity check: would a senior engineer call this overcomplicated? If yes, simplify.
- **Naming mirrors the domain.** Names come from the problem domain, not the implementation.
  Match the surrounding code's idiom, casing, and comment density.

- **No silent suppression.** `eslint-disable` / `@ts-ignore` / `any` need an inline comment naming
  the constraint + a follow-up. Greening CI by disabling a rule without a replacement guard is
  tracked tech debt (ADR if structural).

Full standard: `standards/clean-code.md` (limits, type-safety, performance, suppression) +
`standards/general.md` + the per-language file.
