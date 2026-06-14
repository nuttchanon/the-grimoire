# Stack — tech-stack presets

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
| `none` | No automated tests (spikes/throwaway only). **Requires a recorded ADR** (`codex/decisions/`) — see `rules/00-always.md` "No silent test gaps". |

## The `verify` script

Every profile defines a `verify` command — the single gate the **verifier** runs
(`rules/30-verification.md`):

```
verify = typecheck + lint + test + coverage + format:check
```

Wire it as a package script (`npm run verify`) so it is one command everywhere. The verifier runs it
and quotes the real output; "looks good" is never acceptable.

## Knowledge retrieval — graphify (ADR 0006)

Grimoire does **not** ship a homegrown retrieval engine. Searching the codebase (and `codex/`) is
delegated to **graphify**, a code+docs knowledge graph. The base prescribes the convention; install is
per-machine.

- **Install** (one-time, per machine): `uv tool install graphifyy` then `graphify install`.
- **Build / refresh** the graph for a repo: `graphify .` (PowerShell: no leading slash). Code is
  extracted locally via AST (free, no API); docs/PDFs use the IDE session model (no separate key).
  `graphify hook install` rebuilds the code graph on every commit (AST only, free).
- **Query-first**: prefer `graphify query "<question>"` / `graphify path A B` / `graphify explain X`
  over grepping raw files or reading the whole report — it is the cheaper, structured path.
- **Commit policy**: `graphify-out/` is committed so the team shares one map; local-only artifacts
  (`cost.json`, `cache/`, `.graphify_python`) are gitignored (`templates/gitignore-snippet.txt`).
- **`codex/` is the source of truth** graphify indexes — content vs retrieval stay separate.

Optional personal layer (not a base dependency): **obsidian-wiki** maintains a cross-project Obsidian
vault via the coding agent (Karpathy LLM-Wiki). Install it in your global agent skills, never in the
managed contract.
