---
id: 0004
title: GraphRAG retrieval over the tiered knowledge base
status: proposed
date: 2026-06-06
updates-confirmed-values: no
supersedes:
---

# ADR 0004 — GraphRAG retrieval over the tiered knowledge base

## Context

ADR 0002 defined a Tier-2 retrieval corpus and left the retrieval *method* open. The first
implementation (the sync adapter's dev-brain: pgvector + bge-m3, hybrid vector + tsvector) is
vector-only: it finds passages similar to a query and returns top-k. That answers "what text is like
this?" It does not answer "what is connected to this?"

Many real questions in these projects are **multi-hop**: "this REQ is satisfied by which ADR, and that
ADR affects which module, and that module owns which error codes?" Vector search retrieves each node in
isolation and cannot follow the edge between them — it returns disconnected passages and leaves the
agent to guess the relationship, or misses the chain entirely. Gartner flags GraphRAG — retrieval over
a knowledge graph rather than isolated chunks — as a critical GenAI enabler for exactly this reason:
vector RAG finds passages, GraphRAG follows relationships.

Grimoire already has the graph. `memory/` cards link with `[[wikilinks]]`; ADRs reference REQs and
supersede each other; error codes bind to modules; the IPC contract ties channels to handlers. These
are edges, currently used only by humans (the Obsidian view) and never traversed by retrieval.

The dev-brain built in `sync-adapter-38` has **never been used in production** — it is disposable, as
ADR 0002 anticipated ("being disposable, can be rebuilt"). So this is not a migration constraint; we
are free to design the retrieval layer correctly and rebuild against it.

## Decision

*(Proposed — design only; no base code ships with this ADR.)*

We will design Tier-2 retrieval as **GraphRAG**: a knowledge graph whose nodes are provenance-bound
chunks (`standards/chunking.md`) and whose edges are the `[[wikilinks]]` and cross-references already in
the corpus, queried by a **hybrid pipeline** — vector / keyword recall to find entry nodes, then graph
traversal to follow relationships for multi-hop answers. The governed-core determinism and the
ADR-0002 guardrails (Tier-1-wins, provenance citation, no PHI, safety rules Tier-1-only) carry over
unchanged. The base stays tool-agnostic: it defines the **graph contract** (how nodes, edges, and
provenance are expressed), not an engine. The full design is in `docs/design/graphrag-retrieval.md`.

This ADR is `proposed`: it records the direction and names the vector-only dev-brain as the build it
*targets for replacement*. It is accepted — and the dev-brain rebuilt — only after the current pgvector
layer is smoke-tested and the graph contract is validated against a real corpus.

## Consequences

- Multi-hop questions (REQ ↔ ADR ↔ module ↔ error-code) become answerable in one retrieval instead of
  several disconnected ones — the main capability vector-only retrieval cannot provide.
- The `[[wikilinks]]` already authored become load-bearing for agents, not just a human view layer —
  more reason to link liberally (`standards/knowledge-management.md`).
- Chunking must preserve link metadata (`standards/chunking.md` already specifies this) — graph edges
  are dropped links.
- Real work owed before acceptance: a graph-contract schema (node / edge / provenance), a traversal
  policy (hop limit, Tier-1-wins during traversal), and a rebuilt dev-brain. These are follow-ups,
  gated on the pgvector smoke test.
- Risk: a graph adds a failure mode — a wrong edge routes a multi-hop answer down the wrong chain.
  Traversal must respect provenance and stay inside the data-governance boundary (ADR 0002), and Tier-1
  still wins on conflict.
- Supersedes the `sync-adapter-38` dev-brain as the retrieval *target*; that build is not deleted by
  this ADR — deletion / rebuild happens in that repo when this is accepted.
