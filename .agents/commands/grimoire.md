---
description: Run grimoire init or sync from inside Claude Code.
---

Wrap the Grimoire CLI (`bin/grimoire.mjs`).

- **init** — scaffold `.agents/` + pointers into a new project. Run:
  `npx github:nuttchanon/the-grimoire init` (or `node bin/grimoire.mjs init` when developing the template).
- **sync** — pull the latest template into an existing project. Overwrites **managed paths only**
  (`.agents/grimoire.manifest`); never touches `local/ memory/ backlog/ session/`. Run:
  `npx github:nuttchanon/the-grimoire sync`.

After `sync`, print the changelog (git log between the old and new template sha) and bump
`.agents/VERSION`. Confirm with the user before running `sync` if there are uncommitted changes.
