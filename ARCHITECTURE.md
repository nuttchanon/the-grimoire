# Grimoire — architecture & structure

Canonical reference for **what Grimoire is, what it creates, and what each part does**. Read this to
get a consistent mental model before touching the CLI, the contract, or the layout. It complements
`README.md` (quickstart) and `.agents/AGENTS.md` (the working contract an agent loads each session).

Grimoire is a single, version-controlled **AI-agent operating system** you pull into any repo. One
command (`grimoire init`) gives a project a complete contract — rules, standards, subagents, skills,
commands, stack presets, a verification protocol — plus the root folders an agent writes into. Later,
`grimoire sync` propagates template updates to old projects **without clobbering** their own data.

The CLI is `bin/grimoire.mjs`: **zero dependencies**, Node ≥18, ESM. This repo *is* Grimoire and
dogfoods itself (`TEMPLATE_ROOT` = repo root, so its own `.agents/` is the template source).

## The one mental model: three lifecycles

Everything Grimoire manages falls into exactly one of three buckets. This split is the whole design.

| Lifecycle | Who owns it | `grimoire sync` | Where it lives |
|---|---|---|---|
| **Contract** (read-only) | the base template | **overwrites wholesale** (delete + copy) | `.agents/` |
| **Project-owned state/knowledge** | the project / the agent | **never touches** | `codex/`, `journal/`, `local/` (repo root) |
| **Seed sources** | the base template | shipped, copied into new projects | `templates/` |

Rule of thumb: **`.agents/` is 100% read-only.** Nothing an agent or project writes lives under it.
Anything written goes to a root folder (`codex/`, `journal/`, `local/`). To customize base behavior,
never edit `.agents/` in a consuming project — restate it in `local/` (loads last, wins).

## Top-level layout (what a Grimoire project contains)

```
<repo>/
├─ CLAUDE.md            # thin pointer: imports @.agents/AGENTS.md + @local/AGENTS.local.md
├─ .agents/             # CONTRACT — read-only, wholesale-synced
│  ├─ AGENTS.md         #   canonical entry: tone, hardest rules, the map, load order
│  ├─ rules/            #   always-on working process (numbered 00–60)
│  ├─ standards/        #   coding standards (general + per-language) + writing/codex/evals
│  ├─ stack/            #   tech-stack presets (web-app / desktop / library)
│  ├─ agents/           #   subagents (e.g. the independent verifier)
│  ├─ skills/           #   reusable workflows (incl. vendored find-skills)
│  ├─ commands/         #   slash commands (verify, checkpoint, onboard, present, grimoire)
│  ├─ tooling.json      #   declared plugins / skills / MCP servers
│  ├─ grimoire.manifest #   documents the contract surface (no longer used for carve-outs)
│  └─ VERSION           #   template version + source sha (stamped by init/sync)
├─ codex/               # KNOWLEDGE — project-owned, seeded once, never synced
│  ├─ INDEX.md  domain/  requirements/  decisions/  evidence/  resources/  reference/  runbooks/
├─ journal/             # AGENT STATE — project-owned, never synced
│  ├─ memory/  (+ MEMORY.md)   # KNOWLEDGE: durable facts (tracked)
│  ├─ backlog/                 # QUEUE: pending work items (tracked)
│  └─ session/                 # NOW: per-run state (gitignored)
└─ local/               # OVERRIDE CONFIG — project-owned, never synced, loads LAST and wins
   ├─ AGENTS.local.md   #   profile (stack, testing policy), project facts, override declarations
   ├─ README.md  rules/  standards/  stack/  skills/  commands/  reference/
   └─ tooling.json      #   project-only plugins / MCP (merged additively by bootstrap)
```

### The contract — `.agents/` (read-only)

| Path | Holds |
|---|---|
| `AGENTS.md` | entry contract + load-order + the map + hot-keywords |
| `rules/` | always-on process: 00-always, verification, modes, handoff, context-economy, commit-style, … |
| `standards/` | coding standards (general + per-language), writing, codex, evals, knowledge-management |
| `stack/` | per-profile defaults (framework / lint / test / verify command) |
| `agents/` | subagent definitions — notably `verifier` (independent done-check) |
| `skills/` | re-runnable workflows; `find-skills` is vendored + mirrored to `.claude/skills/` |
| `commands/` | slash commands |
| `tooling.json` | source of truth for required plugins / skills / MCP |
| `grimoire.manifest` | lists the managed paths — documentation only (sync is wholesale) |

### Project-owned roots (never synced)

- **`codex/`** — the project's knowledge base; read-first for any domain/feature work (start at
  `codex/INDEX.md`). Holds `domain/`, `requirements/`, `decisions/` (ADRs), `evidence/`, `resources/`,
  `reference/`, `runbooks/`. Seeded once from `templates/codex/`.
- **`journal/`** — the agent's working state, the "3 homes":
  - `journal/session/` = **NOW** (current run; gitignored),
  - `journal/memory/` = **KNOWLEDGE** (durable facts + `MEMORY.md` index; tracked),
  - `journal/backlog/` = **QUEUE** (pending work; tracked).
- **`local/`** — the project's customization layer. Loads **last and wins**. Override a base rule by
  restating it here; add project-only rules/skills/commands/standards under the matching `local/<area>/`.

## What each CLI command creates / does

`grimoire <command> [--dir <path>]` (default dir = cwd).

### `init` — scaffold a project
1. **Auto-migrate** an old-layout project first (`migrateLegacyLayout`, see below).
2. **Wholesale-copy** the template `.agents/` into the project (`copyAgentsWholesale`).
3. Stamp `VERSION` (template version + git sha).
4. Write `CLAUDE.md` pointer (if absent).
5. Ensure `.gitignore` has the session/backup ignore snippet.
6. **Seed root folders** (only if absent / per-file gap-fill, never overwriting):
   `seedCodex` → `codex/`; `seedRoot("journal")` → `journal/`; `seedRoot("local")` → `local/`.
7. Mirror discoverable skills into `.claude/skills/` (`find-skills` + every `local/skills/<x>`).
8. Generate per-folder `INDEX.md` (after all mutations).
9. Run `bootstrap` in dry-run (prints the plugin/MCP plan; writes nothing).

### `sync` — pull template updates into an existing project
1. Fail if no `.agents/` (must `init` first).
2. **Auto-migrate** an old layout (once, with backup).
3. **Wholesale-replace** `.agents/` from the template (delete + copy) — your contract is refreshed.
4. Re-stamp `VERSION`; re-seed `codex/`/`journal/`/`local/` (gap-fill only, never clobbers your files);
   re-mirror skills; regenerate `INDEX.md`.
   **`codex/`, `journal/`, `local/` are never overwritten** — only missing files are filled in.

### `bootstrap` — wire plugins / MCP / skills
Reads base `tooling.json` ∪ `local/tooling.json` (base wins on key conflict; local adds new keys).
- Dry-run (default): prints missing plugins, MCP servers to ensure, and skill install hints.
- `--apply`: enables missing plugins in `~/.claude/settings.json` (backs it up first, only **adds**,
  never disables), and merges MCP servers into `.mcp.json` (never clobbers an existing server). Flags
  unresolved `${ENV}` placeholders.

### `index` — regenerate per-folder `INDEX.md`
One-line-per-file table built from each file's frontmatter `description:` or its H1 + first sentence.
Two groups: the contract (`.agents/<folder>`) and the override layer (`local/<folder>`).
`index --check` is the CI drift gate: fails if any `INDEX.md` is stale, or a `tooling.json` MCP isn't
documented in `skills/catalog.md`. Newline-agnostic (tolerates CRLF checkouts).

### `doctor` — health-check the wiring (CI-friendly, exits non-zero on error)
Checks: `CLAUDE.md` imports `@.agents/AGENTS.md` (error) and `@local/AGENTS.local.md` (warn); mirrored
skills have `name:`+`description:`; INDEX/catalog drift; `local/AGENTS.local.md` stack-profile +
testing-policy filled; entry files ≤300 lines; `codex/INDEX.md` scaffolded; `local/tooling.json` valid.

## Seed-source map (`templates/` → project root)

`init`/`sync` seed project-owned roots from `templates/`. Source and destination are separate so this
repo's own live state never doubles as the seed.

| Seed source | Seeds into | How |
|---|---|---|
| `templates/codex/` | `codex/` | `seedCodex` — dir-level **seed-once** (skips if `codex/` exists) |
| `templates/journal/` | `journal/` | `seedRoot` — **per-file gap-fill** (fills missing files only) |
| `templates/local/` | `local/` | `seedRoot` — **per-file gap-fill** |
| `templates/CLAUDE.md` | `CLAUDE.md` | copied once (if absent) |
| `templates/gitignore-snippet.txt` | `.gitignore` | appended once (`journal/session/`, `.agents.bak-*/`) |

## Migration (old layout → new)

Older projects kept agent state under `.agents/{memory,backlog,session,local}`. On the next
`init`/`sync`, `migrateLegacyLayout` runs once: it backs up the whole `.agents/` to
`.agents.bak-<stamp>/`, then **moves** each legacy dir to its root home —
`.agents/memory→journal/memory`, `…/backlog→journal/backlog`, `…/session→journal/session`,
`…/local→local/` — **only if the destination is absent** (a conflict leaves the legacy copy in the
backup, never overwriting a newer root copy). Idempotent: a no-op once the legacy dirs are gone.

## How an agent reads a Grimoire project (load order)

1. `CLAUDE.md` → imports `@.agents/AGENTS.md` (contract) + `@local/AGENTS.local.md` (overrides).
2. `.agents/AGENTS.md` — hardest rules + the map; **read first, don't read everything**.
3. `.agents/rules/00-always.md` — every session.
4. `codex/INDEX.md` — read-first for any domain/feature work.
5. `standards/` + `stack/` — when writing/scaffolding code.
6. `local/` — loads **last and wins**.

Inside any folder, read its generated `INDEX.md` before opening files (two-level progressive
disclosure: map → INDEX → file), keeping context lean.

## Invariants (don't break these)

- **Zero runtime dependencies** in `bin/grimoire.mjs` (Node stdlib only).
- **`.agents/` is read-only** and wholesale-replaced by `sync` — never store project data there.
- **`codex/`, `journal/`, `local/` are never synced** — safe homes for project-owned content.
- **`local/` wins** on any conflict (loads last).
- Behavior change ships with its doc/INDEX update in the **same change** (doc-sync).
- Code an agent wrote is not done until the independent **verifier** returns `pass`.
