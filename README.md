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
npx github:<user>/grimoire init

# Existing project — pull latest template (managed paths only; local/ memory/ backlog/ untouched)
npx github:<user>/grimoire sync
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

## Design

See `docs/superpowers/specs/2026-05-30-grimoire-agent-template-design.md`.
