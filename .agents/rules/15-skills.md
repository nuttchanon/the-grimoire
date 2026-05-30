# 15 — Use the right tool (skills / plugins / MCP)

Before improvising any non-trivial task, **consult `skills/catalog.md`** and invoke the primary
capability for the trigger. If the catalog does not cover it, run **`find-skills`** before
hand-rolling a solution. For multi-step work, run the matching **workflow chain** end to end — do
not stop early.

Precedence: this rule defers to `local/`. A project may swap a primary (e.g. pin
`superpowers:test-driven-development` instead of `tdd`) or disable a tool in `local/AGENTS.local.md`.

## Workflow chains

- **Feature:** `brainstorming → writing-plans → [using-git-worktrees] → tdd → verifier → ecc:code-review → ecc:pr`
- **Bugfix:** `diagnose → tdd (reproduce) → verifier → ecc:pr`
- **UI:** `stitch (mockup) → ui-ux-pro-max → react-test → ecc:frontend-a11y → playwright (visual) → verifier`
- **Architecture:** `improve-codebase-architecture → grill-with-docs → writing-plans → …`
- **Research-first:** `ecc:deep-research → brainstorming → …`

The required tools for this project are declared in `tooling.json`; run `grimoire bootstrap` to
install/enable them. The mattpocock engineering skills (`tdd`, `diagnose`, `to-prd`, `to-issues`,
`triage`, `improve-codebase-architecture`, `zoom-out`) require running `/setup-matt-pocock-skills`
once per repo first.
