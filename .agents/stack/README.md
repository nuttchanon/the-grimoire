# Components — tech-stack presets

A **profile** pins the framework, lint/format, test setup, and CI scaffold for a project type.
Pick one at `init`; record the active profile in `local/AGENTS.local.md`.

## Profiles (v0.1 starter set)

- `web-app.md` — full-stack / front-end web.
- `desktop.md` — Electron / desktop app.
- `library.md` — published or internal reusable package.

## Testing-policy knob (per profile, project chooses — not hardcoded)

| Policy | Meaning |
|---|---|
| `tdd-mandatory` | Red-green-refactor required before merge (ever-sync style). |
| `test-ready-deferred` | Test harness wired; tests written as features stabilize (pharma style). |
| `none` | No automated tests (spikes/throwaway only). |

## The `verify` script

Every profile defines a `verify` command — the single gate the **Warden** runs
(`rules/30-verification.md`):

```
verify = typecheck + lint + test + coverage + format:check
```

Wire it as a package script (`npm run verify`) so it is one command everywhere. The Warden runs it
and quotes the real output; "looks good" is never acceptable.
