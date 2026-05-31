---
id: 0002
title: Tiered knowledge architecture — governed core, retrieval corpus, operational memory
status: accepted
date: 2026-05-31
updates-confirmed-values: no
supersedes:
---

# ADR 0002 — Tiered knowledge architecture (governed core + retrieval corpus + operational memory)

## Context

Grimoire's working model is a curated, deterministic context: `AGENTS.md` → folder `INDEX.md` →
file, loaded in a known order, with a stated source priority (`live code > base template > memory
cards`). This works because the governed set is small enough to curate by hand — a few dozen files an
agent can load in full.

That assumption breaks at scale. A consuming project, the Ever Sync Adapter (hospital-data → MOPH
FHIR cloud), already runs **25 hospitals in production (v1), 22 of them upgraded to v2**, against a
**38-site pilot target and an 807-hospital nationwide rollout** once the ministry signals readiness —
plus every รพสต after that. Its knowledge base is already large: **258 doc files (~8 MB), 60 ADRs,
69 MOPH-table Zod schemas, an 87-row IPC contract, 80+ error codes**, and a growing stream of field
reports, hotfixes, and (at nationwide scale) support tickets that no human will curate file-by-file.

That project has **already reached for retrieval**: `index-knowledge-base.py` builds a ChromaDB
vector index, wired over MCP, but — critically — it indexes a **hand-listed set of 52 governed
entry-points**, not "everything." It is curated-RAG-over-governed-files, discovered ad hoc. We have
no base contract saying *what* belongs in a vector store, what must never be retrieved
non-deterministically, where provenance lives, or how conflicts resolve. Without that contract, the
next project either re-derives it or — worse — dumps an unbounded corpus into embeddings and inherits
the failure mode RAG is famous for: **confidently wrong retrieval**. In a healthcare product, a
missed clinical-safety rule or a stale drug-interaction fact is a patient-safety risk, not a UX
papercut.

The question is not "file-based **or** RAG." Both already coexist in the field. The gap is the
**boundary contract** between them.

Options considered:
- **(a) Keep curating by hand.** Fails the moment the corpus outgrows what an agent can load — already
  true for the sync adapter, and HIS will be larger.
- **(b) Move the knowledge base into RAG wholesale.** Surrenders determinism and provenance for the
  governed core; lets safety-critical rules depend on top-k luck. Unacceptable for healthcare.
- **(c) Define explicit tiers with a hard boundary** — deterministic governed core, retrieval-backed
  reference corpus, indexable operational memory — and state which tier owns what, how provenance is
  carried, and that the governed tier always wins a conflict.

## Decision

We will define a **three-tier knowledge contract** that every consuming project inherits, with the
retrieval engine pluggable (ChromaDB, pgvector, none) and **never** baked into the base.

**Tier 1 — Governed core (deterministic, file-based).** The existing Grimoire surface: `AGENTS.md`,
`rules/`, `standards/`, `stack/`, ADRs, `local/reference/` contracts, error catalogs, IPC tables,
safety/compliance rules. Loaded by order, never by similarity search. An agent **must** see these
every run — they cannot depend on retrieval. **Safety-critical and compliance rules live here and
only here.**

**Tier 2 — Retrieval corpus (semantic, provenance-bound).** Material too large or too unstructured to
curate by hand: code-system catalogs (ICD, drug, lab), FHIR/spec references, accumulated meeting
notes, resolved tickets, historical field reports. Indexed for semantic search. Three rules bind it:
1. Every chunk carries **provenance metadata** — `source`, `last_verified`, `expiry`.
2. On any conflict with Tier 1, **Tier 1 wins** (the existing source-priority rule, now machine-applied).
3. Every retrieval returns its **citation**; an agent may not assert a Tier-2 fact without it.

**Tier 3 — Operational memory (structured, indexable).** `memory/` cards, `field-reports/`, handoff
history. Stays lean and file-based (the discipline in `rules/00-always.md` holds), but its `INDEX.md`
files are **eligible** for Tier-2 indexing so the growing operational record stays searchable without
bloating the always-loaded set.

**The boundary is declared, not guessed.** A project states which corpora are Tier-2-backed in a
`retrieval` block in `tooling.json` (or `local/`), listing indexed roots and the embedding/vector
backend. `grimoire doctor` validates the manifest; the base ships **no** default backend.

**Two hard guardrails (fail-closed):**
- **No PHI in any tier.** The second brain holds *knowledge* — how the system works, decisions,
  specs, de-identified incidents — **never** patient records. A guard rejects anything resembling
  patient data from entering `memory/` or the retrieval index.
- **Safety/compliance rules are Tier-1-only.** They may be *referenced* from Tier 2, never *sourced*
  from it.

**Deployment (cloud).** Both halves of Tier 2 are environment-driven and cloud-portable with **no code
change** — a vector store URL and an embedder URL. Hosting is governed by the data the tier holds, not
by convenience:
- A **dev/knowledge tier** carrying no PHI (product docs, ADRs, specs) may run on any cloud — managed
  Postgres+pgvector (RDS/Aurora, Cloud SQL/AlloyDB, Azure, Supabase, Neon) and a self- or managed
  embedder.
- An **operational tier** that can contain hospital/patient-adjacent data (tickets, incident context)
  may be hosted on cloud **only inside the data-governance boundary**: in-country / sovereign or
  ministry-private region (data residency), with the **embedder self-hosted inside that boundary** —
  never a foreign managed embedding API (egress). Encryption in transit + at rest and an access audit
  trail are required. This is the PHI guardrail above, applied to where bytes physically live.

## Consequences

- A project can scale its knowledge base past hand-curation without surrendering the determinism and
  provenance that make the governed core trustworthy. The sync adapter's ad-hoc ChromaDB setup becomes
  a *conforming instance* of a named pattern instead of a bespoke script — and, being disposable, can
  be rebuilt against whatever Tier-2 backend this contract settles on.
- New base work is owed: a `retrieval` manifest schema in `tooling.json`; `grimoire doctor` checks for
  the manifest, for `last_verified`/`expiry` on indexed material, and for the PHI guard; an optional
  reference indexer (or a documented contract a project's own indexer must satisfy). These are
  follow-up ADRs/backlog items, not part of accepting this one.
- Provenance becomes machine-enforced, not prose. `expiry` in the past = `doctor` warns; a Tier-2
  assertion without a citation = a defect. This directly attacks the "confidently wrong" failure mode.
- The base stays tool-agnostic and lean: no vector DB, no embedding model, no Python dependency enters
  Grimoire core. Projects that never outgrow Tier 1 (the common case) pay nothing.
- Obsidian and similar tools are clarified as **human viewers** over Tier-1/Tier-3 markdown
  (`[[wikilinks]]` already render), not a knowledge tier for agents — no architectural commitment.
- Cost we now owe: the boundary must be policed. A lazy project could let Tier-2 quietly absorb a rule
  that belongs in Tier 1; `doctor` checks reduce but do not eliminate that risk, so the PHI/safety
  guardrails are written as fail-closed.

## Confirmed values

This ADR defines a pattern; it changes no IPC channel, error code, or tenant config. Per-project
`retrieval` manifests and the eventual `tooling.json` schema key are introduced by their own
follow-up ADRs when implemented.
