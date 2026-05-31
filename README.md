# Grimoire

A single, version-controlled **AI-agent operating system** you pull into every project.
One command gives a new repo a complete, orderly set of working rules, coding standards,
subagents, skills, commands, tech-stack defaults, and a self-bias-free verification protocol.

The core is **tool-agnostic** (`.agents/AGENTS.md`) so any agent can read it; Claude Code
binding sits on top. Template updates propagate to old projects without clobbering their
per-project customization.

## What is in `.agents/`

| Path | Holds |
|---|---|
| `AGENTS.md` | entry contract + load-order index |
| `rules/` | always-on working process + protocols (numbered) |
| `standards/` | coding standards (general + per-language) |
| `stack/` | tech-stack presets (web-app / desktop / library) |
| `agents/` | subagents — e.g. the independent `verifier` |
| `commands/` | slash commands (`verify`, `checkpoint`, `grimoire`) |
| `skills/` | reusable, re-runnable workflows |
| `local/` | per-project overrides; `sync` never touches |
| `session/` | NOW — current run state (gitignored in projects) |
| `memory/` | KNOWLEDGE — durable facts (tracked) |
| `backlog/` | QUEUE — pending work items (tracked) |

## Quick start

```sh
# New project — scaffold .agents/ + pointers
npx github:nuttchanon/the-grimoire init

# Existing project — pull latest template (managed paths only; local/ memory/ backlog/ untouched)
npx github:nuttchanon/the-grimoire sync
```

## Two-layer model

- **Managed base** — the template owns it; `grimoire sync` overwrites it. Listed in
  `.agents/grimoire.manifest`.
- **Local overrides** (`.agents/local/`) — the project owns it; sync never touches it. To change a
  base rule, **do not edit the base** — add an override in `local/`. That is what keeps sync
  conflict-free.

Precedence: base loads first, `local/` loads last and **wins**.

## Session-state — 3 homes

| Layer | Answers | Home | Git |
|---|---|---|---|
| **NOW** | "what am I doing right now?" | `.agents/session/` | gitignored |
| **KNOWLEDGE** | "what do we already know?" | `.agents/memory/` | tracked |
| **QUEUE** | "what work is pending?" | `.agents/backlog/` | tracked |

## Verification

The agent that writes code cannot mark it done. After a change, the main thread spawns the
**verifier** subagent on fresh context (requirements + diff + checklist only — not the
implementer's reasoning). It refutes by default, runs the real `verify` script, and quotes real
output. Definition of Done = tests green **AND** verifier `pass` **AND** checklist complete.

## Tooling — skills, plugins & MCP

`.agents/tooling.json` declares the plugins, skills, and MCP servers a project relies on, and
`.agents/skills/catalog.md` maps `task → capability` (primary + alternates). The always-on rule
`rules/15-skills.md` makes consulting the catalog reflexive; anything uncovered is found via the
vendored `find-skills` skill.

```sh
# enable required plugins / MCP / skills (prints a plan; nothing is written)
npx github:nuttchanon/the-grimoire bootstrap

# actually apply (additive, backs up ~/.claude/settings.json, never disables anything)
npx github:nuttchanon/the-grimoire bootstrap --apply
```

`init` runs `bootstrap` in dry-run automatically and mirrors `find-skills` into `.claude/skills/`.
The mattpocock engineering skills install separately via `npx skills@latest add mattpocock/skills`
followed by `/setup-matt-pocock-skills`. Editing `~/.claude/settings.json` is a machine-wide change —
bootstrap defaults to dry-run, backs up first, and only adds.

## Navigation — generated per-folder indexes

Each managed folder carries an `INDEX.md`: a one-line-per-file table generated from each file's
frontmatter or H1. Agents read it before opening files — two-level progressive disclosure
(`AGENTS.md` map → folder `INDEX.md` → file) that keeps context lean (`rules/35-context-economy.md`).
It is generated, never hand-edited:

```sh
# regenerate every INDEX.md (runs automatically inside init + sync)
npx github:nuttchanon/the-grimoire index

# CI guard: fail if any INDEX.md is stale, or a tooling.json MCP is undocumented in the catalog
npx github:nuttchanon/the-grimoire index --check
```

## Decisions — ADRs

`init` seeds `docs/adr/` (a template + README) into the project; the folder is project-owned and
survives `sync`. ADRs record lasting choices, carry an `updates-confirmed-values` flag (ground-truth
values change with their ADR in the same PR), and a missing test suite must be a recorded ADR rather
than a silent gap (`rules/00-always.md`).
