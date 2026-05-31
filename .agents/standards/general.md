---
updated: 2026-05-31
status: canonical
description: Baseline conventions: naming, file size, import order, error handling, formatting.
---

# Standards — general

## Naming

| Thing | Case | Example |
|---|---|---|
| files / dirs | kebab-case | `user-profile.ts` |
| variables / functions | camelCase | `getUserProfile` |
| types / classes / components | PascalCase | `UserProfile` |
| constants | CONSTANT_CASE | `MAX_RETRIES` |
| booleans | `is/has/can/should` prefix | `isActive`, `canEdit` |

Names come from the **domain**, not the implementation. Match the surrounding code.

## File size

- Soft ~200 / hard 300 lines (full limits table: `standards/clean-code.md`). Past that, split by
  responsibility.
- One primary export per file where practical.

## Imports (ordering)

1. std lib / runtime
2. third-party
3. internal absolute (`@/...`)
4. relative (`./`, `../`)

Blank line between groups. No unused imports.

## Error handling

- Throw typed errors carrying a **code** (see `error-codes.md`). Never throw bare strings.
- Catch only what you can handle; otherwise let it propagate.
- No silent catches. If you swallow an error, log *why* with context.
- Fail closed on the security path (`rules/50-security.md`).

## Formatting

- Formatter + linter own style (Prettier/ESLint, ruff, gofmt, …). Do not hand-format.
- `format:check` is part of the `verify` script and must pass.
