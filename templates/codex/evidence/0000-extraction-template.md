---
id: 0000
title: <what was extracted / investigated>
status: draft           # draft | reviewed
date: <YYYY-MM-DD>
audited: <YYYY-MM-DD>   # date this doc was checked to the provenance standard
---

# Extraction 0000 — <what was extracted / investigated>

## Source artifact

What you investigated: file path / binary / dump / vendor doc, version or hash if known. One artifact
per doc where possible.

## Method / tool

How you extracted it — the tool, command, decompiler, query, or manual read. Enough that someone
could repeat it and get the same result.

## Findings

| item | source (file + offset/record) | CONFIRMED \| INFERRED | purpose |
|---|---|---|---|
| <value / rule / field> | `<file>:<offset>` or `<table>:<row>` | CONFIRMED | <what it's for> |

## Not recovered

What you looked for and could **not** establish, and why (encrypted, stripped, absent). This bounds
the claim — don't let a gap pass as settled.

## Security / redaction note

Confirm no real secret / PHI is recorded above. If the artifact contained any, record only its
**location + purpose** here for rotate/revoke; the value goes in the gitignored inventory
(`resources/`), never in this tracked doc.
