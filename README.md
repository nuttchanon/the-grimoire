# Grimoire

A lean agent contract for any project: one `AGENTS.md`, cheap to load every session.

```sh
npx the-grimoire-cli init        # writes AGENTS.md + CLAUDE.md (@AGENTS.md)
npx the-grimoire-cli sync        # refresh the managed rules block; your Project section is untouched
npx the-grimoire-cli check       # lines loaded every session; exit 1 over the 200-line budget (CI-able)
npx the-grimoire-cli bootstrap   # show missing plugins/skills; --apply enables the plugins
```

## What `init` writes

- **`AGENTS.md`**: a short managed rules block between `<!-- grimoire:start -->` and
  `<!-- grimoire:end -->`, followed by your `## Project` section (stack, verify command, facts). The
  Project section is yours. It wins on conflict, and `sync` never touches it.
- **`CLAUDE.md`**: `@AGENTS.md`, so Claude Code loads the same contract other agents read.

That's it: no folders, no indexes, no scaffolding. The block names a plain layout, and you create each
folder the first time you need it:

```
docs/adr/            decisions, NNNN-slug.md
docs/requirements/   specs and change requests
docs/runbooks/       incident and ops procedures
docs/reference/      large lookup data (grep it, don't read it whole)
.claude/rules/       path-scoped agent rules (`paths:` frontmatter, loaded on demand)
```

## Tooling (`bootstrap`)

| Role | Tool | Installed as |
|---|---|---|
| Build minimal | [ponytail](https://github.com/DietrichGebert/ponytail) | plugin |
| Terse output | [caveman](https://github.com/JuliusBrussee/caveman) | plugin |
| Workflow router | [pstack](https://github.com/michael-denyer/pstack-claude) (port of poteto's Cursor pstack) | plugin |
| Process skills, on demand | [superpowers](https://github.com/obra/superpowers) | skills (`npx skills add`) |
| Process skills, on demand | [mattpocock/skills](https://github.com/mattpocock/skills) | skills (`npx skills add`) |

superpowers is installed as plain skills instead of the plugin on purpose: the plugin's
SessionStart hook would compete with pstack's router and load on every session. `bootstrap` warns if
the plugin is enabled.

## Upgrading from 0.x

v1 drops `.agents/`, `local/`, `journal/`, `codex/`, per-folder `INDEX.md`, `doctor`, and `index`.
Run `init`, then move content you still need to its plain name and delete the old folders, their
`INDEX.md` files, and their imports in `CLAUDE.md`:

| 0.x | v1 |
|---|---|
| `codex/decisions/` | `docs/adr/` |
| `codex/requirements/` | `docs/requirements/` |
| `codex/runbooks/` | `docs/runbooks/` |
| `codex/reference/`, `local/reference/` | `docs/reference/` |
| `codex/domain/`, `codex/evidence/`, `.agents/topics/` | `docs/domain/`, `docs/investigations/`, `docs/design/` |
| `journal/backlog/` | your issue tracker, or `docs/backlog/` with one file per item |
| `local/rules/` | `.claude/rules/` with `paths:` frontmatter |
| `local/AGENTS.local.md`, `.agents/` | the `## Project` section of `AGENTS.md` |
| `journal/memory/`, `journal/session/` | delete (Claude Code auto memory covers it) | Why: `docs/adr/0001-v1-reset.md`. The 0.x template stays
at tag `v0.5.0`.

## License

MIT
