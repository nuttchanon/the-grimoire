---
updated: 2026-05-31
description: Keep entry and always-on files lean; push detail to references read on demand.
---

# 35 — Context economy (keep entry files lean)

Entry and always-loaded files are read every session — bloat there taxes every turn (tokens +
latency). Keep them lean; push detail to reference files reached on demand. This is the whole point
of the load-order in `AGENTS.md`: start narrow, pull in depth only when the task needs it.

How to write any of these docs (lead, voice, structure, versioning): `standards/writing.md`.

## Budget

- **Entry files** (`CLAUDE.md`, `.agents/AGENTS.md`, `local/AGENTS.local.md`): target **≤250 lines**,
  **hard ceiling 300**. Line count is a proxy — the real test is *"is every line read most sessions?"*
- **Each rule / standard file:** one focused topic. If a file grows past its single concern, split it.
- **Skills / commands:** a skill body loads in full **when invoked** (its name + description load
  cheaply; the body does not, until used). Keep a skill focused, **~200 lines max** — split a larger
  one into sub-skills so unrelated capability is not pulled into context on use.
- **`memory/MEMORY.md`:** one line per memory; the fact itself lives in its own card.

## What an entry file keeps (and little else)

- tone / persona
- the hardest **always-on** rules (full text lives in `rules/00-always.md`)
- load order + routing map (where to find everything)
- pointers to references (`rules/ standards/ stack/ memory/ local/`)
- precedence / customization note

## What moves out (linked, read on demand)

full rule text · coding standards · stack configs · the capability catalog · ADRs · examples · any
long procedure. Replace the moved section with a one-line pointer — never inline a catalog or a long
procedure into an entry file.

## When an entry file crosses the ceiling

Move the least-daily section into its matching reference file (or a new one) and leave a one-line
pointer behind. Re-check after every edit that adds to an entry file.
