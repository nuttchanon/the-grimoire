---
description: Snapshot the NOW whiteboard before a context boundary.
---

Checkpoint the current session state (`rules` §6 — NOW layer).

Steps:

1. Ensure `.agents/session/current.md` reflects the live state: mode, focus, last-done, next-step,
   blockers, open-questions, files-touched. Rewrite it in place if stale.
2. Copy it to `.agents/session/archive/<timestamp>.md` (timestamp = `YYYY-MM-DD-HHmm`).
3. Confirm the snapshot path back to the user.

A checkpoint is **not a new file type** — it is a timestamped copy of `current.md`. Resume always
reads `current.md`; archives are for recovery only.
