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
- **Commit policy**: `graphify-out/` is **gitignored by default** (`templates/gitignore-snippet.txt`)
  — when `graphify hook install` rebuilds the graph on every commit, a committed graph would churn on
  each commit and always sit one commit stale, so each clone rebuilds it locally instead. Commit the
  graph only if you do **not** use the post-commit hook (rebuild it deliberately) and want it browsable
  in-repo; whitelist `graph.json`/`graph.html`/`GRAPH_REPORT.md`/`manifest.json` then.
- **`codex/` is the source of truth** graphify indexes — content vs retrieval stay separate.

Optional personal layer (not a base dependency): **obsidian-wiki** maintains a cross-project Obsidian
vault via the coding agent (Karpathy LLM-Wiki). Install it in your global agent skills, never in the
managed contract.

## Laziness enforcement — ponytail (ADR 0007)

The **principle** lives in the contract: `standards/clean-code.md` owns the ladder, the "never
simplify away" guardrail, and the `ponytail:` shortcut marker — tool-agnostic, every agent gets it.
**Enforcement automation** is delegated to the **ponytail** plugin (skill-capable hosts: Claude Code,
Codex, OpenCode, Gemini, pi); install is per-machine, optional.

- **Install** (Claude Code): `/plugin marketplace add DietrichGebert/ponytail` then
  `/plugin install ponytail@ponytail`. Other hosts: see the ponytail README. ponytail is declared in
  `tooling.json` (with a `source` field = the marketplace repo), so `grimoire bootstrap` lists it and
  prints exactly this paste command.
- **`/ponytail-review`** — review the current diff for over-engineering; hands back a delete-list.
- **`/ponytail-audit`** — same, whole repo instead of the diff.
- **`/ponytail-debt`** — harvest the `ponytail:` shortcut markers into a ledger so "later" isn't
  "never". This is why the marker token in `clean-code.md` is literally `ponytail:`.
- Without the plugin the principle still holds (the marker is self-documenting); you just lose the
  automated harvest/review.
