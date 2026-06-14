# Roadmap

Open work for the Grimoire template itself. (Kept at repo root, not under `journal/backlog/`, so it
never seeds into projects created with `grimoire init`.)

## Migrate the two real projects onto Grimoire

`ever-sync-adapter` is **migrated** (2026-05-31): `grimoire init` into a branch → project contract,
domain rules, and skills moved into `local/` (`reference/`, `rules/local-*`, `skills/`) → state files
collapsed into the 3-home model → stack profile + testing policy set → `grimoire sync` runs cleanly.
That migration drove the v0.2 adopt-safety work (init auto-backup, local INDEX, `grimoire doctor`)
— see `docs/superpowers/specs/2026-05-31-grimoire-adopt-safety-design.md`.

`pharmaceutical-hub` still runs an ad-hoc version of these patterns (design spec §8) — the remaining
migration. Per project: `grimoire init` into a branch → move project-specific content (confirmed
values, error catalog, IPC tables) into `local/` + `journal/memory/` → collapse state files into the 3-home
model → pick stack profile + testing policy → adopt `grimoire sync`.
**Done when:** it loads Grimoire base via `CLAUDE.md` and `grimoire sync` runs cleanly with all
customization isolated in `local/`.

## Verify the Stitch MCP launches end to end

`tooling.json` now wires Stitch as an HTTP MCP (`https://stitch.googleapis.com/mcp`,
`X-Goog-Api-Key: ${STITCH_API_KEY}`) and `bootstrap --apply` flags the missing env. Still unverified:
a throwaway `bootstrap --apply` + a real key actually launching the server in Claude Code.
**Done when:** a smoke run confirms the generated `.mcp.json` connects with a live key.

## Done — retrieval delegated to external tooling (2026-06-14)

Pulled the homegrown retrieval stack back out of the base (ADR 0006 supersedes 0002/0003/0004).
Removed `standards/chunking.md`, `standards/context-engineering.md`, `standards/evals.md`,
`templates/evals/`, and `docs/design/graphrag-retrieval.md`. `codex/` stays as the source of truth;
retrieval over the repo (code + `codex/`) is delegated to **graphify** (local AST for code, IDE-session
model for docs — no separate API). `obsidian-wiki` is an optional **personal, above-repo** layer
(global agent skills), never a base dependency. `standards/knowledge-management.md` stays — it is the
three-homes work-state model, not retrieval machinery.

**Open follow-up:**

- **Wire graphify into the stack as the blessed retrieval pattern.** Decide whether to ship a
  `stack/`-level pointer + a `commands/` entry so `grimoire init` projects get the graphify query-first
  convention without manual setup. Track `graphify-out/` commit policy in the template's `.gitignore`
  snippet.

## Done — codex knowledge base (2026-06-06)

Introduced `codex/` at the **repo root** as the project's single KNOWLEDGE/RESOURCE home
(`domain/`, `requirements/`, `decisions/`, `evidence/`, `resources/`, `reference/`, `runbooks/`).
It subsumes what used to live under `docs/` (requirements → `codex/requirements/`, ADRs →
`codex/decisions/`, runbooks → `codex/runbooks/`). Project-owned, seeded once by `grimoire init` from
`templates/codex/`, outside every managed path so `sync` never touches it. `AGENTS.md` points agents
to `codex/INDEX.md` as read-first for any domain work (fixes: new sessions started blind); `standards/codex.md`
documents the contract. See ADR `docs/adr/0005-codex-knowledge-base.md`.

**Open follow-ups:**

- **Migrate e-claim `docs/` → `codex/`.** The existing legacy/project docs in the e-claim project
  move under `codex/` (requirements, decisions, domain, evidence), and its `AGENTS.local.md` points
  at `codex/INDEX.md`.

## Nice-to-have

- CI status badge in the README.
- More `stack/` profiles and per-language `standards/` as projects need them.
- Wire `grimoire index --check` + `grimoire doctor` into the repo's own CI (alongside `npm test`) so
  INDEX/catalog drift + wiring problems fail PRs here, not just in consuming projects.
  (Entry-file 300-line ceiling is now enforced by `grimoire doctor`.)
- Extend the catalog drift check beyond MCP names (skills/plugins referenced in `catalog.md` vs
  `tooling.json`), moving closer to full approach-C generation.
- Rule: external design/source-of-truth (e.g. a hosted design tool) must have a local snapshot or
  prompt file committed, with the external dependency noted in AGENTS.md/local.
