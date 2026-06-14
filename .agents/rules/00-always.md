---
updated: 2026-05-31
description: The non-negotiable rules; violating any is a hard error, not a style nit. Read every session.
---

# 00 — Always (hard errors)

Always-on. Violating any of these is a hard error, not a style nit.

- **Verify before done.** Code is not done until the independent verifier (`30-verification.md`)
  returns `pass` on **fresh context**. The author of a change cannot mark it done — bias comes from
  shared context. Definition of Done = tests green **AND** verifier `pass` **AND** checklist complete.
  For **user-facing, data-collecting** apps, the launch-security checklist
  (`standards/launch-security-checklist.md`) is part of Done, not a later pass.
- **Read the knowledge base first.** Before domain/feature work, read `codex/INDEX.md` — the
  project's source-of-truth knowledge base (domain, requirements, decisions, evidence). Don't start
  blind.
- **Doc-sync same turn.** Any behavior/interface change updates its doc and `journal/memory/` in the **same
  turn** as the code. No "I'll document later".
- **Security first.** Never hardcode roles, permissions, secrets, or hostnames. Validate and
  authorize on the server. Fail **closed**. (Detail: `50-security.md`.)
- **No hardcoded roles.** Gate behavior through helpers/config, never string literals like
  `if (user.role === "admin")`.
- **Effort is not a constraint.** Never reduce scope, skip tests, or pick the lazy design to save
  effort. If the work is large, **spawn parallel subagents** — do not cut corners.
- **No silent test gaps.** Shipping a unit of work without a test suite is a *recorded decision*, not
  a silent omission: write an ADR (`codex/decisions/`) stating why (spike/throwaway, external constraint) and
  when tests get backfilled. A missing test suite with no ADR is a defect.
- **Confirmed values change with their ADR.** When a decision alters ground-truth values the code
  reads back (IPC channels, error codes, permission keys, tenant configs, shared enums), the ADR sets
  `updates-confirmed-values: yes` and the same PR updates the project's confirmed-values table.
- **Small increments.** One coherent change at a time; keep the diff reviewable. (Detail: `10-working-process.md`.)
- **Surgical changes.** Every changed line traces to the request; don't touch adjacent code you were
  not asked to. (Detail: `25-surgical-changes.md`.)
- **Never edit the managed base; customize in `local/`.** In a consuming project, the base
  (`.agents/AGENTS.md`, `rules/`, `standards/`, `stack/`, `agents/`, `skills/`, `commands/`,
  `tooling.json`) is overwritten by `grimoire sync`. Put every project change under root `local/`
  (never synced) — it loads last and wins. Protocol: `local/README.md`.
- **State your assumptions; don't pick silently.** If a requirement is ambiguous, name what is
  confusing and present the interpretations — do not choose one quietly. Ask when the wrong guess is
  expensive; otherwise pick the obvious default and say so. Push back when a simpler or better
  approach exists.
