# AGENTS.md — master contract (tool-agnostic)

This is the **canonical entry** for every agent working in this repo. Claude Code reaches it via
`CLAUDE.md` (`@.agents/AGENTS.md`). Read in the order below — do **not** "read everything" up front.

## Load order

1. **This file** — hardest rules + the map (below).
2. **`rules/`** — always-on working process. Read `00-always.md` every session.
3. **`standards/`** — when writing code, load `general.md` + the per-language file.
4. **`stack/`** — when scaffolding or configuring, load the active profile.
5. **`docs/adr/`** — when a decision's *why* matters.
6. **`local/AGENTS.local.md`** — per-project overrides; **loads last and wins**.

## The map

| Need | Go to |
|---|---|
| Working process, modes, handoff routing | `rules/` |
| Coding standards, naming, error codes | `standards/` |
| Framework / lint / test / CI defaults | `stack/` |
| Independent verification (the verifier) | `rules/30-verification.md` + `agents/verifier.md` |
| What am I doing right now? | `session/current.md` (NOW) |
| What do we already know? | `memory/` + `memory/MEMORY.md` (KNOWLEDGE) |
| What work is pending? | `backlog/` (QUEUE) |
| Project-specific overrides | `local/` |

## Hardest rules (full text in `rules/00-always.md`)

- **Verify before done.** Code you wrote is not done until the verifier returns `pass` on fresh
  context. The author cannot mark their own work done.
- **Doc-sync same turn.** Behavior change and its doc/memory update ship in the same turn.
- **Security first.** No hardcoded roles/secrets; validate + authorize on the server; fail closed.
- **Effort is not a constraint.** Do not scope-cut to save effort. Spawn parallel subagents instead.

## Precedence

Base (this template) loads first. `local/` loads last and **wins**. To change a base rule, add an
override in `local/` — never edit the base file. That keeps `grimoire sync` conflict-free.
