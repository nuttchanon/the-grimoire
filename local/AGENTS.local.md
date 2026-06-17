# Local overrides — this project (loads LAST, wins)

`grimoire sync` never touches anything under `local/`. See `local/README.md` for the full protocol.
**Do not edit the managed base** (`.agents/rules|standards|stack|agents|skills|commands`,
`AGENTS.md`, `tooling.json`) — put every change here.

## Project profile

- **Active stack profile:** library  <!-- zero-dep Node ESM CLI shipped via npx/npm -->
- **Testing policy:** tdd-mandatory  <!-- node:test suite gates every change; keep it green -->
- **Verify command (if non-default):** `npm test` (= `node --test "test/**/*.test.mjs"`) + `node bin/grimoire.mjs index --check --dir . && node bin/grimoire.mjs doctor --dir .`
- **Presentation mode:** off  <!-- off | on — render human-facing deliverables as HTML (rules/45-presentation.md) -->

## Project facts

- **This repo IS Grimoire** and dogfoods itself. For the full system structure — what the CLI creates,
  what each command does, the three lifecycles, the seed/migration model — read **`.agents/NAVIGATOR.md`**
  before changing `bin/grimoire.mjs`, the `.agents/` contract, or the layout.

<!-- This section is the new home for everything that used to live in a long CLAUDE.md: the system
     model, doc map, domain glossary pointers, access/auth model, environment/build gotchas, confirmed
     values, error-code catalog location, IPC/channel tables. CLAUDE.md becomes a thin pointer; the
     durable project context moves HERE (it loads last and wins, and `grimoire sync` never touches it).
     Large domain contracts (IPC tables, confirmed-value sheets) belong in `local/reference/`.
     Onboarding an existing repo? See commands/onboard.md and move the old CLAUDE.md body into here. -->

## Release process (grimoire releases itself)

Every improvement to the contract or the CLI **must bump the version** in the same PR — do not ship
refinements under a stale version (this repo applies its own `standards/release-versioning.md`).

- **Release version** = `package.json` `version` (single source; `grimoire --version` prints it +
  the build sha). **Build version** = the git short sha, stamped automatically.
- **Bump rule** (pre-1.0): a contract/CLI change (`feat:`, new standard/rule, behavior change) → a
  **minor** bump; a doc-only/`fix:` → a **patch** bump.
- **Per change:** bump with `npm version minor|patch` (it edits `package.json`, commits, and tags
  `vX.Y.Z`), then add the entry to `CHANGELOG.md` under that version before pushing. When the bump
  rides inside a feature PR (as here), edit `package.json` + `CHANGELOG.md` directly and tag the
  release commit on `master` after merge.
- **Publishing is automatic:** pushing the `vX.Y.Z` tag triggers `.github/workflows/publish.yml`,
  which runs the suite and `npm publish`es `the-grimoire-cli`. Auth is **npm Trusted Publishing
  (OIDC)** — no token/secret, nothing to rotate; the workflow's `id-token: write` mints a short-lived
  OIDC token and npm verifies it against the configured trusted publisher. Do not `npm publish` by
  hand — push the tag.

## Override declarations

- **ADRs live in `docs/adr/`** (this repo predates the codex layout). The seeded `codex/decisions/`
  holds the template + future decisions; existing ADRs (0001–0005) stay under `docs/adr/`.

<!-- List any base rule/standard/stack default you are overriding, and where the override lives.
     e.g. "rules/10 plan-before-code relaxed for spikes — see local/rules/local-10-spikes.md"
     e.g. "ADRs live in docs/core/adr/ + docs/adr-index.md, not the seeded docs/adr/" -->

## Added (project-only)

<!-- Point to project-only rules/skills/commands you added under local/<area>/.
     Project rules go in local/rules/ with a `local-` prefix (see local/README.md → naming).
     Big domain reference docs go in local/reference/. -->
