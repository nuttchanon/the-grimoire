# Marginalia — per-project overrides (loads LAST, wins)

`grimoire sync` **never touches** this file. Put everything project-specific here:

- **Active stack profile:** <!-- web-app | desktop | library -->
- **Testing policy:** <!-- tdd-mandatory | test-ready-deferred | none -->
- **Rule overrides:** to change a base rule, restate it here (do NOT edit `.agents/rules/*`).
- **Project facts:** confirmed values, IPC/channel tables, error-code catalog location, domain notes.
- **Verify command (if non-default):**

Base (`.agents/AGENTS.md` + `rules/` + `standards/` + `stack/`) loads first; this file wins on conflict.
