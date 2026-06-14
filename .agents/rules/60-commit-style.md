---
updated: 2026-05-31
description: Conventional Commits and the project's commit/PR conventions.
---

# 60 — Commit style

- **Conventional Commits.** `type(scope): subject` — `feat` `fix` `docs` `refactor` `test` `chore`
  `perf` `build` `ci`. Imperative mood, lower-case subject, no trailing period.
- **One logical change per commit.** Reviewable diffs; no "misc fixes" grab-bags.
- **Hooks run.** husky + lint-staged on commit. **No `--no-verify`** — the one exception is a
  HOTFIX emergency commit (`20-modes.md`), which must be cleaned up afterward.
- **Body explains why** when the change is non-obvious. Reference the `journal/backlog/` id or ADR.
- **Never bypass signing** unless explicitly asked.
