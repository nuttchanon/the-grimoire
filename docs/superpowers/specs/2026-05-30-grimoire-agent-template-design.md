# Grimoire — Reusable AI-Agent Template

**Status:** Design (approved in brainstorming, pending spec review)
**Date:** 2026-05-30
**Author:** Nutt (sole contributor)
**Repo:** `grimoire` (this repository, currently `agentic-workflows`)

---

## 1. Purpose

A single, version-controlled template that every future project pulls in to get a
complete, orderly, quality AI-agent operating system. Main consumer is **Claude Code**
(the only AI subscription currently kept). The template is **tool-agnostic at its core**
(`.agents/AGENTS.md`) so any future agent (Cursor, Copilot, Codex, …) can read it.

Two real projects already run ad-hoc versions of this idea and prove the patterns work:

- `pharmaceutical-hub` — Next.js modular monolith, docs/ADR-driven, rules-as-checkpoints.
- `ever-sync-adapter` — Electron sync tool, live at 15 hospitals, 0 Sev-1 on v2.0.0.

Grimoire is the **canonical, systematized** version both projects can later converge onto
via `grimoire sync`.

### Goals

- Every project inherits: working rules/process, coding standards, subagents/skills/commands,
  tech-stack defaults, protocols, and templates — everything needed for agents to work at full
  efficiency, with **verifiable, non-self-biased** output.
- New project onboarding in one command.
- Template updates propagate to old projects without clobbering per-project customization.
- Tool-agnostic core; Claude Code binding on top.

### Non-Goals (YAGNI)

- No multi-tool bindings beyond Claude Code yet (only the tool-agnostic core + `.claude` pointer).
- No npm publish / public distribution — solo use + small team.
- No issue-tracker integration — queue lives in-repo.

---

## 2. Naming & Flavor

Repo: **Grimoire** (D&D spellbook metaphor). Directory names stay **functional** because
Claude Code must read `skills/ commands/ agents/`. Flavor lives in concept/CLI/README only.

| Real thing | Called in-lore |
|---|---|
| repo | the Grimoire |
| `skills/` | **Spells** — reusable, re-castable |
| `commands/` | **Cantrips** — slash incantations |
| `agents/` | **Familiars** — summoned subagents |
| `rules/` | **Tenets** — working process + protocols |
| `standards/` | **Conventions** |
| `stack/` | **Components** — tech-stack defaults |
| `local/` | **Marginalia** — per-project notes; `sync` never touches |
| CLI | `grimoire init` / `grimoire sync` — scribe & re-transcribe |
| verification protocol | **the Warden** — independent reviewer familiar |

---

## 3. Architecture

### 3.1 Two-layer model (base vs local)

The core anti-clobber principle: separate **managed base** (template owns, overwritten on sync)
from **Marginalia** (project owns, never touched).

```
grimoire/                      # the template repo = source of truth
  .agents/
    AGENTS.md                  # entry — tool-agnostic master contract / index
    rules/                     # Tenets — working process + protocols
    standards/                 # Conventions — coding standards (general + per-lang)
    stack/                     # Components — tech-stack defaults + presets
    agents/  skills/  commands/  # Familiars / Spells / Cantrips (portable .claude assets)
    session/                   # NOW state (gitignored in target projects)
    memory/                    # KNOWLEDGE (durable, tracked)
    backlog/                   # QUEUE (durable, tracked)
    local/                     # Marginalia — per-project override (sync never touches)
    grimoire.manifest          # lists managed paths
    VERSION                    # template tag + sha this project is on
  templates/                   # pointer files dropped into target projects
  bin/grimoire.mjs             # init + sync CLI
  docs/                        # this spec, ADRs, etc.
  README.md
```

### 3.2 Applied to a target project

```
my-project/
  .agents/        # base copied from template + project's own memory/backlog/local
    ...
    local/        # Marginalia — never overwritten
  .claude/
    CLAUDE.md     # thin pointer (see 3.3)
  AGENTS.md       # optional root pointer for non-Claude tools (future)
```

### 3.3 Pointer & precedence

- `.agents/AGENTS.md` is **canonical**. Claude Code reads project `CLAUDE.md`, which imports it:

  ```
  @.agents/AGENTS.md
  @.agents/local/AGENTS.local.md
  ```

- **Precedence:** base loads first, `local/` loads last and **wins**.
- To change a base rule, **do not edit the base file** — add an override in Marginalia.
  This is what makes `sync` conflict-free.

---

## 4. Contents of `.agents/`

### 4.1 `AGENTS.md` (entry)

Short. A **load-order index** + the hardest rules. Inspired by both projects' load-order
discipline (start broad → target domain → rules → ADRs) to avoid "read everything" context thrash.

### 4.2 `rules/` (Tenets) — numbered, always-on

| File | Contains |
|---|---|
| `00-always.md` | Hard errors: verify-before-done, doc-sync-same-turn, security-first, no hardcoded roles, **effort-is-not-a-constraint** (don't scope-cut, spawn parallel subagents) |
| `05-code-quality.md` | Small files, minimal comments (why-only), DRY/YAGNI, naming mirrors domain |
| `10-working-process.md` | Plan before code, ask before large work, small increments, skill invocation |
| `20-modes.md` | **NORMAL vs HOTFIX** mode system (see 4.6) |
| `30-verification.md` | **the Warden** protocol (see 5) |
| `40-handoff.md` | chat → HOTFIX / BACKLOG / do-now routing (see 4.7) |
| `50-security.md` | Permissions via helpers not literals, validate+auth on server, fail-closed, parameterized queries |
| `60-commit-style.md` | Conventional Commits, no `--no-verify` (except HOTFIX), husky + lint-staged |

### 4.3 `standards/` (Conventions)

- `general.md` — naming (kebab files, camel vars, Pascal types, CONSTANT_CASE), error handling,
  file-size limits, import ordering.
- `error-codes.md` — **error-code catalog convention** (every error carries a code; lint script
  validates). Template ships the convention + scaffold script; project fills the catalog.
- per-language: `typescript.md`, `python.md`, … (added as needed).

### 4.4 `stack/` (Components) — presets

- Profiles: `web-app`, `desktop`, `library` (start set). Each pins framework, lint/format,
  test setup, CI scaffold.
- A **testing-policy knob** per profile: `tdd-mandatory` (ever-sync style) vs `test-ready-deferred`
  (pharma style) vs `none`. Not hardcoded — project chooses.
- `verify` script scaffold: `typecheck + lint + test + coverage + format:check` — the command the
  Warden runs.

### 4.5 `agents/ skills/ commands/` — portable assets

Start with a small core set, grow over time:

- Familiar `warden` — independent reviewer (see 5).
- Cantrip `verify` — runs the verify script + dispatches the Warden.
- Cantrip `checkpoint` — snapshots `session/current.md`.
- Cantrip `grimoire` (optional) — wraps `init`/`sync` from inside Claude Code.

### 4.6 Modes (NORMAL vs HOTFIX)

Harvested from ever-sync. Toggled by a user phrase, **persists for the whole session**.

- **NORMAL (default):** full discipline — plan, TDD per testing-policy, full `verify`, docs/memory
  updated same turn, commits through hooks.
- **HOTFIX (on-site fire):** smallest diff (one file if possible), TDD waived (backfilled in
  cleanup), gate new path behind an env flag (single-unset rollback), `--no-verify` allowed,
  log to a `backlog/` item tagged `priority: hotfix` with a cleanup checklist.

Mode is recorded at the top of `session/current.md`.

### 4.7 Handoff routing

chat input → one of:

- **do-now** (no file) — single-commit, finishable this session.
- **BACKLOG** — multi-session / needs ADR / user says "add to backlog" → `backlog/` item.
- **HOTFIX** — fire → `backlog/` item, `priority: hotfix`, cleanup checklist.

---

## 5. The Warden — verification without self-bias

**Principle: the agent that writes code cannot mark it done.** Bias comes from *shared context*,
not from a different model. Cutting the context cuts the bias — so one Claude Code subscription is
enough via **subagents with fresh context**.

### Flow (inside one Claude Code session)

1. Main thread (implementer) finishes the change.
2. Main spawns the **Warden** subagent (Task/Agent tool), passing **only**: requirements + diff +
   checklist. **Not** the implementer's reasoning/conversation.
3. Warden is prompted to **refute** (skeptic; default to FAIL when unsure), **runs** the real
   commands (`verify` script: tests/build/lint), and **quotes real output** — no "looks good".
4. Warden returns a structured verdict: `pass | fail` + reasons + commands run + output, saved as
   an artifact.
5. **Definition of Done** = tests green **AND** Warden `pass` **AND** checklist complete. Missing
   any one → not done.

### Scaling & limits

- Large work → multiple Warden lenses (correctness / security / requirements-match), adversarial-verify.
- Same model family shares blind spots. Mitigations: refute-style prompt, mandatory evidence,
  optionally run the Warden on a different model tier. Cross-model arrives free when a second tool
  is added later.

### Tool binding

- Tool-agnostic: `rules/30-verification.md` states the protocol in prose — any agent can follow.
- Claude Code: Familiar `agents/warden.md` + Cantrip `commands/verify`, optionally bound to
  `/code-review` (and `/code-review ultra` for big changes).
- Optional Stop-hook warns if "done" is declared without a Warden artifact (per-project opt-in).

---

## 6. Session-state — 3 homes, clear axes

Replaces the ad-hoc sprawl (ACTIVE / checkpoint / MEMORY / BACKLOGS / HOTFIXES / field-reports /
handoff) with **three homes, classified by the question each answers** (lifetime × git-tracked).

| Layer | Answers | Home | Lifetime | Git |
|---|---|---|---|---|
| **NOW** | "what am I doing right now?" | `.agents/session/` | session | gitignored |
| **KNOWLEDGE** | "what do we already know?" | `.agents/memory/` | permanent | tracked |
| **QUEUE** | "what work is pending?" | `.agents/backlog/` | permanent | tracked |

### 6.1 NOW — `session/current.md` (single whiteboard)

- One file, **rewritten in place** (not appended). Shows full state at a glance:
  `mode (NORMAL/HOTFIX)` · focus · last-done · next-step · blockers · open-questions · files-touched.
- **Checkpoint is not a new file type** — before a context boundary, copy `current.md` →
  `session/archive/<ts>.md`. Resume reads `current.md` only.
- Local/gitignored — it is about *this run*; teammates don't need it.
- **Decision:** whiteboard (rewrite) chosen over append-log — simpler, robust enough; archive
  snapshots cover recovery.

### 6.2 KNOWLEDGE — `memory/` (Claude Code-native format)

- **One fact per file** + frontmatter (`name` / `description` / `type`), `MEMORY.md` as index,
  `[[links]]` between cards. Reuses Claude Code's own memory convention → zero friction, tool-native.
- `type: lesson | field-report | decision-note | reference`.
- **field-reports are just `type: field-report`** — no separate tree.
- Architecture-level decisions graduate to `docs/adr/`.

### 6.3 QUEUE — `backlog/` (one item per file)

- Frontmatter `id` · `status: open|active|blocked|done` · `priority: normal|hotfix`.
- **Hotfix is a priority flag, not a separate file.** Cleanup checklist lives in the item.
- Done → moved to `backlog/done/`; close-out evidence (ADR link, test reproducer, sign-off) in the file.

Rule of thumb: ask "right-now / already-know / pending?" → you instantly know where to write.

---

## 7. Distribution & sync

Source of truth = the `grimoire` repo on GitHub. CLI = a small Node script
(`bin/grimoire.mjs`), cross-platform, run via `npx github:<user>/grimoire …` (no global install).

### `grimoire init` (new project)

1. Pull base from the repo → place under `.agents/`.
2. Create `.agents/local/` (Marginalia) if absent; seed empty `session/ memory/ backlog/`.
3. Write pointers: project `CLAUDE.md` → `@.agents/AGENTS.md` + `@.agents/local/AGENTS.local.md`.
4. Stamp `.agents/VERSION` = template tag + sha.
5. Write `.gitignore` entries for `session/` (and `session/archive/`).

### `grimoire sync` (existing project catches up)

1. Fetch template at chosen ref (latest or pinned).
2. Overwrite **managed paths only** (`grimoire.manifest`: `AGENTS.md rules/ standards/ stack/
   agents/ skills/ commands/`).
3. **Never touch** `local/ memory/ backlog/ session/`.
4. Bump `VERSION`; print changelog (`git log` between old → new sha).

### Manifest & precedence

- `.agents/grimoire.manifest` lists managed (overwritable) paths. Anything outside is project-owned.
- Customization always lives in `local/` (Marginalia), so sync has nothing to conflict with.

---

## 8. Migration path for the two real projects

Both already use `.agents/AGENTS.md` + load-order + numbered rules, so convergence is incremental:

1. `grimoire init` into a branch (or align existing `.agents/` to the manifest layout).
2. Move project-specific content (confirmed-values, error catalog, IPC tables) into `local/` and
   `memory/`.
3. Collapse existing state files into the 3-home model (§6).
4. Adopt `grimoire sync` for future template updates.

Not part of the first implementation — listed so the design stays migration-aware.

---

## 9. Open questions (resolve during planning)

- CLI language confirmed as Node `.mjs`? (vs PowerShell — rejected for cross-platform.)
- Exact starter set of Spells/Cantrips/Familiars to ship in v0.1.
- Whether root `AGENTS.md` pointer ships now or is deferred until a second tool exists (currently
  deferred per YAGNI).
