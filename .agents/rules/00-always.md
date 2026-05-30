# 00 — Always (hard errors)

Always-on. Violating any of these is a hard error, not a style nit.

- **Verify before done.** Code is not done until the independent verifier (`30-verification.md`)
  returns `pass` on **fresh context**. The author of a change cannot mark it done — bias comes from
  shared context. Definition of Done = tests green **AND** verifier `pass` **AND** checklist complete.
- **Doc-sync same turn.** Any behavior/interface change updates its doc and `memory/` in the **same
  turn** as the code. No "I'll document later".
- **Security first.** Never hardcode roles, permissions, secrets, or hostnames. Validate and
  authorize on the server. Fail **closed**. (Detail: `50-security.md`.)
- **No hardcoded roles.** Gate behavior through helpers/config, never string literals like
  `if (user.role === "admin")`.
- **Effort is not a constraint.** Never reduce scope, skip tests, or pick the lazy design to save
  effort. If the work is large, **spawn parallel subagents** — do not cut corners.
- **Small increments.** One coherent change at a time; keep the diff reviewable.
- **State your assumptions.** If a requirement is ambiguous and the wrong guess is expensive, ask
  before building. Otherwise pick the obvious default and say so.
