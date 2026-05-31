---
id: 0001
title: Per-folder generated INDEX.md for two-level progressive disclosure
status: accepted
date: 2026-05-31
updates-confirmed-values: no
supersedes:
---

# ADR 0001 — Per-folder generated INDEX.md for two-level progressive disclosure

## Context

`AGENTS.md` carries a single routing map (`Need → folder`). To pick the right *file* inside a folder
an agent then globs and opens several candidates, burning context (`rules/35-context-economy.md`).
Hand-written per-folder indexes would help, but a stale index is worse than none and adds a doc-sync
burden every time a file is added or renamed.

Options considered: (a) keep only the `AGENTS.md` map; (b) hand-maintain per-folder indexes;
(c) generate per-folder indexes from each file's own metadata.

## Decision

We will generate a `INDEX.md` in each managed folder (`rules/ standards/ stack/ commands/ agents/
skills/`) from each file's frontmatter `description:` or its H1 + first paragraph, via
`grimoire index`. The generator runs inside `init` and `sync`, and `grimoire index --check` fails CI
on drift. This gives two-level progressive disclosure: `AGENTS.md` map → folder `INDEX.md` → file.

## Consequences

- Agents select the right file in one read; no exploratory globbing inside a folder.
- INDEX.md is generated, never hand-edited — it cannot drift (CI guards it), so option (b)'s
  maintenance cost disappears.
- A new cost: every indexed `.md` should carry a usable one-liner (frontmatter or a clear first
  paragraph). The generator falls back to the H1 title when absent.
- `grimoire index` also guards catalog↔tooling drift: every MCP wired in `tooling.json` must be named
  in `skills/catalog.md`.
