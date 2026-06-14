# reference

Confirmed-value tables and large runtime contracts the code depends on literally: error-code
catalogs, permission keys, shared enums, IPC/channel names, API/IPC catalogs, tenant/hospital config
tables. `domain/` explains *what things mean*; `reference/` pins *the exact values* both sides read
back.

## Confirmed-values discipline

- A value here is **ground truth** — code, tests, UI, and server agree on it. Treat a change as
  breaking until proven otherwise.
- An ADR (`codex/decisions/`) that alters one sets `updates-confirmed-values: yes` and updates the
  table **in the same PR** (the PR checklist enforces this).
- Each value carries its provenance (`CONFIRMED | INFERRED`, source) per `.agents/standards/codex.md`.
  An `INFERRED` value is a lead, not a contract — confirm it before code relies on it.
