# Profile: desktop

Default for Electron / desktop apps (harvested from ever-sync-adapter).

| Concern | Default |
|---|---|
| Shell | Electron |
| Language | TypeScript (`strict`) |
| Lint / format | ESLint + Prettier |
| Test | Vitest (unit) + Playwright/Spectron-style (integration) |
| IPC | typed channels; document the channel table in `journal/memory/` |
| Release | new code paths behind env flags (single-unset rollback) |
| CI | typecheck + lint + test + package on tag |
| Testing policy | `tdd-mandatory` (override per project) |

`verify`: `tsc --noEmit && eslint . && vitest run --coverage && prettier --check .`

Note: for on-site/production tools, pair with HOTFIX mode (`rules/20-modes.md`).

## Reference defaults (adapt per project; vendor names are examples)

- **Process boundaries:** separate tsconfig per process (main / renderer / preload / shared) with
  path aliases; explicit IPC channel registry (one `channels.ts`), preload bridge, and typed API.
- **IPC discipline:** adding a channel touches several files (registry, preload, types, handler, the
  AGENTS.md/`local/` channel table) — keep that checklist explicit and, ideally, a guardrail test
  that diffs the registry against the allow-list in CI.
- **Secrets at rest:** OS keystore (`safeStorage` / keychain), never plaintext in the local DB
  (`rules/50`).
- **Native modules:** rebuild for Electron (`electron-rebuild`) before dev/dist; pin native driver
  versions per backend (e.g. Oracle Instant Client per server version).
- **Local DB:** embedded SQLite via a typed query builder; a single factory is the only legal
  instantiation point; temp-DB fixtures (`mkdtemp` + cleanup) for tests.
- **Tests:** Vitest (unit + integration) + Playwright (E2E); CSP + boundary regression as gates in
  the `verify` chain. Desktop profile defaults to `tdd-mandatory`.
- **Lint preset:** start from `templates/lint/` (clean-code limits + type-safety); enforce via
  `eslint .` in `verify`.
