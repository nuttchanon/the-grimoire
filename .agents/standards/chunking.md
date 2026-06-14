---
updated: 2026-06-06
status: canonical
description: 'How to split a corpus for retrieval so chunks stay meaningful: semantic boundaries over fixed size, self-contained units, provenance and links carried.'
---

# Standards — chunking

A **chunk** is the unit a retrieval system stores and returns. How a corpus is split before indexing
decides whether retrieval surfaces a coherent answer or a fragment that starts mid-thought. Chunking
quietly determines retrieval quality — the difference between a Tier-2 corpus (ADR 0002) that helps and
one that hallucinates. This standard is the discipline; a project's indexer implements it.

## Semantic boundaries, not fixed size

Splitting every N tokens is the common default and the common failure: it cuts through the middle of a
concept, separating a claim from its condition, a heading from its body, a term from its definition.
Split on **meaning** instead — at boundaries the document already has.

- A `journal/memory/` card is already one fact: it is one chunk. ("One fact per file" is semantic chunking by
  construction — `standards/knowledge-management.md`.)
- A standard or ADR splits at its section headings, not mid-section.
- A table stays whole; a code block stays whole.
- A rule and its rationale stay together; a value and its unit stay together.

Grimoire's authoring discipline already produces good chunks: one topic per file, one fact per card. A
corpus that follows `standards/writing.md` is most of the way to chunking well.

## A chunk must be self-contained

A retrieved chunk arrives with no surrounding context. It must stand alone:

- **No dangling reference** — "as above," "the previous section," an unresolved "it" or "this."
- **Enough scope to be unambiguous** — a code that means one thing under ICD and another under a drug
  catalog carries which system it belongs to.
- **One idea per chunk** — if it needs "and also," it is two chunks.

## Carry provenance and relations

Every chunk carries the Tier-2 metadata from ADR 0002 — `source`, `last_verified`, `expiry` — so a
retrieval can be cited and a stale chunk caught. Where a chunk came from a document with `[[wikilinks]]`
or cross-references, preserve those links in metadata: they are the edges a graph retrieval traverses
(`docs/adr/0004-graphrag-retrieval.md`). Chunking for vector search and chunking for graph search are
the same split; only the metadata you keep differs.

## Anti-patterns

| Anti-pattern | Why it fails | Instead |
|---|---|---|
| Fixed N-token split | cuts mid-concept, claim split from its condition | split on heading / card / paragraph |
| Whole-document chunk | top-k returns one giant blob, buries the hit | split to the smallest self-contained unit |
| Stripped metadata | retrieval can't be cited or expired | carry `source` / `last_verified` / `expiry` |
| Dropped links | multi-hop retrieval has no edges | preserve `[[wikilinks]]` / cross-refs |

## Pointers

- Why retrieval exists and the tier boundary: `docs/adr/0002-tiered-knowledge-architecture.md`
- Authoring docs that chunk well: `standards/writing.md`
- Traversing chunk relations (multi-hop): `docs/adr/0004-graphrag-retrieval.md`
- Context-cost framing: `standards/context-engineering.md`
