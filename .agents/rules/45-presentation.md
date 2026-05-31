---
updated: 2026-05-31
description: When and how to render human-facing deliverables as HTML instead of long Markdown.
---

# 45 — Presentation (HTML for humans)

Long Markdown gets skimmed. For human-facing deliverables an interactive HTML page communicates
better — tables, side-by-side comparisons, diff annotations, SVG diagrams, toggles. Render with
`/present` (`commands/present.md`).

## Toggle (default off)

- Project default: set in `local/AGENTS.local.md` ("Presentation mode").
- Session override: user says **"html on" / "html off"**. When off, reply in Markdown only.
- Even when on, use HTML for the deliverable types below — not routine replies.

## Use HTML for

spec comparison · code-review dashboard · report / explainer · design prototype · custom editing UI.
(Catalog: `skills/catalog.md` -> Presentation.)

## Guardrails

- **Source stays canonical.** HTML is an ephemeral *view* generated from the Markdown/spec — never
  the source of truth. Durable decisions still land in `docs/`, `memory/`, specs.
- **Self-contained + offline.** One file, inline CSS/JS, no remote `<script>`/CDN.
- **Security.** Escape embedded code/diff/user text; never run untrusted script; no secrets in the page.
- **Ephemeral.** Artifacts live in `session/artifacts/` (gitignored). Don't commit them.
- **Close the loop.** Editing UIs export back as JSON/Markdown so changes re-enter the workflow.
- **Token-aware.** Generating HTML is expensive; reserve it for deliverables that earn it.
