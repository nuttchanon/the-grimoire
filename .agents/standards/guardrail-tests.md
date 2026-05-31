---
updated: 2026-05-31
status: canonical
description: Structural-invariant tests that fail CI when two sources of truth drift apart.
---

# Standards — guardrail tests (structural invariants)

A **guardrail test** asserts a structural invariant of the codebase, not a behaviour. It diffs two
sources that must agree and fails CI when they drift. Unit tests catch *wrong logic*; guardrail tests
catch *wrong wiring* — a channel registered but not allow-listed, an error code thrown but absent
from the catalog, a permission used but undeclared.

## When to add one

Add a guardrail whenever two places encode the same truth and silent drift between them is a defect:

| Invariant | Sources that must agree |
|---|---|
| IPC channels | the channel registry ↔ the main-process allow-list (`rules/50` fail-closed) |
| Error codes | codes thrown in source ↔ `standards/error-codes.md` catalog |
| Permissions | `can(permission)` keys used ↔ the declared permission set |
| Confirmed values | values read in code ↔ the project's confirmed-values table (ADR-tracked) |
| Routes / events | registered handlers ↔ the typed route/event map |

## Shape

A guardrail is an ordinary test in the project's runner (it rides the existing `verify` gate). It
must **fail closed**: if it cannot read one side, that is a failure, not a skip. Report the diff both
ways — present-but-unexpected *and* expected-but-missing — so neither orphan nor gap hides.

```
actual   = scan source for the live set         // e.g. ipcMain.handle("…") call sites
declared = read the registry / catalog / table  // the source of truth
expect(actual − declared).toBeEmpty()   // used but undeclared  → fail closed
expect(declared − actual).toBeEmpty()   // declared but unused  → stale entry
```

Starter: `templates/tests/guardrail.invariants.test.ts` (adapt the scanners to the project). Wire it
into CI as part of `verify` so drift fails the PR, not production.
