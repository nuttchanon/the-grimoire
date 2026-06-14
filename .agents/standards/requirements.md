---
updated: 2026-05-31
status: canonical
description: "How requirements are captured, identified, versioned, and traced — base requirements plus addons and change requests."
---

# Standards — requirements

A project's requirements are a **tracked, referenceable artifact**, not scattered chat history. They
live under `codex/requirements/` (project-owned; `grimoire sync` never touches them — seeded by
`grimoire init` from `templates/codex/`). Every requirement has a stable ID so code, tests,
commits, ADRs, and change requests can cite it.

## The three documents

| File | Holds | When it changes |
|---|---|---|
| `codex/requirements/base.md` | The **baseline** — the agreed requirements at the current accepted state | Only via an applied change request (CR) |
| `codex/requirements/addons/<id>-<slug>.md` | A self-contained **addon** — a new feature/capability layered on the base | New file per feature; merged into base when it ships |
| `codex/requirements/changes/<id>-<slug>.md` | A **change request (CR)** — a modification to an existing requirement | New file per change; records old → new |

Base = the source of truth for "what the system must do *now*." Addons and CRs are the **audit
trail** of how it got there. Nothing edits a requirement silently — the diff always exists as a CR
or an addon.

## Requirement IDs — stable and traceable

- Format: `REQ-<area>-<NNN>` — e.g. `REQ-AUTH-001`, `REQ-ROSTER-014`. Area is a short uppercase
  domain tag; number is zero-padded, sequential per area, **never reused or renumbered**.
- A requirement keeps its ID for life. If it is removed, mark it `status: withdrawn` — do not delete
  the row (the ID must never point at something else later).
- Cite the ID everywhere the requirement is realized: commit body (`implements REQ-AUTH-001`), test
  name/describe block, the ADR that decided *how*, and the CR that last changed it. An auditor reads
  one ID and finds the whole chain.

## Each requirement row carries

`id` · `statement` (one testable "the system must …" sentence) · `rationale` (why) ·
`acceptance` (how we verify it — links to the test or the manual check) · `status`
(`proposed | accepted | implemented | withdrawn`) · `priority` (`must | should | could`) ·
`source` (who asked / which CR or addon introduced it).

A requirement that cannot be phrased as a **testable** statement is not done being written — sharpen
it until its acceptance criterion is observable.

## Change flow (base ← addon / CR)

1. **New feature** → write an **addon** (`addons/<id>-<slug>.md`) with its own `REQ-…` rows. It is
   reviewable on its own and references the base requirements it depends on or extends.
2. **Modify an existing requirement** → write a **CR** (`changes/<id>-<slug>.md`): name the affected
   `REQ-…` id(s), give **old statement → new statement**, the reason, and the impact (code, tests,
   ADRs, confirmed-values).
3. **On merge**, fold the addon's / CR's outcome into `base.md` (update the rows, bump the base
   `version`), and leave the addon/CR file in place as history. The base always reflects *now*; the
   addon/CR explains *the change*.
4. If the change alters a **ground-truth value** (error code, permission key, enum, channel name),
   the linked ADR sets `updates-confirmed-values: yes` and the confirmed-values table updates in the
   **same PR** (`codex/decisions/` + `standards/error-codes.md`).

## Versioning the base

`base.md` carries a `version` (semantic-ish: bump minor for an added requirement, patch for a
clarification, major for a breaking removal/redefinition) and a `changelog` table listing each
applied addon/CR by id and date. Diffing two base versions = the requirements delta between releases.

## Relationship to the rest of the contract

- **Planning** (`rules/10-working-process.md`): the task contract's *goal* and *acceptance criteria*
  should cite the `REQ-…` ids it satisfies.
- **Verification** (`rules/30-verification.md`): the verifier checks output against the cited
  requirement's acceptance criterion — "done" means that criterion is met.
- **Decisions** (`codex/decisions/`): requirements say *what*; ADRs say *how* and *why*. A CR that needs a
  design choice spawns an ADR; the ADR's `supersedes` and the CR cross-link.
- **PRD/spec skills** (`skills/catalog.md`: `to-prd`, `brainstorming`) produce the prose; this
  standard is where that prose lands as IDed, versioned rows.
