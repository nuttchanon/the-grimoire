# Standards — observability

Lessons from production data/sync tools. The goal: an operator can self-diagnose a live issue from
logs alone, without attaching a debugger.

## Make the diagnosable facts visible at INFO

- When a query/request returns **zero rows or an empty result on a path that usually has data**, log
  enough to tell "correct empty" from "wrong input" — at **INFO**, not DEBUG. Operators rarely have
  debug mode on in production.
- For generated queries, log the **rendered parameters** (the actual values sent), not just the
  template. A silent 0-row from a bad default (locale, era, timezone, unit) is otherwise invisible.

## No silent empty results

- A path that returns nothing where data was expected must surface *why* (filtered, unauthorized,
  no-match) — never an unexplained empty array.

## Per-source / per-locale overrides are first-class

- Defaults that vary by deployment (date era, timezone, encoding, ID format, DB dialect) must be
  **documented in onboarding** and overridable per source. Bake the override point in; don''t assume
  one global default fits every site.

## Logging hygiene

- Never log secrets, tokens, or full PII; scrub before logging (`rules/50-security.md`).
- Structured logs (level + code + context) over free-text — pairs with the error-code catalog
  (`standards/error-codes.md`).
