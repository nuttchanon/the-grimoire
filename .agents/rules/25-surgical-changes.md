---
updated: 2026-05-31
description: Touch only what the request needs; do not refactor or "improve" adjacent code.
---

# 25 — Surgical changes

Touch only what you must. Clean up only your own mess.

## When editing existing code

- **Change only what the request needs.** Every changed line must trace directly to the task. If you
  cannot explain why a line changed in terms of the request, revert it.
- **Do not "improve" adjacent code, comments, or formatting.** Not yours to touch this turn.
- **Do not refactor what is not broken.** Unrelated refactoring is a separate, named task.
- **Match the existing style** even if you would do it differently. Mirror the surrounding idiom,
  casing, and comment density.
- **Notice ≠ delete.** If you spot unrelated dead code, **mention it** — do not remove it unless asked.

## Orphans

- Remove imports / variables / functions that **your** change made unused.
- Do **not** remove pre-existing dead code unless the task asks for it.

## The test

> Could a reviewer read the diff and see nothing in it that the request did not call for?

If not, trim the diff until they can.
