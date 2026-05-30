# Profile: library

Default for published or internal reusable packages.

| Concern | Default |
|---|---|
| Build | tsup / unbuild → ESM (+ CJS if consumers need it) |
| Language | TypeScript (`strict`), emit `.d.ts` |
| Lint / format | ESLint + Prettier |
| Test | Vitest; high coverage bar (public API) |
| Public API | explicit `exports` map; no deep imports |
| Versioning | semver; changesets for release notes |
| CI | typecheck + lint + test + build + pack-check on PR |
| Testing policy | `tdd-mandatory` (public contract — override per project) |

`verify`: `tsc --noEmit && eslint . && vitest run --coverage && prettier --check . && npm pack --dry-run`
