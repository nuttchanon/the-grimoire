---
updated: 2026-05-31
status: canonical
description: "The project-wide testing approach: the pyramid, what to test at each level, the active policy, and what 'tested' means."
---

# Standards — testing strategy

The per-stack **policy** (`tdd-mandatory | test-ready-deferred | none`) says *whether* you write
tests now (`stack/`). This standard says *how* you test when you do — so "add tests" is never an
open question.

## The pyramid (most tests cheap, few tests broad)

| Level | Tests | Speed | Use for |
|---|---|---|---|
| **Unit** | pure functions, domain/engine logic, reducers, validators | ms, no I/O | the bulk; every branch of business logic |
| **Integration** | a module against its real boundaries (DB, queue, an adapter) | seconds | data access, server actions, wiring |
| **E2E / contract** | a user-visible flow or a published API contract | slow | a few critical happy paths + key failure paths |

Push logic **down** the pyramid: keep the domain layer pure (`standards/architecture.md`) so most
behavior is unit-testable without spinning up I/O.

## What a good test asserts

- **Behavior, not implementation.** Assert observable output/effect for an input, not internal calls.
  A refactor that preserves behavior must not break the test.
- **One reason to fail.** Each test pins one behavior; the name states it (`returns 409 when the
  slot is already taken`).
- **Failure paths first-class.** Test the error/empty/forbidden branches, not just the happy path —
  the launch-security checklist requires abuse-path tests for user-facing apps.
- **Deterministic.** No real clock, network, or randomness — inject them. A seeded RNG or a fixed
  clock makes a flaky test impossible. Flaky = broken; fix or quarantine, never ignore.
- **Error codes, not strings.** Switch assertions on stable codes (`standards/error-codes.md`), not
  on message text.

## Coverage — a floor, not a goal

Aim for meaningful coverage of branches and failure modes, not a vanity percent. 100% line coverage
with no failure-path assertions is weaker than 70% that exercises every error branch. Untested code
on a critical path (auth, money, data integrity) is a defect regardless of the overall number.

## Structural / guardrail tests

Some invariants are not example-based — "every module's public API is re-exported", "every error
code is unique", "the registry and the routes agree". Encode these as **guardrail tests** that fail
CI when two sources of truth drift (`standards/guardrail-tests.md`).

## When tests are deferred

Under `test-ready-deferred` (or any unit of work shipped without tests), the absence is a **recorded
decision**, not a silent gap: open an ADR stating why and the conditions for backfill
(`docs/adr/`). Keep the code test-ready meanwhile — pure logic, injected dependencies, small units —
so tests drop in later without a rewrite.

## Definition of "tested" (feeds Definition of Done)

A change is tested when: the new/changed behavior has assertions at the right pyramid level · failure
paths are covered · the suite is green on fresh context · and (user-facing) the launch checklist's
abuse-path tests exist. The independent verifier (`rules/30-verification.md`) runs the real suite and
quotes real output — it does not take "tests pass" on trust.
