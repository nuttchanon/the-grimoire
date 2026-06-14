---
id: 0000
title: <short decision title>
status: proposed        # proposed | accepted | superseded | deprecated
date: <YYYY-MM-DD>
updates-confirmed-values: no   # yes | no — see "Confirmed values" below
supersedes:             # ADR id(s) this replaces, if any
---

# ADR 0000 — <short decision title>

## Context

What forces this decision? The problem, constraints, and the options actually on the table. Keep it
factual — no solution yet.

## Decision

The choice, stated as one sentence in active voice ("We will …"). Then the *why* in a few lines.

## Consequences

What becomes easier, what becomes harder, what we now owe (migrations, follow-ups, risks).

## Confirmed values

> Set `updates-confirmed-values: yes` in the frontmatter **only if this decision changes a value the
> code treats as ground truth** — an IPC channel name, an error code, a permission key, a hospital/
> tenant config, an enum the UI and server both depend on.

If `yes`: list each value below **and** update the project's confirmed-values table
(`codex/reference/`) in the same PR (the PR checklist enforces this). If `no`, delete this section.

| Value | Old | New | Where it lives |
|---|---|---|---|
| | | | |
