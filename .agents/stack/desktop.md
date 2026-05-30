# Profile: desktop

Default for Electron / desktop apps (harvested from ever-sync-adapter).

| Concern | Default |
|---|---|
| Shell | Electron |
| Language | TypeScript (`strict`) |
| Lint / format | ESLint + Prettier |
| Test | Vitest (unit) + Playwright/Spectron-style (integration) |
| IPC | typed channels; document the channel table in `memory/` |
| Release | new code paths behind env flags (single-unset rollback) |
| CI | typecheck + lint + test + package on tag |
| Testing policy | `tdd-mandatory` (override per project) |

`verify`: `tsc --noEmit && eslint . && vitest run --coverage && prettier --check .`

Note: for on-site/production tools, pair with HOTFIX mode (`rules/20-modes.md`).
