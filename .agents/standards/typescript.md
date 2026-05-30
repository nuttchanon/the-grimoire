# Conventions — TypeScript

- **`strict: true`.** No implicit `any`. Prefer `unknown` over `any` at boundaries, then narrow.
- **No non-null `!`** except where provably safe with a comment. Prefer guards.
- **Types over interfaces** for unions/utility; `interface` for extendable object shapes — pick one
  per project and stay consistent.
- **Discriminated unions** for state; avoid boolean-flag soup.
- **`const` by default**; `let` only when reassigned; never `var`.
- **No default exports** for modules with logic (named exports aid refactor + grep). Components MAY
  use default export if the framework expects it.
- **Async:** always `await` or explicitly `void` a promise; no floating promises.
- **Validation at boundaries** with a schema lib (zod/valibot). Internal code trusts validated types.
- **Errors** carry a code (`error-codes.md`); never throw strings.
