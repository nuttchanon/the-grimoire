# 40 — Handoff routing

Every incoming chat request routes to exactly one of:

- **do-now** — single-commit, finishable this session, no ADR needed. No file; just do it and update
  `session/current.md`.
- **BACKLOG** — multi-session, needs an ADR, touches schema/architecture, or the user says "add to
  backlog". Create a `backlog/<id>.md` item (`status: open`, `priority: normal`).
- **HOTFIX** — production fire. Create a `backlog/<id>.md` item (`priority: hotfix`) with a cleanup
  checklist, then fix under HOTFIX mode (`20-modes.md`).

Decision rule of thumb:

> Right-now & small → do-now. Big / needs-a-decision / "later" → BACKLOG. On fire → HOTFIX.

When unsure between do-now and BACKLOG, prefer BACKLOG and confirm scope before building.
