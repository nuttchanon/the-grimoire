---
id: CR-0000
title: <short change title>
status: proposed        # proposed | accepted | applied | rejected
date: <YYYY-MM-DD>
affects:                # the REQ-… id(s) this change modifies
---

# Change Request CR-0000 — <short change title>

A modification to one or more **existing** requirements. Records the diff old → new so the change is
auditable. When applied, update the affected rows in `base.md`, bump the base `version`, and log it in
the base changelog; this file stays as history. See `.agents/standards/requirements.md`.

## Reason for change

What changed in the world (new constraint, user feedback, regulation, a wrong assumption) that forces
this. Be factual.

## The change

| id | old statement | new statement |
|---|---|---|
| REQ-<AREA>-<NNN> | <the current statement> | <the revised statement> |

<!-- For a withdrawal: new statement = "(withdrawn — <reason>)" and set the row's status to withdrawn
     in base.md (keep the id). -->

## Impact

- **Code/tests:** what must change to honor the new statement.
- **Decisions:** ADR id(s) this needs or supersedes.
- **Confirmed values:** if a ground-truth value changes (error code, permission key, enum, channel),
  the linked ADR sets `updates-confirmed-values: yes` and the table updates in the **same PR**.
- **Downstream requirements:** other `REQ-…` affected by this change.

## Acceptance

The check that proves the new statement holds (and the old behavior is gone).
