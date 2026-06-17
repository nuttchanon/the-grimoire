# Attributions

Grimoire builds on external tools and ideas. This ledger credits their authors and records what we
adopted. When you bring in something new from outside — a tool, library, pattern, or idea — add an
entry here **and** cite the source in the adopting ADR. The practice is `standards/attribution.md`.

This file lives at the repo root (like `ROADMAP.md`): it documents the Grimoire template itself and
does not ship into `grimoire init` projects. A consuming project keeps its own ledger
(`codex/resources/manifest.md` or its own `docs/attributions.md`).

## Tools

### graphify — in-repo retrieval
- **Author:** Safi Shamsi (@graphifyy) — graphifylabs.ai, YC S26
- **Source:** https://github.com/safishamsi/graphify · PyPI `graphifyy`
- **License:** see the repository — verify before redistribution (not captured here).
- **Adopted for:** the blessed in-repo retrieval mechanism — a code+docs knowledge graph over the
  repo (including `codex/`). Code via local tree-sitter AST (free); docs via the IDE session model.
- **Wired in:** ADR `docs/adr/0006-delegate-retrieval-to-external-tooling.md`; `.agents/stack/README.md`
  (Knowledge retrieval section); `.gitignore` + `templates/gitignore-snippet.txt` (commit policy).
- **Adopted as-is** (external CLI; not vendored). Date: 2026-06-14.

### obsidian-wiki — personal knowledge layer
- **Author:** Ar9av (@_ar9av) — https://github.com/Ar9av
- **Source:** https://github.com/Ar9av/obsidian-wiki
- **License:** MIT (per the project README).
- **Adopted for:** an optional **personal, above-repo** knowledge layer — an agent-maintained Obsidian
  wiki. Explicitly **not** a base dependency (it overlaps `codex/`'s curation role).
- **Wired in:** ADR `docs/adr/0006-delegate-retrieval-to-external-tooling.md` (named as an optional
  layer); `.agents/stack/README.md`. Installed into global agent skills, not the managed contract.
- **Adopted as-is** (global skills via `pip install obsidian-wiki`). Date: 2026-06-14.

### ponytail — laziness ladder + over-engineering enforcement
- **Author:** Dietrich Gebert (@DietrichGebert) — https://github.com/DietrichGebert
- **Source:** https://github.com/DietrichGebert/ponytail
- **License:** MIT (per the repository `LICENSE` and README badge).
- **Adopted for:** the "lazy senior dev" decision ladder (skip → stdlib → native → existing dep →
  one-line → minimal), the "never simplify away" guardrail, and the `ponytail:` shortcut marker.
- **Wired in:** ADR `docs/adr/0007-adopt-ponytail-laziness-ladder.md`; `standards/clean-code.md` (the
  ladder, guardrail, and marker in the suppression policy); `rules/05-code-quality.md` (one-line
  pointer); `.agents/stack/README.md` (delegated enforcement: `/ponytail-review|audit|debt`).
- **Adapted, not copied** — the *principle* is ported into Grimoire's own standard (tool-agnostic,
  survives `grimoire sync`); the *enforcement automation* (review/audit/debt commands) is delegated to
  the ponytail plugin as an optional per-machine tool, not vendored. Date: 2026-06-17.

## Ideas / patterns

### LLM-Wiki pattern
- **Author:** Andrej Karpathy
- **Source:** gist — https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- **Adopted for:** the curated-markdown knowledge model — "compile knowledge once, the LLM maintains
  it" — behind obsidian-wiki and mirrored by Grimoire's `journal/memory/` cards.
- **Adapted, not copied:** Grimoire's memory-card model predates and parallels it; credited for the
  idea. Date: 2026-06-14.
