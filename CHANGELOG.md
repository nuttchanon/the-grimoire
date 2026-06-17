# Changelog

All notable changes to Grimoire are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/) per `standards/release-versioning.md`.

Pre-1.0 bump policy: a **contract or CLI change → minor**; a **doc/fix → patch**. The release version
is the single source of truth in `package.json` (`grimoire --version` prints it plus the build sha);
bump with `npm version minor|patch` (it commits and tags), then add the entry below.

This file documents the Grimoire template repo itself; it is not shipped into `grimoire init`
projects (which keep their own changelog).

## [Unreleased]

## [0.4.0] - 2026-06-17

### Changed
- `sync` adoption hardening, from rolling Grimoire across 5 real repos:
  - rewrites a CLAUDE.md still importing `@.agents/local/…` (and inline `.agents/local/…` refs) to
    `@local/…` after the local→root migration (`fixPointerAfterMigration`), instead of leaving a
    broken import;
  - now runs `ensureGitignore` (was `init`-only) — strips the stale `.agents/session/` line, adds
    `journal/session/`, `.agents.bak-*/`, `graphify-out/`, so migrated repos stop nearly committing
    the `.agents.bak-*` backup;
  - `graphify-out` default flips to fully ignored (was commit-the-graph): the post-commit hook
    rebuilds every commit, so a committed graph churns and is always stale (`stack/README` updated);
  - `init` now appends the Grimoire imports to an existing CLAUDE.md (e.g. a bare `@AGENTS.md`)
    instead of skipping, so adopting a repo that already has a pointer just works.
- `doctor` warns when CLAUDE.md still imports `@.agents/local/…`; `NAVIGATOR.md` documents the
  docs→codex adoption pattern and the "grep for runtime reads of moved paths" / no-PII-in-codex
  cautions. 5 new CLI test cases (suite now 41).

## [0.3.2] - 2026-06-17

### Changed
- CI runs on Node 24 (current LTS, matches local dev) instead of 22, and uses `actions/checkout@v5`
  + `actions/setup-node@v5` — clearing the GitHub deprecation warning that the `@v4` actions still
  ran their JS on the end-of-life Node 20 action runtime.
- Publish auth switched from an `NPM_TOKEN` secret to **npm Trusted Publishing (OIDC)**: the 0.3.1
  publish failed with `EOTP` because the account requires 2FA on writes and a long-lived token
  can't supply an OTP. OIDC needs no secret, never expires, and auto-attaches provenance. The
  workflow now upgrades npm to `>=11.5.1` (OIDC minimum) before publishing.

## [0.3.1] - 2026-06-17

### Fixed
- CI publish no longer fails on `Could not find 'test/**/*.test.mjs'`: the `npm test` glob needs the
  Node `--test` glob support added in Node 21, so both workflows now pin `node-version: "22"`
  (`publish.yml`, `test.yml`). `test.yml` also runs `npm test` (was bare `node --test`) so the PR
  gate and the release gate execute the identical command — the gap that let 0.3.0 ship a
  publish-only break.

## [0.3.0] - 2026-06-17

### Added
- Published to npm as [`the-grimoire-cli`](https://www.npmjs.com/package/the-grimoire-cli):
  `npx the-grimoire-cli init`, or `npm i -g the-grimoire-cli` then `grimoire init` (the bin command
  stays `grimoire`). The `npx github:nuttchanon/the-grimoire` form still works.
- CI auto-publish: pushing a `vX.Y.Z` tag runs the suite and publishes to npm with provenance
  (`.github/workflows/publish.yml`; requires the `NPM_TOKEN` repo secret).

### Changed
- Package `name` → `the-grimoire-cli` (`grimoire` on npm was taken); added `repository`, `homepage`,
  `bugs`, and `keywords` for the npm listing.

## [0.2.1] - 2026-06-17

### Fixed
- `templateSha` no longer leaks git's `fatal: not a git repository` to stderr when grimoire runs
  from an npx/tarball install (no `.git`); the build sha degrades quietly to `unknown`.

## [0.2.0] - 2026-06-17

### Added
- Versioning discipline: `grimoire --version` / `-v` prints the release semver + build sha; this
  `CHANGELOG.md`; the release version is now single-sourced from `package.json`.
- ponytail laziness ladder ported into `standards/clean-code.md` — the decision ladder, the
  "never simplify away" guardrail, and the `ponytail:` shortcut marker (ADR 0007).
- `standards/attribution.md` + `docs/attributions.md` credits ledger for adopted tools/ideas.
- `codex/` knowledge base consolidation (ADR 0005); `.agents/NAVIGATOR.md` system map.

### Changed
- `.agents/` is now a read-only managed contract, replaced wholesale by `grimoire sync`; project
  state moved to root `journal/` + `local/`, with one-time auto-migration from the old layout.
- `stampVersion` regenerates `.agents/VERSION` from `package.json` so the two can never drift.

### Removed
- The homegrown retrieval stack (pgvector / GraphRAG / chunking / evals); knowledge retrieval is
  delegated to external tooling — `graphify` in-repo, `obsidian-wiki` optional (ADR 0006, supersedes
  ADRs 0002–0004).

## [0.1.0]

- Initial baseline: the Grimoire CLI (`init` / `sync` / `bootstrap` / `index` / `doctor`) and the
  tool-agnostic agent contract under `.agents/`.
