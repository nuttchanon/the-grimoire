---
updated: 2026-06-14
status: canonical
description: "Credit the external work the project builds on: what to record when adopting a tool/pattern/idea, where it goes, and the adapt-not-copy rule."
---

# Standards — attribution

Credit the external work the project builds on. When you adopt something from outside — a tool,
library, framework, pattern, or idea (including an article or gist you adapt) — record it and credit
its author. This is ethics **and** provenance: a future reader must know what is ours, what is
borrowed, and where it came from. It is the same discipline as `standards/codex.md` (every fact cites
its source), applied to dependencies.

## What to record

For every external adoption:

- **Name** + **author** (handle / org if known)
- **Source** — repo URL, package name, or article/gist link
- **License** — and any redistribution constraint. **Verify it; never guess a license.**
- **What you adopted** — the tool/pattern, and whether used **as-is** or **adapted**
- **Where it's wired** — the adopting ADR, and the files/standards that reference it
- **Date**

## Where it goes

- **The adopting ADR cites the source.** Any decision to bring in an external tool/pattern names and
  links it in `codex/decisions/` (this template repo: `docs/adr/`). The *why* carries the credit —
  non-negotiable.
- **A running ledger** collects them in one place: `docs/attributions.md` at the repo root (the
  Grimoire template uses this), or `codex/resources/manifest.md` for a consuming project's resources.

## Adapt, don't copy

When you adapt an external idea to this stack, say so and say what you changed — a vendor example is an
illustration, not a mandate. Credit the source for the idea even when little of its form survives.

Keep this lean (`rules/35-context-economy.md`).
