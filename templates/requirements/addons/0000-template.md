---
id: ADDON-0000
title: <short addon title>
status: proposed        # proposed | accepted | implemented | withdrawn
date: <YYYY-MM-DD>
extends:                # REQ-… ids in base this builds on, if any
---

# Addon ADDON-0000 — <short addon title>

A self-contained new capability layered on the base. Reviewable on its own. When it ships, fold its
rows into `base.md` and bump the base `version`; this file stays as history.
See `.agents/standards/requirements.md`.

## Why

What user need / opportunity this addresses. Link the PRD or discussion if any.

## New requirements

| id | statement | priority | status | acceptance | source |
|---|---|---|---|---|---|
| REQ-<AREA>-<NNN> | The system must <testable statement>. | must | proposed | <test or check> | this addon |

## Dependencies & impact

- **Builds on:** <REQ-… in base, or "none">
- **Touches:** <code areas, modules>
- **Decisions needed:** <ADR id(s) this spawns, if a design choice is required>
- **Confirmed values:** <does it add/change an error code, permission key, enum, channel? if so, the
  ADR sets `updates-confirmed-values: yes` and the table updates in the same PR>

## Acceptance (addon-level)

How we know the whole addon is done — the set of checks across its requirements.
