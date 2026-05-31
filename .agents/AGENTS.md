# AGENTS.md — master contract (tool-agnostic)

This is the **canonical entry** for every agent working in this repo. Claude Code reaches it via
`CLAUDE.md` (`@.agents/AGENTS.md`). Read in the order below — do **not** "read everything" up front.

Keep this file lean (`rules/35-context-economy.md`): tone, hardest rules, the map, pointers — detail
lives in the files it links.

## Tone

The person you work with is a **Product Builder** — address them directly ("you"), not as a passive
third party. Talk straight: factual and data-driven, no hype, no flattery, no telling them what they
want to hear. State trade-offs, risks, and disagreements plainly, with the evidence behind them —
being right matters more than being agreeable. Stay calm and professional, never emotional or
defensive. They may not know a given technical detail; explain it when it matters, plainly and
without condescension. Be terse and technical, and match the surrounding code and the user's
register. Project-specific tone or any communication mode lives in `local/AGENTS.local.md`.

## Load order

1. **This file** — hardest rules + the map (below).
2. **`rules/`** — always-on working process. Read `00-always.md` every session.
3. **`standards/`** — when writing code, load `general.md` + the per-language file.
4. **`stack/`** — when scaffolding or configuring, load the active profile.
5. **`docs/adr/`** — when a decision's *why* matters.
6. **`local/`** — per-project customization. Read `local/AGENTS.local.md`, then the matching
   `local/<area>/` (rules/standards/stack/skills/commands/reference) for any base area you touch;
   **loads last and wins**.

## The map

| Need | Go to |
|---|---|
| Working process, modes, handoff routing | `rules/` |
| Coding standards, naming, error codes | `standards/` |
| Requirements (base / addon / change request) | `standards/requirements.md` + `docs/requirements/` |
| Test strategy, release/versioning, accessibility | `standards/testing-strategy.md` · `release-versioning.md` · `accessibility.md` |
| Framework / lint / test / CI defaults | `stack/` + `templates/ci/` |
| Independent verification (the verifier) | `rules/30-verification.md` + `agents/verifier.md` |
| What am I doing right now? | `session/current.md` (NOW) |
| What do we already know? | `memory/` + `memory/MEMORY.md` (KNOWLEDGE) |
| What work is pending? | `backlog/` (QUEUE) |
| Project-specific overrides | `local/` |
| Project domain reference (big contracts, IPC tables, confirmed values) | `local/reference/` |
| Protect bespoke `.agents/` paths from sync | `local/owned` |
| Keeping entry files lean | `rules/35-context-economy.md` |
| Presenting to a human (HTML) | `rules/45-presentation.md` + `commands/present.md` |

Inside any managed folder **or `local/` folder**, read its generated `INDEX.md` (one line per file)
**before** opening files — that is the per-folder resource map (regenerate with `grimoire index`; CI
runs `--check`). `grimoire doctor` health-checks the whole wiring (exits non-zero on error, for CI).

### Hot keywords (jump straight to the file)

| Keyword | File |
|---|---|
| error code / error catalog | `standards/error-codes.md` |
| verify command / done | active `stack/<profile>.md` + `rules/30-verification.md` |
| security / auth / secrets | `rules/50-security.md` |
| code quality / clean code | `standards/clean-code.md` + `rules/05-code-quality.md` |
| launch / privacy gate | `standards/launch-security-checklist.md` + `standards/security-scanners.md` |
| requirement / spec / REQ-id / change request | `standards/requirements.md` + `docs/requirements/` |
| test strategy / how to test / coverage | `standards/testing-strategy.md` |
| release / changelog / version / rollback | `standards/release-versioning.md` |
| accessibility / a11y / WCAG | `standards/accessibility.md` |
| incident / runbook / on-call / outage | `docs/runbooks/` + `templates/runbook/` |
| CI / pipeline / workflow | `templates/ci/ci.yml` + `templates/ci/sast.yml` |
| commit format | `rules/60-commit-style.md` |
| HOTFIX | `rules/20-modes.md` |
| decision / ADR / "why" | `docs/adr/` |
| which skill / capability | `skills/catalog.md` |
| writing / editing a contract doc | `standards/writing.md` |

## Source priority (when sources conflict)

Trust in this order: **live code + committed docs/specs** (current) > **this base template**
(`rules/ standards/ stack/`) > **`memory/` cards** (may be stale — verify before acting on one).
A memory never overrides what the code currently says; treat it as a lead, not as truth.

## Hardest rules (full text in `rules/00-always.md`)

- **Verify before done.** Code you wrote is not done until the verifier returns `pass` on fresh
  context. The author cannot mark their own work done.
- **Doc-sync same turn.** Behavior change and its doc/memory update ship in the same turn.
- **Security first.** No hardcoded roles/secrets; validate + authorize on the server; fail closed.
- **Effort is not a constraint.** Do not scope-cut to save effort. Spawn parallel subagents instead.

## Customization & precedence

Base (this template) loads first; `local/` loads last and **wins**.

**In a consuming project, never edit the managed base** — `.agents/AGENTS.md`, `rules/`,
`standards/`, `stack/`, `agents/`, `skills/`, `commands/`, `tooling.json`. `grimoire sync`
overwrites all of them, so edits there are lost. Put **every** customization under `.agents/local/`
(it is never synced): **override** a base behavior by restating it in `local/` (it wins), or **add**
a project-only rule/skill/command/standard under the matching `local/<area>/`. Protocol:
`local/README.md`.

**Project domain docs** that don't fit the lean `AGENTS.md` (a big runtime contract, confirmed-value
tables, an IPC catalog) live in `local/reference/` — `grimoire index` generates its `INDEX.md` too.
**Bespoke top-level `.agents/` paths** the project owns (e.g. `field-reports/`, `handoff/`) can be
listed one per line in `local/owned`; `grimoire init`/`sync` then never overwrite them, even if a
future base version adds a same-named managed path. Run `grimoire doctor` to verify the wiring
(imports, skill frontmatter, INDEX drift, placeholders); it exits non-zero on error, for CI.
