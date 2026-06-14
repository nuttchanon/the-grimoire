---
updated: <YYYY-MM-DD>
status: canonical
description: Ground-truth values the code reads back. Changed only via an ADR with updates-confirmed-values: yes, in the same PR.
---

# Confirmed values

Values the system treats as **ground truth** — error codes, permission keys, shared enums, channel /
IPC names, tenant configs. Changing one is breaking: it goes through an ADR
(`codex/decisions/`) with `updates-confirmed-values: yes`, updated here in the **same PR**.

| key | value | kind | source (file + offset) | CONFIRMED \| INFERRED |
|---|---|---|---|---|
| <e.g. ERR_AUTH_EXPIRED> | <value> | error code | `<file>:<offset>` | CONFIRMED |

<!-- One table per kind is fine (error codes, permissions, enums…). Never silently edit a value:
     every change traces to an ADR. -->
