# Grimoire — Teaching Agents to Use Skills, Plugins & MCPs

**Status:** Design (approved in brainstorming, pending spec review)
**Date:** 2026-05-30
**Author:** Nutt
**Builds on:** Grimoire v0.1 (the agent-template). This adds a tooling layer.

---

## 1. Purpose

Every Grimoire-managed project should make its agent **reliably reach for the right capability** —
whether that capability is a skill, a plugin, or an MCP server — instead of improvising. Three
problems to solve at once:

1. **Discovery + timing** — the agent knows a capability exists and invokes it at the right moment.
2. **Curation** — out of hundreds of installed skills (ecc alone is 100+), only a vetted, useful
   set is surfaced; the long tail is found on demand.
3. **Chaining** — multi-step work runs as a known pipeline (e.g. brainstorm → plan → TDD → verify).

Covers **three tool layers**: **skills** (incl. mattpocock, superpowers, vendored), **plugins**
(user-level marketplaces), and **MCP servers** (e.g. Playwright, Google Stitch).

### Goals

- A curated **catalog** mapping `task → capability`, grouped by trigger, with a primary + alternates.
- An always-on **rule** that makes consulting the catalog (and falling back to `find-skills`) reflexive.
- **Workflow chains** for the common multi-step jobs.
- `grimoire init` **bootstraps** the required plugins, skills, and MCP servers (with consent + dry-run).

### Non-Goals (YAGNI)

- No auto-generated catalog from a plugin scan (future "approach C"; tracked in backlog).
- No attempt to install MCP server binaries the user has not chosen — only wire up config.
- No per-skill version pinning beyond what the marketplace provides.

---

## 2. The user's vetted set (source of truth for the catalog)

Confirmed during brainstorming. The catalog is built from these; the long tail is reached via
`find-skills`.

### Always-on / communication
- `pordee`, `caveman` — communication compression (session-level, user-toggled).

### Process & engineering — **mattpocock/skills** (used daily)
Source: `https://github.com/mattpocock/skills`. Small, composable, model-agnostic.
- `improve-codebase-architecture` — ⭐ most-used; find deepening/refactor opportunities.
- `grill-me`, `grill-with-docs` — stress-test a plan/design before building.
- `tdd` — test-first loop (primary over `superpowers:test-driven-development`).
- `diagnose` — hard-bug/perf loop (primary over `superpowers:systematic-debugging`).
- `to-prd`, `to-issues` — turn context into a PRD / into tracker issues.
- `zoom-out` — recover strategic context when lost in the weeds.
- `handoff` — compact the session for another agent.
- `prototype` — throwaway prototype to flesh out a design.
- `setup-matt-pocock-skills` — the installer (used by bootstrap on a fresh machine).

### Process — **superpowers** (used regularly; Claude auto-pulls)
- `brainstorming` — design before building (primary entry for new features).
- `writing-plans` → `executing-plans` / `subagent-driven-development`.
- `using-git-worktrees`, `dispatching-parallel-agents` — isolation & fan-out.
- `requesting-code-review`, `receiving-code-review`, `verification-before-completion`.
- (TDD / debugging exist here too — kept as **alternates** to the mattpocock primaries.)

### Design / UI
- `ui-ux-pro-max` — **primary** UI/UX design intelligence.
- `andrej-karpathy` (multica-ai/andrej-karpathy-skills) — used often, eng-flavored design.
- ❌ `frontend-design` — explicitly deprecated (works worse; ui-ux-pro-max replaces it).

### ecc — curated important/necessary (TS · Next.js · Electron · **healthcare**)
- **Core:** `plan`, `feature-dev`, `code-review`, `security-review`, `security-scan`,
  `deep-research`, `documentation-lookup`/`docs-lookup`, `pr`, `quality-gate`, `refactor-clean`,
  `update-docs`, `update-codemaps`.
- **Web / Next.js (pharmaceutical-hub):** `react-patterns`, `react-performance`, `react-review`,
  `react-test`, `react-build`, `nextjs-turbopack`, `frontend-patterns`, `frontend-a11y`,
  `api-design`, `backend-patterns`, `error-handling`, `postgres-patterns`, `prisma-patterns`,
  `database-migrations`, `e2e-testing`.
- **Healthcare (both repos are medical):** `healthcare-phi-compliance`, `hipaa-compliance`,
  `healthcare-emr-patterns`, `healthcare-cdss-patterns`, `healthcare-eval-harness`.
- **TypeScript review:** via `code-review` + the typescript reviewer agent.

### Discovery
- `find-skills` (vercel-labs) — **vendored** into the template; discover/install a skill on demand
  for anything the catalog does not cover.

### MCP servers
- **Playwright** (`mcp__…playwright`) — browser QA, e2e, **visual verification** for the verifier.
- **Google Stitch** — UI mockup → code generation (design intake for UI work).
- (Already-connected MCPs usable from the catalog: `context7` docs, `exa` search, `github`,
  `memory` knowledge graph.)

---

## 3. Architecture & files

```
.agents/
  skills/
    catalog.md                 # curated task→capability mapping (managed)
    find-skills/SKILL.md       # vendored from vercel-labs (managed)
  rules/
    15-skills.md               # always-on: catalog → find-skills → chain (managed)
  tooling.json                 # required plugins + skills + MCP servers (managed; bootstrap reads)
bin/grimoire.mjs               # + bootstrap (plugins/skills/MCP) + skill-mirror
```

Target project after `init` also gains:
```
my-project/
  .claude/
    skills/find-skills/SKILL.md   # mirrored from .agents/skills/ so Claude Code discovers it
  .mcp.json                       # project MCP servers (Playwright, Stitch, …) — created/merged
```

All of `.agents/skills/`, `.agents/rules/`, `.agents/tooling.json` are **managed** (synced).
Per-project on/off choices live in `local/` (loads last, wins).

---

## 4. `catalog.md` — structure

A trigger-indexed table. Each row: **trigger → primary capability → alternates → layer**.

```
| When you are… | Use (primary) | Alternates | Layer |
|---|---|---|---|
| starting a new feature | brainstorming | — | skill |
| stress-testing a plan | grill-me / grill-with-docs | — | skill |
| writing the impl plan | writing-plans | ecc:plan | skill |
| writing code test-first | tdd | superpowers:test-driven-development | skill |
| chasing a hard bug / perf | diagnose | superpowers:systematic-debugging | skill |
| improving architecture | improve-codebase-architecture | — | skill |
| lost in the weeds | zoom-out | — | skill |
| reviewing before merge | ecc:code-review | requesting-code-review, /code-review | skill |
| security / PHI-touching code | ecc:security-review | ecc:security-scan | skill |
| PHI / HIPAA handling | ecc:healthcare-phi-compliance | hipaa-compliance | skill |
| React component / Next.js | ecc:react-patterns | react-performance, nextjs-turbopack | skill |
| designing UI | ui-ux-pro-max | andrej-karpathy | skill |
| need a capability you lack | find-skills | — | skill |
| browser QA / e2e / visual check | Playwright MCP | ecc:e2e-testing | mcp |
| turning a mockup into UI | Google Stitch MCP | — | mcp |
| docs / unknown API | context7 / exa MCP | ecc:documentation-lookup | mcp |
| turning context into a PRD | to-prd | ecc:plan-prd | skill |
```

(Full table in the file; the above is representative.) Convention: **primary is what to reach for
by default**; alternates are equivalents for when the primary is unavailable or a second opinion is
wanted. `frontend-design` is listed only under a "deprecated — do not use" note.

---

## 5. `rules/15-skills.md` — always-on (short)

> Before improvising any non-trivial task, **consult `skills/catalog.md`** and invoke the primary
> capability for the trigger. If the catalog does not cover it, run **`find-skills`** before hand-rolling.
> For multi-step work, run the matching **workflow chain** end to end — do not stop early.

### Workflow chains (in the rule / catalog)
- **Feature:** `brainstorming → writing-plans → [using-git-worktrees] → tdd → verifier → ecc:code-review → ecc:pr`
- **Bugfix:** `diagnose → tdd (reproduce) → verifier → ecc:pr`
- **UI:** `Google Stitch (mockup) → ui-ux-pro-max → tdd/react-test → frontend-a11y → Playwright (visual) → verifier`
- **Architecture:** `improve-codebase-architecture → grill-with-docs → writing-plans → …`
- **Research-first:** `ecc:deep-research → brainstorming → …`

Precedence note: this rule defers to `local/` — a project may swap a primary (e.g. pin
`superpowers:test-driven-development` instead of `tdd`).

---

## 6. `tooling.json` — the bootstrap manifest

One file lists everything `init` should ensure is present, across the three layers:

```json
{
  "plugins": [
    { "name": "superpowers", "marketplace": "claude-plugins-official", "scope": "user" },
    { "name": "ecc", "marketplace": "ecc", "scope": "user" },
    { "name": "ui-ux-pro-max", "marketplace": "ui-ux-pro-max-skill", "scope": "user" },
    { "name": "andrej-karpathy-skills", "marketplace": "karpathy-skills", "scope": "user" },
    { "name": "pordee", "marketplace": "pordee", "scope": "user" },
    { "name": "caveman", "marketplace": "caveman", "scope": "user" }
  ],
  "skills": [
    { "name": "mattpocock", "installer": "setup-matt-pocock-skills",
      "source": "https://github.com/mattpocock/skills", "scope": "user" },
    { "name": "find-skills", "vendored": ".agents/skills/find-skills", "scope": "project" }
  ],
  "mcp": [
    { "name": "playwright", "scope": "project" },
    { "name": "stitch", "scope": "project", "note": "Google Stitch — UI generation" }
  ]
}
```

`frontend-design` is intentionally absent (deprecated).

---

## 7. `grimoire init` / `grimoire bootstrap` — behavior & safety

A new bootstrap step, runnable standalone (`grimoire bootstrap`) and called by `init`.

### Plugins (user-level)
1. Read `~/.claude/settings.json` `enabledPlugins` (+ marketplaces).
2. Compute the missing set vs `tooling.json`.
3. **Dry-run by default** — print exactly what would be added (marketplace + plugin). Only with
   `--apply` (or interactive confirm) does it write.
4. On apply: **back up `settings.json` first**, then **add only** — never disable or remove an
   existing plugin. Idempotent: re-running is a no-op when satisfied.

### Skills
- **Vendored** (`find-skills`): copy `.agents/skills/find-skills/` → project `.claude/skills/` so
  Claude Code discovers it. Source of truth stays in `.agents/` (synced); `.claude/skills/` is a mirror.
- **mattpocock:** if absent, print the `setup-matt-pocock-skills` install hint (or run it under
  `--apply`). Never auto-installs without consent.

### MCP (project-level)
- Create or **merge** project `.mcp.json` with the `mcp` entries from `tooling.json` (Playwright,
  Stitch, …). Merge is additive and idempotent; never clobbers existing server definitions.
- Print a note when an MCP needs credentials/auth the bootstrap cannot supply (e.g. Stitch API key).

### Global side-effect warning
Editing `~/.claude/settings.json` affects **every** project on the machine. The CLI states this,
defaults to dry-run, backs up, and is additive-only.

---

## 8. Sync behavior

`grimoire sync` overwrites the managed tooling assets (`skills/catalog.md`, `skills/find-skills/`,
`rules/15-skills.md`, `tooling.json`) and re-mirrors `find-skills` into `.claude/skills/`. It does
**not** re-run plugin/MCP bootstrap automatically (those have global/credential side-effects) —
instead it prints "tooling.json changed; run `grimoire bootstrap` to apply." `local/` overrides are
never touched.

---

## 9. Testing

`node:test`, all against a temp `HOME` / temp project — never the real machine:

- `init` copies `catalog.md`, `rules/15-skills.md`, `find-skills/SKILL.md`, `tooling.json`.
- `find-skills` is mirrored into `.claude/skills/find-skills/`.
- `tooling.json` parses; schema has the three layers.
- `bootstrap --dry-run` prints the missing set and **does not** modify the temp settings file.
- `bootstrap --apply` adds missing `enabledPlugins` **idempotently** (second run = no change) and
  **never removes** a pre-existing entry; a backup file is written.
- `.mcp.json` is created when absent and **merged** (not clobbered) when present.

---

## 10. Open questions (resolve during planning)

- Exact `.mcp.json` schema for Stitch (server command/args + auth) — confirm against the Stitch MCP
  docs before wiring.
- Whether mattpocock skills are reachable via a marketplace (cleaner) or only via
  `setup-matt-pocock-skills` (current assumption).
- Do we mirror **all** vendored skills into `.claude/skills/`, or only `find-skills`? (v0.1: only
  `find-skills`; revisit if more skills get vendored.)
