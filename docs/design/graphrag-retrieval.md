---
updated: 2026-06-06
status: draft
description: 'Full design for GraphRAG retrieval over the tiered KB — graph model, hybrid pipeline, traversal policy, guardrails, and build phases. Companion to ADR 0004.'
---

# Design — GraphRAG retrieval over the tiered knowledge base

Companion to `docs/adr/0004-graphrag-retrieval.md`. The ADR records the decision; this is the design.
Status **draft** — accepted and built only after the current pgvector dev-brain is smoke-tested.

## Problem

Vector RAG answers "what text is similar to my query?" It returns top-k isolated chunks. A large class
of real questions is **multi-hop** — the answer is a *path* through related nodes, not a single
passage:

- "This REQ is satisfied by which ADR, and that ADR changes which module's error codes?"
- "This incident touched which IPC channel, whose handler lives in which module, covered by which test?"
- "This drug-interaction rule supersedes which earlier one, cited by which field report?"

Vector search retrieves each node separately and cannot follow the edge. GraphRAG makes the edges
first-class and traverses them.

## Graph model

**Nodes** are Tier-2 chunks (`standards/chunking.md`): provenance-bound, self-contained units — a
memory card, an ADR section, an error-code entry, an IPC row, a spec clause.

**Edges** are relationships already authored in the corpus, lifted into metadata at index time:

| Edge source | Example | Relationship |
|---|---|---|
| `[[wikilinks]]` in `memory/` | `[[grimoire-status]]` | references |
| ADR `supersedes:` frontmatter | 0004 → 0002 | supersedes |
| ADR ↔ REQ citation | "satisfies REQ-014" | satisfies |
| error-code ↔ module | `E_SYNC_*` → sync module | owned-by |
| IPC contract row | channel → handler | bound-to |

Each edge carries the same provenance as its nodes; a traversal can always be cited.

## Retrieval pipeline (hybrid)

1. **Recall** — vector + keyword (the existing hybrid: embedding similarity + tsvector RRF) finds the
   *entry nodes* most relevant to the query. Keyword recall stays because medical codes need exact
   match (ADR 0002).
2. **Traverse** — from entry nodes, follow edges up to a bounded hop limit, collecting connected nodes
   that form the answer path.
3. **Assemble** — return the subgraph (nodes + the edges between them) with provenance, so the agent
   sees the *relationship*, not just the endpoints.

Single-hop queries degrade gracefully: with no useful edge, the pipeline returns recall results — i.e.
plain vector RAG. GraphRAG is a superset, not a replacement risk.

## Traversal policy

- **Hop limit** — bounded (start at 2) to prevent fan-out across the whole graph and to cap KV-cache
  cost (`standards/context-engineering.md`).
- **Tier-1 wins during traversal** — if a traversal reaches a node that conflicts with a Tier-1
  governed rule, Tier-1 wins (ADR 0002), mid-path, not just at the answer.
- **Provenance gates the edge** — an edge past `expiry` is flagged, not silently followed.
- **Governance boundary holds** — traversal never crosses out of the data-governance boundary; the PHI
  guardrail and self-hosted-embedder rules (ADR 0002) are unchanged.

## Guardrails (inherited from ADR 0002, unchanged)

- No PHI in any node or edge.
- Safety / compliance rules are Tier-1-only — referenced from the graph, never sourced from it.
- Every retrieval cites; a Tier-2 assertion without a citation is a defect.

## Tool-agnostic contract

The base defines **what** an edge and node are (frontmatter relations, `[[wikilinks]]`, provenance
fields) — the *graph contract*. The engine (graph store, traversal implementation) lives in the
consuming project, environment-driven and cloud-portable like the rest of Tier-2. The base ships no
graph database.

## Supersedes

This design targets a rebuild of the `sync-adapter-38` dev-brain (pgvector + bge-m3, vector-only). That
build has never run in production and is disposable by ADR 0002. It is **not deleted by this design**;
deletion and rebuild happen in that repo once this design is accepted and the graph contract is
validated.

## Build phases (when accepted)

1. **Smoke-test the current pgvector dev-brain** — prove vector recall works before adding a graph
   layer. Gate: nothing below starts until this passes.
2. **Graph-contract schema** — node / edge / provenance shape; a `grimoire doctor` check for it.
3. **Edge extraction at index time** — lift `[[wikilinks]]`, `supersedes:`, citations into edges.
4. **Traversal over recall** — add the bounded-hop traversal on top of hybrid recall.
5. **Rebuild dev-brain** as a conforming instance; retire the vector-only script.

Each phase is its own ADR / backlog item; this design is the map, not the plan.

## Pointers

- The decision: `docs/adr/0004-graphrag-retrieval.md`
- The tier boundary + guardrails: `docs/adr/0002-tiered-knowledge-architecture.md`
- Node shape (chunks): `standards/chunking.md`
- Why edges exist (the `[[wikilinks]]` graph): `standards/knowledge-management.md`
- Context-cost framing (hop limit / KV cache): `standards/context-engineering.md`
