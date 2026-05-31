---
description: Onboard an existing (pre-Grimoire) repo onto the template without losing its custom contract.
---

# onboard — adopt Grimoire in an existing repo

Use this when a repo already has its own agent contract (a hand-rolled `.agents/`, a long `CLAUDE.md`,
ad-hoc rules) and you want it on the managed template. `init` lays the base and **backs up** an
existing `.agents/` to `.agents.bak-<timestamp>/`; this playbook moves the project's signal into
`local/` so nothing is lost and `grimoire sync` stays conflict-free. Work on a branch.

## Steps

1. **Branch + survey.** `git checkout -b chore/grimoire-onboard`. Read the existing `.agents/` (every
   rule), `CLAUDE.md`, and any `docs/**/adr/`. Note what is project-specific (domain, stack, security
   model, env gotchas) vs generic (it'll be replaced by the base).

2. **Run init.** `npx github:nuttchanon/the-grimoire init`. If an `.agents/` was present it is now
   safe in `.agents.bak-<timestamp>/`; the managed base + `local/` skeleton are in place. `init` skips
   seeding `docs/adr/` if the repo already keeps ADRs anywhere under `docs/**/adr/`.

3. **Move custom rules → `local/rules/`.** For each project rule worth keeping, recreate it under
   `local/rules/` with a **`local-` prefix** (avoids number collisions with the base — see
   `local/README.md`). Carry the content verbatim; add a frontmatter `description:`.

4. **Move CLAUDE.md context → `local/AGENTS.local.md` (+ big docs → `local/reference/`).** Set the
   profile (stack, testing policy, verify command). Move the system model, doc map, domain pointers,
   access/auth model, and env/build gotchas into **Project facts**; park large domain contracts (IPC
   tables, confirmed values) in `local/reference/`. Record any base behaviour you're overriding under
   **Override declarations**.

5. **Slim CLAUDE.md to a pointer.** Reduce it to the Grimoire imports
   (`@.agents/AGENTS.md` + `@.agents/local/AGENTS.local.md`) plus one line of orientation.

6. **Reconcile ADRs.** If the repo had its own ADR layout, delete the redundant seeded `docs/adr/`
   (init usually skips it) and note the real location in **Override declarations**.

7. **Declare bespoke paths.** List any top-level `.agents/` dirs the project owns (e.g.
   `field-reports/`, `handoff/`) one per line in `local/owned` so `sync` never overwrites them.

8. **Verify + clean up.** `grimoire index` (regen INDEX.md), `grimoire doctor` (check wiring), run the
   project's verify command, confirm the contract loads. Delete the `.agents.bak-*` backup once
   everything is migrated. Commit; open a PR.

## Done when

The `.agents.bak-*` backup is gone · every kept project rule lives under `local/rules/` (prefixed) ·
`CLAUDE.md` is a thin pointer · `grimoire index --check` + `grimoire doctor` are clean · no duplicate
ADR tree.
