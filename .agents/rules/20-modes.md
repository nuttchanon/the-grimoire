# 20 — Modes: NORMAL vs HOTFIX

A mode is set by a user phrase and **persists for the whole session**. Record it at the top of
`session/current.md`.

## NORMAL (default)

Full discipline:
- Plan before code; TDD per the active stack testing-policy.
- Full `verify` script (`stack/`): typecheck + lint + test + coverage + format:check.
- Docs and `memory/` updated **same turn** as the change.
- Commits go through hooks (husky + lint-staged). No `--no-verify`.
- The verifier must `pass` before "done".

## HOTFIX (on-site fire)

Triggered by phrases like "hotfix", "production down", "on-site fire". Minimize blast radius:
- **Smallest diff** — one file if possible.
- **TDD waived** — backfill tests in the cleanup item.
- **Gate the new path behind an env flag** — single-unset rollback.
- `--no-verify` **allowed** for the emergency commit only.
- **Log a `backlog/` item** tagged `priority: hotfix` with a cleanup checklist (tests to backfill,
  flag to remove, ADR if the fix implies a decision).

Leaving HOTFIX → the cleanup item must be closed under NORMAL discipline.
