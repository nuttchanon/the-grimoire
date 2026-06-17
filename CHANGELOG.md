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
