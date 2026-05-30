# Profile: web-app

Default for full-stack / front-end web projects.

| Concern | Default |
|---|---|
| Framework | Next.js (App Router) or Vite + React |
| Language | TypeScript (`strict`) — see `standards/typescript.md` |
| Lint / format | ESLint + Prettier |
| Test | Vitest + React Testing Library; Playwright for e2e |
| Coverage | reported in `verify`; threshold set per project |
| Validation | zod at every boundary |
| CI | typecheck + lint + test + build on PR |
| Testing policy | `test-ready-deferred` (override per project) |

`verify`: `tsc --noEmit && eslint . && vitest run --coverage && prettier --check .`

## Reference defaults (adapt per project; vendor names are examples)

- **Auth guards — one model, three call-site shapes:** a single `can(permission)` policy with
  `requirePermission()` (throws, for actions), `requirePermissionResponse()` (returns 401, for route
  handlers), `requirePermissionOrRedirect()` (for pages). Zero inline `role === "x"` checks.
- **Edge-safe auth split:** keep an edge/middleware config with **no DB** separate from the full
  server auth that hits the DB at sign-in (Auth.js v5 pattern).
- **Validation:** zod at every server-action boundary; client validation is UX only (`rules/50`).
- **Module layering:** pure engine + read/write/projection split + schema-ownership by module
  (`standards/architecture.md`).
- **Security headers in one place** (e.g. `next.config` headers): CSP, HSTS, X-Frame-Options DENY,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy; disable `poweredByHeader`.
- **DB:** typed query builder / ORM with tracked migrations (generate → migrate); `db:push` dev-only.
