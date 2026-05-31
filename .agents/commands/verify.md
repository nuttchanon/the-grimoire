---
description: Run the verify script and dispatch the verifier subagent for independent sign-off.
---

Verify the current change to Definition-of-Done standard (`rules/30-verification.md`).

Steps:

1. Identify the `verify` command for this project (package script `verify`, or the active
   `stack/` profile's command). If none exists, fall back to typecheck + lint + tests.
2. Run it. Capture real output and exit code.
3. Spawn the **verifier** subagent (Task/Agent tool) on **fresh context**, passing ONLY:
   - the requirements / acceptance criteria for this change,
   - the diff (`git diff` of the change),
   - the Definition-of-Done checklist.
   Do **not** pass your own reasoning or this conversation.
4. Relay the verifier's structured verdict. If `fail`, the change is **not done** — address the
   reasons and re-run. Do not declare done without a `pass` artifact.

For large or risky changes, also run `/code-review` (or `/code-review ultra`).
