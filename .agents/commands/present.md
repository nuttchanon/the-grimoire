---
description: Render the current spec / review / report / prototype / editing UI as a self-contained HTML artifact and return a file:// URL.
---

Turn a human-facing deliverable into an interactive HTML page a person will actually read — not a
long Markdown wall they skim. Use for a spec comparison, code-review dashboard, report/explainer,
design prototype, or a custom editing UI (see `skills/catalog.md` -> Presentation).

Honor presentation mode (`rules/45-presentation.md`): render HTML only when the mode is on for this
project (`local/AGENTS.local.md`) or the user asks; otherwise stay in Markdown.

Steps:

1. Keep the **source canonical** — the Markdown/spec stays the source of truth; the HTML is a *view*
   generated from it.
2. Build ONE self-contained `.html`: inline CSS + JS, **no external/remote `<script>` or CDN**, works
   offline via `file://`. **Escape** any code/diff/user text you embed (no raw injection).
3. Write it to `journal/session/artifacts/<YYYY-MM-DD-HHmm>-<slug>.html` (ephemeral, gitignored).
4. Return the absolute `file://` path so the user can open it in a browser.
5. For editing UIs, include a **"copy as JSON / copy as Markdown"** button so the user can export
   their changes back into the conversation (close the loop).

Token-aware: render HTML for deliverables that earn it, not routine replies.
