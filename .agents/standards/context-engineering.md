---
updated: 2026-06-06
status: canonical
description: 'Context-engineering vocabulary: the window as a budget, context collapse, curation over capacity, three-stage guardrails, and the cost of context.'
---

# Standards — context engineering

Grimoire is, end to end, context engineering: deciding what an agent holds in working memory at each
turn and curating it for signal. This file names the concepts that design rests on, so every agent
shares one vocabulary and can name a failure when it sees it. The mechanics live elsewhere —
`rules/35-context-economy.md` (keep entry files lean), `standards/knowledge-management.md` (where state
lives); this file is the *why* and the shared language.

## The window is a budget, not a target

The **context window** is how much text a model holds in working memory at once. It is finite and
shared — every always-on file, every tool result, every prior turn spends from it. A bigger window is
not a better one: it raises the ceiling, not the quality. Treat the window as a budget you spend on the
*most relevant* tokens, not a container you fill.

## Context collapse (the failure mode we design against)

**Context collapse** is what happens when too much is stuffed into the window: the model loses the
plot, recall drops, and output quality falls even though every needed fact is technically "in there."
Context past the relevant set is not neutral — it is noise that buries signal.

- **Symptoms:** the agent forgets an instruction given earlier, contradicts a loaded rule, re-asks a
  settled question, or blends two unrelated tasks.
- **Cause:** low signal-to-noise — irrelevant files loaded up front, stale turns never cleared, a
  catalog inlined where a pointer belonged.
- **Fix is curation, not a bigger window.** Load narrow, pull depth on demand, clear finished work.
  This is the entire point of the `AGENTS.md` load order.

## Curation over capacity

The lever is *what you load*, not *how much you can*. Grimoire's mechanisms are all curation:

| Mechanism | What it curates | Where |
|---|---|---|
| Load order (entry → INDEX → file) | read narrow first, depth on demand | `AGENTS.md` |
| Lean entry files (≤250 lines) | only always-true content stays always-on | `rules/35-context-economy.md` |
| Per-folder `INDEX.md` | one line per file, scan before opening | every managed folder |
| Three homes (NOW / KNOWLEDGE / QUEUE) | state survives outside chat history | `standards/knowledge-management.md` |
| On-demand skill / doc bodies | body loads when invoked, not before | `rules/35-context-economy.md` |

## Guardrails run in three stages

**Guardrails** are the rules and filters that constrain what an agent may say or do. They are not one
gate — they run before, during, and after generation, and Grimoire already has all three:

| Stage | Question | Where it lives |
|---|---|---|
| **Pre-generation** | is the input safe and authorized? | `rules/50-security.md` (validate + authorize server-side, fail closed) |
| **In-generation** | is the agent constrained while it works? | the loaded contract — `rules/`, `standards/`, source priority |
| **Post-generation** | did the output pass before it ships? | `rules/30-verification.md`, `standards/guardrail-tests.md`, the verifier |

Shipping an agent to users with only one stage is shipping a liability. Name which stage a check
belongs to; a gap in one stage is not covered by another.

## The cost of context

Loading is not free, and the bill has a name. **Inference** — running the model to produce output — is
the recurring cost of an agent; training is a one-time investment, inference is the rent. Long context
drives that rent up: the **KV cache** (the stored attention tensors that let the model skip recomputing
past tokens) grows with everything you keep in the window. Long context is not free; the KV cache is
the receipt.

This is the economic case under `rules/35-context-economy.md`: a lean entry file is not just easier to
read, it is cheaper and faster every single turn. Curation pays twice — better signal *and* lower rent.

## Pointers

- Keeping entry / always-on files lean: `rules/35-context-economy.md`
- Where work-state lives across sessions: `standards/knowledge-management.md`
- Splitting a corpus for retrieval without losing meaning: `standards/chunking.md`
- Testing agent behavior, not just wiring: `standards/evals.md`
- Scaling knowledge past hand-curation: `docs/adr/0002-tiered-knowledge-architecture.md`
- Why this vocabulary: `docs/adr/0003-context-engineering-vocabulary.md`
