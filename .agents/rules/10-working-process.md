---
updated: 2026-05-31
description: 'How to work a task end to end: plan, task contract, right altitude, small increments, tools, TDD.'
---

# 10 — Working process

- **Plan before code.** For anything beyond a trivial edit, state the plan (files, approach,
  test strategy) before touching code. For large/ambiguous work, get a thumbs-up first.
- **Goal-driven.** Turn the task into a verifiable goal before starting: "fix the bug" → "write a
  test that reproduces it, then make it pass". Strong success criteria let you loop to done without
  re-asking; weak ones ("make it work") force constant clarification.
- **Task contract.** Before non-trivial code, state the contract: the verifiable **goal**, explicit
  **acceptance criteria**, and what is **out of scope**. The verifier checks output against it — "done"
  means the criteria are met and nothing out-of-scope crept in.
- **Right altitude.** Match effort and abstraction to the ask. Do the full *right* thing for the
  actual request — neither gold-plate (speculative abstraction; YAGNI, `rules/05`) nor scope-cut to
  save effort (`rules/00`). When the right altitude is unclear, state your read and proceed.
- **Ask before large work.** Multi-session, schema-changing, or architecture-shifting work →
  route to **BACKLOG** (`40-handoff.md`) and confirm scope before starting.
- **Small increments.** Land coherent, reviewable slices. Vertical (tracer-bullet) over horizontal.
- **Use the tools.** When a skill or command fits the task, use it instead of improvising.
- **Adapt external guidance.** When applying an article, talk, or vendor doc, extract the principle and fit it to this stack and domain. Vendor names and examples in the source are illustrations, not mandates — keep the core tool-agnostic.
- **Update NOW.** Keep `session/current.md` reflecting the live state (focus / last-done /
  next-step / blockers). Rewrite in place; do not append.
- **TDD per stack policy.** Follow the active profile's testing policy
  (`tdd-mandatory` | `test-ready-deferred` | `none`) — see `stack/`.
