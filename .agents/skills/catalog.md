# Capability catalog

What to reach for, by trigger. **Primary** = default choice. **Alternates** = equivalents when the
primary is unavailable or you want a second opinion. Anything not here → run `find-skills`.

> The mattpocock engineering skills below require `/setup-matt-pocock-skills` once per repo
> (configures the issue tracker, triage label vocabulary, and doc layout they consume).

## Process & engineering

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| starting a new feature | `superpowers:brainstorming` | — | skill |
| aligning before a change | `grill-me` / `grill-with-docs` | — | skill |
| writing the implementation plan | `superpowers:writing-plans` | `ecc:plan` | skill |
| writing code test-first | `tdd` | `superpowers:test-driven-development` | skill |
| chasing a hard bug / perf regression | `diagnose` | `superpowers:systematic-debugging` | skill |
| improving architecture (ball of mud) | `improve-codebase-architecture` | — | skill |
| designing a module's layering | `standards/architecture.md` | `improve-codebase-architecture` | doc |
| production logging / observability | `standards/observability.md` | — | doc |
| understanding unfamiliar code | `zoom-out` | — | skill |
| compacting the session for handoff | `handoff` | — | skill |
| throwaway prototype to flesh out a design | `prototype` | — | skill |
| turning context into a PRD | `to-prd` | `ecc:plan-prd` | skill |
| breaking a plan into issues | `to-issues` | — | skill |
| triaging incoming issues | `triage` | — | skill |
| writing a new skill | `write-a-skill` | `skill-creator` | skill |
| isolating parallel work | `superpowers:using-git-worktrees` | `superpowers:dispatching-parallel-agents` | skill |

## Review, security, quality

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| reviewing before merge | `ecc:code-review` | `superpowers:requesting-code-review`, `/code-review` | skill |
| auditing security-sensitive code | `ecc:security-review` | `ecc:security-scan` | skill |
| gating a launch (privacy + security) | `standards/launch-security-checklist.md` | `ecc:security-review`, SAST (`standards/security-scanners.md`) | doc |
| confirming work is done | `verifier` (Grimoire) | `superpowers:verification-before-completion` | subagent |
| cleaning dead code | `ecc:refactor-clean` | — | skill |
| running the quality gate | `ecc:quality-gate` | — | skill |
| writing or reviewing code to standard | `standards/clean-code.md` | `templates/lint/` (enforcement) | doc |
| writing or editing an agent-facing doc | `standards/writing.md` | — | doc |
| guarding structural invariants (drift) | `standards/guardrail-tests.md` | — | doc |
| recording a decision (incl. no-test rationale) | `docs/adr/` (`0000-template.md`) | — | doc |

## Web / Next.js (pharmaceutical-hub)

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| building a React component | `ecc:react-patterns` | `ecc:react-performance` | skill |
| reviewing React/TSX | `ecc:react-review` | — | skill |
| writing React tests | `ecc:react-test` | `tdd` | skill |
| fixing a React/Next build | `ecc:react-build` | `ecc:build-fix` | skill |
| Next.js / Turbopack specifics | `ecc:nextjs-turbopack` | — | skill |
| accessibility pass | `ecc:frontend-a11y` | `web-design-guidelines` | skill |
| designing an API | `ecc:api-design` | `ecc:backend-patterns` | skill |
| DB schema / queries | `ecc:postgres-patterns` | `ecc:prisma-patterns` | skill |
| DB migration | `ecc:database-migrations` | — | skill |

## Healthcare (both repos are medical)

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| handling PHI / privacy | `ecc:healthcare-phi-compliance` | `ecc:hipaa-compliance` | skill |
| EMR/EHR data patterns | `ecc:healthcare-emr-patterns` | — | skill |
| clinical decision support | `ecc:healthcare-cdss-patterns` | — | skill |
| evaluating a health-AI feature | `ecc:healthcare-eval-harness` | — | skill |

## Design / UI

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| designing UI/UX | `ui-ux-pro-max` | `andrej-karpathy` | skill |
| turning a mockup into UI code | `stitch` (MCP) | — | mcp |

> **Deprecated — do not use:** `frontend-design` (replaced by `ui-ux-pro-max`).

## Research, docs, MCP

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| researching an unknown topic | `ecc:deep-research` | `exa` (MCP) | skill |
| looking up a library / API | `context7` (MCP) | `ecc:documentation-lookup` | mcp |
| browser QA / e2e / visual check | `playwright` (MCP) | `ecc:e2e-testing` | mcp |
| repo / PR operations | `ecc:pr` | `github` (MCP), `/pr` | skill |
| need a capability you lack | `find-skills` | — | skill |

## Presentation (HTML for humans)

Render with `/present` when presentation mode is on (`rules/45-presentation.md`). HTML is an
ephemeral view; the Markdown/spec stays canonical.

| When you are… | Primary | Alternates | Layer |
|---|---|---|---|
| comparing specs / designs side by side | `/present` (HTML) | `superpowers:brainstorming` visual companion | command |
| presenting a code review to a human | `/present` (HTML dashboard) | `ecc:code-review` | command |
| writing a report / explainer | `/present` (HTML) | — | command |
| showing a design prototype | `prototype` | `/present` (HTML) | skill |
| building a custom editing UI (copy-as-JSON) | `/present` (HTML) | — | command |
## Communication

`pordee` (Thai-compressed) and `caveman` (terse) are session-level toggles set by the user.
