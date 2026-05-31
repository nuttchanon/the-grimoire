---
updated: 2026-05-31
status: canonical
description: Every error carries a stable code so logs, tests, and UIs switch on it, not on message strings.
---

# Standards — error-code catalog

Every thrown/returned error carries a stable **code** so logs, tests, and UIs can switch on it
without string-matching messages.

## Convention

- Code shape: `DOMAIN_REASON` in CONSTANT_CASE — e.g. `AUTH_TOKEN_EXPIRED`, `SYNC_CONFLICT`,
  `VALIDATION_REQUIRED_FIELD`.
- One catalog file per project (e.g. `src/errors/catalog.ts`) — the single source of truth.
- Error objects expose `{ code, message, cause? }`. `message` is human-facing; `code` is the contract.
- A lint/check script validates that every code used exists in the catalog and that the catalog has
  no duplicates. Wire it into the `verify` script as a gate (`lint:error-codes`): register the code **before** implementing; the build fails on an unregistered or duplicate code.

## What the template ships

- This convention.
- A scaffold check script stub (`stack/` profiles reference it). **The project fills the catalog** —
  the template does not ship project-specific codes.

## Example (TypeScript)

```ts
export const ERROR_CODES = {
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  VALIDATION_REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD",
} as const;
export type ErrorCode = keyof typeof ERROR_CODES;

export class AppError extends Error {
  constructor(public code: ErrorCode, message: string, public cause?: unknown) {
    super(message);
  }
}
```
