# codex

The project's **knowledge and resource root**, at the repo root (not under `.agents/`). It is the
rebuild's source of truth: what the system is, what it must do, why it's built that way, and the raw
materials and evidence behind those claims. Project-owned — `grimoire sync` never touches it; the
base contract only points here. Full protocol: `.agents/standards/codex.md`.

## Read-first rule

Any domain reference starts at `codex/INDEX.md`, then the relevant subfolder's `INDEX.md`. New work
reads the matching INDEX **before** acting — don't start a task blind to recorded knowledge.

## Provenance discipline

Every recorded fact cites its **source** (file + offset/record) and a **CONFIRMED | INFERRED** tag.
Unsupported claims are removed or demoted to "not recovered" — no unsourced guesses. Pre-existing
docs are not trusted until audited to this standard (carry `audited: <date>`).

## How to add a folder

codex is extensible. When a new kind of knowledge appears, add a folder, give it an `INDEX.md`
(signpost table) and a short `README.md`, and list it in the master `codex/INDEX.md`. Keep every
file lean (context economy).

## Secrets

Real secrets / PHI never go in tracked knowledge docs — see `resources/README.md` and
`.agents/standards/codex.md`. The chat is the leak boundary: never echo a secret or PHI into output.
