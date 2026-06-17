# Grimoire

A single, version-controlled **AI-agent operating system** you pull into every project.
One command gives a new repo a complete, orderly set of working rules, coding standards,
subagents, skills, commands, tech-stack defaults, and a self-bias-free verification protocol.

The core is **tool-agnostic** (`.agents/AGENTS.md`) so any agent can read it; Claude Code
binding sits on top. Template updates propagate to old projects without clobbering their
per-project customization.

> **Full structure & component reference:** [`.agents/NAVIGATOR.md`](.agents/NAVIGATOR.md) — what Grimoire
> creates, what each CLI command does, the three lifecycles, and the seed/migration model.

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

`init` also seeds **`codex/`** at the **repo root** (not under `.agents/`) — the project's knowledge
base: `domain/`, `requirements/`, `decisions/`, `evidence/`, `resources/`, `reference/`, `runbooks/`.
It is read-first for any domain/feature work (start at `codex/INDEX.md`), project-owned, and lives
outside every managed path, so `grimoire sync` is sync-safe and never touches it.

## Quick start

Published on npm as [`the-grimoire-cli`](https://www.npmjs.com/package/the-grimoire-cli); the command
it installs is `grimoire`.

```sh
# New project — scaffold .agents/ + pointers
npx the-grimoire-cli init

# Existing project — pull latest template (managed paths only; codex/ journal/ local/ untouched)
npx the-grimoire-cli sync
```

Install it globally for the `grimoire` command everywhere, and update in place:

```sh
npm i -g the-grimoire-cli       # install
grimoire init                   # or: grimoire sync
npm update -g the-grimoire-cli  # pull the latest template release
grimoire --version              # release version + build sha
```

Prefer pinning straight to the repo? `npx github:nuttchanon/the-grimoire init` works too, no npm needed.

## Two-layer model

- **Managed base** — the template owns it; `grimoire sync` overwrites it. Listed in
  `.agents/grimoire.manifest`.
- **Local overrides** (`local/`, at the repo root) — the project owns it; sync never touches it. To change a
  base rule, **do not edit the base** — add an override in `local/`. That is what keeps sync
  conflict-free.

Precedence: base loads first, `local/` loads last and **wins**.

## Session-state — 3 homes

| Layer | Answers | Home | Git |
|---|---|---|---|
| **NOW** | "what am I doing right now?" | `journal/session/` | gitignored |
| **KNOWLEDGE** | "what do we already know?" | `journal/memory/` | tracked |
| **QUEUE** | "what work is pending?" | `journal/backlog/` | tracked |

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

A project declares its **own** plugins / MCP servers (Linear, Sentry, Supabase, Figma, …) in
`local/tooling.json` — same shape as the base. `bootstrap` merges it **additively** (base
wins on conflict, local adds new entries), so project integrations live in `local/` instead of
bloating the managed base.

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

`init`/`sync` generate an `INDEX.md` for both the managed folders and your `local/` folders.

## Health check — doctor

`grimoire doctor` verifies a project is correctly wired: `CLAUDE.md` imports, skill frontmatter
(`name:`/`description:` so mirrored skills are discoverable), INDEX/catalog drift, unfilled
`AGENTS.local.md` placeholders, and oversized entry files. One line per
finding; exits non-zero on any error, so it drops straight into CI:

```sh
npx github:nuttchanon/the-grimoire doctor
```

## Decisions — ADRs

`init` seeds `codex/decisions/` (a template + README) into the project; it is project-owned and
survives `sync`. ADRs record lasting choices, carry an `updates-confirmed-values` flag (ground-truth
values change with their ADR in the same PR), and a missing test suite must be a recorded ADR rather
than a silent gap (`rules/00-always.md`).
