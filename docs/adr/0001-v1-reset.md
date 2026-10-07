# 0001 — v1 reset: one AGENTS.md, three external skill vendors

Date: 2026-10-07 · Status: accepted

## Context

After months of use, the 0.x template had become heavy. A single `init` seeded about 85 files
(`.agents/` 48, `codex/` 24, `journal/` 7, `local/` 7), and most of them were empty READMEs, INDEX
files, and templates. Every session loaded about 14KB (≈3.5K tokens) before any work started:
`AGENTS.md` + `AGENTS.local.md` + a mandatory `rules/00-always.md`. Reaching real guidance took 4–5
hops (map → `INDEX.md` → rule → standard). Much of it was written for humans to read (navigator, tone,
presentation mode, per-folder tables of contents), or duplicated what Claude Code already does
natively (skill catalog, memory, session notes). Only a few parts were actually used. One rule
("effort is not a constraint, never pick the lazy design") also contradicted the adopted ponytail
ladder.

## Decision

- The contract is one root `AGENTS.md`: a managed rules block (about 10 lines) plus a project-owned
  `## Project` section, which wins on conflict. `CLAUDE.md` is just `@AGENTS.md`.
- The CLI is `init`/`sync` (one idempotent operation: refresh the block), `bootstrap`, and
  `--version`. `index`, `doctor`, migration code, and `tooling.json` are removed.
- Process knowledge comes from external vendors instead of homegrown rules and standards. The base is
  ponytail + caveman. On top of that: pstack, the only auto-router (SessionStart), plus superpowers and
  mattpocock installed as on-demand skills with no hooks. ecc, pordee, ui-ux-pro-max, karpathy, and
  the MCP entries are no longer bundled.

## Consequences

- `init` writes 2 files. The always-on cost from grimoire falls to roughly 0.5K tokens.
- 0.x projects migrate by hand (see README). The old template remains at tag `v0.5.0`.
- Coding/security/testing standards are no longer shipped. If a project needs one, it writes it in
  its own Project section or adds a skill for it.
