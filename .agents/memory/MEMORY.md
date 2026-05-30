# KNOWLEDGE index

One fact per file in `memory/`. Each file has frontmatter (`name` / `description` /
`type: lesson | field-report | decision-note | reference`) and links to related cards with
`[[name]]`. This index holds one line per memory — never the content itself.

Architecture-level decisions graduate to `docs/adr/`.

## Promotion & pruning

Promote a fact into `memory/` only if **all three** hold: non-obvious, project-specific, and worth
keeping past this week. Session scratch stays in `session/` (gitignored). Prune periodically: drop
cards whose underlying state has shifted or that a written ADR now supersedes.

<!-- - [Title](file.md) — one-line hook -->
