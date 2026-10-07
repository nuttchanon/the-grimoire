# AGENTS.md

<!-- grimoire:start — managed by `grimoire sync`; edit the Project section, not this block -->
## Rules
- Done = the verify command passes and, for a non-trivial change, a fresh-context subagent reviewed the diff. Never claim done on unverified work.
- Every changed line traces to the request. No drive-by refactors.
- Security: no hardcoded secrets, roles, or hosts. Validate and authorize server-side. Fail closed.
- A behavior change ships with its doc update in the same change.
- Ambiguous and costly to guess wrong: ask. Otherwise pick the obvious default and say so.
- Non-obvious decision: write `docs/adr/NNNN-slug.md` (context, decision, consequences).
- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
- The Project section below wins on conflict.
<!-- grimoire:end -->

## Project
- Stack: zero-dependency Node ESM CLI (`bin/grimoire.mjs`), published to npm as `the-grimoire-cli`.
- Verify: `npm test`
- The managed block above is the template `grimoire init`/`sync` write into other projects. Edit it with care.
- Release: every CLI or template change bumps `package.json` `version` and adds a `CHANGELOG.md`
  entry in the same PR (breaking → major, `feat:` → minor, `fix:`/docs → patch). After merge, tag `vX.Y.Z` on master and
  push the tag; `.github/workflows/publish.yml` publishes via npm Trusted Publishing (OIDC). Never
  `npm publish` by hand.
- `master` is branch-protected: work on a branch, push, open a PR.
