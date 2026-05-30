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
