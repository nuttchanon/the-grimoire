---
id: 0003
title: Adopt a shared context-engineering vocabulary
status: accepted
date: 2026-06-06
updates-confirmed-values: no
supersedes:
---

# ADR 0003 — Adopt a shared context-engineering vocabulary

## Context

Grimoire is, end to end, a context-engineering system: the load order, lean entry files, per-folder
INDEX, the three-home state model, and the tiered knowledge contract (ADR 0002) all exist to control
what an agent holds in working memory and to keep the signal high. But the repo never *named* the
concepts behind that design. The mechanics were documented (`rules/35-context-economy.md`,
`standards/knowledge-management.md`); the vocabulary was not.

That gap has a cost. Agents and humans reading the repo could follow the rules without a word for
*why* — no shared term for the failure the rules prevent, no common label for the three places a
guardrail runs, no name for the economic reason a lean file is cheaper. Without shared terms, two
agents describe the same failure two ways, and a reviewer cannot say "this is context collapse, curate
it down" in three words. Industry has settled on this vocabulary (context window, context collapse,
guardrails, inference, KV cache); adopting it costs nothing and buys precision.

The material came from an external 2026 "terms to know" list. Per our practice, external guidance is
adapted to our stack, not copied: of nine terms, five describe what Grimoire already does (window,
collapse, guardrails, inference, KV cache) and belong in a vocabulary doc; the rest map to separate
work — chunking and evals to their own standards, GraphRAG to a retrieval ADR, quantization out of
scope for a tool-agnostic template.

## Decision

We will add `standards/context-engineering.md` as the canonical vocabulary for how Grimoire reasons
about context: the window as a budget, **context collapse** as the named failure mode the design
prevents, **curation over capacity** as the lever, **three-stage guardrails** (pre / in /
post-generation) mapped onto existing rules, and the **cost of context** (inference + KV cache) as the
economic case under `rules/35-context-economy.md`. The doc names and links existing mechanisms; it
introduces no new mechanism and mandates no new process.

## Consequences

- Reviewers and agents get a precise shared language: "context collapse," "curate it down," "which
  guardrail stage," "the KV-cache cost." Cheaper, clearer review.
- `rules/35-context-economy.md` gains an economic rationale by reference instead of restating it; the
  rule stays about *what to do*, the standard holds *why*.
- The hot-keyword map in `AGENTS.md` gains entries so the terms route to the file.
- Low risk: a vocabulary doc with no enforcement cannot break a build. The cost is one more standard to
  keep current — bounded by the lean-file discipline it describes.
- Three sibling work items are scoped by this adoption: `standards/chunking.md`, `standards/evals.md`,
  and the GraphRAG retrieval ADR (0004).
