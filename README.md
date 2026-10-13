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
| Workflow router | [pstack](https://github.com/michael-denyer/pstack-claude) (port of poteto's Cursor pstack) | plugin |
| Planning/triage skills, on demand | [mattpocock/skills](https://github.com/mattpocock/skills) (without `tdd`, `diagnose`) | skills (`npx skills add`) |

superpowers is not bundled: pstack covers its skills (TDD, debugging, planning, review, verification),
and its plugin's SessionStart router would compete with pstack's.

The 0.x template (`.agents/`, `codex/`, `journal/`, `local/`) is retired; it stays at tag `v0.5.0`.
Why: `docs/adr/0001-v1-reset.md`.

## License

MIT
