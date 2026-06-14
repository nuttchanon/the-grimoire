---
id: 0006
title: Delegate knowledge retrieval to external tooling; keep codex as the source of truth
status: accepted
date: 2026-06-14
updates-confirmed-values: no
supersedes: 0002, 0003, 0004
---

# ADR 0006 — Delegate knowledge retrieval to external tooling

## Context

ADRs 0002–0004 grew a homegrown retrieval stack inside the base: a tiered knowledge
architecture with a pgvector retrieval corpus (0002), a context-engineering vocabulary to reason
about it (0003), and a GraphRAG layer to traverse it (0004). Supporting standards followed —
`chunking.md` (how to split a corpus for embedding), `context-engineering.md` (window-as-budget
vocabulary), and `evals.md` (behaviour scoring), plus `templates/evals/`.

Two things changed the calculus:

1. **The retrieval machinery never shipped.** ADR 0004 stayed `proposed`; the pgvector dev-brain was
   gated on a smoke test that never ran in production. We were carrying design weight for a system we
   had not validated.
2. **External tools now cover retrieval, for free, over our existing files.** `graphify` builds a
   queryable knowledge graph from a repo — code via local tree-sitter AST (no API, deterministic),
   docs/PDFs/images via the IDE session model (no extra API key on a flat-rate plan). It points
   straight at the repo, `codex/` included, and answers "what connects X to Y" / "show the call flow"
   without us building or operating an index. For a curated personal knowledge layer above the repo,
   `obsidian-wiki` applies Karpathy's LLM-Wiki pattern (the agent maintains interconnected markdown,
   Obsidian is the viewer) — again driven by the coding agent, no separate API.

The distinction that resolves this: **content** (where knowledge lives) is separate from **retrieval**
(how you search it). `codex/` is content — curated, committed, source-of-truth markdown an agent and a
human author. The pgvector/GraphRAG/chunking layer was retrieval. Tools replace retrieval; they do not
replace the truth store — `graphify` needs `codex/` to index.

## Decision

We will **delegate knowledge retrieval to external tooling** and remove the homegrown retrieval stack
from the base.

- **`codex/` stays** as the project's single source of truth (domain, requirements, decisions,
  evidence, resources, reference, runbooks). Unchanged.
- **`graphify` is the in-repo retrieval mechanism** — a code+docs knowledge graph over the repo,
  `codex/` included. Code extraction is local and free; doc extraction runs through the IDE session.
  `graphify-out/` is committable so a team shares one map.
- **`obsidian-wiki` is an optional personal layer above the repo** — cross-project knowledge and
  agent-history mining into an Obsidian vault. It overlaps `codex/`'s curation philosophy, so it is
  **not a base dependency**: it lives in the user's global agent skills, never in the managed contract.
- Supersede ADR 0002 (tiered knowledge architecture), ADR 0003 (context-engineering vocabulary), and
  ADR 0004 (GraphRAG retrieval).
- Remove `standards/chunking.md`, `standards/context-engineering.md`, `standards/evals.md`,
  `templates/evals/`, and `docs/design/graphrag-retrieval.md`.
- **`standards/knowledge-management.md` stays** — it defines the three-homes work-state model
  (`journal/session|memory|backlog`), which is core grimoire structure, not retrieval machinery.

## Consequences

- **Easier:** the base no longer prescribes (or owes) a retrieval system it never ran. Less surface to
  keep coherent; retrieval is a tool you install, not a thing we maintain.
- **Easier:** retrieval over `codex/` is available immediately via `graphify`, with no embedding
  infrastructure, at flat cost on a subscription plan.
- **Harder / owed:** retrieval quality now depends on an external tool's roadmap, not ours. If a
  project needs guaranteed semantic search, that is a project-local decision (`local/`), recorded in
  its own ADR — the base stays tool-agnostic and unopinionated about it.
- **Migration:** consuming projects that adopted the pgvector/GraphRAG guidance keep their own
  instances; this ADR only removes the *base* prescription. The `sync-adapter-38` dev-brain is now a
  project-local choice, not a grimoire-blessed pattern.
- The "context engineering" *practice* survives where it always lived — `rules/35-context-economy.md`
  (keep entry files lean). Only the formal vocabulary standard is dropped.
