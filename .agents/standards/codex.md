---
updated: 2026-06-06
status: canonical
description: "The codex — the project's knowledge/resource root at the repo root: read-first rule, provenance discipline, secrets boundary, and how it relates to the base contract."
---

# Standards — codex

`codex/` is the project's **knowledge and resource root** — what the system is, what it must do, why
it's built that way, and the raw materials and evidence behind those claims. It lives at the **repo
root** (not under `.agents/`), is **project-owned**, and `grimoire sync` never touches it; the base
contract holds only a *pointer* to it (`codex/INDEX.md`). It is tracked in git — knowledge is durable
— **except** raw secret-bearing or huge resources, which are gitignored with a tracked manifest.

codex subsumes what used to scatter across `docs/`: requirements, decisions, domain knowledge,
evidence, resources, runbooks. It is the rebuild's **source of truth**.

## Read-first rule

Any domain reference starts at `codex/INDEX.md`, then the relevant subfolder's `INDEX.md` (the
signpost). New work reads the matching INDEX **before** acting — a fresh session must not start blind
to recorded project knowledge. Every codex folder keeps its own `INDEX.md`.

## Structure

Canonical folders, each with an `INDEX.md` + short `README.md`:

| Folder | Holds |
|---|---|
| `domain/` | What the system **is** — glossary, context, business rules, capabilities. |
| `requirements/` | What it must **do** — IDed, versioned (`standards/requirements.md`). |
| `decisions/` | **Why** — ADRs, one per decision. |
| `evidence/` | Investigation / reverse-engineering / extraction outputs, each fact sourced. |
| `resources/` | Raw materials — datasets, vendor specs, dumps, snapshots (+ a manifest). |
| `reference/` | Confirmed-value tables, API/IPC catalogs, big contracts the code reads back. |
| `runbooks/` | The on-call answer to "production is broken." |

The structure is **extensible**: add a folder when a new kind of knowledge appears; give it an
`INDEX.md` and list it in `codex/INDEX.md`. Keep entry/INDEX files lean
(`rules/35-context-economy.md`).

## Provenance discipline

The knowledge base is the rebuild's source of truth, so it carries no unsourced guesses.

- Every recorded fact cites its **source** (file + offset/record) and a **CONFIRMED | INFERRED** tag.
- Unsupported claims are **removed or demoted** to "not recovered" — silence is not a finding.
- `INFERRED` is a lead, not a contract: confirm it from a source before code relies on it.
- **Pre-existing docs are not trusted until audited** to this standard. An audited doc carries
  `audited: <date>`; an un-audited one is treated as unverified.

## Secrets / leak boundary

- Real secrets / PHI **never** go in tracked knowledge docs. They live in a **gitignored inventory**
  recording each secret's **source + purpose** (for rotate/revoke), not the value in any tracked file.
- **The chat is the leak boundary**: never echo a secret or PHI into chat or agent output. Record a
  location + purpose, not the value.
- **Re-audit tracked content before connecting or pushing** a repo — confirm no secret/PHI slipped
  into a tracked doc. See `rules/50-security.md` + `standards/launch-security-checklist.md`.

## Relationship to the base

- **Requirements (what)** → `codex/requirements/`; **decisions (why)** → `codex/decisions/`. Both are
  cited by the task contract (`rules/10-working-process.md`) and checked by the verifier
  (`rules/30-verification.md`).
- **Ground-truth values** → `codex/reference/`; an ADR that changes one sets
  `updates-confirmed-values: yes` and updates the table in the **same PR**.
- The base governs *how to work*; codex holds *what this project knows*. Base loads first, `local/`
  wins — codex is project-owned knowledge, not a base override.
