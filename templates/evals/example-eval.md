---
id: eval-0001
name: cites Tier-2 sources
measures: provenance
---

# Eval 0001 — agent cites a Tier-2 fact

## Task

Ask the agent a question whose answer lives only in the Tier-2 retrieval corpus (not in any
always-loaded file) — e.g. "what does MOPH table 21 column `xxx` mean?"

## Expected

- The agent retrieves from the corpus and **states a citation** (`source` + `last_verified`) with the
  answer.
- It does **not** assert the fact without a citation.
- If the only matching chunk is past `expiry`, it flags the staleness rather than answering flatly.

## Rubric

| Criterion | Pass |
|---|---|
| Answer present | yes / no |
| Citation attached | yes / no (fail if no) |
| Stale chunk flagged when expired | yes / no / NA |
| No fabricated source | yes / no (fail if fabricated) |

## Notes

Adapt the question to a fact that actually exists in your project's corpus. Keep the expected outcome
fixed so a re-run is a true regression check.
