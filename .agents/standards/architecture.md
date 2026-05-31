---
updated: 2026-05-31
status: canonical
description: Module layering and boundaries distilled from real modular codebases.
---

# Standards — architecture

Patterns distilled from real modular codebases. Apply where the module is non-trivial; don't
over-structure a thin CRUD screen (YAGNI).

## Pure domain layer

- Keep business logic in a layer with **zero framework/DB/IO imports** (call it `engine/`, `domain/`,
  or `core/`). Plain functions in, plain data out.
- DB/IO lives only in dedicated read/write modules that call into the pure layer — never the reverse.
- Make non-determinism injectable: pass a **seeded RNG** / clock, so generation is reproducible and
  unit-testable without mocks.

## Read / write / projection split

- **reads** — query module (`data/queries.ts`), `server-only`, returns raw rows.
- **writes** — action module (`actions/`), the only place that mutates.
- **projections** — pure shape transforms for each render surface, no DB. Independently testable.
- A view layer composes reads + projections and owns the cache tag.

## Schema / ownership by module

- Core owns identity-level schema only; each module owns its own tables. The shared DB client is
  **schema-less** (doesn't import module tables at init), so modules don't become a circular hub.
- Modules may re-export core tables for FK convenience — never invert the dependency.

## Invariants

- Where correctness depends on a structural fact (an inner-join that excludes ghosts, an ordering, a
  default), state it with a `// INVARIANT:` comment **and** a test. A silent structural invariant
  breaks the first time someone writes a left-join.
- Validate required env at the **startup boundary** with a clear error — never `process.env.X!`
  scattered at use sites (a missing var should fail loud at init, not as a random runtime error).
