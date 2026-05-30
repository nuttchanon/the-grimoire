# Grimoire

A single, version-controlled **AI-agent operating system** you pull into every project.
One command gives a new repo a complete, orderly set of working rules, coding standards,
subagents, skills, commands, tech-stack defaults, and a self-bias-free verification protocol.

The core is **tool-agnostic** (`.agents/AGENTS.md`) so any agent can read it; Claude Code
binding sits on top. Template updates propagate to old projects without clobbering their
per-project customization.

## Lore (flavor only — directory names stay functional)

| Real thing | In-lore |
|---|---|
| the repo | the **Grimoire** |
| `skills/` | **Spells** — reusable, re-castable |
| `commands/` | **Cantrips** — slash incantations |
| `agents/` | **Familiars** — summoned subagents |
| `rules/` | **Tenets** — working process + protocols |
| `standards/` | **Conventions** |
| `stack/` | **Components** — tech-stack defaults |
| `local/` | **Marginalia** — per-project notes; `sync` never touches |
| the verifier | **the Warden** — independent reviewer Familiar |

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
- **Marginalia** (`.agents/local/`) — the project owns it; sync never touches it. To change a
  base rule, **do not edit the base** — add an override in `local/`. That is what keeps sync
  conflict-free.

Precedence: base loads first, `local/` loads last and **wins**.

## Session-state — 3 homes

| Layer | Answers | Home | Git |
|---|---|---|---|
| **NOW** | "what am I doing right now?" | `.agents/session/` | gitignored |
| **KNOWLEDGE** | "what do we already know?" | `.agents/memory/` | tracked |
| **QUEUE** | "what work is pending?" | `.agents/backlog/` | tracked |

## Design

See `docs/superpowers/specs/2026-05-30-grimoire-agent-template-design.md`.
