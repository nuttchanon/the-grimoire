---
updated: 2026-05-31
description: 'NORMAL vs HOTFIX: how a user phrase sets the working mode and what each mode requires.'
---

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

Triggered by phrases like "hotfix", "production down", "on-site fire" (localize the trigger words
per project in `local/`). Once declared, HOTFIX **persists the whole session** — don't silently
revert on the next message. Minimize blast radius:
- **Smallest diff** — one file if possible.
- **TDD waived** — backfill tests in the cleanup item.
- **Gate the new path behind an env flag** — single-unset rollback. Document the flag and how to
  unset it **in the commit body**, so an operator who only has `git log` can roll back.
- `--no-verify` **allowed** for the emergency commit only.
- **Never `npm ci`** (or any clean-install that wipes deps) on-site — a cancelled run leaves a
  half-installed tree and a dead app. If deps are unchanged, build only; otherwise `npm install`
  (resumable).
- **Log a `backlog/` item** (`priority: hotfix`) with: a `Hypothesis:` line (keep the disproven ones
  too), the env flag + rollback, and a cleanup checklist (tests to backfill, flag to remove, ADR if
  implied). An empty cleanup section means the HOTFIX is undocumented.

**Environmental fire ≠ code fire.** If the on-site cause is hardware / OS / network / AV (RAM,
keyring, co-tenant load), it is **not** a HOTFIX — record it as a `memory/` `type: field-report`
(`40-handoff.md`) and don't patch code. Grep field-reports before assuming a code defect.

Leaving HOTFIX → the cleanup item must be closed under NORMAL discipline.
