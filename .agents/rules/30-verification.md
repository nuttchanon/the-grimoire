---
updated: 2026-05-31
description: 'The independent verifier: the author cannot mark their own work done; verify on fresh context.'
---

# 30 — Verification (independent verifier)

**Principle: the agent that writes code cannot mark it done.** Bias comes from *shared context*,
not from the model. Cut the context → cut the bias. One Claude Code subscription is enough via a
**subagent with fresh context** — the **verifier**.

## Flow (one session)

1. Implementer (main thread) finishes the change.
2. Main spawns the **verifier** subagent, passing **only**: the requirements, the diff, and the
   checklist. **Not** the implementer's reasoning or conversation.
3. The verifier is prompted to **refute** (skeptic; default to FAIL when unsure). It **runs the real
   commands** (`verify` script — tests/build/lint) and **quotes real output**. No "looks good".
4. The verifier returns a structured verdict: `pass | fail` + reasons + commands run + quoted output,
   saved as an artifact.
5. **Definition of Done** = tests green **AND** verifier `pass` **AND** checklist complete. Missing
   any one → not done.

## Scaling

- Large work → multiple verifier lenses (correctness / security / requirements-match), run in parallel.
- Same model family shares blind spots. Mitigate with: refute-style prompt, mandatory quoted
  evidence, optionally run the verifier on a different model tier. Cross-model verification arrives
  free when a second tool is added later.

## Tool binding

- Tool-agnostic: this file states the protocol in prose — any agent can follow it.
- Claude Code: subagent `agents/verifier.md` + command `commands/verify.md`. For big changes, pair
  with `/code-review` (or `/code-review ultra`).
- A Stop-hook may warn if "done" is declared without a verifier artifact (per-project opt-in).
