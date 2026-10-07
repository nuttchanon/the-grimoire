# Grimoire

A lean agent contract for any project: one `AGENTS.md`, cheap to load every session.

```sh
npx the-grimoire-cli init        # writes AGENTS.md + CLAUDE.md (@AGENTS.md)
npx the-grimoire-cli sync        # refresh the managed rules block; your Project section is untouched
npx the-grimoire-cli bootstrap   # show missing plugins/skills; --apply enables the plugins
```

## What `init` writes

- **`AGENTS.md`**: a short managed rules block between `<!-- grimoire:start -->` and
  `<!-- grimoire:end -->`, followed by your `## Project` section (stack, verify command, facts). The
  Project section is yours. It wins on conflict, and `sync` never touches it.
- **`CLAUDE.md`**: `@AGENTS.md`, so Claude Code loads the same contract other agents read.

That's it: no folders, no indexes, no scaffolding. Create `docs/adr/` when you write your first decision.

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
Run `init`, move anything you still need into the Project section of `AGENTS.md`, then delete the old
folders and their imports in `CLAUDE.md`. Why: `docs/adr/0001-v1-reset.md`. The 0.x template stays
at tag `v0.5.0`.

## License

MIT
