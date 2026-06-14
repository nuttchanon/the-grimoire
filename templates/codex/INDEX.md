# codex — index (read this first)

The project's **knowledge / resource root**. Read this signpost before touching any domain reference,
then open the matching subfolder's own `INDEX.md`. Project-owned: `grimoire sync` never touches
`codex/`; the base holds only a pointer to it. Every folder below keeps its own `INDEX.md`.

| Folder | What it holds |
|---|---|
| `domain/` | What the system **is** — glossary, context, business rules, capabilities. |
| `requirements/` | What it must **do** — IDed, versioned base + addons + change requests. |
| `decisions/` | **Why** it is built this way — ADRs (one file per decision). |
| `evidence/` | Investigation / reverse-engineering / extraction outputs, each fact sourced. |
| `resources/` | Raw materials — datasets, vendor specs, dumps, external artifacts/snapshots. |
| `reference/` | Confirmed-value tables, API/IPC catalogs, big contracts the code reads back. |
| `runbooks/` | The on-call answer to "production is broken — what now." |

Protocol: `.agents/standards/codex.md`. The structure is **extensible** — add a folder when a new
kind of knowledge appears; give it an `INDEX.md` and list it here.
