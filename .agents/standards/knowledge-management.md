---
updated: 2026-05-31
status: canonical
description: 'The second-brain model: three homes for work-state, and how to view memory as an optional Obsidian vault.'
---

# Standards — knowledge management

Where work-state lives so context survives across sessions and compaction. Three homes, each
answering one question; nothing duplicated between them. Continuity lives here, not in chat history.

## Three homes

| Layer | Answers | Home | Git |
|---|---|---|---|
| NOW | what am I doing right now? | `journal/session/current.md` | gitignored |
| KNOWLEDGE | what do we already know? | `journal/memory/` + `journal/memory/MEMORY.md` | tracked |
| QUEUE | what work is pending? | `journal/backlog/` | tracked |

Write the live state to NOW as you go; promote durable facts to KNOWLEDGE; route pending work to
QUEUE (`rules/40-handoff.md`). Finish a task, then compact or clear the session — the three homes
carry continuity, so a fresh session loses nothing that mattered.

## Memory cards

One fact per file under `journal/memory/`, linked with `[[wikilinks]]`; `MEMORY.md` is the one-line index.
Convert relative dates to absolute. Link liberally — a `[[name]]` with no file yet marks a card
worth writing later.

## Optional: view memory as an Obsidian vault

`journal/memory/` is plain Markdown using `[[wikilinks]]` — already Obsidian-native. Point an Obsidian vault
at it for graph view and backlinks over the agent's knowledge base. This is a **human view layer
only**: Grimoire never depends on Obsidian (the core stays tool-agnostic), and nothing in `journal/memory/`
requires it.
