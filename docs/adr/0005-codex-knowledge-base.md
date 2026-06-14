---
id: 0005
title: codex knowledge base at the repo root
status: accepted
date: 2026-06-06
updates-confirmed-values: no
supersedes:
---

# ADR 0005 — codex knowledge base at the repo root

## Context

New agent sessions start blind: nothing in the contract points at the project's accumulated
knowledge, so domain context, requirements, decisions, and investigation evidence go unread. There
was also no single home for that knowledge. Requirements, ADRs, and runbooks were scattered under
`docs/` (seeded into `docs/requirements/`, `docs/adr/`, `docs/runbooks/`), with no place at all for
domain glossaries, reverse-engineering evidence/provenance, or resource references. The wrong fix —
editing the managed base to carry project knowledge — is forbidden: `grimoire sync` overwrites it.

## Decision

We will add **`codex/` at the repo ROOT** (not under `.agents/`) as the project's single
knowledge/resource home, with `domain/`, `requirements/`, `decisions/`, `evidence/`, `resources/`,
`reference/`, and `runbooks/`. It is project-owned, seeded once by `grimoire init` from
`templates/codex/`, and — being outside every managed path in `grimoire.manifest` — is never touched
by `sync`. `AGENTS.md` points agents to `codex/INDEX.md` as **read-first for any domain/feature
work**; `rules/00-always.md` makes that a session-start discipline. `codex/` **subsumes** the old
`docs/` trees: requirements → `codex/requirements/`, ADRs → `codex/decisions/`, runbooks →
`codex/runbooks/`. The base stays a signpost only — `codex/` scales without touching the base.

## Consequences

- One knowledge root per project; agents no longer start blind on domain context.
- Existing projects need a migration (`docs/` → `codex/`); tracked as a ROADMAP follow-up
  (e-claim first).
- The base contract stays lean: it signposts `codex/INDEX.md` rather than carrying domain content,
  so knowledge grows project-side without bloating or risking sync overwrites.
- The CLI drops `seedAdr`/`seedDocTree` in favor of a single `seedCodex`; the `codex/INDEX.md` is
  hand-maintained (project-owned), so the generated-INDEX tooling does not touch it. `doctor` warns
  if it is missing.
