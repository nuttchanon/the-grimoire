# local/ — your project's customization layer

Everything under `.agents/local/` belongs to **this project**. `grimoire sync` **never touches it**.
This is where ALL per-repo customization lives.

## The one hard rule

**Never edit the managed base in a consuming project.** These paths are overwritten on every
`grimoire sync` (they are the "generals" shipped by the template):

```
.agents/AGENTS.md  rules/  standards/  stack/  agents/  skills/  commands/  tooling.json
```

If you edit them, your change is lost on the next sync. Put the change in `local/` instead.

## Two ways to customize

1. **Override** a base behavior — restate it in `local/`. Because `local/` loads **last**, it wins.
   - A base rule → add the corrected rule in `local/rules/` (or note it in `AGENTS.local.md`).
   - A base standard/stack default → put the project version in `local/standards/` or `local/stack/`.
2. **Add** something the base doesn't have — a project-only rule, skill, command, or standard goes
   straight into the matching `local/<area>/`.

## Layout

| Path | Holds |
|---|---|
| `AGENTS.local.md` | entry: active stack profile, testing policy, project facts, override declarations |
| `rules/` | project-only always-on rules (named `local-*.md`) |
| `standards/` | project-only coding standards / per-language additions |
| `stack/` | project-only stack notes or profile overrides |
| `skills/` | project-only skills — each `<name>/SKILL.md` is mirrored to `.claude/skills/` by init/sync |
| `commands/` | project-only slash commands |
| `reference/` | project domain reference docs (big runtime contract, IPC tables, confirmed values) — indexed by `grimoire index` |
| `owned` | one bespoke `.agents/` path per line that `init`/`sync` must never overwrite (e.g. `field-reports/`, `handoff/`) |

## Naming `local/rules/` — avoid number collisions with the base

The base ships numbered rules `00–60` (`rules/00-always.md`, `rules/30-verification.md`, …). A
project rule named `30-security.md` under `local/rules/` reads as "rule 30" too — ambiguous with the
base's `30-verification.md`. **Prefix every project rule with `local-`** so the number space never
clashes and the source is obvious at a glance:

```
local/rules/local-10-design-system.md   ✅  unambiguous, clearly project-owned
local/rules/30-security.md              ❌  collides with base rules/30-verification.md
```

Keep the original topic number after the prefix if it helps (`local-30-security.md`) — the `local-`
makes it distinct regardless. Reference them from `AGENTS.local.md` so the load order is explicit.

## Precedence

base loads first → `local/` loads last → **`local/` wins**. See the load order in `.agents/AGENTS.md`.
