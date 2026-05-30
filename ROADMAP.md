# Roadmap

Open work for the Grimoire template itself. (Kept at repo root, not under `.agents/backlog/`, so it
never seeds into projects created with `grimoire init`.)

## Confirm the Google Stitch MCP package

`tooling.json` wires Stitch as `npx -y @google/stitch-mcp@latest` with `env.STITCH_API_KEY` — the
package name is a best-effort guess (design spec §10). `grimoire bootstrap --apply` writes it
verbatim into a project `.mcp.json`, so a wrong name yields a broken server entry.
**Done when:** the real Stitch MCP command/args/auth are confirmed from official docs, `tooling.json`
is updated, and a throwaway `bootstrap --apply` produces a `.mcp.json` Claude Code can launch.

## Migrate the two real projects onto Grimoire

`pharmaceutical-hub` and `ever-sync-adapter` run ad-hoc versions of these patterns (design spec §8).
Per project: `grimoire init` into a branch → move project-specific content (confirmed values, error
catalog, IPC tables) into `local/` + `memory/` → collapse state files into the 3-home model → pick
stack profile + testing policy → adopt `grimoire sync`.
**Done when:** each loads Grimoire base via `CLAUDE.md` and `grimoire sync` runs cleanly with all
customization isolated in `local/`.

## Approach C — generate the catalog from installed plugins

`skills/catalog.md` is hand-curated and drifts as plugins change. Explore a `grimoire catalog`
subcommand that scans installed skills + `tooling.json` to emit/validate the trigger→capability
inventory, keeping the hand-written primary-vs-alternates judgments.
**Done when:** the catalog can be regenerated or lint-checked and drift against `tooling.json` is
caught automatically.

## Nice-to-have

- CI status badge in the README.
- More `stack/` profiles and per-language `standards/` as projects need them.
- A verify check that flags entry files (CLAUDE.md, AGENTS.md, local/AGENTS.local.md) over the 300-line ceiling (rules/35-context-economy.md).
