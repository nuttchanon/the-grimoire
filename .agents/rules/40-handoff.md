---
updated: 2026-05-31
description: 'Route every incoming request to exactly one home: chat, backlog, hotfix, or field-report.'
---

# 40 — Handoff routing

Every incoming chat request routes to exactly one of:

- **do-now** — single-commit, finishable this session, no ADR needed. No file; just do it and update
  `journal/session/current.md`.
- **BACKLOG** — multi-session, needs an ADR, touches schema/architecture, or the user says "add to
  backlog". Create a `journal/backlog/<id>.md` item (`status: open`, `priority: normal`).
- **HOTFIX** — production fire in the **code**. Create a `journal/backlog/<id>.md` item (`priority: hotfix`)
  with a cleanup checklist, then fix under HOTFIX mode (`20-modes.md`).
- **FIELD-REPORT** — on-site issue whose cause is **environmental** (hardware / OS / network / AV),
  not the codebase. Record as a `journal/memory/` `type: field-report`; don't patch code. Grep field-reports
  before assuming a code defect.

Decision rule of thumb:

> Right-now & small → do-now. Big / needs-a-decision / "later" → BACKLOG. Code on fire → HOTFIX.
> Site/environment on fire → FIELD-REPORT.

When unsure between do-now and BACKLOG, prefer BACKLOG and confirm scope before building.
