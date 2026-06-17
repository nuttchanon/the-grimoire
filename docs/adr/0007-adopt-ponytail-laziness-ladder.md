---
id: 0007
title: Adopt the ponytail laziness ladder; port the principle, delegate the enforcement
status: accepted
date: 2026-06-17
updates-confirmed-values: no
---

# ADR 0007 — Adopt the ponytail laziness ladder

## Context

`standards/clean-code.md` already carries the canon — KISS, YAGNI, "minimize complexity" — but as
slogans. An agent reads "YAGNI" and still reaches for a dependency, a wrapper, or a speculative
abstraction, because the principle never told it *what to try first*. There was no ordered, refutable
procedure the verifier could check a change against.

[ponytail](https://github.com/DietrichGebert/ponytail) (Dietrich Gebert, MIT) packages exactly that
procedure: a "lazy senior dev" decision ladder — skip → stdlib → native → existing dep → one line →
minimal code — plus a "never simplify away" guardrail (validation, data-loss, security, a11y) and a
`ponytail:` comment marker for deliberate shortcuts that names each shortcut's ceiling and upgrade
path. It ships as a multi-platform plugin with `/ponytail-review`, `/ponytail-audit`, and
`/ponytail-debt` (which harvests the `ponytail:` markers into a ledger).

This is the same content-vs-mechanism split ADR 0006 drew for retrieval: the **principle** is durable,
tool-agnostic knowledge that belongs in our contract; the **enforcement automation** is a tool a user
installs. Vendoring the plugin into the base would tie a tool-agnostic contract to one set of agent
hosts and would be lost on the next `grimoire sync`.

## Decision

Adopt ponytail by **porting the principle and delegating the enforcement**.

- **Port the principle into the contract.** `standards/clean-code.md` owns the ladder, the "never
  simplify away" guardrail, and the `ponytail:` shortcut marker (in the suppression policy), with a
  one-line summary + pointer in `rules/05-code-quality.md` and a review-checklist item the verifier
  refutes against. This is Grimoire's own standard — tool-agnostic, survives `grimoire sync`.
- **Keep the marker token literally `ponytail:`** so the plugin's `/ponytail-debt` can harvest markers
  written under the contract. This is the deliberate coupling point between the ported principle and
  the delegated tool.
- **Delegate enforcement automation to the ponytail plugin** (`/ponytail-review|audit|debt`),
  documented in `stack/README.md` as an optional per-machine install — not a base dependency, not
  vendored. Without it the principle still holds; only the automated review/harvest is lost.
- **No new CLI command.** A `grimoire debt` command was considered and rejected (YAGNI): the plugin
  already harvests, and the marker is self-documenting without it.
- Credit recorded in `docs/attributions.md` (`standards/attribution.md`).

## Consequences

- **Easier:** YAGNI becomes an ordered, checkable procedure rather than a slogan; the verifier has a
  concrete checklist item; deliberate shortcuts are visible and harvestable instead of silent.
- **Easier:** every agent host gets the principle for free via the contract; hosts that support the
  plugin additionally get automated review/audit/debt.
- **Harder / owed:** the `ponytail:` token now couples the contract's marker to one tool's harvester.
  If that tool changes its convention or is dropped, the marker stays valid as self-documentation; only
  the automated harvest would need a replacement.
- **Intensity levels** (`lite/full/ultra`) are intentionally *not* ported into the base — Grimoire
  already tunes strictness through the stack profile and `local/` overrides; a second knob would be
  redundant.
