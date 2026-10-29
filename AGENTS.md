# AGENTS.md

<!-- grimoire:start — managed by `grimoire sync`; edit the Project section, not this block -->

## Rules

- Done = the verify command passes and, for a non-trivial change, a fresh-context subagent reviewed the diff. Never claim done on unverified work.
- Every changed line traces to the request. No drive-by refactors.
- Security: no hardcoded secrets, roles, or hosts. Validate and authorize server-side. Fail closed.
- A behavior change ships with its doc update in the same change.
- Ambiguous and costly to guess wrong: ask. Otherwise pick the obvious default and say so.
- Non-obvious decision: write `docs/adr/NNNN-slug.md` (context, decision, consequences).
- Docs use plain folder names under `docs/`: `adr/`, `requirements/`, `runbooks/`, `reference/` (large lookup data: grep it, don't read it whole). Create a folder on first use.
- Context loaded every session (`CLAUDE.md`, `AGENTS.md`, their `@imports`, `.claude/rules/` without `paths:`) stays under 200 lines in total. Measure it with `npx the-grimoire-cli check`.
- Rules that apply only to some files go in `.claude/rules/<topic>.md` with `paths:` frontmatter, so they load only when matching files are touched.
- UI work: design against a root `DESIGN.md` (no project one yet? seed it from a reference in github.com/voltagent/awesome-design-md). Shape and judge with impeccable (`/impeccable critique`, `audit`, `polish`) and the taste-skill anti-template rules, then check the rendered page with `playwright-cli` screenshots at mobile and desktop widths before calling it done.
- Accessibility audit (WCAG 2.2 A + AA): run `/impeccable audit`, back it with axe-core injected through `playwright-cli run-code` (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`), then check by hand what axe cannot: focus order and visible focus (Tab through the page), heading and landmark hierarchy (the accessibility snapshot), reliance on color (1.4.1, a grayscale screenshot), touch targets of at least 24px (2.5.8). Write the report to `docs/audits/a11y-YYYY-MM-DD.md`, one row per finding: success criterion, level, severity, evidence, fix.
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
