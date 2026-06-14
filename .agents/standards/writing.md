---
updated: 2026-05-31
status: canonical
description: How to write agent-facing docs so they are high-signal and versioned.
---

# Standards — writing docs

How to write the Markdown agents read (rules, standards, agents, skills, commands, ADRs). Goal: an
agent finds the right file and the right line fast. High-signal docs are part of code quality
(`rules/35-context-economy.md`).

## Lead with purpose

The first line after the H1 is one crisp sentence: **what this file is + when to read it.** The
per-folder `INDEX.md` generator lifts this as the blurb — a vague lead ("Always-on.") makes a useless
index entry. Files that carry frontmatter may set a `description:` field, which the generator prefers.

## Voice

- Terse, technical, active voice. Cut filler, hedging, throat-clearing.
- Address the agent directly ("do X", not "one should do X").
- Match the register of the surrounding docs.

## Structure

- **One topic per file.** If it grows a second concern, split it (`rules/35`).
- **Tables and lists for enumerations**; prose only for reasoning a reader must follow.
- **H1 = `Area — topic`** (e.g. `Standards — clean code`); sections scannable by heading.
- **Link, don't inline.** Point to the canonical file; never paste a catalog or long procedure into
  an entry file. When you move detail out, leave a one-line pointer behind.

## Versioning

Git holds full history; a visible stamp answers "is this current?" at a glance.

- Canonical docs (standards, ADRs, long-lived references) carry frontmatter `updated: YYYY-MM-DD`,
  and `status:` (`draft` | `canonical` | `deprecated`) where a lifecycle matters.
- **Bump `updated` in the same commit as any change to the doc's meaning** — this extends the
  doc-sync rule (`rules/00-always.md`): behaviour and its doc move together, and the stamp records when.
- A `status: deprecated` doc names its replacement (`superseded-by:` or an inline pointer); never
  delete silently. ADRs already follow this (`codex/decisions/`).
- `updated` with no `description:` does not change a file's INDEX blurb (the generator falls back to
  the H1 + first line), so stamping is safe to add incrementally.

## Do / don't

- ✅ `# 30 — Verification` → "The agent that writes code cannot mark it done. ..." (lead states what + why).
- ❌ Restating the heading, or opening with backstory before the point.
- ✅ A five-row table of limits. ❌ The same limits as five paragraphs.
- ✅ "See `standards/clean-code.md`." ❌ Copying its content into three files.

## Before you commit a doc

- The lead sentence works as a standalone INDEX blurb.
- No duplicated content that will drift — one canonical home, others point to it.
- `updated` bumped if the meaning changed.
- Regenerate indexes: `grimoire index` (CI runs `--check`).
