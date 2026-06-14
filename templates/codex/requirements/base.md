---
version: 0.1.0
updated: <YYYY-MM-DD>
status: canonical
description: Baseline requirements — what the system must do now. Changed only via an applied addon or change request.
---

# Requirements — baseline

The agreed requirements at the current accepted state. This file always reflects **now**. It changes
only when an addon (`addons/`) or change request (`changes/`) is applied — see
`.agents/standards/requirements.md` for the flow. Never edit a requirement here without a matching
addon/CR file recording the diff.

## How to read a row

`id` (stable `REQ-<AREA>-<NNN>`, never reused) · `statement` (one testable "the system must …") ·
`priority` (`must | should | could`) · `status` (`proposed | accepted | implemented | withdrawn`) ·
`acceptance` (the test or check that proves it) · `source` (who/what introduced it).

## Requirements

### AREA: <e.g. AUTH>

| id | statement | priority | status | acceptance | source |
|---|---|---|---|---|---|
| REQ-AUTH-001 | The system must <testable statement>. | must | accepted | `test/auth/...` or manual check | initial spec |

<!-- Add one section per area. Keep numbers sequential per area; never renumber or reuse an id.
     A withdrawn requirement stays in the table with status: withdrawn — do not delete the row. -->

## Changelog (applied addons / CRs)

| date | id | kind | summary | base version after |
|---|---|---|---|---|
| <YYYY-MM-DD> | <ADDON-001 / CR-001> | addon \| change | <one line> | 0.1.0 |
