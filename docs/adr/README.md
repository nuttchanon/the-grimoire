# Architecture Decision Records

One file per decision: `docs/adr/NNNN-kebab-title.md`, copied from `0000-template.md`. ADRs are
**project-owned** — `grimoire sync` never touches this folder. Number sequentially; never renumber.

## When to write one

- A choice with lasting consequences (framework, data model, auth model, module boundaries).
- A trade-off a future reader would otherwise relitigate.
- **No test suite for a unit of work.** Absence of tests is a *recorded decision*, not a silent
  omission: open an ADR stating why (spike/throwaway, external constraint) and the conditions under
  which tests get backfilled. A missing test suite with no ADR is a defect.

## The `updates-confirmed-values` field

Some values are **ground truth** the code reads back — IPC channel names, error codes, permission
keys, tenant/hospital configs, shared enums. When an ADR changes one of these, set
`updates-confirmed-values: yes` and, **in the same PR**, update the project's confirmed-values table
(its location is project-specific — e.g. `journal/memory/` or a `local/` standard). The PR checklist must
verify the table was updated; a `yes` ADR without a matching table change does not merge.

## Status lifecycle

`proposed` → `accepted` (merged) → later `superseded` (point the new ADR's `supersedes:` at it) or
`deprecated`. Never delete an accepted ADR; supersede it so the history stays legible.
