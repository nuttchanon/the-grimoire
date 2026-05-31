# Roadmap

Open work for the Grimoire template itself. (Kept at repo root, not under `.agents/backlog/`, so it
never seeds into projects created with `grimoire init`.)

## Migrate the two real projects onto Grimoire

`pharmaceutical-hub` and `ever-sync-adapter` run ad-hoc versions of these patterns (design spec §8).
Per project: `grimoire init` into a branch → move project-specific content (confirmed values, error
catalog, IPC tables) into `local/` + `memory/` → collapse state files into the 3-home model → pick
stack profile + testing policy → adopt `grimoire sync`.
**Done when:** each loads Grimoire base via `CLAUDE.md` and `grimoire sync` runs cleanly with all
customization isolated in `local/`.

## Verify the Stitch MCP launches end to end

`tooling.json` now wires Stitch as an HTTP MCP (`https://stitch.googleapis.com/mcp`,
`X-Goog-Api-Key: ${STITCH_API_KEY}`) and `bootstrap --apply` flags the missing env. Still unverified:
a throwaway `bootstrap --apply` + a real key actually launching the server in Claude Code.
**Done when:** a smoke run confirms the generated `.mcp.json` connects with a live key.

## Nice-to-have

- CI status badge in the README.
- More `stack/` profiles and per-language `standards/` as projects need them.
- A `verify` check that flags entry files (CLAUDE.md, AGENTS.md, local/AGENTS.local.md) over the
  300-line ceiling (`rules/35-context-economy.md`).
- Wire `grimoire index --check` into the repo's own CI (alongside `npm test`) so INDEX/catalog drift
  fails PRs here, not just in consuming projects.
- Extend the catalog drift check beyond MCP names (skills/plugins referenced in `catalog.md` vs
  `tooling.json`), moving closer to full approach-C generation.
- Rule: external design/source-of-truth (e.g. a hosted design tool) must have a local snapshot or
  prompt file committed, with the external dependency noted in AGENTS.md/local.
