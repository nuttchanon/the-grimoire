---
updated: 2026-05-31
status: canonical
description: "Versioning, changelog, and release discipline across app and library profiles — what ships, how it's tagged, how it's recorded."
---

# Standards — release & versioning

Every project needs an answer to "what version is live, and what changed since the last one." This
standard gives the default; the active `stack/` profile refines the tooling.

## Versioning scheme

- **Libraries** (`stack/library.md`): strict **SemVer** — major = breaking API, minor = added API,
  patch = fix. Public API changes drive the bump. Use **changesets** so each PR declares its bump.
- **Apps** (web-app / desktop): SemVer-ish or CalVer — pick one and stay consistent. The number is
  for humans tracing "which build has this fix," so what matters is that a tag exists per release and
  maps to a commit. Tag the release commit (`vX.Y.Z`); the tag is the source of truth for "what
  shipped."

## Changelog — required, generated from commits

- Keep a `CHANGELOG.md` (Keep-a-Changelog style: grouped Added / Changed / Fixed / Removed /
  Security under each version + date).
- It is **derived from Conventional Commits** (`rules/60-commit-style.md`): `feat:` → Added,
  `fix:` → Fixed, `feat!:`/`BREAKING CHANGE:` → a major bump + a Changed/Removed entry. A tool
  (changesets, release-please, or `git-cliff`) generates it; do not hand-curate from memory.
- Cite requirement and ADR ids where relevant (`implements REQ-…`, `see ADR 00NN`) so a release
  links back to *why* (`standards/requirements.md`).

## Release checklist (gate before tagging)

1. Verifier `pass` on fresh context; full suite green (`rules/30-verification.md`).
2. For a user-facing app: the launch-security checklist passes
   (`standards/launch-security-checklist.md`).
3. `CHANGELOG.md` updated for this version; version bumped in the manifest (`package.json` etc.).
4. Any `updates-confirmed-values: yes` ADR in this range has its confirmed-values table updated.
5. Docs synced (`rules/00-always.md`) — no behavior shipped with stale docs.
6. Tag the release commit; push the tag; publish (library: registry; app: deploy).

## Deploy & rollback

- The deploy target and any region/config pinning that the code depends on belong in the project's
  `local/` notes or an ADR (not hardcoded, not tribal knowledge).
- Every release must be **rollback-able**: know the previous good tag and the procedure to redeploy
  it. A migration that can't roll back is itself a decision — record it in an ADR with the
  forward-fix plan.

## Pre-release / staged rollout

Feature flags or env gates (same mechanism as HOTFIX, `rules/20-modes.md`) let a change ship dark and
ramp. A flag is debt: record its name, the ramp/cleanup condition, and remove it once fully rolled
out — a stale flag is a silent fork in behavior.
